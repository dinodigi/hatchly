// ===== Hatchly seed dataset (spec §11–§12) =====

const PHASES = {
  ideation:   { key:"ideation",   label:"Ideation",    verb:"Shape it",        badge:"b-idea",   color:"var(--accent-text)",  soft:"var(--accent-soft)" },
  validation: { key:"validation", label:"Validation",  verb:"Pressure-test it",badge:"b-val",    color:"var(--info-text)",    soft:"var(--info-soft)" },
  launch:     { key:"launch",     label:"Launch",      verb:"Ship it",         badge:"b-launch", color:"var(--success-text)", soft:"var(--success-soft)" },
  operating:  { key:"operating",  label:"Post-launch", verb:"Run it",          badge:"b-op",     color:"var(--text-secondary)",soft:"var(--surface)" },
};
const PHASE_ORDER = ["ideation","validation","launch","operating"];

// 13 rubric dimensions, grouped into 4 categories
const DIMENSIONS = [
  { key:"problem_clarity",   label:"Problem Clarity",   cat:"foundation" },
  { key:"market_demand",     label:"Market Demand",     cat:"foundation" },
  { key:"icp_clarity",       label:"ICP Clarity",       cat:"foundation" },
  { key:"founder_market_fit",label:"Founder–Market Fit",cat:"foundation" },
  { key:"differentiation",   label:"Differentiation",   cat:"position" },
  { key:"competitive_moat",  label:"Competitive Moat",  cat:"position" },
  { key:"positioning",       label:"Positioning",       cat:"position" },
  { key:"monetization",      label:"Monetization",      cat:"business" },
  { key:"revenue_model",     label:"Revenue Model",     cat:"business" },
  { key:"distribution",      label:"Distribution",      cat:"execution" },
  { key:"gtm_readiness",     label:"GTM Readiness",     cat:"execution" },
  { key:"feasibility",       label:"Feasibility",       cat:"execution" },
  { key:"risk_level",        label:"Risk Level",        cat:"execution" },
];
const DIM = Object.fromEntries(DIMENSIONS.map(d => [d.key, d]));
const CATEGORIES = {
  foundation: { label:"Foundation", blurb:"Is the problem real and the customer clear?" },
  position:   { label:"Position",   blurb:"Why this, why you, why now?" },
  business:   { label:"Business",   blurb:"Does the money work?" },
  execution:  { label:"Execution",  blurb:"Can it actually ship and reach people?" },
};
function bandOf(v){ return v >= 75 ? "strong" : v >= 60 ? "moderate" : "weak"; }

const USER = {
  id:"u_01", name:"Alex Rivera", email:"alex@rivera.co",
  bio:"Ex-PM, left full-time in 2024 to build solo. Has shipped two small SaaS tools.",
  plan:"founder", avatar:"AR",
};

const CONNECTIONS = [
  { kind:"stripe",  label:"Stripe",        note:"Payments",            status:"connected" },
  { kind:"email",   label:"Elastic Email", note:"Transactional + lists",status:"connected" },
  { kind:"shopify", label:"Shopify",       note:"Storefront",          status:"not_connected" },
  { kind:"bank",    label:"Mercury",       note:"Business banking",    status:"error" },
  { kind:"domain",  label:"BrandBucket",   note:"Domains & names",     status:"connected" },
];

// ---- Per-dimension detail for Loop's live scorecard ----
const LOOP_DIM_DETAIL = {
  icp_clarity:{ evidence:["Solo founders, 0–12 months post-corporate","Sharp emotional trigger at the ~3pm slump"], risks:["Narrow segment caps early TAM"], improvements:["Quantify how many hit the 12-month edge yearly"] },
  problem_clarity:{ evidence:["Pain is lost rhythm, not lack of tools","Founder lived the problem for 47 days"], risks:["\"Rhythm\" is fuzzy to measure"], improvements:["Define the one metric a user would check daily"] },
  feasibility:{ evidence:["v0 already shipped and used daily","No novel infra — calendar + journal + LLM"], risks:[], improvements:["Confirm memory recall stays cheap at scale"] },
  founder_market_fit:{ evidence:["Founder is the ICP","Two prior SaaS ships"], risks:["Solo founder, limited GTM bandwidth"], improvements:["Document the 47-day streak as proof"] },
  market_demand:{ evidence:["Active founder-tooling category","Adjacent tools growing"], risks:["Demand may be 'nice to have'"], improvements:["Run a 100-founder waitlist sprint"] },
  monetization:{ evidence:["$15–20/mo feels payable for the ICP","Clear value at the daily-use level"], risks:["Solo-founder budgets are thin"], improvements:["Test annual upfront to de-risk churn"] },
  risk_level:{ evidence:["Low technical risk","Founder self-funded"], risks:["12-month churn is structural","Channel saturation"], improvements:["Plan a graduation path past month 12"] },
  differentiation:{ evidence:["Voice-first, memory-led","Reflection loop competitors lack"], risks:["Easy to copy the surface"], improvements:["Make memory the switching cost"] },
  positioning:{ evidence:["\"A planner that remembers\" lands","Anti-forms stance is sharp"], risks:["Crowded planner shelf"], improvements:["Own one wedge phrase publicly"] },
  revenue_model:{ evidence:["Simple subscription","Predictable MRR"], risks:["No expansion revenue yet"], improvements:["Sketch a team/cohort tier"] },
  gtm_readiness:{ evidence:["Landing in progress","Founder audience seed exists"], risks:["No live funnel yet"], improvements:["Ship before/after landing in 7 days"] },
  competitive_moat:{ evidence:["Accumulated memory per user","Habit lock-in over time"], risks:["No moat on day zero"], improvements:["Import calendar + journal at onboarding"] },
  distribution:{ evidence:["Founder communities reachable"], risks:["IH/Twitter channel is crowded","Cold start with no audience"], improvements:["Publish weekly 'founder rhythm' essays","Partner with 3 indie founder podcasts"] },
};

