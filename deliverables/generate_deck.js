const pptxgen = require("pptxgenjs");
const path = require("node:path");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "PULSE";
pptx.subject = "Business overview of PULSE employee feedback and wellbeing product";
pptx.title = "PULSE | Business Overview";
pptx.company = "PULSE";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineSlideMaster({
  title: "BASE",
  background: { color: "F7F5F0" },
  objects: [
    { line: { x: 0.55, y: 7.12, w: 12.22, h: 0, line: { color: "E4E0D9", width: 0.7 } } },
    { text: { text: "PULSE  /  BUSINESS OVERVIEW", options: { x: 0.58, y: 7.18, w: 4.7, h: 0.18, fontFace: "Aptos", fontSize: 8, charSpacing: 1.1, color: "79756F", margin: 0 } } },
    { slideNumber: { x: 12.25, y: 7.16, w: 0.5, h: 0.18, color: "79756F", fontFace: "Aptos", fontSize: 8, align: "right", margin: 0 } },
  ],
  slideNumber: { x: 12.25, y: 7.16, color: "79756F", fontFace: "Aptos", fontSize: 8 },
});

const C = {
  paper: "F7F5F0",
  white: "FFFFFF",
  ink: "292825",
  muted: "77736D",
  red: "BF3439",
  redDark: "8F272D",
  redSoft: "F4E6E3",
  blue: "476D9A",
  blueSoft: "E6EDF4",
  green: "4B7665",
  greenSoft: "E6EEE9",
  gold: "B48743",
  goldSoft: "F2EBDD",
  line: "E4E0D9",
  dark: "272725",
  dark2: "363632",
};
const SW = 13.333;
const SH = 7.5;

function rect(slide, x, y, w, h, fill, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.11,
    line: { color: opts.line || fill, transparency: opts.line ? 0 : 100, width: 0.8 },
    fill: { color: fill },
    radius: 0.12,
    ...opts,
  });
}
function circle(slide, x, y, d, fill, line = fill) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: d, h: d, line: { color: line, transparency: 100 }, fill: { color: fill } });
}
function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: opts.fontFace || "Aptos",
    fontSize: opts.fontSize || 14,
    color: opts.color || C.ink,
    bold: opts.bold || false,
    breakLine: false,
    margin: 0,
    valign: opts.valign || "mid",
    lineSpacingMultiple: 1,
    fit: "shrink",
    paraSpaceAfterPt: 0,
    ...opts,
  });
}
function line(slide, x1, y1, x2, y2, color = C.line, width = 1.2, dash) {
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, dashType: dash } });
}
function label(slide, value, x, y, color = C.red) {
  text(slide, value.toUpperCase(), x, y, 5.2, 0.22, { fontSize: 9, bold: true, color, charSpacing: 1.6 });
}
function heading(slide, kicker, title, subtitle = "") {
  label(slide, kicker, 0.62, 0.43);
  text(slide, title, 0.62, 0.78, 11.95, 0.68, { fontFace: "Aptos Display", fontSize: 30, bold: true, charSpacing: -0.5 });
  if (subtitle) text(slide, subtitle, 0.65, 1.55, 11.65, 0.44, { fontSize: 13, color: C.muted, valign: "top" });
}
function card(slide, x, y, w, h, title, body, accent = C.red) {
  rect(slide, x, y, w, h, C.white, { line: C.line });
  rect(slide, x, y, 0.07, h, accent);
  text(slide, title, x + 0.22, y + 0.19, w - 0.43, 0.31, { fontSize: 15, bold: true });
  text(slide, body, x + 0.22, y + 0.60, w - 0.43, h - 0.77, { fontSize: 11, color: C.muted, valign: "top", breakLine: false });
}
function bullet(slide, value, x, y, w, color = C.ink, dot = C.red, size = 12) {
  circle(slide, x, y + 0.105, 0.075, dot);
  text(slide, value, x + 0.19, y, w - 0.19, 0.38, { fontSize: size, color, valign: "top" });
}
function addSlide() { return pptx.addSlide("BASE"); }
function stat(slide, x, y, number, caption, color = C.red) {
  text(slide, number, x, y, 2.2, 0.56, { fontFace: "Aptos Display", fontSize: 31, bold: true, color });
  text(slide, caption, x, y + 0.58, 2.25, 0.48, { fontSize: 10, color: C.muted, valign: "top" });
}
function pill(slide, value, x, y, w, fill, color) {
  rect(slide, x, y, w, 0.32, fill);
  text(slide, value, x + 0.1, y + 0.01, w - 0.2, 0.27, { fontSize: 8.5, bold: true, color, align: "center" });
}

