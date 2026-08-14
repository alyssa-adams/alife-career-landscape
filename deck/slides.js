/* =============================================================================
   "The ALife Career Landscape"  —  ERA Minicon 2026, Sunday 16 August
   Alyssa Adams · VP of ISAL · Cross Compass
   (Title matches the Minicon announcement. "You are the agent" is the spoken
   framing device — it is deliberately not printed anywhere.)

   Every factual claim carries its source on the slide, with a working link.
   Claims the research could NOT verify are marked and are not asserted.

   STRUCTURE — read this before editing.
   The presented path is slides 1–35. Everything after D.appendix() is BACKUP:
   material that lost the 7 August red-team pass. It still ships, because the
   file is the artifact 550 people read afterwards, and because "jump to the
   slide that answers the question" beats "let me explain" during Q&A.

   THE 9 AUGUST VISUAL PASS (fleet-reviewed) — the rules it left behind:
   · One headline per slide, aimed at <= 8 words, plus AT MOST one element
     (a number, a quote, a diagram, a table <= 4 rows, a mock UI, or nothing).
   · The argument lives in speaker_notes.md and in her mouth. If a
     sentence is about to be spoken, it is not also printed.
   · Kickers are LABELS ("Section 4", "Field notes"), never sentences.
   THE 10 AUGUST PASS: the talk now opens inside its frame — two live
   Swarm Chemistry slides (Sayama) before any career content; sims render
   agents as oids; "acts" are called "sections"; palette is EMISSION.
   · No printed "It's not X. It's Y." machinery. Say it; don't set it.
   · Prose that carried numbers moved into .src footnotes, which are sacred.
   If you add a slide to the presented path, cut one. The hour is a hard
   budget and this deck has already overrun it once.
   ============================================================================= */