const LOOP_DIMENSIONS = [
  { key:"icp_clarity", value:91, delta:12 },
  { key:"problem_clarity", value:88, delta:6 },
  { key:"feasibility", value:86, delta:null },
  { key:"founder_market_fit", value:82, delta:null },
  { key:"market_demand", value:76, delta:3 },
  { key:"monetization", value:74, delta:8 },
  { key:"risk_level", value:72, delta:-3 },
  { key:"differentiation", value:71, delta:4 },
  { key:"positioning", value:69, delta:5 },
  { key:"revenue_model", value:68, delta:2 },
  { key:"gtm_readiness", value:64, delta:9 },
  { key:"competitive_moat", value:63, delta:-2 },
  { key:"distribution", value:58, delta:1 },
].map(d => ({ ...d, band:bandOf(d.value), label:DIM[d.key].label, cat:DIM[d.key].cat, ...LOOP_DIM_DETAIL[d.key] }));

const IDEAS = [
  {
    id:"i_loop", name:"Loop", phase:"validation", archetype:"saas",
    one_liner:"A planner that remembers. — AI habit coaching for solo founders.",
    completeness:100, current_score:84, last_activity:"2h ago", lastTab:"scorecard",
    next_move:"Close the distribution gap — it's your lowest dimension at 58.",
    snapshot:{
      version:2, overall:84, confidence:"high", inputs:"12 inputs · 4 sources",
      verdict:"Promising. A defensible bet with a clear ICP and a soft GTM.",
      category_scores:{ foundation:84, position:68, business:67, execution:74 },
      dimensions:LOOP_DIMENSIONS,
      swot:{
        strengths:["ICP Clarity 91","Problem Clarity 88","Feasibility 86"],
        weaknesses:["Distribution 58","Competitive Moat 63","GTM Readiness 64"],
        opportunities:["Land via IH / MicroConf","Ship a 7-day landing"],
        threats:["Founder-tool channel saturation","Day-zero cold start"],
      },
      competitors:[
        { name:"Notion + AI", stance:"indirect", gap:"Not voice-first, no memory" },
        { name:"Sunsama",     stance:"adjacent", gap:"Manual, forms-heavy" },
        { name:"Reclaim",     stance:"adjacent", gap:"No reflection loop" },
      ],
      action_plan:[
        { text:"Import calendar + journal at onboarding to bootstrap the moat", closes:"competitive_moat", current:63 },
        { text:"Publish weekly 'founder rhythm' essays as the wedge", closes:"distribution", current:58 },
        { text:"Partner with 3 indie founder podcasts", closes:"distribution", current:58 },
        { text:"Ship a one-page before/after landing in 7 days", closes:"gtm_readiness", current:64 },
      ],
    },
    memories:[
      { id:"m1", content:"Solo founders, 0–12 months, post-corporate transition", tags:["icp_clarity"], confidence:"high", src:"chat", srcLabel:"Chat · turn 4", edited:false },
      { id:"m2", content:"Pain peaks ~3pm: lost rhythm, no one to push back", tags:["problem_clarity","problem"], confidence:"high", src:"chat", srcLabel:"Chat · turn 6", edited:false },
      { id:"m3", content:"Competitor Sunsama is forms-heavy and manual", tags:["competitor","differentiation"], confidence:"medium", src:"link", srcLabel:"sunsama.com", edited:false },
      { id:"m4", content:"Founder built v0 for self, 47-day streak", tags:["founder_market_fit","founder"], confidence:"high", src:"chat", srcLabel:"Chat · turn 2", edited:true },
      { id:"m5", content:"Distribution channel (IH / Twitter) is crowded", tags:["distribution","risk"], confidence:"medium", src:"voice", srcLabel:"Voice note · 0:38", edited:false },
      { id:"m6", content:"$15–20/mo feels payable for the ICP", tags:["monetization"], confidence:"medium", src:"chat", srcLabel:"Chat · turn 9", edited:false },
    ],
    tasks:[
      { id:"t1", title:"Ship a before/after landing page", status:"in_progress", category:"validation", origin:"scorecard", origin_ref:"gtm_readiness",
        description:"A single page that contrasts the 3pm slump with the after-Loop rhythm. The wedge for the waitlist sprint.",
        subtasks:[{t:"Write hero + before/after copy",d:true},{t:"Build the page",d:true},{t:"Wire the waitlist form",d:false}] },
      { id:"t2", title:"Run a 100-founder waitlist sprint", status:"todo", category:"validation", origin:"scorecard", origin_ref:"market_demand",
        description:"Validate demand: 100 founders on the list in two weeks would move Market Demand and de-risk the bet.",
        subtasks:[{t:"Draft the IH post",d:false},{t:"List 10 founder communities",d:false}] },
      { id:"t3", title:"Interview 5 founders at the 12-month edge", status:"done", category:"validation", origin:"chat", completed_via:"chat_detected",
        description:"Talk to the exact ICP about the rhythm problem. Detected complete from chat — you mentioned all five were done.",
        subtasks:[{t:"Recruit 5",d:true},{t:"Run interviews",d:true},{t:"Synthesize",d:true}] },
    ],
    brand_candidates:[ {name:"Loop", chosen:true}, {name:"Cadence", chosen:false}, {name:"Rhythm", chosen:false} ],
    brand_kit:{
      generation:3, drafted_ago:"38 min ago", source:"your validation report",
      primary:"#1F3A30", on_primary:"#F4EDE0",
      hero:{
        wordmark:"Loop", mark:"rhythm",
        headline:"A planner that remembers.",
        blurb:"Loop is a daily accountability ritual for solo founders. Voice-first, adaptive, and built to learn your rhythm over time.",
        dots:["#0F1410","#1F3A30","#F4EDE0","#DD6B49","#9DB6A3"],
      },
      phone:{
        greeting:"Good morning, Maya.",
        body:"Yesterday you said 4pm was the dip. Want to build the wall earlier today?",
        items:[ {label:"AM check-in", time:"now", active:true}, {label:"Mid-day pulse", time:"12:30"}, {label:"End-of-day reflection", time:"18:00"} ],
        cta:"Tap to speak",
      },
      name_note:"Loop. The daily, weekly, monthly cycle that compounds. The user is in a loop with the system — that's the relationship.",
      taglines:[
        { text:"A planner that remembers.", rationale:"Leads with the moat (memory) in 4 words. Reads as a category descriptor + a twist. Tested best in 7-second user-card interviews.", selected:true },
        { text:"Your work, with memory.", rationale:"Softer, more emotional. Frames Loop as something that knows you, not a tool you manage. Pairs well with vision-led marketing." },
        { text:"A relationship for your work.", rationale:"From your 4:12 voice memo — the “it's a relationship, not a planner” thread. High variance: founders either love it or read it as “fluffy.”" },
      ],
      description:{
        short:"A planner that remembers.",
        medium:"Loop is a daily accountability ritual for solo founders. Voice-first, adaptive, and built to learn your rhythm over time.",
        long:"Loop is a daily accountability ritual for solo founders. Three voice check-ins a day — morning, mid-day, evening — and the system remembers which one actually moved you forward, then quietly weights its prompts toward your real rhythm. It is not a task manager you maintain; it is a relationship that compounds, learning the shape of your week so the next prompt always lands where it matters most.",
        selected:"medium",
      },
      identity_title:"A quieter, warmer mark",
      identity_desc:"Pulls from journaling and ritual — not productivity. Forest grounds the brand; cream is the page; coral is reserved for action.",
      logo_concepts:[
        { key:"spiral", label:"Spiral", desc:"The loop, drawn in one continuous gesture. Most editorial." },
        { key:"rhythm", label:"Rhythm", desc:"Three arcs — morning, mid-day, end-of-day. Quiet, calendar-shaped.", selected:true },
        { key:"compound", label:"Compound", desc:"Three dots growing — what the system accumulates over weeks." },
        { key:"wordmark", label:"Wordmark", desc:"Custom italic “loop” — the two o's suggest the cycle." },
      ],
      palette:[
        { hex:"#0F1410", name:"Ink",    role:"Primary text, dark surfaces",    contrast:"AAA ON CREAM" },
        { hex:"#1F3A30", name:"Forest", role:"Primary brand color",            contrast:"AAA ON CREAM" },
        { hex:"#F4EDE0", name:"Cream",  role:"Default background",             contrast:"AAA AGAINST FOREST" },
        { hex:"#DD6B49", name:"Coral",  role:"Accent · action · highlight",    contrast:"AA ON CREAM" },
        { hex:"#9DB6A3", name:"Sage",   role:"Secondary surface, calm states", contrast:"AA ON INK" },
      ],
      type:[
        { role:"Heading", font:"Instrument Serif", weight:"Weight 400", stack:"'Instrument Serif', Georgia, serif", italic:true, note:"Display serif with quiet warmth — references the journaling tradition Loop sits next to.", specimen:"A relationship,\nnot a planner.", big:true },
        { role:"Body", font:"Geist", weight:"Weight 400", stack:"'Geist', system-ui, sans-serif", note:"Clean modern sans — fast to read, never gets in the way of the prompt.", specimen:"Three voice check-ins a day. The system remembers which one actually moved you forward, and quietly weights its prompts toward that one." },
        { role:"Mono", font:"Geist Mono", weight:"Weight 400", stack:"'Geist Mono', ui-monospace, monospace", mono:true, note:"For timestamps, transcripts, system feedback — the receipts.", specimen:"07:42 → AM check-in queued · 21 min · ‹listen›" },
      ],
      voice_title:"Loop notices. It does not coach.",
      voice_desc:"The voice is the moat made audible. Adaptive memory only feels different if the words feel different.",
      voice_sounds:[
        { label:"Reflective", ex:"Asks before it tells. “How did that feel?”" },
        { label:"Specific", ex:"“Yesterday you said 4pm was the dip. Did you build the wall this time?”" },
        { label:"Warm but neutral", ex:"Doesn't flatter. Notices." },
        { label:"Patient", ex:"Three sentences max. Never urgent unless you are." },
      ],
      voice_avoid:[
        { label:"Hype-y", ex:"No “Let's crush today!” — that's the planner Loop is not." },
        { label:"Coachy", ex:"No “You got this!” — assumes a relationship that hasn't been earned." },
        { label:"Productivity-bro", ex:"No “10x your output.” Loop is about rhythm, not throughput." },
        { label:"Generic AI", ex:"No “I'm here to help!” — Loop doesn't introduce itself, it remembers." },
      ],
      word_dna:[
        { use:"ritual",       instead:"habit",         why:"Implies meaning + repeatability without the gamification baggage." },
        { use:"check-in",     instead:"log / entry",   why:"Frames it as a conversation, not a database row." },
        { use:"rhythm",       instead:"schedule",      why:"Loop adapts. A schedule doesn't." },
        { use:"noticed",      instead:"detected",      why:"Detected feels surveilling. Noticed is human." },
        { use:"today's loop", instead:"today's tasks", why:"The product noun is “loop” — own it." },
      ],
      wild:{
        nav:["How it works","Pricing","Diary"],
        landing_blurb:"Three voice check-ins a day. The system learns which one actually moves you forward — and quietly weights its prompts toward that one.",
        primary_cta:"Start your loop", secondary_cta:"Listen to a day",
        card_name:"Maya Karim", card_role:"founder · Loop", card_contact:"maya@loop.so · loop.so",
        social_pre:"The system that ", social_em:"remembers", social_post:" which check-in moved you.",
        social_footer:"LOOP.SO · FOUNDER DIARY",
      },
      reasoning:{
        themes:["ritual","accountability","solo-founder","behavioral","coaching","vision"],
        scores:[ {label:"Positioning", value:89}, {label:"Differentiation", value:71}, {label:"ICP Clarity", value:91} ],
        memory:[ {icon:"sparkle", label:"Behavioral memory as moat"}, {icon:"voice", label:"4:12 voice memo · relationship"}, {icon:"doc", label:"Voice-first constraint"}, {icon:"sparkle", label:"Pricing signal"} ],
      },
    },
    domains:[
      { name:"tryloop.com", price:2495, fit_reason:"Short, verb-y, matches the habit-loop positioning and reads as a product, not a brand.", status:"suggested" },
      { name:"loophq.com",  price:1850, fit_reason:"The HQ pattern reads as a founder tool — a place you run things from.", status:"viewed" },
    ],
    activity:[
      { type:"score_changed", summary:"GTM readiness rose +8 to 64", at:"2h" },
      { type:"memory_added",  summary:"New memory: 12-month churn risk", at:"5h" },
      { type:"link_captured", summary:"Captured: IndieHackers thread", at:"1d" },
      { type:"task_done",     summary:"Completed: Interview 5 founders", at:"2d" },
    ],
  },
  {
    id:"i_drop", name:"Drop", phase:"launch", archetype:"physical_ecom",
    one_liner:"Funko Pop mystery boxes — a curated drop every month.",
    completeness:100, current_score:79, last_activity:"1d ago", lastTab:"plan",
    next_move:"Open the business bank account — it's blocking the rest of the launch board.",
    snapshot:{ version:1, overall:79, confidence:"high", inputs:"9 inputs · 3 sources",
      verdict:"Solid niche play. Margin and logistics are the watch-items.",
      category_scores:{ foundation:80, position:74, business:78, execution:81 },
      dimensions:[
        {key:"market_demand",value:86,band:"strong"},{key:"feasibility",value:82,band:"strong"},
        {key:"icp_clarity",value:80,band:"strong"},{key:"monetization",value:78,band:"strong"},
        {key:"distribution",value:74,band:"moderate"},{key:"competitive_moat",value:62,band:"moderate"},
      ].map(d=>({...d,label:DIM[d.key].label,cat:DIM[d.key].cat})),
      swot:{strengths:["Passionate niche","Clear unit economics"],weaknesses:["Thin margins","Inventory risk"],opportunities:["Subscription recurring revenue"],threats:["Funko licensing shifts"]},
      competitors:[], action_plan:[],
    },
    memories:[
      { id:"d1", content:"Buyers are Funko collectors 25–40, completionist streak", tags:["icp_clarity","customer"], confidence:"high", src:"chat", srcLabel:"Chat · turn 3", edited:false },
      { id:"d2", content:"Mystery-box format drives the recurring 'drop' habit", tags:["differentiation"], confidence:"high", src:"chat", srcLabel:"Chat · turn 5", edited:false },
      { id:"d3", content:"Funkos are fragile and odd-sized — packaging is a real cost", tags:["risk","feasibility"], confidence:"high", src:"voice", srcLabel:"Voice note · 1:12", edited:false },
    ],
    tasks:[
      { id:"k1", title:"Form an LLC", category:"legal", status:"done", blocking:true, origin:"playbook",
        description:"Stand up the legal entity before money moves. Stripe Atlas bundles incorporation + Stripe, which you already use.",
        vendor_suggestions:[{name:"Stripe Atlas",note:"Bundles Stripe"},{name:"LegalZoom",note:"Full-service"},{name:"Firstbase",note:"Fast"}], subtasks:[{t:"Pick state",d:true},{t:"File",d:true}] },
      { id:"k2", title:"Open a business bank account", category:"legal", status:"in_progress", blocking:true, origin:"playbook",
        description:"Separate business banking is required for clean books and Stripe payouts.",
        vendor_suggestions:[{name:"Mercury",note:"Startup-friendly"},{name:"Relay",note:"Multi-account"},{name:"Novo",note:"Simple"}], subtasks:[{t:"Apply at Mercury",d:true},{t:"Verify EIN",d:false}] },
      { id:"k3", title:"Set up Stripe payments", category:"payments", status:"done", blocking:true, origin:"playbook",
        description:"Checkout + subscription billing for the monthly drop.", subtasks:[] },
      { id:"k4", title:"Pick a platform — Shopify vs custom", category:"product", status:"done", origin:"playbook",
        description:"Recommend Shopify for a single-SKU mystery-box drop; Atlas/Stripe already connected.", subtasks:[] },
      { id:"k5", title:"Source boxes & decide sizes", category:"ops", status:"in_progress", origin:"playbook",
        description:"Funkos are fragile and odd-sized — spec a rigid 6×6×6 mailer with an insert.", subtasks:[{t:"Get 3 quotes",d:true},{t:"Order samples",d:false}] },
      { id:"k6", title:"Design shipping labels & inserts", category:"ops", status:"todo", origin:"playbook", description:"Branded unboxing — the insert is the marketing.", subtasks:[] },
      { id:"k7", title:"Set per-box pricing & margin", category:"ops", status:"todo", origin:"playbook",
        description:"Target $40/box; verify margin after Funko cost + box + shipping.", subtasks:[] },
      { id:"k8", title:"Set up Elastic Email for the launch list", category:"marketing", status:"todo", origin:"playbook", description:"Transactional + the launch announcement sequence.", subtasks:[] },
      { id:"k9", title:"Build the drop landing + waitlist", category:"marketing", status:"in_progress", origin:"playbook", description:"Countdown to the first drop with a waitlist capture.", subtasks:[{t:"Design",d:true},{t:"Build",d:false}] },
    ],
    brand_candidates:[ {name:"Drop", chosen:true}, {name:"BoxDrop", chosen:false} ],
    brand_kit:{
      generation:2, drafted_ago:"3 days ago", source:"your validation report",
      primary:"#2B5FB3", on_primary:"#F3EDE3",
      hero:{
        wordmark:"Drop", mark:"stack",
        headline:"A curated drop every month.",
        blurb:"Drop is a monthly mystery box for Funko collectors. One curated drop, capped quantity, and the thrill of not knowing which vinyl lands on your shelf next.",
        dots:["#19181A","#2B5FB3","#F3EDE3","#E2553D","#ECC15B"],
      },
      phone:{
        greeting:"April drop is live.",
        body:"42 boxes left. This month leans 90s cartoons — three chase variants hidden in the run.",
        items:[ {label:"Reserve my box", time:"new", active:true}, {label:"Spin the reveal", time:"locked"}, {label:"Trade duplicates", time:"soon"} ],
        cta:"Claim a box",
      },
      name_note:"Drop. The monthly moment a new box lands. The user waits for the drop, talks about the drop, collects the drop — the word is the ritual.",
      taglines:[
        { text:"A curated drop every month.", rationale:"Leads with cadence + curation in 5 words. Sets the expectation that this is editorial, not a vending machine.", selected:true },
        { text:"You never know what's inside.", rationale:"Leans into the mystery-box dopamine. Higher energy, reads younger, pairs well with reveal videos." },
        { text:"For the shelf you're proud of.", rationale:"From your collector interviews — the display, not the hoard. Aspirational, but softer on the surprise hook." },
      ],
      description:{
        short:"A curated drop every month.",
        medium:"Drop is a monthly mystery box for Funko collectors — one curated, capped drop, with chase variants hidden in every run.",
        long:"Drop is a monthly mystery box for serious Funko collectors. Every month a single curated, quantity-capped drop goes live, themed around an era or franchise, with rare chase variants seeded through the run. Members reserve, reveal, and trade duplicates inside the community — turning a one-off purchase into a recurring ritual the shelf is built around.",
        selected:"medium",
      },
      identity_title:"Loud where it counts, calm everywhere else",
      identity_desc:"Cobalt carries the brand so the figures stay the heroes; bone keeps the page quiet; punch is reserved for the drop and the CTA.",
      logo_concepts:[
        { key:"stack",    label:"Stack", desc:"Boxes stacking month over month — the collection growing.", selected:true },
        { key:"burst",    label:"Burst", desc:"The reveal moment, abstracted into a spark." },
        { key:"compound", label:"Run",   desc:"Dots in a row — the capped, countable run." },
        { key:"wordmark", label:"Wordmark", desc:"Heavy italic “drop” — fast, kinetic, falling into place." },
      ],
      palette:[
        { hex:"#19181A", name:"Ink",    role:"Primary text, dark surfaces",   contrast:"AAA ON BONE" },
        { hex:"#2B5FB3", name:"Cobalt", role:"Primary brand color",           contrast:"AAA ON BONE" },
        { hex:"#F3EDE3", name:"Bone",   role:"Default background",            contrast:"AAA AGAINST COBALT" },
        { hex:"#E2553D", name:"Punch",  role:"Accent · drops · CTAs",         contrast:"AA ON BONE" },
        { hex:"#ECC15B", name:"Butter", role:"Rarity flags, highlights",      contrast:"AA ON INK" },
      ],
      type:[
        { role:"Heading", font:"Geist", weight:"Weight 700", stack:"'Geist', system-ui, sans-serif", weightCss:700, note:"Tight, heavy sans — reads like a product stamp, not a planner.", specimen:"You never know\nwhat's inside.", big:true },
        { role:"Body", font:"Geist", weight:"Weight 400", stack:"'Geist', system-ui, sans-serif", note:"Clean modern sans — keeps the drop details scannable on a phone.", specimen:"One curated box a month, capped at a fixed run. Chase variants are seeded at random — your odds, and your shelf, are part of the game." },
        { role:"Mono", font:"Geist Mono", weight:"Weight 400", stack:"'Geist Mono', ui-monospace, monospace", mono:true, note:"For drop counts, SKUs, and reveal timers — the receipts.", specimen:"APR · 042 / 500 left · chase odds 1:60 · ‹reveal›" },
      ],
      voice_title:"Drop hypes the moment, not the hustle.",
      voice_desc:"The thrill is the product. The voice should feel like the few seconds before you open the box.",
      voice_sounds:[
        { label:"Anticipatory", ex:"“42 left. The 90s run closes Friday.”" },
        { label:"Collector-fluent", ex:"Knows a chase from a common. Talks grails, not units." },
        { label:"Playful", ex:"“Cross your fingers. Then cross them again.”" },
        { label:"Honest about odds", ex:"States the rarity. Never fakes scarcity." },
      ],
      voice_avoid:[
        { label:"Corporate", ex:"No “Thank you for your purchase.” It's a drop, not a receipt." },
        { label:"Gambling-y", ex:"No “Win big!” — the odds are stated, the joy is the shelf." },
        { label:"Faux-scarce", ex:"No fake countdowns. The cap is real and shown." },
        { label:"Generic e-com", ex:"No “Shop now.” You claim a box; you don't browse a catalog." },
      ],
      word_dna:[
        { use:"drop",     instead:"release",     why:"The drop is the noun, the verb, and the ritual. Own it." },
        { use:"claim",    instead:"buy / add to cart", why:"Reserving a capped box is claiming, not shopping." },
        { use:"reveal",   instead:"unboxing",    why:"The reveal is the product moment, not just content." },
        { use:"chase",    instead:"rare item",   why:"Collector language signals you're one of them." },
        { use:"the run",  instead:"inventory",   why:"A capped run feels finite and collectible; inventory doesn't." },
      ],
      wild:{
        nav:["How it works","Past drops","Join"],
        landing_blurb:"One curated mystery box a month, capped and themed, with chase variants hidden in the run. Reserve before it closes.",
        primary_cta:"Claim a box", secondary_cta:"See past drops",
        card_name:"Sam Okafor", card_role:"founder · Drop", card_contact:"sam@getdrop.shop · getdrop.shop",
        social_pre:"You never know ", social_em:"what's inside", social_post:" — and that's the whole point.",
        social_footer:"GETDROP.SHOP · APRIL DROP",
      },
      reasoning:{
        themes:["collectible","ritual","scarcity","community","reveal","niche"],
        scores:[ {label:"Market demand", value:86}, {label:"ICP clarity", value:80}, {label:"Differentiation", value:74} ],
        memory:[ {icon:"sparkle", label:"Mystery-box format as the habit"}, {icon:"brain", label:"Collectors 25–40, completionist"}, {icon:"voice", label:"Voice note · packaging is the marketing"}, {icon:"doc", label:"Capped-run pricing signal"} ],
      },
    },
    domains:[ { name:"getdrop.shop", price:990, fit_reason:"The .shop TLD signals commerce; 'get' reads as a call to action.", status:"suggested" } ],
    activity:[
      { type:"task_done", summary:"Completed: Set up Stripe payments", at:"1d" },
      { type:"phase_advanced", summary:"Advanced to Launch", at:"4d" },
      { type:"score_changed", summary:"Drop +5 this week", at:"6d" },
    ],
  },
  {
    id:"i_pantry", name:"Pantry", phase:"ideation", archetype:null,
    one_liner:"Tell it what's in your fridge; it plans dinner.",
    completeness:38, current_score:null, last_activity:"9d ago", lastTab:"overview",
    stalled:true,
    next_move:"You're 3 dimensions from unlocking validation — tell me about competitors and how it'll make money.",
    dimsWithSignal:5,
    memories:[
      { id:"p1", content:"Target: busy parents who hate the 6pm 'what's for dinner' decision", tags:["icp_clarity","customer"], confidence:"medium", src:"chat", srcLabel:"Chat · turn 2", edited:false },
      { id:"p2", content:"Pain is decision fatigue, not lack of recipes", tags:["problem_clarity"], confidence:"high", src:"chat", srcLabel:"Chat · turn 3", edited:false },
      { id:"p3", content:"Unsure on monetization — subscription vs grocery affiliate", tags:["monetization","risk"], confidence:"low", src:"chat", srcLabel:"Chat · turn 5", edited:false },
    ],
    tasks:[], brand_candidates:[], domains:[],
    activity:[ { type:"memory_added", summary:"Captured monetization uncertainty", at:"9d" } ],
  },
];