// 1 — Cover
{
  const s = addSlide();
  s.background = { color: C.dark };
  circle(s, 9.0, -1.35, 5.9, C.redDark);
  circle(s, 9.85, 0.95, 3.2, C.red);
  circle(s, 8.0, 3.95, 1.0, C.gold);
  label(s, "Employee wellbeing · Private work signals", 0.78, 0.72, "F2B7AC");
  text(s, "PULSE", 0.76, 1.35, 6.8, 1.1, { fontFace: "Aptos Display", fontSize: 66, bold: true, color: C.white, charSpacing: -2 });
  text(s, "Work better.\nNotice sooner.", 0.82, 2.66, 6.9, 1.55, { fontFace: "Aptos Display", fontSize: 34, bold: true, color: "F6F2EC", breakLine: false, valign: "top" });
  text(s, "A business overview of a privacy-first employee feedback and wellbeing product.", 0.84, 4.54, 6.5, 0.8, { fontSize: 16, color: "D8D4CD", valign: "top" });
  pill(s, "PRODUCT CONCEPT · EARLY STAGE", 0.84, 5.72, 2.9, "433B38", "F2B7AC");
  text(s, "November 2026", 0.84, 6.44, 2.3, 0.26, { fontSize: 10, color: "C8C3BC" });
  text(s, "PULSE  /  BUSINESS OVERVIEW", 9.1, 7.18, 3.8, 0.18, { fontSize: 8, charSpacing: 1.1, color: "D8D4CD", align: "right" });
  text(s, "01", 12.56, 7.16, 0.2, 0.18, { fontSize: 8, color: "D8D4CD", align: "right" });
}

// 2 — The problem
{
  const s = addSlide();
  heading(s, "The opportunity", "Teams see activity. They often miss how work feels.", "The product thesis: bring work-rhythm context and employee voice together—without expanding surveillance.");
  const y = 2.36;
  card(s, 0.68, y, 3.72, 2.55, "Output without context", "Activity totals can show that work happened, but not whether workload feels sustainable or a team needs support.", C.blue);
  card(s, 4.80, y, 3.72, 2.55, "Feedback without continuity", "A periodic survey can capture sentiment, yet may not connect to week-by-week changes in work rhythm.", C.gold);
  card(s, 8.92, y, 3.72, 2.55, "Trust is the constraint", "When people fear individual monitoring, honest participation is harder. Privacy has to be designed into the product.", C.red);
  rect(s, 0.68, 5.35, 11.96, 0.95, C.dark);
  text(s, "PULSE thesis", 0.96, 5.58, 1.6, 0.28, { fontSize: 12, bold: true, color: "F2B7AC" });
  text(s, "A better signal is not more data about a person—it is safer context for a team conversation.", 2.48, 5.52, 9.75, 0.42, { fontSize: 16, bold: true, color: C.white });
}

// 3 — Product
{
  const s = addSlide();
  heading(s, "The product", "One calm workspace. Three useful signals.", "PULSE combines individual work awareness with anonymous team check-ins and aggregate reporting.");
  const xs = [0.72, 4.80, 8.88];
  const data = [
    ["01", "Private time awareness", "Session timing, active/idle separation, task labels and a configurable idle prompt.", C.blue],
    ["02", "Anonymous weekly pulse", "A short check-in on mood, stress and workload. Responses are not linked to an employee identity.", C.red],
    ["03", "Team-level action", "Aggregate scorecards, trend signals, risk alerts and exportable reports for managers.", C.green],
  ];
  data.forEach((d, i) => {
    const x = xs[i];
    rect(s, x, 2.4, 3.7, 2.75, C.white, { line: C.line });
    circle(s, x + 0.25, 2.68, 0.55, d[3]);
    text(s, d[0], x + 0.27, 2.81, 0.5, 0.18, { fontSize: 10, bold: true, color: C.white, align: "center" });
    text(s, d[1], x + 0.26, 3.48, 3.15, 0.48, { fontSize: 17, bold: true });
    text(s, d[2], x + 0.26, 4.08, 3.12, 0.8, { fontSize: 11.5, color: C.muted, valign: "top" });
  });
  text(s, "Private for the individual  →  anonymous at the team layer  →  actionable in conversation", 1.02, 5.75, 11.15, 0.4, { fontSize: 15, bold: true, color: C.red, align: "center" });
}