(function () {
  'use strict';
  var D = window.Deck;

  /* ---------- 0. OPEN ---------------------------------------------------- */

  // 1 — title (matches the announcement)
  D.add(
    '<div class="kicker">ERA Minicon · 16 August 2026</div>' +
    '<h1>The ALife<br>Career Landscape</h1>' +
    '<p class="lead mut" style="margin-top:10px">Academia, industry, and the spaces in between —<br>and how to figure out what\'s right for you.</p>' +
    '<p class="mut" style="font-size:20px;margin-top:26px">Alyssa Adams &nbsp;·&nbsp; Vice President, ISAL<br>' +
    'R&amp;D Senior Scientific Research Advisor, Cross Compass<br>formerly Deputy Director, Cross Labs Kyoto</p>'
  );

  /* The talk opens INSIDE its frame: two Swarm Chemistry slides before any
     career content (her request, 10 Aug: "frame this whole talk in swarm
     chemistry terms, and be explicit about that in the intro"). Slide 2 is
     the spectacle and states the frame in print; slide 3 zooms to one agent
     and hands her two sliders — outward sensing and inward sensing — the
     pair the entire hour keeps returning to. "You are the agent" stays
     SPOKEN, printed nowhere. The Lenia opener this replaces is retired;
     sims/sim0-lenia.js remains in the repo, unreferenced. */

  // 2 — the frame, stated in the open: Sayama's Swarm Chemistry, live
  D.addSim({
    act: 'The frame · Swarm Chemistry · Sayama 2009',
    title: 'This talk is written in swarm chemistry.',
    make: window.makeSim0a,
    readout: true,
    src: 'Hiroki Sayama\'s Swarm Chemistry, live — each species senses only inside its own perception radius; cohesion, alignment, separation. ' +
         'Sayama (2009) "Swarm Chemistry," <em>Artificial Life</em> 15(1):105–114 · <a href="https://doi.org/10.1162/artl.2009.15.1.15107">doi</a> · ' +
         'simulator &amp; recipes: <a href="https://bingweb.binghamton.edu/~sayama/SwarmChemistry/">bingweb.binghamton.edu/~sayama/SwarmChemistry</a> ' +
         '<span class="flag">· parameters unmodified — the names on screen are Sayama\'s own</span>'
  });

  // 3 — one agent, up close: its parameters split into two families
  D.addSim({
    act: 'The frame · one agent, up close',
    title: 'One agent. Two kinds of sensors.',
    make: window.makeSim0b,
    readout: true,
    src: 'Same physics, camera on one agent. <span style="color:var(--cyan)">Outward sensors</span>: perception radius, response to neighbours. ' +
         '<span style="color:var(--amber)">Inward</span>: its own pace, its own noise. Drag either and the same swarm hands it a different life. ' +
         '<span class="flag">· these two sliders are the talk</span>'
  });

  // 4 — the thesis: a method, not a field
  D.add(
    '<h2>Artificial life is <span class="am">a method.</span></h2>' +
    '<blockquote class="small" style="margin-top:8px">"…an interdisciplinary study of life and life-like processes that uses a ' +
    '<span class="am">synthetic methodology</span>."' +
    '<cite>Mark A. Bedau, <em>Trends in Cognitive Sciences</em> 7(11), 2003</cite></blockquote>' +
    '<div class="src">Bedau (2003) <em>TiCS</em> 7(11):505–512 · <a href="https://doi.org/10.1016/j.tics.2003.09.012">doi</a> · ' +
    '<a href="https://people.reed.edu/~mab/publications/papers/BedauTICS03.pdf">full text</a></div>'
  );

  // 5 — not a careers talk: the four gauges, drawn as gauges
  D.add(
    '<div class="wsref">Worksheet <b>p1 · q1</b> <i>now</i></div>' +
    '<div class="kicker">Designing Your Life · the first instrument</div>' +
    '<h2>A career is a subsystem of a life.</h2>' +
    '<svg class="diag" viewBox="0 0 1000 240" width="1000" height="240">' +
    '<path d="M40,170 A85,85 0 0 1 210,170" fill="none" stroke="#3E3E4C" stroke-width="12"/>' +
    '<path d="M290,170 A85,85 0 0 1 460,170" fill="none" stroke="#3E3E4C" stroke-width="12"/>' +
    '<path d="M540,170 A85,85 0 0 1 710,170" fill="none" stroke="#3E3E4C" stroke-width="12"/>' +
    '<path d="M790,170 A85,85 0 0 1 960,170" fill="none" stroke="#3E3E4C" stroke-width="12"/>' +
    '<line x1="125" y1="170" x2="76" y2="129" stroke="#70748A" stroke-width="5" stroke-linecap="round"/>' +
    '<line x1="375" y1="170" x2="416" y2="124" stroke="#FFD24A" stroke-width="5" stroke-linecap="round"/>' +
    '<line x1="625" y1="170" x2="609" y2="110" stroke="#70748A" stroke-width="5" stroke-linecap="round"/>' +
    '<line x1="875" y1="170" x2="896" y2="112" stroke="#70748A" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="125" cy="170" r="7" fill="#9CA0B2"/><circle cx="375" cy="170" r="7" fill="#FFD24A"/>' +
    '<circle cx="625" cy="170" r="7" fill="#9CA0B2"/><circle cx="875" cy="170" r="7" fill="#9CA0B2"/>' +
    '<text class="lab" x="125" y="215" text-anchor="middle">HEALTH</text>' +
    '<text class="lab" x="375" y="215" text-anchor="middle" style="fill:#FFD24A">WORK</text>' +
    '<text class="lab" x="625" y="215" text-anchor="middle">PLAY</text>' +
    '<text class="lab" x="875" y="215" text-anchor="middle">LOVE</text></svg>' +
    '<div class="src">Burnett &amp; Evans, <em>Designing Your Life</em>, Knopf 2016, ch. 1 · worksheet ' +
    '<a href="https://designingyour.life/worksheets-and-discussion-questions/">designingyour.life/worksheets</a></div>'
  );

  // 6 — the two guides, joined at their common ground (10 Aug: reframed off
  // "Stanley vs DYL" — the fight framing is retired; what they share is
  // serendipity, and the compass disagreement is spoken as a nuance, not
  // printed as a versus)
  D.add(
    '<div class="wsref later">Worksheet <b>p2 · q7</b> <i>take home</i></div>' +
    '<div class="kicker">Two guides</div>' +
    '<h2>Both books run on <span class="am">serendipity.</span></h2>' +
    '<div class="cols" style="margin-top:14px;align-items:stretch">' +
    '<div class="card" style="text-align:center;padding:34px 24px;display:flex;flex-direction:column">' +
    '<div class="am" style="font-family:var(--display);font-size:58px;font-weight:600;line-height:1.06;min-height:126px;display:flex;align-items:center;justify-content:center">TREASURE<br>HUNTER</div>' +
    '<p class="mut" style="font:600 15px/1.7 var(--mono);margin:20px 0 0;max-width:none">STANLEY &amp; LEHMAN · 2015<br>CH. 4: "THE FALSE COMPASS"</p></div>' +
    '<div class="card" style="text-align:center;padding:34px 24px;display:flex;flex-direction:column">' +
    '<div class="cy" style="font-family:var(--display);font-size:58px;font-weight:600;line-height:1.06;min-height:126px;display:flex;align-items:center;justify-content:center">COMPASS</div>' +
    '<p class="mut" style="font:600 15px/1.7 var(--mono);margin:20px 0 0;max-width:none">BURNETT &amp; EVANS · 2016<br>THEY CALL IT "WAYFINDING"</p></div></div>' +
    '<div class="src">Stanley &amp; Lehman, <em>Why Greatness Cannot Be Planned</em>, Springer 2015 · <a href="https://doi.org/10.1007/978-3-319-15524-1">doi.org/10.1007/978-3-319-15524-1</a> ' +
    '&nbsp;·&nbsp; Burnett &amp; Evans, <em>Designing Your Life</em>, Knopf 2016, ISBN 978-1-101-87532-2 ' +
    '&nbsp;·&nbsp; Stanley telling his own career non-objectively: <em>Cross Roads #42</em>, Cross Labs AI, 14 Mar 2024 — I hosted it · ' +
    '<a href="https://www.youtube.com/watch?v=73svHfR3eo8">youtube.com/watch?v=73svHfR3eo8</a> · ' +
    '"the alternative to the objective path is the path of the interesting" (26:46) ' +
    '<span class="flag">· quote is from auto-captions — check it against the audio before speaking it</span></div>'
  );

  // 7 — Picbreeder: THE REAL SPECIMENS (10 Aug), rendered at print quality
  // from the original CPPN genomes and verified three ways (archived-site
  // pixel correlation >= 0.98, exact genome stats vs Secretan et al. fig. 13,
  // the site's own parent records). The face->car pair sits adjacent so the
  // eyes-becoming-wheels is visible on screen. Data URIs: deck/picbreeder-data.js.
  D.add(
    '<div class="kicker">Picbreeder</div>' +
    '<h2>One user\'s alien face became<br>another user\'s car.</h2>' +
    '<div style="display:flex;gap:22px;margin-top:12px;align-items:flex-start">' +
    '<figure style="margin:0"><img src="' + window.PICBREEDER.skull + '" alt="Picbreeder skull" style="width:218px;height:218px;display:block;border:1px solid var(--rule);border-radius:4px">' +
    '<figcaption style="font:600 14px/1.5 var(--mono);letter-spacing:.06em;color:var(--dim);text-align:center;margin-top:10px">SKULL · 74 GENS</figcaption></figure>' +
    '<figure style="margin:0"><img src="' + window.PICBREEDER.butterfly + '" alt="Picbreeder butterfly" style="width:218px;height:218px;display:block;border:1px solid var(--rule);border-radius:4px">' +
    '<figcaption style="font:600 14px/1.5 var(--mono);letter-spacing:.06em;color:var(--dim);text-align:center;margin-top:10px">BUTTERFLY · 104 GENS</figcaption></figure>' +
    '<figure style="margin:0"><img src="' + window.PICBREEDER.alien + '" alt="Picbreeder alien face" style="width:218px;height:218px;display:block;border:1px solid var(--rule);border-radius:4px">' +
    '<figcaption style="font:600 14px/1.5 var(--mono);letter-spacing:.06em;color:var(--dim);text-align:center;margin-top:10px">ALIEN FACE · <span style="color:var(--ink)">ACAMPBEL</span></figcaption></figure>' +
    '<div style="height:218px;display:flex;align-items:center"><span style="font-family:var(--display);font-size:40px;color:var(--amber)">→</span></div>' +
    '<figure style="margin:0"><img src="' + window.PICBREEDER.car + '" alt="Picbreeder car" style="width:218px;height:218px;display:block;border:1px solid var(--amber);border-radius:4px">' +
    '<figcaption style="font:600 14px/1.5 var(--mono);letter-spacing:.06em;color:var(--dim);text-align:center;margin-top:10px">CAR · <span style="color:var(--amber)">KEN (STANLEY)</span></figcaption></figure></div>' +
    '<p class="mut" style="font-size:20px;margin-top:10px">"I was not trying to breed a car." — Ken Stanley</p>' +
    '<div class="src">Real specimens, rendered from the original CPPN genomes (<a href="https://picbreeder.net/">picbreeder.net</a>), verified against the archived site (pixel r ≥ 0.98) and ' +
    'Secretan et al. (2011) fig. 13, <em>Evolutionary Computation</em> 19(3):373–403 · <a href="https://doi.org/10.1162/EVCO_a_00030">doi</a> · quote: ' +
    '<a href="https://tt.research.ucf.edu/news/faculty-feature-dr-ken-stanley-the-myth-of-the-objective-part-ii/">UCF faculty feature</a> ' +
    '<span class="flag">· two different users, per the site\'s own record: acampbel published the face; Stanley branched it — the eyes became the wheels. Skull = the objective-search-fails specimen (Woolley &amp; Stanley 2011); car = the serendipity one. Images © UCF Research Foundation, non-commercial licence.</span></div>'
  );

  /* ---------- SECTION 1 · two kinds of sensing ------------------------- */

  // 8 — two kinds of sensing, as two round particles (10 Aug: the boid
  // triangles became flat discs to match the sims' new particle style; the
  // gold halo fills became stroke rings — no glows anywhere in this deck).
  // Violet lines to the neighbours ARE "a vector"; tight gold rings = inward.
  D.add(
    '<div class="act">Section 1</div>' +
    '<h2>Two kinds of sensing.</h2>' +
    '<svg class="diag" viewBox="0 0 1050 250" width="1050" height="250">' +
    '<circle cx="250" cy="100" r="86" fill="none" stroke="#8A8AFF" stroke-width="2" stroke-dasharray="5 8" opacity=".55"/>' +
    '<line x1="266" y1="100" x2="182" y2="56" stroke="#8A8AFF" stroke-width="2" opacity=".4"/>' +
    '<line x1="266" y1="100" x2="316" y2="76" stroke="#8A8AFF" stroke-width="2" opacity=".4"/>' +
    '<line x1="266" y1="100" x2="294" y2="156" stroke="#8A8AFF" stroke-width="2" opacity=".4"/>' +
    '<circle cx="182" cy="56" r="8" fill="#9CA0B2"/>' +
    '<circle cx="316" cy="76" r="8" fill="#9CA0B2"/>' +
    '<circle cx="294" cy="156" r="8" fill="#9CA0B2"/>' +
    '<circle cx="266" cy="100" r="13" fill="#8A8AFF"/>' +
    '<text class="lab" x="250" y="212" text-anchor="middle" style="fill:#8A8AFF">EXTEROCEPTION</text>' +
    '<text x="250" y="240" text-anchor="middle">THE OTHERS · A VECTOR</text>' +
    '<circle cx="806" cy="100" r="40" fill="none" stroke="#FFD24A" stroke-width="2" opacity=".26"/>' +
    '<circle cx="806" cy="100" r="26" fill="none" stroke="#FFD24A" stroke-width="2" opacity=".5"/>' +
    '<circle cx="806" cy="100" r="13" fill="#FFD24A"/>' +
    '<text class="lab" x="800" y="212" text-anchor="middle" style="fill:#FFD24A">INTEROCEPTION</text>' +
    '<text x="800" y="240" text-anchor="middle">YOURSELF · A SCALAR</text></svg>'
  );

  // 9 — SIM 2 (its title is the act's punchline; say the rest over it)
  D.addSim({
    act: 'Section 1 · the visible field and the true one',
    title: 'Everything they can see says they\'re winning.',
    make: window.makeSim2,
    legend: '<span class="sw" style="background:#8A8AFF"></span>WORLD-ONLY ' +
            '<span class="sw" style="background:#FF5C68"></span>SELF-ONLY, SEES NO ONE ' +
            '<span class="sw" style="background:#FFD24A"></span>BOTH <span class="sep">·</span> ' +
            'BOTTOM BARS = AVG FELT ENERGY PER FLOCK',
    src: 'Boids: Reynolds (1987) "Flocks, Herds, and Schools," <em>SIGGRAPH</em> 21(4):25–34 · <a href="https://doi.org/10.1145/37401.37406">doi</a> — ' +
         'flocking is exteroception here, so the red interoception-only population cannot flock · ' +
         'run-and-tumble chemotaxis as the inner mechanism · interoception vs exteroception: Sherrington (1906).'
  });

  // 10 — Stanley's scope condition, as two quote cards
  D.add(
    '<div class="kicker">The scope condition</div>' +
    '<h2>Stanley draws the line himself.</h2>' +
    '<div class="cols" style="margin-top:10px">' +
    '<div class="card"><h3 class="gr">Getting lunch</h3>' +
    '<blockquote class="small" style="border:none;padding:0;font-size:23px;max-width:none">"You can make that an objective and that\'s very reasonable."</blockquote></div>' +
    '<div class="card"><h3 class="am">Curing cancer · creating AI</h3>' +
    '<blockquote class="small" style="border:none;padding:0;font-size:23px;max-width:none">"We just don\'t know what the intervening stepping stones are… there clearly we have no idea where we have to travel."</blockquote></div></div>' +
    '<p class="mut" style="font:500 17px/1.4 var(--mono);margin-top:14px;text-align:center">KEN STANLEY · THE JIM RUTT SHOW EP130 · 2021</p>' +
    '<div class="src">Full transcript · <a href="https://jimruttshow.blubrry.net/the-jim-rutt-show-transcripts/transcript-of-episode-130-ken-stanley-on-why-greatness-cannot-be-planned/">jimruttshow.blubrry.net — EP130</a></div>'
  );


  /* ---------- SECTION 2 · the ground moves — and the real-world receipts - */

  // 11 — SIM 1 (carries the section opening itself)
  D.addSim({
    act: 'Section 2 · the environment is non-stationary',
    title: 'The ground is moving — partly because you moved.',
    make: window.makeSim1,
    legend: '<span class="sw" style="background:#8A8AFF"></span>CLIMBERS ' +
            '<span class="sw" style="background:#FFD24A"></span>EXPLORERS ' +
            '<span class="sw" style="background:#6E7080"></span>STRANDED — OUT OF FUEL, CAN REVIVE ' +
            '<span class="dash"></span>GROUND AT START <span class="sep">·</span> ' +
            'X WHAT YOU WORK ON <span class="sep">·</span> Y HOW WELL IT GOES',
    src: 'Moving-peaks-style non-stationary optimisation: Branke (1999) <em>CEC</em> · ' +
         '<a href="https://doi.org/10.1109/CEC.1999.785502">doi.org/10.1109/CEC.1999.785502</a> &nbsp;·&nbsp; ' +
         'crowding term after McPherson &amp; Ranger-Moore, "Evolution on a Dancing Landscape," ' +
         '<em>Social Forces</em> 70(1), 1991 · <a href="https://doi.org/10.2307/2580060">doi.org/10.2307/2580060</a>'
  });

  // 12 — the beat after the sim
  D.add(
    '<h2 class="big">Nobody made a mistake.</h2>' +
    '<p class="lead mut" style="margin-top:18px">Every stranded agent is still at a local maximum.</p>'
  );

  // 13 — the receipt: the peak moved  (funding detail lives in .src + backup)
  D.add(
    '<h2>The peak really did move.</h2>' +
    '<div class="cols" style="margin-top:16px">' +
    '<div class="card"><h3 class="cy">Google DeepMind · 2024</h3>' +
    '<p>Position paper: open-endedness is <em>essential</em> for superhuman AI.</p></div>' +
    '<div class="card"><h3 class="cy">Sakana AI · 2026</h3>' +
    '<p>Three artificial-life releases in four months — one cites <em>the book</em> by name.</p></div></div>' +
    '<div class="src">Hughes et al. (2024) arXiv:2406.04268 · <a href="https://arxiv.org/abs/2406.04268">arxiv.org/abs/2406.04268</a> ' +
    '<span class="flag">— cites the journal <em>Artificial Life</em> four times and concedes ALife\'s subjectivity critique by name</span> · ' +
    '<a href="https://sakana.ai/digital-ecosystem/">sakana.ai/digital-ecosystem</a> · <a href="https://sakana.ai/smart-cellular-bricks/">smart-cellular-bricks</a> · ' +
    '<a href="https://sakana.ai/picbreeder-ai/">picbreeder-ai</a> · Stanley\'s own latest is an <em>ALife</em> paper: <a href="https://arxiv.org/abs/2607.02954">arXiv:2607.02954</a>, 3 Jul 2026 ' +
    '&nbsp;·&nbsp; US funding: <strong>proposed</strong> −56.9% vs <strong>enacted</strong> −3.4%; GRFP 2,600→1,500→2,500, second-years excluded; ' +
    '29% of non-US physics PhDs left within six months (AIP). Full table: backup 39. ' +
    '<span class="flag">· proposed, enacted and enjoined are three different things</span></div>'
  );


  // 14 — the resolution, as the mapping table (Act 2 ends on the payoff)
  D.add(
    '<div class="wsref later">Worksheet <b>p2 · q6</b> <i>take home</i></div>' +
    '<h2>Designing Your Life is <span class="am">MAP-Elites.</span></h2>' +
    '<table style="margin-top:16px"><tr><th>Quality-Diversity</th><th>Designing Your Life</th></tr>' +
    '<tr><td>Local quality criterion</td><td>Workview / Lifeview</td></tr>' +
    '<tr><td>Behaviour characterisation</td><td>The dimensions you vary a life along</td></tr>' +
    '<tr><td>Archive of diverse elites</td><td>Three Odyssey Plans, unranked</td></tr>' +
    '<tr><td>Cheap evaluation</td><td>Prototype conversations</td></tr></table>' +
    '<div class="src">Lehman &amp; Stanley (2011) <em>Evol. Comput.</em> 19(2) · <a href="https://doi.org/10.1162/EVCO_a_00025">doi</a> ' +
    '<span class="flag">— "make novelty an objective and fitness another objective in a multi-objective formulation," inside "Abandoning Objectives" itself: QD factorised the compass from heading into local refinement</span> &nbsp;·&nbsp; ' +
    'Mouret &amp; Clune (2015) MAP-Elites · <a href="https://arxiv.org/abs/1504.04909">arXiv:1504.04909</a> &nbsp;·&nbsp; ' +
    'Pugh, Soros &amp; Stanley (2016) <em>Front. Robot. AI</em> 3:40 · <a href="https://doi.org/10.3389/frobt.2016.00040">doi</a></div>'
  );

  /* ---------- ACTIVITY A2 ------------------------------------------------- */

  // 15 — A2 opener, redesigned 14 Aug as a LIVE CO-DESIGN: the room decides
  // the instrument together, then runs it. The entry frame (traces → reward)
  // is printed; the three design decisions are made in chat; the prompt gets
  // pasted and the timer runs on this slide. Pocket defaults (the old Good
  // Time Journal prompt) live in the speaker notes in case chat stalls —
  // slides 16–17 still assume "a scored list of recent activities" came out
  // of this, so steer the axes toward engagement-and-energy-shaped choices.
  D.add(
    '<div class="wsref">Worksheet <b>p1 · q2</b> <i>now</i></div>' +
    '<div class="act">Your turn · we design this instrument together</div>' +
    '<h2>Your reward function — inferred<br>from what you actually <span class="am">did.</span></h2>' +
    '<div class="cols-3" style="margin-top:16px">' +
    '<div class="card"><h3 class="cy" style="font-size:21px">1 · THE TRACE</h3><p class="mut" style="font-size:19px">Which slice of recent behaviour do we sample?</p></div>' +
    '<div class="card"><h3 class="cy" style="font-size:21px">2 · THE AXES</h3><p class="mut" style="font-size:19px">What two scores does every item get?</p></div>' +
    '<div class="card"><h3 class="cy" style="font-size:21px">3 · THE PROBE</h3><p class="mut" style="font-size:19px">One question we ask of the worst row.</p></div></div>' +
    '<div class="chat" style="margin-top:12px">In chat: propose · 👍 what you like · I paste the winning design, then the timer runs.</div>' +
    '<div class="timer" data-secs="135" style="font-size:60px;margin-top:10px">2:15</div>',
    'activity'
  );

  // 16 — AEIOU: five letters, five nouns
  D.add(
    '<div class="wsref">Worksheet <b>p1 · q3</b> <i>now</i></div>' +
    '<div class="act">AEIOU · your highest-engagement activity</div>' +
    '<div class="step"><div class="n" style="font-size:42px">A</div><div class="t" style="font-size:29px">Activities</div></div>' +
    '<div class="step"><div class="n" style="font-size:42px">E</div><div class="t" style="font-size:29px">Environments</div></div>' +
    '<div class="step"><div class="n" style="font-size:42px">I</div><div class="t" style="font-size:29px">Interactions</div></div>' +
    '<div class="step"><div class="n" style="font-size:42px">O</div><div class="t" style="font-size:29px">Objects</div></div>' +
    '<div class="step"><div class="n" style="font-size:42px">U</div><div class="t" style="font-size:29px">Users</div></div>' +
    '<div class="timer" data-secs="150" style="font-size:84px;margin-top:38px">2:30</div>' +
    '<div class="src">AEIOU is not a DYL invention — it is an ethnographic field-observation framework from design research ' +
    '(Doblin Group, c. 1991), repurposed from observing other people to observing yourself.</div>',
    'activity'
  );

  // 17 — the question this act exists for
  D.add(
    '<div class="wsref">Worksheet <b>p1 · q4</b> <i>now</i></div>' +
    '<p class="lead mut">Now find your <span class="mg">lowest-energy</span> activity.</p>' +
    '<h2 class="huge am" style="margin-top:22px">Who chose it?</h2>' +
    '<div class="chat">In chat: &nbsp;one word</div>',
    'activity'
  );

  // 18 — the debrief, one line
  D.add(
    '<h2 class="big">You just did inverse RL<br>on yourself.</h2>' +
    '<div style="display:grid;grid-template-columns:76px 210px 58px 210px;font:600 19px/2.1 var(--mono);letter-spacing:.05em;margin-top:30px;color:var(--dim)">' +
    '<span style="color:var(--dim)">RL</span><span style="color:var(--ink2)">REWARD</span><span style="color:var(--dim)">→</span><span style="color:var(--ink2)">BEHAVIOUR</span>' +
    '<span style="color:var(--dim)">IRL</span><span style="color:var(--ink2)">BEHAVIOUR</span><span style="color:var(--dim)">→</span><span style="color:var(--ink2)">REWARD</span></div>'
  );

  /* ---------- SECTION 3 --------------------------------------------------- */

  // 19 — the section divider that is a claim. The negation ("you are not
  // underqualified") is SPOKEN as you land here — printing both halves was the
  // exact negate-then-assert machinery this deck no longer prints.
  D.add('<div class="act">Section 3</div><h1>You are in the<br>wrong environment.</h1>');

  // 20 — SIM 3, now real Swarm Chemistry (10 Aug): the same hero recipe
  // dropped into three different ambient mixtures. "Recipe" is Sayama's own
  // word for the parameter list, which is why the title can use it honestly.
  D.addSim({
    act: 'Section 3 · the same agent, three worlds',
    title: 'Identical recipe. Three mixtures.',
    make: window.makeSim3,
    readout: true,
    src: 'Same 40 gold agents in every pane — one published Sayama ingredient, unmodified (Cell with Two Nuclei, 4/6). Ambient mixtures are published ingredients too: ' +
         'Cell 5/6 (A) · Pulsating Eye 3/3 (B) · Pulsating Eye 1/3 (C). Sayama (2009) <em>Artificial Life</em> 15(1) · <a href="https://doi.org/10.1162/artl.2009.15.1.15107">doi</a> · ' +
         '<a href="https://bingweb.binghamton.edu/~sayama/SwarmChemistry/">recipes</a> ' +
         '<span class="flag">· the pairings are ours, unanimous over 16 seeds each — RESHUFFLE reruns it live</span>'
  });

  // 21 — the market, as one number over the ghost of a vocabulary
  D.add(
    '<div class="kicker">22 employers · every live posting · 2026-08-07</div>' +
    '<h2 class="huge am" style="margin:10px 0 24px">2,400 jobs. Zero.</h2>' +
    '<p class="mut" style="font-size:23px;line-height:1.65;max-width:34em;opacity:.5">open-endedness · emergence · evolution · ' +
    'self-organisation · artificial life · quality-diversity · novelty · swarm · complex systems</p>' +
    '<p style="font:600 17px/1.5 var(--mono);color:var(--dim);margin-top:14px;max-width:none">JOBS.AC.UK, SAME DAY: &nbsp;MACHINE LEARNING <span class="am">142</span> &nbsp;·&nbsp; ARTIFICIAL LIFE <span class="mg">0</span></p>' +
    '<div class="src">Greenhouse / Lever / Ashby job APIs, 22 employers, and jobs.ac.uk — all fetched 2026-08-07. ' +
    'One title matched — school curriculum, a false positive. The 142 is the control. ' +
    '<span class="flag">· re-run the morning of the talk if you want the numbers exact</span></div>'
  );

  // 22 — the one title on earth, as the team page itself
  D.add(
    '<h2>One job title says <span class="am">"Open-endedness."</span></h2>' +
    '<div class="roster">' +
    '<div class="row"><span>SVP, Chemistry</span><span>Lila Sciences</span></div>' +
    '<div class="row hot"><span><b>SVP, Open-endedness</b> — Kenneth Stanley</span><span>Lila Sciences</span></div>' +
    '<div class="row"><span>122 open roles — none of them say it</span><span></span></div></div>' +
    '<div class="src"><a href="https://www.lila.ai/team/kenneth-stanley">lila.ai/team/kenneth-stanley</a> · ' +
    '<a href="https://www.kenstanley.net/home">kenstanley.net</a> · both verified 2026-08-07 — the title was written for the person, not the role</div>'
  );

  // 23 — the translation table, AFTER Lila: zero, the one exception, then
  // the mechanism. Ends the act right before the drill that uses it.
  D.add(
    '<h2>What the postings call it.</h2>' +
    '<table style="margin-top:14px"><tr><th>Your phrasing</th><th>Their phrasing</th></tr>' +
    '<tr><td>Evaluating with no ground truth</td><td><strong class="am">evals</strong> &nbsp;<span class="mut">— 19 live titles</span></td></tr>' +
    '<tr><td>Open-ended environment generation</td><td><strong class="am">environments</strong> &nbsp;<span class="mut">— 8 live titles</span></td></tr>' +
    '<tr><td>Collective behaviour, multi-agent dynamics</td><td><strong class="am">agents</strong> · orchestration</td></tr>' +
    '<tr><td>Whole-cell simulation</td><td><strong class="am">"Virtual Cell"</strong> &nbsp;<span class="mut">— actual postdocs</span></td></tr></table>' +
    '<p class="lead" style="margin-top:18px">The gap is <span class="am">craft</span>, not concepts.</p>' +
    '<div class="src">Verbatim, live 2026-08-07: "Research Engineer, Frontier Evals &amp; Environments" (OpenAI) · "Staff Software Engineer, Environments Infrastructure" (Anthropic) · ' +
    '"Member of Technical Staff, Evaluation Execution" (METR) · Virtual Cell postdocs: Arc Institute &nbsp;·&nbsp; the honest arithmetic: ~13 of 2,400 are research-track AND ALife-adjacent — about a dozen openings worldwide ' +
    '&nbsp;·&nbsp; barriers, both real: <a href="https://job-boards.greenhouse.io/anthropic/jobs/5198255008">Anthropic RE, evals</a> ($500–850k, asks for a <em>bachelor\'s</em>; a listed project: "take a flaky distributed eval pipeline and make it boring") · ' +
    '<a href="https://jobs.lever.co/apolloresearch/4a65c6e1-785a-4f88-8998-a97574afb7ee">Apollo Research</a> ("we don\'t require a formal background") ' +
    '&nbsp;·&nbsp; closer to home: <a href="https://www.crosslabs.org/careers">Cross Labs</a> · <a href="https://sakana.ai/careers/">Sakana AI</a> · <a href="https://www.sonycsl.co.jp/">Sony CSL Kyoto</a> — which does list 人工生命</div>'
  );

  /* ---------- ACTIVITY A3 ------------------------------------------------- */

  // 24 — the translation drill
  D.add(
    '<div class="wsref">Worksheet <b>p2 · q5</b> <i>now — flip over</i></div>' +
    '<div class="act">Your turn · 6 minutes · we read these out</div>' +
    '<div class="chat" style="font-size:30px;max-width:none;line-height:1.6">I build / study ______<br>so that ______<br>can ______</div>' +
    '<p class="mut" style="font-size:21px;margin-top:16px">It must survive a hiring manager repeating it to their boss.</p>' +
    '<div class="timer" data-secs="180" style="font-size:84px">3:00</div>',
    'activity'
  );

  /* ---------- SECTION 4 --------------------------------------------------- */

  // 25 — SIM 4 (carries the section opening itself)
  D.addSim({
    act: 'Section 4 · other agents are your environment',
    title: 'One difference: who can see whom.',
    // printed bridge (14 Aug): lands the jump from the translation drill —
    // A3 made each method legible; this section is what a community of
    // mutually-legible methods does to itself
    sub: 'You just made your method legible. Here\'s a community where everyone can read everyone\'s.',
    make: window.makeSim4,
    readout: true,
    overlay: [
      { x: 44,   y: 584, text: 'AVG QUALITY', rot: true },
      { x: 1220, y: 686, text: 'TIME → 20 S', anchor: 'right' },
      { x: 62,   y: 474, text: 'DIVERSITY — HOW SPREAD OUT', anchor: 'left' },
      { x: 682,  y: 474, text: 'DIVERSITY', anchor: 'left' }
    ],
    src: 'Lazer &amp; Friedman (2007), <em>Administrative Science Quarterly</em> 52(4):667–694 · ' +
         '<a href="https://doi.org/10.2189/asqu.52.4.667">doi.org/10.2189/asqu.52.4.667</a> &nbsp;·&nbsp; ' +
         'rule verbatim from the authors\' own poster: <a href="http://allan.friedmans.org/papers/tortoisehare_poster.pdf">tortoisehare_poster.pdf</a> ' +
         '<span class="flag">· lines are the mean of 16 replicates; bands are the full spread</span>'
  });

  // 26 — the real finding, as the curve it is (10 Aug: axis labels moved to
  // swarm vocabulary; the data is Derex's human groups, so "subgroups" — the
  // authors' own unit — stays on the annotation)
  D.add(
    '<h2>The optimum is <span class="am">5 to 10 clusters.</span></h2>' +
    '<svg class="diag" viewBox="0 0 900 252" width="900" height="252">' +
    '<rect x="270" y="30" width="130" height="188" fill="#FFD24A" opacity=".12"/>' +
    '<line x1="70" y1="218" x2="850" y2="218" stroke="#232330" stroke-width="3"/>' +
    '<line x1="70" y1="218" x2="70" y2="30" stroke="#232330" stroke-width="3"/>' +
    '<path class="curve" d="M84,206 C170,84 250,56 335,58 C470,62 650,140 838,208" stroke="#8A8AFF"/>' +
    '<text class="lab" x="335" y="104" text-anchor="middle" style="fill:#FFD24A">5–10 SUBGROUPS</text>' +
    '<text x="84" y="243">ONE BLOB</text>' +
    '<text x="845" y="243" text-anchor="end">EVERY OID ALONE</text>' +
    '<text x="82" y="24">RATE OF CUMULATIVE INNOVATION</text></svg>' +
    '<div class="src">curve: Derex, Perreault &amp; Boyd (2018) <em>Phil. Trans. R. Soc. B</em> 373:20170062, 600 people · <a href="https://doi.org/10.1098/rstb.2017.0062">doi</a> ' +
    '<span class="flag">— connected groups "maintain complex cultural traits but produce insufficient variation"; fragmented ones the reverse</span> &nbsp;·&nbsp; ' +
    'and it blinks: Bernstein, Shore &amp; Lazer (2018) <em>PNAS</em> 115(35) · <a href="https://doi.org/10.1073/pnas.1802407115">doi</a> — triads seeing each other constantly / every third round / never found the optimum ' +
    '33.3% / <strong>48.3%</strong> / 44.1% — separate experiment, separate axis; full table: backup ' +
    '<span class="flag">· the copying result reverses under conformity (Barkoczi &amp; Galesic 2016) — say this if asked</span></div>'
  );

  // 27 — SIM 4b: niche construction (the Casciaro chain moved to the backup
  // deck — its line is now spoken over this sim: "the grubby feeling is
  // measured, and it's self-reinforcing — build something and let the
  // network be a by-product")
  D.addSim({
    act: 'Section 4 · niche construction',
    title: 'The ground rises where they stand.',
    make: window.makeSim4b,
    src: 'Spatial niche-construction models: Silver &amp; Di Paolo (2006) <em>Theor. Pop. Biol.</em> 70:387–400 &nbsp;·&nbsp; ' +
         'Laland, Odling-Smee &amp; Feldman (1999) <em>PNAS</em> 96:10242–10247 · <a href="https://doi.org/10.1073/pnas.96.18.10242">doi</a> ' +
         '<span class="flag">· applied to a Discord server this is frankly a metaphor — but protected niches in innovation studies, and the sociology of scientific movements, are not</span>'
  });

  /* ---------- ACTIVITY A4 (unchanged) ------------------------------------- */

  // 28 — the workshop (the emotional peak; the timer is the hero)
  D.add(
    '<div class="act">Your turn · 5 minutes</div>' +
    '<h2 class="big">What niche does this community need<br>that doesn\'t exist yet?</h2>' +
    '<p class="mut" style="font-size:21px">an industry directory · mentor matching · a "what I actually do all day" series · a CV-translation clinic · a job board that isn\'t empty</p>' +
    '<div class="chat">Post it in chat. Anything with traction, <strong>I take to the ISAL board.</strong></div>' +
    '<div class="timer" data-secs="240" style="font-size:96px">4:00</div>',
    'activity'
  );

  // 29 — the payoff, as the number
  D.add(
    '<div class="am" style="font-family:var(--display);font-size:280px;line-height:1;font-weight:600;letter-spacing:-.015em;font-variant-numeric:tabular-nums">550</div>' +
    '<p class="lead" style="margin-top:10px">of you raised the ground under this community.</p>' +
    '<div class="src">ERA Minicon 2026 announcement — "550+ member Discord" · the count is the community\'s own</div>'
  );

  /* ---------- SECTION 5 --------------------------------------------------- */

  // 30 — SIM 5 (carries the section opening itself)
  D.addSim({
    act: 'Section 5 · explore, exploit, and when to pivot',
    title: 'The ground moves at fifteen seconds.',
    // printed bridge (14 Aug): hands off from 550/niche construction — the
    // community raises the ground; the commit decision stays individual
    sub: 'Raising the ground was the community\'s move. When to commit is only yours.',
    make: window.makeSim5,
    readout: true,
    // axis names live ON the plot now (positioned HTML, not canvas text);
    // the readout notes carry the per-panel temperature policy
    overlay: [
      { x: 27,   y: 566, text: 'AVG QUALITY', rot: true },
      { x: 1229, y: 682, text: 'TIME → 30 S', anchor: 'right' },
      { x: 648,  y: 480, text: 'SHIFT · 15 S · THE TOP PEAK MOVES', anchor: 'left' },
      { x: 1239, y: 452, text: 'MEAN OF 16 RUNS · BAND ±1 S.D.', anchor: 'right' },
      { x: 24,   y: 426, text: 'T', anchor: 'center' },
      { x: 437,  y: 426, text: 'T', anchor: 'center' },
      { x: 850,  y: 426, text: 'T', anchor: 'center' }
    ],
    src: 'Metropolis acceptance = simulated annealing: Kirkpatrick, Gelatt &amp; Vecchi (1983) <em>Science</em> 220(4598):671–680 · ' +
         '<a href="https://doi.org/10.1126/science.220.4598.671">doi</a> ' +
         '<span class="flag">· lines are the mean of 16 replicates, bands ±1 s.d. · press PIVOT RULE for the fourth strategy</span>'
  });

  // 31 — the pivot rule, as the crossing it is (immediately after SIM 5:
  // the PIVOT RULE button's payoff, named while the demo is still warm)
  D.add(
    '<div class="wsref later">Worksheet <b>p2 · q8</b> <i>take home</i></div>' +
    '<h2>Leave when your <span class="am">learning rate</span> crosses the average.</h2>' +
    '<svg class="diag" viewBox="0 0 900 300" width="900" height="300" style="margin-top:14px">' +
    '<line x1="70" y1="266" x2="850" y2="266" stroke="#232330" stroke-width="3"/>' +
    '<line x1="70" y1="266" x2="70" y2="40" stroke="#232330" stroke-width="3"/>' +
    '<path class="curve" d="M72,70 C280,84 430,150 620,208 C700,230 780,244 842,252" stroke="#FFD24A"/>' +
    '<line class="dash" x1="70" y1="196" x2="850" y2="196" stroke="#9CA0B2"/>' +
    '<circle cx="576" cy="196" r="9" fill="#FFD24A"/>' +
    '<line class="dash" x1="576" y1="196" x2="576" y2="266" stroke="#70748A"/>' +
    '<text class="lab" x="600" y="160" style="fill:#FFD24A">LEAVE HERE</text>' +
    '<text x="82" y="34" style="fill:#FFD24A">WHAT THIS ROLE STILL TEACHES YOU</text>' +
    '<text x="150" y="188">AVERAGE ELSEWHERE</text>' +
    '<text x="845" y="292" text-anchor="end">TIME IN ROLE</text></svg>' +
    '<div class="src">Charnov (1976) <em>Theoretical Population Biology</em> 9(2):129–136 · <a href="https://doi.org/10.1016/0040-5809(76)90040-X">doi</a> ' +
    '<span class="flag">— the theorem needs something to deplete; salary doesn\'t, learning does. Applied to a non-depleting patch it says "never leave."</span> &nbsp;·&nbsp; ' +
    'already an algorithm: Oudeyer, Kaplan &amp; Hafner (2007), Intelligent Adaptive Curiosity, rewards <em>learning progress</em> · <a href="https://inria.hal.science/hal-00793610">inria.hal.science</a></div>'
  );

  // 32 — the hot-streak result, as three orderings (the human data confirming
  // the mechanism the sim and the rule just showed).
  // (14 Aug: this slide used to print "the only ordering with positive lift;
  // either half alone does worse than chance" and expect the room to parse it
  // in the two seconds it was up. Nobody can — Alyssa couldn't, and she wrote
  // the deck. It is now the table that sentence was compressing, colour-matched
  // to SIM 5's three panels: violet explores forever, red exploits forever,
  // gold does one and then the other. Do not compress it back into prose.)
  D.add(
    '<div class="kicker">≈26,000 careers · artists, film directors, scientists</div>' +
    '<h2>Explore first. Then commit.</h2>' +
    '<p class="defn"><strong>A hot streak</strong> is the four-or-so-year run when your work lands far above your own average. Nine careers in ten contain one; your output <em>rate</em> doesn\'t change during it; it can start at any age.</p>' +
    '<div class="ord">' +
    '<div class="r hd"><div class="seq"><span class="ph">First half</span>' +
    '<span class="to"></span><span class="ph">Then</span></div>' +
    '<div class="out">Chance a hot streak starts</div></div>' +
    '<div class="r"><div class="seq"><span class="ph cy">EXPLORE</span>' +
    '<span class="to">→</span><span class="ph none">never narrowed</span></div>' +
    '<div class="out cy">↓ &nbsp;BELOW CHANCE</div></div>' +
    '<div class="r"><div class="seq"><span class="ph none">never wandered</span>' +
    '<span class="to">→</span><span class="ph mg">EXPLOIT</span></div>' +
    '<div class="out mg">↓ &nbsp;BELOW CHANCE</div></div>' +
    '<div class="r win"><div class="seq"><span class="ph am">EXPLORE</span>' +
    '<span class="to am">→</span><span class="ph am">EXPLOIT</span></div>' +
    '<div class="out"><span class="n">+20.5%</span><span class="l">artists</span>' +
    '<span class="n">+13.8%</span><span class="l">directors</span>' +
    '<span class="n">+19.2%</span><span class="l">scientists</span></div></div></div>' +
    '<p class="ordnote">Each half is read off the work itself — how spread out your styles or topics are, window by window: wide, then narrow. <em>Chance</em> is the same careers, shuffled. <em>Lift</em> is the gap against that.</p>' +
    '<div class="src">Liu, Dehmamy, Chown, Giles &amp; Wang (2021) <em>Nature Communications</em> 12:5392 · <a href="https://doi.org/10.1038/s41467-021-25477-8">doi</a> — ' +
    '800,000 artworks, 79,000 films, 20,000 scientists; observational, no causal claim &nbsp;·&nbsp; ' +
    'no peak age — hot streaks land uniformly at random across a career; John Fenn\'s ended in a Nobel at 85: Liu et al. (2018) <em>Nature</em> 559:396–399 · <a href="https://doi.org/10.1038/s41586-018-0315-8">doi</a></div>'
  );

  // 33 — field notes, one row of ventures. (10 Aug: the Maven card is GONE —
  // Alyssa was not involved in Maven at all; it was Stanley's company and its
  // presence on her ventures row read as hers. Do not restore it here.)
  D.add(
    '<div class="act">Field notes</div>' +
    '<h2>Ten startups. Most didn\'t work.</h2>' +
    '<div class="cols-3" style="gap:20px;margin-top:16px">' +
    '<div class="card"><h3 style="font-size:23px">Broken Egg Games</h3><p class="mut">my first — volunteered</p></div>' +
    '<div class="card"><h3 style="font-size:23px">ProPhounD</h3><p class="mut">co-founded with postdocs</p></div>' +
    '<div class="card"><h3 style="font-size:23px">Veda</h3><p class="mut"><strong class="gr">acquired</strong></p></div></div>' +
    '<div class="src">58,111 startups — Yin, Wang, Evans &amp; Wang (2019) <em>Nature</em> 575:190–194 · <a href="https://doi.org/10.1038/s41586-019-1725-y">doi</a> — ' +
    'eventual-successes and never-successes are indistinguishable on their first attempt; the winners discard less between attempts; clean-sheeting every time is the losing regime ' +
    '<span class="flag">· the three ventures are from memory, not a registry — details as I remember them</span></div>'
    // production reminder (kept OFF the slide, 10 Aug red-team catch): before
    // the talk Alyssa still confirms dates + her role at each venture, and
    // Veda's HQ + acquisition date — see speaker_notes.md "before the day"
  );

  // 34 — the two caveats, as the authors' own words. (10 Aug: the concept
  // word is now "margin" — "slack" read as the app to anyone under 40.)
  D.add(
    '<h2>Non-objective search has a prerequisite: <span class="am">margin.</span></h2>' +
    '<div class="cols" style="margin-top:10px">' +
    '<div class="card"><blockquote class="small" style="border:none;padding:0;font-size:22px;max-width:none">"We would be remiss if the reader infers a message that novelty search is <em>better</em> than objective-based search."' +
    '<cite>Lehman &amp; Stanley, 2011 — their own result</cite></blockquote></div>' +
    '<div class="card"><blockquote class="small" style="border:none;padding:0;font-size:22px;max-width:none">"If you\'re in a situation where you can\'t afford to take risks… just doing things because they\'re interesting could be pretty risky."' +
    '<cite>Ken Stanley, EP130</cite></blockquote></div></div>' +
    '<p style="font-size:23px;margin-top:20px;max-width:none">A visa tied to a contract. A dependent. Savings measured in weeks.</p>' +
    '<div class="src">Lehman &amp; Stanley (2011) "Abandoning Objectives," <em>Evol. Comput.</em> 19(2):189–223 · <a href="https://doi.org/10.1162/EVCO_a_00025">doi</a> ' +
    '— a result about a population of hundreds, most discarded; you are one lineage &nbsp;·&nbsp; ' +
    '<a href="https://jimruttshow.blubrry.net/the-jim-rutt-show-transcripts/transcript-of-episode-130-ken-stanley-on-why-greatness-cannot-be-planned/">EP130, full transcript</a> ' +
    '<span class="flag">· an argument for building margin into a community — not for telling people to be braver</span></div>'
  );

  // 35 — routes that exist right now (BEFORE the thesis: slack names the
  // problem, routes hand over material help, the thesis closes the idea)
  D.add(
    '<div class="wsref later">Worksheet <b>p2 · q9</b> <i>take home</i></div>' +
    '<div class="kicker">Verified 7 August</div>' +
    '<h2>One opens <span class="am">the day after this conference starts.</span></h2>' +
    '<table style="margin-top:10px"><tr><th>Route</th><th>What it is</th></tr>' +
    '<tr><td><strong class="am">ARIA · Nature-Inspired Computation</strong></td><td>Programme Director call <strong class="am">opens 17 Aug</strong></td></tr>' +
    '<tr><td><strong>Astera Residency</strong></td><td>$125–250k + up to $1.5m — <strong>no university required</strong></td></tr>' +
    '<tr><td><strong>SFI Complexity Postdoc</strong></td><td>any discipline · <strong class="am">closes 30 Sep</strong></td></tr>' +
    '<tr><td><strong>JSPS Postdoc</strong> (Japan)</td><td>¥362,000/mo — <strong>the host applies</strong>, so ask</td></tr></table>' +
    '<div class="src">Also: MSCA Postdoctoral, 9.6% success, mobility rule applies; ERC relocation top-up to €2m for PIs moving from non-associated third countries &nbsp;·&nbsp; ' +
    '<a href="https://www.aria.org.uk/">aria.org.uk</a> · <a href="https://astera.org/residency/">astera.org/residency</a> · ' +
    '<a href="https://www.santafe.edu/">santafe.edu</a> · <a href="https://www.jsps.go.jp/english/">jsps.go.jp</a> · <a href="https://erc.europa.eu/">erc.europa.eu</a> ' +
    '<span class="flag">· ARIA eligibility for non-UK applicants unverified — check before you promise anyone anything</span></div>'
  );

  /* 10 Aug: the old closing pair is off the presented path. The thesis
     phase-portraits moved to the END OF BACKUP (53); the Questions/takeaways
     slide was cut outright — the talk now ends on routes (36), which is the
     most useful thing to leave on screen through Q&A, and the takeaways
     moved to the spoken track. */

  /* =========================================================================
     BACKUP — everything below this line is off the presented path.
     Each of these was live in an earlier build and lost a red-team pass.
     They stay in the file for two reasons: 550 people read this deck at
     their own pace afterwards, and during Q&A "let me jump to the slide"
     beats "let me explain."
     ========================================================================= */

  D.appendix();

  D.add(
    '<div class="act">Backup</div>' +
    '<h1>The rest<br>of the argument.</h1>' +
    '<p class="lead mut">Cut for time, not for doubt. Every one of these answers a question<br>somebody in this room is about to ask.</p>' +
    '<p class="mut" style="font-size:21px;margin-top:20px">Press <strong>g</strong>, a number, <strong>Enter</strong> to jump.</p>'
  );

  // backup 37 — the DYL honesty slide (zero trials), moved off the live path
  // 14 Aug; its line is now spoken over the MAP-Elites slide. Parked FIRST in
  // the backup so every later backup keeps the number the Q&A map already uses.
  D.add(
    '<div class="kicker">Backup · the DYL evidence base, if anyone asks</div>' +
    '<div class="chips" style="margin-top:34px">' +
    '<div class="chip" style="padding:30px 22px"><div class="v" style="font-size:76px">1,000,000+</div><div class="c">READERS</div></div>' +
    '<div class="chip" style="padding:30px 22px"><div class="v mg" style="font-size:76px">0</div><div class="c">CONTROLLED TRIALS</div></div></div>' +
    '<div class="src">Zero RCTs, zero quasi-experimental studies, zero pre–post evaluations of the DYL curriculum. ' +
    'The academic "life design" literature (Savickas et al. 2009, <em>J. Vocational Behavior</em> 75(3) · <a href="https://doi.org/10.1016/j.jvb.2009.04.004">doi</a>) is a different framework sharing the name &nbsp;·&nbsp; ' +
    'career interventions do work modestly: Whiston et al. (2017) · <a href="https://doi.org/10.1016/j.jvb.2017.03.010">doi</a> &nbsp;·&nbsp; ' +
    'design-thinking critique: Micheli et al. (2019) · <a href="https://doi.org/10.1111/jpim.12466">doi</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · asked at every ALife talk: "isn\'t the landscape metaphor wrong?"</div>' +
    '<ul>' +
    '<li><strong>Dimensionality — a real hit.</strong> In high dimensions the good regions are <em>connected</em>: ' +
    '<em>"no need to cross any adaptive valleys."</em>&ensp;A 1-D picture overstates being <em>trapped</em>.</li>' +
    '<li><strong>No fixed surface</strong> once fitness depends on everyone else — which is the whole crowding term.</li>' +
    '<li><strong>"Career fitness" isn\'t a scalar.</strong> One noisy sample a year.</li>' +
    '</ul>' +
    '<p class="lead" style="margin-top:12px">Take the concession — it doesn\'t save you. <span class="cy">A greedy walk halts after a mean of ' +
    '<strong>e − 1 ≈ 1.72 steps</strong>, however big the space is.</span></p>' +
    '<p class="lead"><span class="am">You are never trapped. You just stop improving after about two moves.</span></p>' +
    '<div class="src">Orr (2003) <em>J. Theor. Biol.</em> 220:241–247 · <a href="https://doi.org/10.1006/jtbi.2003.3161">doi</a> &nbsp;·&nbsp; ' +
    'Gavrilets &amp; Gravner (1997) <em>JTB</em> 184:51–64 · <a href="https://doi.org/10.1006/jtbi.1996.0242">doi</a> ' +
    '<span class="flag">— holds above a percolation threshold, under binary fitness; it establishes connectivity, not reachability</span> &nbsp;·&nbsp; ' +
    'Kaplan (2008) <em>Biol&amp;Phil</em> 23(5) · <a href="https://doi.org/10.1007/s10539-008-9116-z">doi</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · the full US funding table</div>' +
    '<h2>Proposed, enacted, and enjoined are <span class="am">three different things.</span></h2>' +
    '<table><tr><th></th><th>Proposed (FY2026 request)</th><th>Actually enacted</th></tr>' +
    '<tr><td>NSF, total</td><td><span class="mg">−56.9%</span></td><td><span class="am">−3.4%</span></td></tr>' +
    '<tr><td>NSF Research &amp; Related Activities</td><td>—</td><td><strong class="am">flat</strong><span class="am"> in nominal dollars</span></td></tr>' +
    '<tr><td>NSF STEM Education</td><td>—</td><td><span class="am">−20%</span></td></tr>' +
    '<tr><td>All federal R&amp;D</td><td><span class="mg">−20.5%</span></td><td><span class="am">−0.2%</span> <span class="mut">(nondefense −5.2%)</span></td></tr>' +
    '<tr><td>NIH</td><td>—</td><td><span class="am">+0.9%</span></td></tr></table>' +
    '<p class="lead" style="margin-top:14px">The damage is real and it landed <strong>unevenly</strong> — but it is not the number that was in the headlines.</p>' +
    '<div class="src">GRFP 2025 detail: ~1,500 awards, 10% success overall, <strong>under 5% in the life sciences</strong>; the 2026 round made 2,500 awards ' +
    'from ~14,000 applicants. &nbsp;·&nbsp; CRS R48783 Table 1 · H.R. 6938, signed 23 Jan 2026 · NIH via P.L. 119-75, 3 Feb 2026 · NSF release, 13 Apr 2026</div>'
  );

  D.add(
    '<div class="kicker">Backup · the honest caveat about the formalism, if anyone invokes active inference</div>' +
    '<blockquote class="small">Active inference gives you the vocabulary — interoceptive and exteroceptive streams inside one generative model.' +
    '<br><br>But notice what it doesn\'t give you. The free energy principle tells you how an agent minimises surprise <em>given its priors</em>. ' +
    'It has nothing whatsoever to say about <span class="am">whose priors those are.</span>' +
    '<br><br>Career unhappiness isn\'t an inference problem. It\'s a <strong>prior</strong> problem.</blockquote>' +
    '<div class="src">Seth (2013) <em>TiCS</em> · <a href="https://doi.org/10.1016/j.tics.2013.09.007">doi</a> &nbsp;·&nbsp; ' +
    'Seth &amp; Friston (2016) <em>Phil Trans R Soc B</em> · <a href="https://doi.org/10.1098/rstb.2016.0007">doi</a> ' +
    '<span class="flag">· Friston conceded in 2018 that the principle cannot be falsified</span></div>'
  );

  D.add(
    '<div class="kicker">Backup · Stanley pre-empts the naive career reading himself</div>' +
    '<blockquote>"I\'m not saying like, \'Okay, well now I want to figure out how to get into grad school. ' +
    'So I\'ll just wander around and do interesting things and hope that it will happen.\'"' +
    '<cite>Ken Stanley, The Jim Rutt Show EP130</cite></blockquote>' +
    '<p class="lead" style="margin-top:26px">He is not against near-horizon goals.<br>' +
    'He is against treating <strong>a distant destination as a gradient.</strong></p>' +
    '<div class="src">The Jim Rutt Show EP130, 7 June 2021 · ' +
    '<a href="https://jimruttshow.blubrry.net/the-jim-rutt-show-transcripts/transcript-of-episode-130-ken-stanley-on-why-greatness-cannot-be-planned/">full transcript</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · the skills inventory, in full</div>' +
    '<h2>What the ALife toolkit actually is</h2>' +
    '<table><tr><th>Method</th><th>Who is paying for it</th></tr>' +
    '<tr><td>Agent-based modelling</td><td>policy, epidemics, markets, logistics, crowd safety</td></tr>' +
    '<tr><td>Evolutionary computation, quality-diversity</td><td>design optimisation where no gradient exists</td></tr>' +
    '<tr><td>Cellular automata, self-organisation</td><td>smart materials, morphogenetic engineering</td></tr>' +
    '<tr><td>Multi-agent and collective behaviour</td><td>agentic AI orchestration, swarms, market design</td></tr>' +
    '<tr><td>Simulating counterfactual worlds</td><td>world models, digital twins, synthetic environments</td></tr>' +
    '<tr><td><span class="am">Evaluating systems with no ground truth</span></td><td><span class="am">the bottleneck problem in AI right now</span></td></tr></table>' +
    '<p class="mut" style="font-size:22px;margin-top:14px">ALife is the only community that has spent thirty-five years asking ' +
    '<em>how do you tell if something interesting happened when there\'s no score?</em></p>' +
    '<div class="src">Each right-hand cell is sourced elsewhere in this deck: the live-postings audit, 2026-08-07 (slides 21 &amp; 23) · ' +
    'DeepMind &amp; Sakana releases (slide 13) · the no-ground-truth bottleneck: the eval-team postings quoted verbatim on slide 23</div>',
    'pad-tight'
  );

  D.add(
    '<div class="kicker">Backup · two corrections to the copying result</div>' +
    '<h2>The copying trap, corrected twice.</h2>' +
    '<ul>' +
    '<li><strong>The left-hand arm isn\'t "not talking enough."</strong> Lazer &amp; Friedman\'s own density curve is a ' +
    '<em>fragmentation</em> artefact — their text says that among networks that stay in one piece, ' +
    '"the inverse-U shape disappears… <span class="am">the fewer connections the better in the long run.</span>" ' +
    'Sparse groups do badly because they are <em>several small populations drawing from a smaller pool</em>, not because they are quiet. ' +
    'That is why the live slide cites Derex instead.</li>' +
    '<li><strong>The whole result is conditional on copying the best performer.</strong> It <span class="am">reverses</span> ' +
    'when people copy the most common answer instead.</li>' +
    '</ul>' +
    '<p class="lead" style="margin-top:4px"><span class="cy">The argument survives both: not one big room — many overlapping small ones.</span></p>' +
    '<div class="src">Lazer &amp; Friedman (2007) <em>ASQ</em> 52(4):667–694 · <a href="https://doi.org/10.2189/asqu.52.4.667">doi</a> &nbsp;·&nbsp; ' +
    'Barkoczi &amp; Galesic (2016) <em>Nature Communications</em> 7:13109 · <a href="https://doi.org/10.1038/ncomms13109">doi</a></div>',
    'pad-tight'
  );

  D.add(
    '<div class="kicker">Backup · Bernstein in full, if you want the table</div>' +
    '<h2>You don\'t have to choose. <span class="am">Just stop talking sometimes.</span></h2>' +
    '<p>Triads solving a rugged problem. Neighbours\' solutions visible <strong>every round</strong>, ' +
    '<strong>every third round</strong>, or <strong>never</strong>.</p>' +
    '<table style="margin-top:8px"><tr><th>Interaction</th><th>Found the optimum</th><th>Mean quality</th></tr>' +
    '<tr><td>Constant</td><td>33.3%</td><td>best tier</td></tr>' +
    '<tr><td><span class="am">Intermittent</span></td><td><strong class="am">48.3%</strong></td><td><span class="am">best tier</span></td></tr>' +
    '<tr><td>Isolated</td><td>44.1%</td><td>worst</td></tr></table>' +
    '<p class="lead" style="margin-top:14px">Intermittent groups got <strong>both halves</strong> — they alternately converged and diverged. ' +
    '<span class="cy">"Solutions improved most on rounds with social influence <em>after a period of separation</em>."</span></p>' +
    '<div class="src">Bernstein, Shore &amp; Lazer (2018) "How intermittent breaks in interaction improve collective intelligence," ' +
    '<em>PNAS</em> 115(35):8734–8739 · <a href="https://doi.org/10.1073/pnas.1802407115">doi</a> · ' +
    '<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6126746/">PMC6126746</a> &nbsp;— the same Lazer, eleven years later</div>'
  );

  D.add(
    '<div class="kicker">Backup · and it gets worse for a room this size</div>' +
    '<h2>Conformity rises with <span class="am">group size</span> and with <span class="am">task difficulty.</span></h2>' +
    '<p>699 participants. Challenging tasks elicit more copying, and the rate of copying increases with the number of people in the room.</p>' +
    '<p class="lead"><span class="am">A 550-person Discord is structurally at risk of converging on the same wrong answer — precisely on the questions that matter most.</span></p>' +
    '<div class="src">Toyokawa, Whalen &amp; Laland (2019) "Social learning strategies regulate the wisdom and madness of interactive crowds," ' +
    '<em>Nature Human Behaviour</em> 3:183–193 · <a href="https://doi.org/10.1038/s41562-018-0518-x">doi.org/10.1038/s41562-018-0518-x</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · being honest about niche construction as a framework</div>' +
    '<h2>It is contested — and the critics wrote the paper <em>with</em> the advocate.</h2>' +
    '<table><tr><th>Sceptics</th><th>Advocate</th></tr>' +
    '<tr><td>It\'s a category error: a <em>cause</em> of change, not a <em>process</em> of change.</td><td>The implications for evolutionary theory are profound.</td></tr>' +
    '<tr><td>No systematic direction — it raises and lowers fitness alike.</td><td>Ecological inheritance is a genuine second inheritance system.</td></tr>' +
    '<tr><td>It yields no unambiguous prediction.</td><td>"Not yet, but this is feasible."</td></tr></table>' +
    '<p class="lead" style="margin-top:18px"><strong>And applied to a Discord server, it is frankly a metaphor.</strong> ' +
    'But <span class="cy">protected niches</span> in innovation studies, and the sociology of scientific movements, are not.</p>' +
    '<div class="src">Scott-Phillips, Laland, Shuker, Dickins &amp; West (2014) <em>Evolution</em> 68(5):1231–1243, open access · <a href="https://doi.org/10.1111/evo.12332">doi</a> &nbsp;·&nbsp; ' +
    'Frickel &amp; Gross (2005) <em>ASR</em> 70(2) · <a href="https://doi.org/10.1177/000312240507000202">doi</a> &nbsp;·&nbsp; ' +
    'Smith &amp; Raven (2012) <em>Research Policy</em> 41(6) · <a href="https://research.tue.nl/files/3528642/729198.pdf">pdf</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · more from the hot-streak data</div>' +
    '<h2>Three things nobody expects</h2>' +
    '<ul>' +
    '<li><strong>Productivity does not change during a hot streak.</strong> Same output rate. Better output.</li>' +
    '<li>People with a <em>lower</em> baseline benefit more.</li>' +
    '<li>And the topic you end up exploiting is <span class="am">not</span> the most recent, <span class="am">not</span> the most cited, ' +
    '<span class="am">not</span> the most popular one you tried.</li>' +
    '</ul>' +
    '<p class="lead">Which is the same claim as Picbreeder, arriving from bibliometrics: ' +
    '<span class="cy">you cannot tell which stepping stone matters while you are standing on it.</span></p>' +
    '<div class="src">Liu et al. (2018) <em>Nature</em> 559:396–399 · <a href="https://doi.org/10.1038/s41586-018-0315-8">doi</a> · preprint <a href="https://arxiv.org/abs/1712.01804">arXiv:1712.01804</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · the pivot rule already exists as code</div>' +
    '<h2>Intelligent Adaptive Curiosity, 2007.</h2>' +
    '<p>It rewards <strong>learning progress</strong> — the rate at which prediction error is falling — not the error, and not any external reward.</p>' +
    '<p>The agent automatically abandons both what it has mastered and what it cannot learn, and self-organises developmental stages.</p>' +
    '<p class="lead"><span class="cy">It moves on when a region stops teaching it anything. That is the pivot rule, implemented, nineteen years ago.</span></p>' +
    '<div class="src">Oudeyer, Kaplan &amp; Hafner (2007) <em>IEEE Trans. Evol. Comput.</em> 11(2):265–286 · ' +
    '<a href="https://inria.hal.science/hal-00793610">inria.hal.science/hal-00793610</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · and the NIH natural experiment on failure</div>' +
    '<h2>Near-misses <span class="am">outperformed</span> narrow winners.</h2>' +
    '<p class="lead">Researchers who just missed the funding line and persisted went on to produce <strong>21% more hit papers</strong> than those who just cleared it.</p>' +
    '<p class="lead"><span class="mg">The setback also made 12.6% of them disappear from the record permanently.</span></p>' +
    '<p>Both halves are the finding. Say both.</p>' +
    '<div class="src">Wang, Jones &amp; Wang (2019) <em>Nature Communications</em> 10:4331 · ' +
    '<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6773762/">PMC6773762</a></div>'
  );

  D.add(
    '<div class="kicker">Backup · the standard advice vs the data</div>' +
    '<h2>Seven pieces of advice, contradicted.</h2>' +
    '<ul class="dense" style="max-width:46em">' +
    '<li><em>"Focus. Pick a lane."</em> → exploitation without prior exploration does worse than chance.</li>' +
    '<li><em>"Early wins compound."</em> → near-misses beat narrow winners by 21%.</li>' +
    '<li><em>"Opportunity is rare, hold on."</em> → the richer the environment, the sooner you leave.</li>' +
    '<li><em>"Explore your options" (the 37% rule)</em> → with cardinal payoffs the optimum is √<span style="text-decoration:overline">n</span>, not n/e. For 100 options, <strong>10, not 37</strong>.</li>' +
    '<li><em>"Set clear goals."</em> → objective search solved the hard maze 3/40; novelty search 39/40, with simpler solutions.</li>' +
    '<li><em>"Pivot decisively, clean sheet."</em> → reuse is what separates success from stagnation.</li>' +
    '<li><em>"Don\'t do anything rash."</em> → coin-flip-induced changers were happier six months later.</li>' +
    '</ul>' +
    '<div class="src">Bearden 2006 · <a href="https://doi.org/10.1016/j.jmp.2005.11.003">doi</a> &nbsp;·&nbsp; ' +
    'Lehman &amp; Stanley 2011 · <a href="https://doi.org/10.1162/EVCO_a_00025">doi</a> &nbsp;·&nbsp; ' +
    'Levitt 2021 · <a href="https://www.nber.org/papers/w22487">NBER w22487</a></div>'
  );

  // 51 — the Casciaro chain, moved off the live path 9 Aug to fund the
  // opening sim slot. Its line is spoken over SIM 4b; the diagram answers Q&A.
  D.add(
    '<div class="kicker">Backup · the networking result in full</div>' +
    '<h2>The grubby feeling is measured.</h2>' +
    '<svg class="diag" viewBox="0 0 1080 130" width="1080" height="130" style="margin-top:18px">' +
    '<rect x="10" y="25" width="222" height="80" rx="12" fill="none" stroke="#3A3A48" stroke-width="2.5"/>' +
    '<text x="121" y="58" text-anchor="middle">INSTRUMENTAL</text><text x="121" y="84" text-anchor="middle">NETWORKING</text>' +
    '<line x1="238" y1="65" x2="272" y2="65" stroke="#70748A" stroke-width="4"/><polygon points="272,58 286,65 272,72" fill="#70748A"/>' +
    '<rect x="292" y="25" width="222" height="80" rx="12" fill="none" stroke="#3A3A48" stroke-width="2.5"/>' +
    '<text x="403" y="58" text-anchor="middle">FEELS MORALLY</text><text x="403" y="84" text-anchor="middle">DIRTY</text>' +
    '<line x1="520" y1="65" x2="554" y2="65" stroke="#70748A" stroke-width="4"/><polygon points="554,58 568,65 554,72" fill="#70748A"/>' +
    '<rect x="574" y="25" width="222" height="80" rx="12" fill="none" stroke="#3A3A48" stroke-width="2.5"/>' +
    '<text x="685" y="58" text-anchor="middle">NETWORKS</text><text x="685" y="84" text-anchor="middle">LESS</text>' +
    '<line x1="802" y1="65" x2="836" y2="65" stroke="#70748A" stroke-width="4"/><polygon points="836,58 850,65 836,72" fill="#70748A"/>' +
    '<rect x="848" y="25" width="222" height="80" rx="12" fill="none" stroke="#FF5C68" stroke-width="3"/>' +
    '<text x="959" y="58" text-anchor="middle" style="fill:#FF5C68">PERFORMS</text><text x="959" y="84" text-anchor="middle" style="fill:#FF5C68">WORSE</text></svg>' +
    '<p class="lead" style="margin-top:24px">Build something. Let the network be a by-product.</p>' +
    '<div class="src">Casciaro, Gino &amp; Kouchaki (2014) "The Contaminating Effects of Building Instrumental Ties," <em>ASQ</em> 59(4):705–735 · <a href="https://doi.org/10.1177/0001839214554990">doi</a> ' +
    '— 165 lawyers: seniority predicted feeling less dirty (b = −.25, p &lt; .001) ' +
    '<span class="flag">· Corrigendum, ASQ 2024: the causal power-moderation interaction moved to p = .072 — worse-with-less-power is suggestive, not settled. Say so if asked.</span></div>'
  );

  // 52 — the ISAL jobs board: the old cold open, cut from the presented path
  // 10 Aug when the swarm frame took the opening. Kept for the inevitable
  // "is the market really that empty?" question.
  D.add(
    '<div class="kicker">Backup · alife.org/jobs — if anyone asks "is it really that empty?"</div>' +
    '<h2>I have never had a job titled<br><span class="am">"artificial life researcher."</span></h2>' +
    '<div class="pills"><span class="pill">Faculty</span><span class="pill">Industry</span>' +
    '<span class="pill">Postdoctoral</span><span class="pill">PhD studentship</span>' +
    '<span class="pill">Undergraduate internship</span></div>' +
    '<div class="pane"><span class="mut" style="font-size:52px;font-weight:500">No items found.</span></div>' +
    '<div class="src">The ISAL jobs board · <a href="https://alife.org/jobs/">alife.org/jobs</a> ' +
    '<span class="flag">· verified 2026-08-06 — re-check before Q&A if you plan to invoke it</span></div>'
  );

  // 53 — the thesis phase portraits, cut from the close 10 Aug (the talk now
  // ends on routes). Answers "what does open-endedness say about careers?"
  D.add(
    '<div class="kicker">Backup · my own thesis result</div>' +
    '<h2>A career with fixed rules will, <span class="am">provably</span>, cycle.</h2>' +
    '<svg class="diag" viewBox="0 0 900 300" width="900" height="300" style="margin-top:10px">' +
    '<ellipse cx="240" cy="140" rx="112" ry="72" fill="none" stroke="#9CA0B2" stroke-width="4"/>' +
    '<polygon points="345,132 359,132 352,156" fill="#9CA0B2"/>' +
    '<text x="240" y="272" text-anchor="middle">ISOLATED — RECURS</text>' +
    '<path d="M660,140 C660,120 688,120 688,142 C688,172 630,176 628,140 C626,96 716,92 722,146 C728,208 596,216 590,140 C584,58 760,52 770,142" ' +
    'fill="none" stroke="#8A8AFF" stroke-width="4"/>' +
    '<polygon points="778,120 772,152 756,130" fill="#8A8AFF"/>' +
    '<text x="680" y="272" text-anchor="middle" fill="#8A8AFF">STATE-DEPENDENT — OPEN-ENDED</text></svg>' +
    '<div class="src">Adams, A. M., Zenil, H., Davies, P. C. W. &amp; Walker, S. I. (2017) "Formal Definitions of Unbounded Evolution and Innovation Reveal ' +
    'Universal Mechanisms for Open-Ended Evolution in Dynamical Systems," <em>Scientific Reports</em> 7:997 · ' +
    '<a href="https://doi.org/10.1038/s41598-017-00810-8">doi.org/10.1038/s41598-017-00810-8</a> ' +
    '<span class="flag">— only state-dependent rules keep innovating; fixed rules recur. Applied to a career it is a metaphor on purpose — concede that in the same breath.</span></div>'
  );

  D.start();
})();
