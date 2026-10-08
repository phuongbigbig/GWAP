// Dependency-free regression tests for the pure statistics helpers in index.html.
// Run:  node tests/stats.test.js
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
// stats core = everything before the data model; plus a few pure helpers defined later
let src = script.slice(0, script.indexOf('/* ===================== DATA MODEL'));
['parseNum', 'pairUp', 'normCell'].forEach(n => {
  const i = script.indexOf('function ' + n + '(');
  assert(i >= 0, 'missing ' + n);
  let depth = 0, j = script.indexOf('{', i);
  for (let k = j; k < script.length; k++) {
    if (script[k] === '{') depth++;
    if (script[k] === '}' && --depth === 0) { src += script.slice(i, k + 1) + '\n'; break; }
  }
});
const api = new Function(src + '; return {welch,pairedT,anova,lsd,tukeyP,ptukey,adjustP,stars,fmtP,mannWhitney,wilcoxon,parseNum,pairUp,normCell};')();
const near = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('Tukey critical values reproduce alpha = 0.05', () => {
  near(1 - api.ptukey(3.773, 3, 12), 0.05, 1e-3, 'k=3 df=12');
  near(1 - api.ptukey(2.228 * Math.SQRT2, 2, 10), 0.05, 1e-3, 'k=2 df=10');
});
t('Holm / Bonferroni', () => {
  assert.deepStrictEqual(api.adjustP([0.01, 0.04, 0.03], 'holm').map(x => +x.toFixed(10)), [0.03, 0.06, 0.06]);
  assert.deepStrictEqual(api.adjustP([0.01, 0.04], 'bonferroni'), [0.02, 0.08]);
});
t('untestable (NaN) p-values stay NaN and are not counted', () => {
  const a = api.adjustP([0.01, NaN, 0.04], 'bonferroni');
  near(a[0], 0.02, 1e-12, 'p0'); assert(isNaN(a[1])); near(a[2], 0.08, 1e-12, 'p2');
  assert.strictEqual(api.stars(NaN), 'n/a'); assert.strictEqual(api.fmtP(NaN), 'n/a');
});
t('zero within-group variance', () => {
  assert.strictEqual(api.welch([1, 1, 1], [2, 2, 2]).p, 0);
  assert.strictEqual(api.welch([1, 1, 1], [1, 1, 1]).p, 1);
  assert.strictEqual(api.anova([[1, 1, 1], [2, 2, 2]]).p, 0);
  assert.strictEqual(api.tukeyP(1, 3, 3, 0, 2, 4), 0);
  assert.strictEqual(api.tukeyP(0, 3, 3, 0, 2, 4), 1);
  assert.strictEqual(api.pairedT([3, 4, 5], [1, 2, 3]).p, 0);
});
t('Welch / ANOVA agree with reference values', () => {
  const w = api.welch([1, 2, 3, 4], [2, 4, 6, 8]);
  near(w.t, -Math.sqrt(3), 1e-9, 't'); near(w.df, 4.4118, 1e-3, 'df'); // hand-derived: se^2=2.0833
  near(api.anova([[1, 2, 3], [2, 3, 4], [5, 6, 7]]).F, 13, 1e-9, 'F'); // SSB=26, MSB=13, MSW=1
});
t('exact rank tests', () => {
  assert.strictEqual(api.mannWhitney([1, 2, 3], [4, 5, 6]).p, 0.1);
  assert.strictEqual(api.mannWhitney([1, 1, 1], [1, 1, 1]).p, 1);
  assert.strictEqual(api.wilcoxon([2, 3, 4], [1, 1, 1]).p, 0.25);
});
t('Wilcoxon normal approximation is tie-corrected and valid', () => {
  const a = [...Array(30).keys()].map(x => x + 1 + (x % 3)), b = [...Array(30).keys()];
  const r = api.wilcoxon(a, b); assert(!r.exact && r.p >= 0 && r.p <= 1);
});
t('strict number parsing', () => {
  assert.strictEqual(api.parseNum('0,7'), 0.7); assert.strictEqual(api.parseNum(' 1e3 '), 1000);
  ['', ' ', 'abc', '25abc', '1,2,3', '0x10', null, undefined].forEach(v => assert(isNaN(api.parseNum(v)), String(v)));
  assert.strictEqual(api.normCell('0,7'), '0.7'); assert.strictEqual(api.normCell(' abc '), 'abc');
});
t('pairing keeps replicate positions when a cell is blank', () => {
  const [a, b] = api.pairUp([5, 6, 7], [1, NaN, 3]);
  assert.deepStrictEqual(a, [5, 7]); assert.deepStrictEqual(b, [1, 3]);
});
console.log(`\n${n} test groups passed`);