// 4 — How it works
{
  const s = addSlide();
  heading(s, "Experience", "From personal signal to supportive action.", "The workflow is designed to make the individual’s experience useful before it becomes a manager’s insight.");
  line(s, 1.63, 3.12, 11.52, 3.12, "D4CFC8", 2);
  const steps = [
    { x: 1.1, n: "01", t: "Track privately", b: "Capture session timing; separate idle time; let the employee label work.", c: C.blue },
    { x: 5.0, n: "02", t: "Check in weekly", b: "Invite voluntary ratings for mood, stress and workload.", c: C.red },
    { x: 8.9, n: "03", t: "Discuss patterns", b: "Show safe team aggregates and trends; support a human conversation.", c: C.green },
  ];
  steps.forEach((d) => {
    circle(s, d.x + 0.85, 2.78, 0.68, d.c);
    text(s, d.n, d.x + 0.88, 3.0, 0.62, 0.2, { fontSize: 11, bold: true, color: C.white, align: "center" });
    text(s, d.t, d.x, 3.75, 2.4, 0.37, { fontSize: 17, bold: true, align: "center" });
    text(s, d.b, d.x - 0.12, 4.27, 2.66, 0.8, { fontSize: 11, color: C.muted, valign: "top", align: "center" });
  });
  pill(s, "No individual pulse answers in manager views", 4.35, 5.76, 4.5, C.greenSoft, C.green);
}

// 5 — Privacy
{
  const s = addSlide();
  heading(s, "Trust architecture", "Privacy is a product boundary—not a settings toggle.", "Specific controls in the current design help make the promise explainable.");
  const rows = [
    ["Not collected", "Keystrokes · screenshots · screen content · URLs · browsing history"],
    ["Not exposed", "Individual pulse responses · personal activity timelines in manager views"],
    ["Suppressed", "Team aggregates below the organization’s minimum response size (default 5)"],
    ["Separated", "User-linked weekly receipts enforce participation separately from answer records"],
  ];
  rows.forEach((r, i) => {
    const y = 2.28 + i * 0.82;
    circle(s, 0.82, y + 0.12, 0.28, i === 2 ? C.gold : C.green);
    text(s, "✓", 0.84, y + 0.14, 0.23, 0.18, { fontSize: 10, bold: true, color: C.white, align: "center" });
    text(s, r[0], 1.35, y, 1.75, 0.38, { fontSize: 14, bold: true });
    text(s, r[1], 3.25, y, 8.8, 0.48, { fontSize: 12, color: C.muted });
    if (i < rows.length - 1) line(s, 1.34, y + 0.62, 12.1, y + 0.62);
  });
  rect(s, 0.82, 5.92, 11.68, 0.52, C.redSoft);
  text(s, "Operational note: organizations still need appropriate consent, access controls, retention and privacy review before collecting employee data.", 1.02, 6.02, 11.25, 0.28, { fontSize: 10, color: C.redDark, bold: true });
}