// ---- Scripted chat threads per idea ----
const CHATS = {
  i_loop:[
    { role:"assistant", content:"Welcome back. Loop sits at 84 with high confidence. Your weakest dimension is Distribution at 58 — want to work the wedge there, or look at the full report?" },
    { role:"user", content:"What's actually holding distribution back?" },
    { role:"assistant", content:"Two things in memory: the IH/Twitter channel is crowded, and you have no audience seed yet. The fix isn't a new channel — it's a wedge. Weekly 'founder rhythm' essays would compound, and three indie-founder podcasts would borrow trust fast. Want me to add both as action items?" },
    { role:"user", content:"yes, add the essays one" },
    { role:"assistant", content:"Added \"Publish weekly 'founder rhythm' essays\" to your Plan, tagged to Distribution. I'll watch for signal that it's moving the dimension.", tool:"create_action_item · Plan" },
  ],
  i_drop:[
    { role:"assistant", content:"Drop's launch board is 4 of 9 done. The bank account is the blocker — Stripe payouts and clean books both wait on it. Where are you with Mercury?" },
    { role:"user", content:"applied yesterday, just waiting on EIN verification" },
    { role:"assistant", content:"Good — that's the last gate before payouts. I'll mark the Mercury subtask in progress and leave EIN verification open. Once it clears, three downstream tasks unblock: pricing, labels, and the launch list.", tool:"adjust_task · Plan" },
    { role:"user", content:"the stripe setup is done btw, finished it this morning" },
    { role:"assistant", content:"Marked \"Set up Stripe payments\" done and logged it to your activity feed. That's 5 of 9 — you're past the halfway line on the launch board.", tool:"complete_task · chat_detected" },
  ],
  i_pantry:[
    { role:"assistant", content:"Pantry's been quiet for 9 days. You've got a clear customer and a sharp problem, but the idea's only 38% shaped — 5 of 13 dimensions have signal. Pick one to fill in: how it makes money, or who it's really up against?" },
    { role:"user", content:"honestly not sure on money yet" },
    { role:"assistant", content:"That's fine — uncertainty is itself signal, and I've kept it in memory. Two common paths for a meal-planning tool: a thin monthly subscription, or grocery-affiliate revenue where you take a cut of the cart. They pull the product in different directions. Want to talk through which fits your parents-at-6pm customer?" },
  ],
};

