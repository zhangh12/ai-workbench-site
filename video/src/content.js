// What is written on screen inside the app: reports, replies, code.
// Every number is read from window.DATA (data/data.js, produced by real runs). None is typed here.
V.C = (function () {
  const D = window.DATA, { tex } = V.ui;
  const f2 = (x) => x.toFixed(2);
  const pv = (p) => (p < 0.001 ? "<0.001" : p.toFixed(4));
  const pe = (p) => (p < 0.001 ? "p < 0.001" : "p = " + p.toFixed(4));       // "p = 0.0013" or "p < 0.001"
  const hr = (o) => `${f2(o.hr)} (${f2(o.lcl)}–${f2(o.ucl)})`;
  const [M, F] = D.km.table;
  const med = (g) => `${g.median} (${g.lcl}–${g.ucl})`;
  const lr = D.km.logrank, cox = D.cox, T = D.try_ecog01, miss = D.data_check.missing;
  const diffDays = F.median - M.median, diffMonths = (diffDays / 30.4375).toFixed(1);
  const pct = (x) => Math.round(x * 100) + "%";

  const kmTable = `<table><thead><tr><th>Sex</th><th>n</th><th>Deaths</th><th>Median survival, days (95% CI)</th></tr></thead><tbody>
    <tr><td>Male</td><td>${M.n}</td><td>${M.deaths}</td><td>${med(M)}</td></tr>
    <tr><td>Female</td><td>${F.n}</td><td>${F.deaths}</td><td>${med(F)}</td></tr></tbody></table>`;
  const coxTable = (m, age) => `<table><thead><tr><th>Term</th><th>HR (95% CI)</th><th>p</th></tr></thead><tbody>
    <tr><td>Female vs male</td><td>${hr(m.sex)}</td><td>${pv(m.sex.p)}</td></tr>
    <tr data-k="ecog-row"><td>ECOG, per point</td><td>${hr(m.ecog)}</td><td>${pv(m.ecog.p)}</td></tr>
    ${age ? `<tr data-k="age-row"><td>Age, per year</td><td>${hr(m.age)}</td><td>${m.age.p.toFixed(2)}</td></tr>` : ""}</tbody></table>`;
  const missRows = Object.entries(miss).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);

  const B = V.ui.bars, PM = D.pubmed, TR = D.trial;
  const cap1 = (t) => t[0] + t.slice(1).toLowerCase(), clipT = (t, n) => (t.length > n ? t.slice(0, n - 1) + "…" : t), num = (n) => n.toLocaleString("en-US");
  const html = {
    // ---- tab "Literature": what the search returned. Titles, journals and years are PubMed's; nothing is said about findings.
    litReply: `<p><b>${PM.count} papers on PubMed.</b></p>${B(86, 50)}<p>The six most relevant are in <code>literature.md</code>.</p>`,
    litReport: `<h1>Sex differences in lung cancer survival: literature</h1>
      <p data-k="lp"><span data-k="l1">The search found ${PM.count} papers on PubMed.</span></p>${B(92, 60)}
      <h2>Most relevant</h2>
      <table><thead><tr><th>Year</th><th>Journal</th><th>Title</th></tr></thead><tbody>${PM.top.slice(0, 5).map((x) => `<tr><td>${x.year}</td><td>${clipT(x.journal, 16)}</td><td>${clipT(x.title, 46)}</td></tr>`).join("")}</tbody></table>${B(78)}`,
    l1New: `The search found ${PM.count} papers on PubMed, published between ${PM.year_min} and ${PM.year_max}.`,
    // ---- tab "Trial NCT...": the design, from the registry record
    trialReply: `<p><b>${TR.title}</b></p><p>${cap1(TR.design.allocation)}, ${TR.design.interventionModel.toLowerCase()} groups, ${num(TR.enrollment)} participants.</p><p>The design is summarized in <code>trial.md</code>.</p>`,
    trialReport: `<h1>${TR.nct}: trial design</h1>
      <table><tbody>
      <tr><td><b>Trial</b></td><td>${TR.title}</td></tr>
      <tr><td><b>Design</b></td><td>${cap1(TR.design.allocation)}, ${TR.design.interventionModel.toLowerCase()} groups, masking: ${TR.design.maskingInfo.toLowerCase()}</td></tr>
      <tr><td><b>Purpose</b></td><td>${cap1(TR.design.primaryPurpose)}</td></tr>
      <tr><td><b>Arms</b></td><td>${TR.arms.join(" · ")}</td></tr>
      <tr><td><b>Enrollment</b></td><td>${num(TR.enrollment)} participants</td></tr>
      <tr><td><b>Primary outcome</b></td><td>${TR.primary}</td></tr>
      <tr><td><b>Sponsor</b></td><td>${TR.sponsor}</td></tr></tbody></table>
      <p data-k="tp"><span data-k="t1">Participants were randomized to ${TR.arms[0]} or ${TR.arms[1]}.</span>
      <span data-k="t2">The primary outcome was ${TR.primary.toLowerCase()}.</span></p>${B(72)}`,

    // ---- tab "Data check"
    dataReport: `<h1>Data check</h1>${B(94, 70)}
      <h2>Missing values</h2>
      <table><thead><tr><th>Variable</th><th>Missing</th></tr></thead><tbody>${missRows.slice(0, 4).map(([k, n]) => `<tr><td><code>${k}</code></td><td>${n}</td></tr>`).join("")}</tbody></table>${B(60)}`,
    dataReply: `<p><b>${D.n} patients, ${D.data_check.ncol} variables.</b> ${D.n_events} deaths.</p>${B(88, 52)}`,

    // ---- tab "KM by sex"  (the reply shows what the chat renders: a table, a formula, coloured text)
    kmReply: `<p><b>Women survived longer than men.</b></p>${kmTable.replace("Median survival, days (95% CI)", "Median, days (95% CI)")}
      <p>Log-rank test: ${tex("\\chi^2 = " + f2(lr.chisq))}, <b style="color:var(--wb-accent-strong)">${pe(lr.p)}</b></p>`,
    kmReport: `<h1>Survival by sex: advanced NSCLC, first line</h1>
      <h2>Methods</h2>${B(96, 90, 48)}
      <h2>Results</h2>${kmTable}
      <p>Log-rank test: ${tex("\\chi^2 = " + f2(lr.chisq))}, df = 1, <b>${pe(lr.p)}</b>.</p>
      <div data-k="fig"></div>
      <p data-k="p1"><span data-k="s1">Women lived longer than men: median survival was ${F.median} vs ${M.median} days.</span>
      <span data-k="s2">The curves come together after about 750 days, where few patients are still at risk.</span></p>
      <h2>Limitations</h2>${B(92, 64)}`,
    // the first sentence after Claude acted on the comment
    s1New: `Women lived longer than men: median survival was ${F.median} vs ${M.median} days, a difference of ${diffDays} days (about ${diffMonths} months).`,

    // ---- tab "Cox model"
    coxReply: `<p><b>Adjusted for ECOG:</b></p>${coxTable(cox.ecog)}
      <p><span style="color:var(--wb-warn)">${cox.n_missing_ecog} patient without ECOG excluded</span> (n = ${cox.ecog.sex.n}).</p>`,
    coxReport: (age) => `<h1>Cox model: sex, adjusted for ECOG${age ? " and age" : ""}</h1>
      <h2>Model</h2>
      ${tex(`h(t \\mid x) = h_0(t)\\,\\exp(\\beta_1\\,\\text{female} + \\beta_2\\,\\text{ECOG}${age ? " + \\beta_3\\,\\text{age}" : ""})`, true)}
      ${B(90, 56)}
      <h2>Results</h2>${coxTable(age ? cox.ecog_age : cox.ecog, age)}${B(94, 72)}`,
    // asked in "Cox model" about "KM by sex"
    // asked in "Cohort" about a result of "KM by sex"
    crossReply: `<p><b>KM by sex</b>: median survival ${M.median} days for men, ${F.median} for women.</p>
      <p>Log-rank ${pe(lr.p)}.</p>
      <p data-k="from" class="from">From <span class="ref">KM by sex / summary.md</span> <span class="ref">report.md</span></p>`,
    // ---- the data session: a cohort pulled from a (synthetic) real-world database, described, analysed
    cohortReply: `<p><b>${num(D.n)} patients</b> in the cohort, from ${num(D.attrition[0].n)} in <code>onc_rwd.demo</code>.</p><p>Synthetic demo data. The steps are in <code>cohort.md</code>.</p>`,
    cohortReport: `<h1>Cohort: advanced NSCLC, first-line treated</h1><p>Source: <code>onc_rwd.demo</code> on Databricks (synthetic demo data).</p>
      <table><thead><tr><th>Step</th><th>Patients</th></tr></thead><tbody>${D.attrition.map((x) => `<tr><td>${x.label}</td><td>${num(x.n)}</td></tr>`).join("")}</tbody></table>${B(84, 52)}`,
    baselineReply: `<p><b>${D.baseline[0].n} men, ${D.baseline[1].n} women.</b> Median age ${D.baseline[0].age_median} in both.</p><p>The table is in <code>baseline.md</code>.</p>`,
    baselineReport: `<h1>Baseline characteristics by sex</h1>
      <table><thead><tr><th></th><th>Male</th><th>Female</th></tr></thead><tbody>
      <tr><td>n</td>${D.baseline.map((x) => `<td>${x.n}</td>`).join("")}</tr>
      <tr><td>Age, median (IQR)</td>${D.baseline.map((x) => `<td>${x.age_median} (${x.age_q1}–${x.age_q3})</td>`).join("")}</tr>
      <tr><td>Stage IV</td>${D.baseline.map((x) => `<td>${x.stage4_pct.toFixed(0)}%</td>`).join("")}</tr>
      <tr><td>ECOG 0–1</td>${D.baseline.map((x) => `<td>${x.ecog01_pct.toFixed(0)}%</td>`).join("")}</tr>
      <tr><td>ECOG missing</td>${D.baseline.map((x) => `<td>${x.ecog_missing}</td>`).join("")}</tr></tbody></table>${B(80)}`,
  };

  const code = {
    km: `# Kaplan-Meier curves by sex and log-rank test (cohort from the Cohort tab)
library(survival)
library(ggplot2)

d <- nanoparquet::read_parquet("../Cohort/cohort.parquet")
d$sex <- factor(d$sex, levels = c("Male", "Female"))
# time = days from first-line start; event: 1 = death, 0 = censored

fit <- survfit(Surv(time, event) ~ sex, data = d)
lr  <- survdiff(Surv(time, event) ~ sex, data = d)
p   <- pchisq(lr$chisq, df = 1, lower.tail = FALSE)

# Summary table: n, deaths, median survival with 95% CI
tab <- summary(fit)$table
write.csv(tab, "tables/km_by_sex_summary.csv")

# Plot with 95% confidence bands; + marks censored patients
km <- broom::tidy(fit)
g <- ggplot(km, aes(time, estimate, color = strata)) +
  geom_step(linewidth = 0.8) +
  labs(x = "Time (days)", y = "Survival probability")
ggsave("figures/km_by_sex.png", g, width = 7, height = 5, dpi = 150)`.split("\n"),
    cox: `# Cox model: hazard ratio for sex, adjusted for ECOG (cohort from the Cohort tab)
library(survival)

d <- nanoparquet::read_parquet("../Cohort/cohort.parquet")
d$sex <- factor(d$sex, levels = c("Male", "Female"))
# time = days from first-line start; event: 1 = death, 0 = censored

# Complete cases: patients without an ECOG score are left out
d <- d[!is.na(d$ph.ecog), ]

fit <- coxph(Surv(time, event) ~ sex + ph.ecog, data = d)
summary(fit)

# Proportional-hazards check (Schoenfeld residuals)
cox.zph(fit)`.split("\n"),
  };

  return { D, PM, TR, num, f2, pv, pe, hr, med, M, F, lr, cox, T, miss, missRows, diffDays, diffMonths, pct, html, code, kmTable, coxTable };
})();