// 6 — Analytics
{
  const s = addSlide();
  heading(s, "Decision support", "Turn weekly ratings into a conversation prompt.", "A transparent aggregate score surfaces patterns; it is not a diagnosis or an individual performance rating.");
  const factors = [
    ["Stress", 30, C.red], ["Workload", 25, C.gold], ["Inverse mood", 25, C.blue], ["Participation", 20, C.green],
  ];
  factors.forEach((f, i) => {
    const y = 2.25 + i * 0.64;
    text(s, f[0], 0.86, y, 1.55, 0.28, { fontSize: 12, bold: true });
    rect(s, 2.6, y + 0.035, 5.2, 0.24, "EAE6DF");
    rect(s, 2.6, y + 0.035, 5.2 * f[1] / 30, 0.24, f[2]);
    text(s, `${f[1]}%`, 8.0, y - 0.01, 0.6, 0.3, { fontSize: 12, bold: true, color: f[2] });
  });
  rect(s, 9.15, 2.27, 3.2, 2.8, C.dark);
  label(s, "Illustrative thresholds", 9.43, 2.57, "F2B7AC");
  text(s, "< 40", 9.45, 3.03, 1.0, 0.38, { fontSize: 21, bold: true, color: C.white });
  text(s, "Low", 10.63, 3.08, 1.0, 0.3, { fontSize: 12, color: "D8D4CD" });
  text(s, "40–64", 9.45, 3.67, 1.0, 0.38, { fontSize: 21, bold: true, color: C.white });
  text(s, "Medium", 10.63, 3.72, 1.0, 0.3, { fontSize: 12, color: "D8D4CD" });
  text(s, "65+", 9.45, 4.31, 1.0, 0.38, { fontSize: 21, bold: true, color: C.white });
  text(s, "High", 10.63, 4.36, 1.0, 0.3, { fontSize: 12, color: "D8D4CD" });
  text(s, "Base score blends four aggregate signals; week-over-week movement contributes a capped 10% when an eligible prior week exists.", 0.87, 5.33, 11.0, 0.56, { fontSize: 12, color: C.muted, valign: "top" });
  pill(s, "ALERTS ARE AGGREGATE-ONLY", 0.87, 6.12, 3.1, C.blueSoft, C.blue);
}

// 7 — Customer
{
  const s = addSlide();
  heading(s, "Who it serves", "Start where work rhythms and team trust both matter.", "Initial customer profiles are hypotheses to validate through discovery and design-partner pilots.");
  const profiles = [
    ["People / HR leaders", "Need an earlier, privacy-conscious view of team wellbeing patterns.", C.red],
    ["Team managers", "Need practical signals to guide retrospectives and workload conversations.", C.blue],
    ["Employees", "Need personal awareness without screen monitoring or individual pulse exposure.", C.green],
  ];
  profiles.forEach((d, i) => {
    const x = 0.78 + i * 4.15;
    rect(s, x, 2.4, 3.75, 2.2, C.white, { line: C.line });
    circle(s, x + 0.28, 2.7, 0.22, d[2]);
    text(s, d[0], x + 0.63, 2.66, 2.8, 0.35, { fontSize: 15, bold: true });
    text(s, d[1], x + 0.28, 3.28, 3.1, 0.86, { fontSize: 11.5, color: C.muted, valign: "top" });
  });
  text(s, "Pilot discovery questions", 0.82, 5.18, 2.8, 0.31, { fontSize: 14, bold: true });
  bullet(s, "What makes a wellbeing signal trustworthy enough to act on?", 0.88, 5.65, 5.5, C.ink, C.gold, 11);
  bullet(s, "Who owns budget, rollout and employee communication?", 6.7, 5.65, 5.5, C.ink, C.gold, 11);
}