Object.assign(window, { PHASES, PHASE_ORDER, DIMENSIONS, DIM, CATEGORIES, bandOf, USER, CONNECTIONS, IDEAS, CHATS });

// ---- Imported ideas (mined from the user's own AI chats via "the Seal") ----
const IMPORT_BATCHES = [
  { id:"b_seed1", source_label:"ChatGPT · last 6 months", declared_count:7, parsed_count:7, status:"parsed", created_at:"2 days ago" },
];

const IMPORTED_IDEAS = [
  { id:"ii_standup", batch_id:"b_seed1", name:"Standup Solo", one_liner:"Async standup for one-person teams.", cluster_label:"Founder tools", confidence:"high", tags:["saas","productivity"], suggested_archetype:"saas", status:"staged",
    extracted_memories:["Wants a daily nudge to log progress","Solo standups feel pointless without pushback","Would pay if it surfaced what's stuck this week"] },
  { id:"ii_inbox", batch_id:"b_seed1", name:"Inbox Triage", one_liner:"An AI chief-of-staff that drafts replies in your voice.", cluster_label:"Founder tools", confidence:"medium", tags:["saas","ai","productivity"], suggested_archetype:"saas", status:"staged",
    extracted_memories:["Spends 90 min/day in email","Existing tools don't learn tone","Privacy is the dealbreaker for most"] },
  { id:"ii_crate", batch_id:"b_seed1", name:"Crate", one_liner:"Curated hobby mystery boxes, monthly.", cluster_label:"Commerce sparks", confidence:"medium", tags:["ecom","subscription"], suggested_archetype:"physical_ecom", status:"staged",
    extracted_memories:["Inspired by Funko mystery-box sellout drops","Unsure on niche — hobby vs collectible","Margins scared me last time"] },
  { id:"ii_resale", batch_id:"b_seed1", name:"Second Spin", one_liner:"Consignment resale for niche board games.", cluster_label:"Commerce sparks", confidence:"low", tags:["marketplace","ecom"], suggested_archetype:"marketplace", status:"staged",
    extracted_memories:["BGG community is rabid about condition grading","Shipping heavy boxes kills the math"] },
  { id:"ii_clips", batch_id:"b_seed1", name:"Clipline", one_liner:"Turn long streams into vertical clips automatically.", cluster_label:"Creator tools", confidence:"high", tags:["ai","creator","saas"], suggested_archetype:"saas", status:"staged",
    extracted_memories:["Streamers won't edit; they want it done","Hook detection is the hard part","Would pay per published clip, not per month"] },
  { id:"ii_course", batch_id:"b_seed1", name:"Cohortly", one_liner:"Run a paid cohort course from a Notion doc.", cluster_label:"Creator tools", confidence:"medium", tags:["creator","saas","education"], suggested_archetype:"saas", status:"converted", converted_idea_id:null,
    extracted_memories:["Hates juggling Zoom + Circle + Stripe","Wants one link to sell a cohort"] },
  { id:"ii_petcam", batch_id:"b_seed1", name:"PawPing", one_liner:"A pet camera that texts you when the dog barks.", cluster_label:"Commerce sparks", confidence:"low", tags:["hardware","consumer"], suggested_archetype:"other", status:"dismissed",
    extracted_memories:["Hardware is probably out of scope for me","Saturated category"] },
];

Object.assign(window, { IMPORT_BATCHES, IMPORTED_IDEAS });
