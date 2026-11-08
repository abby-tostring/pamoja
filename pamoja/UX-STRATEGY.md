# Pamoja UX, attention, and conversion strategy

This design uses established human-computer interaction principles, not claims that any layout guarantees conversion. Validate the assumptions with usability testing, analytics, and A/B tests.

## 1. Visual layout & reading patterns

- **Top left:** brand and wayfinding. The homepage header follows a familiar left-brand/right-action convention; a simple nav avoids decision overload.
- **F-pattern:** scanning research from Nielsen Norman Group documents F-shaped fixation patterns on text-heavy pages. Therefore, headings and critical first words are front-loaded and the feature grid uses concise left-aligned copy. F-pattern is descriptive, not a rule every user follows.
- **Z-pattern:** the sparse hero uses a left-to-right narrative from value proposition to product preview; the CTA sits immediately below the copy. Z-shaped scanning is a design heuristic, not a universal eye-tracking finding.
- **Gutenberg diagram:** useful as a historical composition heuristic; not treated as rigorous predictive eye-tracking science. Prioritize semantic hierarchy and task relevance over quadrant formulas.
- **Dashboard:** primary totals at the top, activity and groups below, action buttons near the relevant context.

## 2. First five seconds

- **Message:** “Good times. No money drama.” explains the emotional benefit immediately; the next sentence specifies the task and audience.
- **Single dominant CTA:** “Start splitting for free” is above the fold, with a secondary low-commitment “See how it works” link.
- **Proof of concept:** the Diani example preview demonstrates exactly what the app tracks, avoiding vague marketing claims or fabricated customer testimonials.
- **Low cognitive load:** short sentences, limited choices, clear currency notation, and a familiar card-based dashboard reduce unnecessary processing (cognitive load theory).
- **No intrusive popups:** they would interrupt the primary task and add friction.

## 3. Visual anchors & directional cues

- **Von Restorff effect:** a visually distinct emerald primary CTA against cream/white surfaces makes the main action stand out. Color contrast and whitespace, not constant animation, create salience.
- **Directional cues:** arrows are paired with actionable verbs; chevrons appear on navigable group cards. Directional cues reinforce, rather than replace, clear labels.
- **Gestalt proximity:** controls are grouped with the data they change; expenses and settlement records are visually separated.
- **Accessible focus:** interactive elements have focus styles; meaningful state is not conveyed by color alone.

## 4. Imagery and human psychology

- **Product-led preview first:** the realistic Diani dashboard is more relevant than decorative stock faces because it helps users predict the product's usefulness.
- **Faces:** human faces often attract visual attention, but their effect depends on task, placement, and context. Avoid the unsupported claim that faces always increase conversions.
- **Emotional framing:** relatable scenarios (travel, groceries, shared rent) evoke concrete memories and help people identify with the problem. Avoid manipulative urgency and fake social proof.
- **Performance:** the hero mockup is HTML/CSS rather than a heavy image, so it remains crisp, accessible, and fast to render.

## 5. Typography & microcopy

- **Hierarchy:** large bold hero (~48–72 px responsive), 30–40 px page headings, 18–20 px card headings, 14–18 px body, and short 12–14 px supporting labels.
- **Readable measure:** hero body copy is constrained to ~32–40rem with generous line-height; smaller screens reflow naturally.
- **Front-loaded language:** “Add expense,” “Record payment,” and “Invite” state the result, reducing recognition effort.
- **Error prevention:** split totals are validated, dangerous actions ask for confirmation, and manual settlement warnings clearly explain that no money is transferred.
- **Scannability:** descriptive headings, whitespace, and short explanatory copy reduce scanning effort; bold is reserved for important labels.

## Measurement plan

Track landing CTA click-through, registration completion, first-group creation, first-expense completion, invite acceptance, settlement completion, and task errors. Obtain consent for analytics where applicable. Run A/B tests only with sufficient traffic; test one meaningful change at a time, report confidence intervals, and avoid overinterpreting small samples.

## Further reading

- Nielsen Norman Group: https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- Nielsen Norman Group: https://www.nngroup.com/articles/how-users-read-on-the-web/
- Nielsen Norman Group: https://www.nngroup.com/articles/recognition-and-recall/
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Sweller (1988), Cognitive Load During Problem Solving: Effects on Learning.
- von Restorff (1933), investigations into isolation effects in memory.