// 8 — Business model
{
  const s = addSlide();
  heading(s, "Business model", "A simple per-person subscription ladder.", "Current product pricing page proposes monthly per-person prices and a 7-day trial; validate willingness to pay in pilots.");
  const plans = [
    { x: 0.78, name: "Starter", price: "$8", cap: "per person / month", desc: "Personal habits", items: ["Time tracking", "Idle detection", "Weekly pulse"], c: C.blue },
    { x: 4.88, name: "Team", price: "$16", cap: "per person / month", desc: "Team signals", items: ["Starter features", "Anonymous scorecards", "Burnout alerts + reports"], c: C.red },
    { x: 8.98, name: "Business", price: "$28", cap: "per person / month", desc: "Organization-wide", items: ["Team features", "Unlimited teams", "Advanced trends + priority support"], c: C.green },
  ];
  plans.forEach((p, i) => {
    rect(s, p.x, 2.35, 3.62, 3.25, i === 1 ? C.dark : C.white, { line: i === 1 ? C.dark : C.line });
    text(s, p.name, p.x + 0.24, 2.62, 2.9, 0.34, { fontSize: 16, bold: true, color: i === 1 ? C.white : C.ink });
    text(s, p.price, p.x + 0.24, 3.14, 1.3, 0.61, { fontSize: 34, bold: true, color: i === 1 ? "F2B7AC" : p.c });
    text(s, p.cap, p.x + 0.28, 3.83, 2.75, 0.25, { fontSize: 9.5, color: i === 1 ? "D8D4CD" : C.muted });
    line(s, p.x + 0.24, 4.22, p.x + 3.38, 4.22, i === 1 ? "54514B" : C.line);
    text(s, p.desc, p.x + 0.24, 4.39, 3.0, 0.28, { fontSize: 11, bold: true, color: i === 1 ? C.white : C.ink });
    text(s, p.items.join("  ·  "), p.x + 0.24, 4.83, 3.05, 0.47, { fontSize: 9.5, color: i === 1 ? "D8D4CD" : C.muted, valign: "top" });
  });
  text(s, "Yearly billing is shown as 20% off on the product page. Prices are proposed, not validated revenue or contracted pricing.", 0.86, 5.98, 11.4, 0.38, { fontSize: 10, color: C.muted, italic: true });
}

// 9 — Go to market
{
  const s = addSlide();
  heading(s, "Go-to-market", "Earn trust in focused pilots before scaling.", "Recommended first motion: recruit design partners, prove adoption and usefulness, then systematize acquisition.");
  const stages = [
    ["01  DISCOVER", "Interview HR, managers and employees; test privacy language and buying owner.", "Output: validated problem + pilot criteria", C.blue],
    ["02  PILOT", "Run a time-boxed team trial; measure participation, repeat use and actionability.", "Output: evidence + product fixes", C.red],
    ["03  PACKAGE", "Turn proven use cases into onboarding, templates and a repeatable team rollout.", "Output: sales-ready offer", C.green],
  ];
  stages.forEach((d, i) => {
    const x = 0.78 + i * 4.14;
    rect(s, x, 2.42, 3.7, 2.82, C.white, { line: C.line });
    pill(s, d[0], x + 0.22, 2.67, 1.7, i === 1 ? C.redSoft : C.blueSoft, d[3]);
    text(s, d[1], x + 0.22, 3.25, 3.14, 0.9, { fontSize: 12, color: C.ink, valign: "top" });
    line(s, x + 0.22, 4.35, x + 3.4, 4.35);
    text(s, d[2], x + 0.22, 4.57, 3.05, 0.42, { fontSize: 10, bold: true, color: C.muted });
  });
  text(s, "Pilot success metrics to define with partners", 0.84, 5.72, 4.5, 0.34, { fontSize: 13, bold: true });
  text(s, "Activation  ·  weekly response rate  ·  repeat use  ·  manager action taken  ·  employee trust feedback", 0.84, 6.13, 11.5, 0.35, { fontSize: 11.5, color: C.redDark });
}

// 10 — Positioning
{
  const s = addSlide();
  heading(s, "Positioning", "A human signal layer—not another surveillance dashboard.", "PULSE aims to connect personal awareness and team-level context while keeping individual wellbeing responses private.");
  const cols = [0.9, 4.95, 9.0];
  const headers = ["ACTIVITY TOOLS", "PULSE", "PULSE SURVEYS"];
  const descs = [
    "Often emphasize time or output; may not include a voluntary wellbeing pulse.",
    "Combines private activity timing, weekly pulse signals and suppressed team aggregates.",
    "Capture feedback, but may not pair it with day-to-day work-rhythm context.",
  ];
  cols.forEach((x, i) => {
    const isCenter = i === 1;
    rect(s, x, 2.55, 3.45, 2.24, isCenter ? C.dark : C.white, { line: isCenter ? C.dark : C.line });
    text(s, headers[i], x + 0.24, 2.83, 3.0, 0.26, { fontSize: 10, bold: true, charSpacing: 1.2, color: isCenter ? "F2B7AC" : C.muted });
    text(s, descs[i], x + 0.24, 3.35, 2.95, 1.02, { fontSize: 12, color: isCenter ? C.white : C.ink, valign: "top" });
  });
  text(s, "Differentiation to validate", 0.93, 5.25, 3.2, 0.32, { fontSize: 14, bold: true });
  bullet(s, "Useful without individual surveillance", 0.97, 5.73, 3.3, C.ink, C.red, 11);
  bullet(s, "Privacy thresholds people can explain", 5.05, 5.73, 3.25, C.ink, C.red, 11);
  bullet(s, "Signals designed to prompt conversation", 9.05, 5.73, 3.3, C.ink, C.red, 11);
}

