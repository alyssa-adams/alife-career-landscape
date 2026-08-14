# The ALife Career Landscape

*"This talk is written in swarm chemistry."*

A talk for **ERA Minicon 2026** (Sunday 16 August) on academia, industry, and the
spaces in between — and how to figure out what's right for you — run with the
field's own toolkit: the whole hour is framed in Hiroki Sayama's Swarm Chemistry,
with live simulations throughout.

**Alyssa Adams** · Vice President, ISAL · R&D Senior Scientific Research Advisor,
Cross Compass · formerly Deputy Director, Cross Labs Kyoto

---

## Open the slides

Download **[`slides.html`](slides.html)** and open it in a browser. It is one
self-contained file — no install, no network, nothing phones home. It works with
wifi off, which is how it's presented.

- **36 talk slides**, then **17 backup slides** behind them — the extended
  arguments, caveats, and full data tables that answer the questions the talk
  tends to provoke.
- **Keys:** `→` next · `←` back · `g` + number + `Enter` jump to a slide ·
  `t` activity timer · `?` help.
- Prefer paper? [`slides.pdf`](slides.pdf) is all 53 slides, static. You lose
  the simulations and keep the argument.

Every factual claim carries its citation on the slide where it appears, with a
working link. Claims the research could not verify are flagged on-slide rather
than asserted.

## The worksheet

**[`worksheet.pdf`](worksheet.pdf)** — two pages that pair with the talk's
exercises: the Life Dashboard, a week of Good Time Journal rows, AEIOU prompts,
the translation drill, and three five-year plans, plus further reading. Ten
quiet minutes with page one is the best preparation for the live session.

## The simulations

Eight canvases, all vanilla JavaScript on `<canvas>` — no libraries. Seeded,
fixed timestep, deterministic: the run you see is the run I rehearsed. The
sliders and buttons are yours.

| Slide | What's running | Worth trying |
|---|---|---|
| 2 | Sayama's Swarm Chemistry, his published recipes, parameters untouched | `RECIPE ▸` cycles Pulsating Eye → Swinger → Cell with Two Nuclei → Rotary |
| 3 | One agent in the swarm, two sensor dials | Drag `OUTWARD REACH` toward *blind*, then `INWARD GAIN` toward *numb* — the same swarm hands it four different lives |
| 8 | Hill-climbing while the landscape decays underfoot | `CHANGE RATE` and `CROWDING` |
| 12 | Boids (Reynolds 1987) steering on a visible field that isn't the true one | Slide `FIELDS` from *decoupled* to *aligned* and watch the flock's fortunes reverse |
| 21 | The same 40 agents dropped into three ambient mixtures — real Swarm Chemistry | `RESHUFFLE ⟳` reseeds live; the three outcomes are unanimous over 16 seeds per pairing |
| 26 | The copying trap (Lazer & Friedman 2007) | Watch the connected population lead, then stall |
| 28 | Niche construction — the ground rises where they stand | `SCATTER THEM` |
| 31 | Explore vs exploit vs anneal on a landscape that shifts mid-run | `PIVOT RULE`, then run it again |

The Swarm Chemistry port is faithful, not decorative: kinetics ported
line-for-line from Sayama's own GPLv3 simulator source (parameter order,
1/d separation, whim gate, double-buffered velocities), recipes verbatim from
his homepage, his names on the readouts.

## Rebuild it, verify it

```
node build.js            # deck/ + sims/  →  slides.html (byte-identical)
node test/sc-smoke.js    # swarm port physics gates: parse counts, boundedness,
                         # no-NaN, cohesion, determinism — plain node, no browser
node test/sc0b-sweep.js  # the four slider fates on slide 3, over 8 seeds
node test/sc3-search.js  # the slide-20 pairing classifier, 16 seeds per pairing
```

Sources: slide content in `deck/slides.js`, engine in `deck/deck.js`, styles
(and the embedded OFL fonts) in `deck/slides-src.html`, simulations in `sims/`.

## Credits & licences

- **Swarm Chemistry** — Hiroki Sayama. Sayama (2009), *Artificial Life*
  15(1):105–114, [doi:10.1162/artl.2009.15.1.15107](https://doi.org/10.1162/artl.2009.15.1.15107) ·
  [simulator & recipes](https://bingweb.binghamton.edu/~sayama/SwarmChemistry/).
  The port in `sims/sim0-swarm.js` derives from his GPLv3 simulator and is
  **GPLv3** accordingly, with provenance notes in the file header.
- **Picbreeder specimens** (slide 7) — rendered from the original CPPN genomes
  at [picbreeder.net](https://picbreeder.net/), verified against the archived
  site and Secretan et al. (2011). Images © UCF Research Foundation,
  non-commercial licence; credited on-slide by evolver username.
- **Boids** — Reynolds (1987), *SIGGRAPH*. All other findings are cited on the
  slide that uses them.
- **Type** — Fraunces, Archivo, Azeret Mono (SIL Open Font License, embedded).
- Everything else (slides, worksheet, remaining code) © 2026 Alyssa Adams.
  If you'd like to reuse any of it, just ask — the answer is probably yes.

Built for the ERA community. See you in the chat.
