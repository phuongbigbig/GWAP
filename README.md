# Group-wise Analysis Platform (GWAP)

A single-file, browser-based tool for turning qPCR data into publication-ready figures with built-in statistics. No installation, no server, no dependencies — just open the HTML file (or host it on GitHub Pages) and start typing data.

## Features

- **Manual data entry** in an editable table: rows = samples, columns = replicates (biological or technical). Add or remove samples and replicates with large +/− stepper buttons. Missing replicate cells are handled correctly (a blank is ignored, not treated as zero).
- **Two input modes**
  - *Relative expression* — paste fold-change / relative values directly.
  - *Raw Ct* — enter target and reference (housekeeping) Ct values; the app computes fold change by the ΔΔCt method against a chosen control sample, with a selectable amplification efficiency.
- **Grouping mode** (3-level data): groups on the x-axis, samples shown in a legend by colour/pattern and clustered within each group — like a typical multi-gene / multi-condition figure. Statistics and comparison brackets run **within each group independently**. The wide input table can be popped out to a full-screen editor.
- **Statistics on demand**
  - One-way ANOVA followed by a post-hoc test: **Tukey HSD** (all pairs), **Holm**, **Bonferroni**, or uncorrected Fisher LSD.
  - **Welch's t-test** for two-group comparisons (with optional Holm/Bonferroni correction across multiple pairs).
  - Compare *each sample vs. a control*, or define *custom pairs*.
  - Significance shown as stars (ns / * / ** / ***) or exact p-values; brackets are drawn above the tallest bar so they never overlap the data. Non-significant marks can be hidden with one toggle.
  - A **Recalculate** button to force-refresh the results after editing data.
- **Plot types**: bar, box, or violin.
- **Black/white patterns** or **colour**, including ggsci scientific-journal palettes (NPG, AAAS, NEJM, Lancet, JAMA, JCO, BMJ, UChicago, D3).
- **Full customisation**: title and axis titles, SEM vs SD error bars, replicate-point overlay, line weight, font size, output width and aspect ratio, and optional legend / ns-mark toggles.
- **Seven page colour themes** (Blue, Teal, Violet, Crimson, Green, Amber, Graphite) that re-tint the interface highlight, background, and header decoration together. (Separate from the plot colour palettes.)
- **Export**
  - Plot as vector **SVG** and high-resolution **PNG**.
  - Statistical results table as **CSV** and **XLSX** (a real Excel file, built with no external libraries; numbers stay numeric).
- A built-in **"Statistics explained"** panel that describes the test and correction currently in use, when to use them, caveats, and APA references.

## Usage

1. Open the HTML file in any modern browser (Chrome, Firefox, Edge, Safari).
2. Click **Example data** to see a working figure, or type your own values.
3. Choose the test, comparison design, plot type, and appearance options.
4. From the **Export** panel, save the figure as SVG/PNG or the statistics table as CSV/XLSX.

Everything runs locally in your browser — your data never leaves your computer.

## Hosting on GitHub Pages

1. Rename the HTML file to `index.html` and add it to a repository.
2. Push to the `main` branch.
3. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The app will be available at `https://<username>.github.io/<repo>/`.

## Statistical methods

All statistics are computed in plain JavaScript (no external libraries) and have been verified against known reference values and independent numerical integration:

- **Welch's unequal-variance t-test** with Welch–Satterthwaite degrees of freedom.
- **One-way ANOVA** (F-test).
- **Tukey HSD / Tukey–Kramer** via the exact studentized-range distribution (supports unequal replicate numbers).
- **Paired (matched) t-test** for linked replicates.
- **Mann–Whitney U** (unpaired) and **Wilcoxon signed-rank** (paired) non-parametric tests, with exact p-values for small n and a tie-corrected normal approximation for larger n.
- **Holm** and **Bonferroni** multiple-comparison corrections.
- **ΔΔCt** relative quantification: fold change = E^(−ΔΔCt); with E = 2 this is the classic Livak 2^(−ΔΔCt) method.

**Two-group comparisons.** A one-way ANOVA on exactly two groups is mathematically identical to the Student (equal-variance) two-sample t-test — exactly, with F = t² and matching p-values. In this app the ANOVA + Tukey/Holm/Bonferroni/LSD options therefore all reduce to the same Student t-test when there are only two groups (a single comparison leaves the correction with nothing to adjust). The **"Pairwise Welch's t-test"** option is the exception: it does not assume equal variances and uses Welch–Satterthwaite degrees of freedom, so its p-value differs slightly. For two groups with possibly unequal spread (common at small qPCR n), Welch's t-test is the safer default; use the rank-based tests for clearly non-normal data.

The built-in **"Statistics explained"** panel describes the currently selected test, the multiple-comparison corrections (Bonferroni, Holm, Tukey HSD, Dunnett, none), the two-group equivalence above, assumptions, and APA references — and updates live with your selections.

**Note on sample size:** qPCR experiments typically use n = 3 replicates, which gives low statistical power. A non-significant result is not proof of "no difference." Expression ratios are right-skewed, so analysing on the log scale (ΔCt or log₂ fold change) often better satisfies test assumptions.

### Key references (APA)

- Student. (1908). The probable error of a mean. *Biometrika, 6*(1), 1–25.
- Welch, B. L. (1947). The generalization of 'Student's' problem when several different population variances are involved. *Biometrika, 34*(1–2), 28–35.
- Fisher, R. A. (1925). *Statistical methods for research workers.* Oliver & Boyd.
- Tukey, J. W. (1949). Comparing individual means in the analysis of variance. *Biometrics, 5*(2), 99–114.
- Kramer, C. Y. (1956). Extension of multiple range tests to group means with unequal numbers of replications. *Biometrics, 12*(3), 307–310.
- Holm, S. (1979). A simple sequentially rejective multiple test procedure. *Scandinavian Journal of Statistics, 6*(2), 65–70.
- Dunn, O. J. (1961). Multiple comparisons among means. *Journal of the American Statistical Association, 56*(293), 52–64.
- Mann, H. B., & Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. *The Annals of Mathematical Statistics, 18*(1), 50–60.
- Wilcoxon, F. (1945). Individual comparisons by ranking methods. *Biometrics Bulletin, 1*(6), 80–83.
- Dunnett, C. W. (1955). A multiple comparison procedure for comparing several treatments with a control. *Journal of the American Statistical Association, 50*(272), 1096–1121.
- Livak, K. J., & Schmittgen, T. D. (2001). Analysis of relative gene expression data using real-time quantitative PCR and the 2−ΔΔC_T method. *Methods, 25*(4), 402–408.
- Pfaffl, M. W. (2001). A new mathematical model for relative quantification in real-time RT-PCR. *Nucleic Acids Research, 29*(9), e45.
- Bustin, S. A., et al. (2009). The MIQE guidelines: Minimum information for publication of quantitative real-time PCR experiments. *Clinical Chemistry, 55*(4), 611–622.

## Browser support

Works in any current desktop browser. No internet connection is required after the page loads.

## License & credit

© 2026 Nguyen Thanh Phuong. You are free to use and adapt this tool for research and educational purposes.