// 11 — Roadmap
{
  const s = addSlide();
  heading(s, "Execution", "Prove the foundations. Then scale the workflow.", "Suggested roadmap; timing and scope should be set with design partners and engineering capacity.");
  const phases = [
    ["NOW", "Harden", "Complete deployment wiring; verify auth, data paths, security and billing configuration.", C.red],
    ["NEXT", "Validate", "Run design-partner pilots; test response thresholds, onboarding and manager actionability.", C.gold],
    ["LATER", "Scale", "Improve integrations, team rollout tooling, analytics quality and operational readiness.", C.blue],
  ];
  phases.forEach((d, i) => {
    const x = 0.82 + i * 4.12;
    rect(s, x, 2.52, 3.62, 2.45, C.white, { line: C.line });
    pill(s, d[0], x + 0.24, 2.78, 0.85, d[3] === C.red ? C.redSoft : d[3] === C.gold ? C.goldSoft : C.blueSoft, d[3]);
    text(s, d[1], x + 0.24, 3.32, 3.0, 0.42, { fontSize: 21, bold: true });
    text(s, d[2], x + 0.24, 3.9, 3.04, 0.72, { fontSize: 11, color: C.muted, valign: "top" });
  });
  rect(s, 0.82, 5.43, 11.72, 0.78, C.greenSoft);
  text(s, "North-star outcome", 1.08, 5.62, 1.75, 0.26, { fontSize: 12, bold: true, color: C.green });
  text(s, "Teams can notice strain earlier and act—without weakening employee trust.", 3.05, 5.57, 8.9, 0.36, { fontSize: 15, bold: true, color: C.ink });
}

// 12 — Close / next steps
{
  const s = addSlide();
  s.background = { color: C.dark };
  circle(s, 10.2, -1.0, 4.8, C.redDark);
  circle(s, 11.28, 1.43, 2.3, C.red);
  label(s, "The next step", 0.8, 0.72, "F2B7AC");
  text(s, "Build trust.\nProve value.\nScale carefully.", 0.8, 1.28, 6.3, 2.12, { fontFace: "Aptos Display", fontSize: 34, bold: true, color: C.white, valign: "top" });
  text(s, "We’re looking for design partners willing to test a privacy-first approach to employee feedback and work-rhythm awareness.", 0.84, 3.73, 6.6, 0.8, { fontSize: 15, color: "D8D4CD", valign: "top" });
  const asks = [
    "Share current wellbeing / workload listening challenges",
    "Co-design a small, consent-led team pilot",
    "Define what useful and trustworthy outcomes look like",
  ];
  asks.forEach((a, i) => {
    circle(s, 8.05, 2.2 + i * 0.78, 0.28, C.red);
    text(s, `${i + 1}`, 8.06, 2.24 + i * 0.78, 0.25, 0.16, { fontSize: 9, bold: true, color: C.white, align: "center" });
    text(s, a, 8.52, 2.14 + i * 0.78, 3.65, 0.42, { fontSize: 12, color: C.white });
  });
  line(s, 0.82, 5.35, 12.45, 5.35, "514B45", 1);
  text(s, "PULSE", 0.84, 5.7, 1.25, 0.42, { fontSize: 23, bold: true, color: C.white });
  text(s, "A privacy-first product concept. Not yet evidence of validated market demand, paid customers, or production-ready deployment.", 2.25, 5.68, 9.95, 0.56, { fontSize: 10, color: "C8C3BC", valign: "top" });
  text(s, "12", 12.56, 7.16, 0.2, 0.18, { fontSize: 8, color: "D8D4CD", align: "right" });
}

const outputPath = path.resolve(__dirname, "PULSE_Business_Deck_12_Slides.pptx");
pptx.writeFile({ fileName: outputPath });
