// AUTO-BUNDLED — edit src/*.jsx then re-bundle

/* ===================== icons.jsx ===================== */
// ===== Icons: minimal 1.6px line set, currentColor =====
const Ic = ({ d, size = 18, sw = 1.6, fill = "none", children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  back:    (p) => <Ic d="M15 18l-6-6 6-6" {...p} />,
  chevR:   (p) => <Ic d="M9 18l6-6-6-6" {...p} />,
  chevD:   (p) => <Ic d="M6 9l6 6 6-6" {...p} />,
  chevL:   (p) => <Ic d="M15 18l-6-6 6-6" {...p} />,
  plus:    (p) => <Ic d="M12 5v14M5 12h14" {...p} />,
  check:   (p) => <Ic d="M20 6L9 17l-5-5" {...p} />,
  x:       (p) => <Ic d="M18 6L6 18M6 6l12 12" {...p} />,
  lock:    (p) => <Ic {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ic>,
  grid:    (p) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Ic>,
  compass: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></Ic>,
  brain:   (p) => <Ic d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 7 17a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 2-5.2A3 3 0 0 0 18 6a3 3 0 0 0-3-3 3 3 0 0 0-3 1.5A3 3 0 0 0 9 3zM12 4.5v13.5" {...p} />,
  target:  (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></Ic>,
  board:   (p) => <Ic {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></Ic>,
  tag:     (p) => <Ic {...p}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2V5a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/></Ic>,
  settings:(p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ic>,
  mic:     (p) => <Ic {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></Ic>,
  link:    (p) => <Ic {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></Ic>,
  send:    (p) => <Ic d="M22 2L11 13M22 2l-7 20-4-9-9-4z" {...p} />,
  arrowUp: (p) => <Ic d="M12 19V5M5 12l7-7 7 7" {...p} />,
  sparkle: (p) => <Ic d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...p} />,
  bolt:    (p) => <Ic d="M13 2L4 14h7l-1 8 9-12h-7z" {...p} />,
  flag:    (p) => <Ic {...p}><path d="M4 21V4a1 1 0 0 1 1-1h13l-3 5 3 5H5"/></Ic>,
  clock:   (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
  trend:   (p) => <Ic d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" {...p} />,
  alert:   (p) => <Ic {...p}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z"/></Ic>,
  globe:   (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></Ic>,
  card:    (p) => <Ic {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Ic>,
  bell:    (p) => <Ic {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></Ic>,
  shield:  (p) => <Ic d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" {...p} />,
  user:    (p) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ic>,
  plug:    (p) => <Ic {...p}><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5"/></Ic>,
  dots:    (p) => <Ic {...p}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></Ic>,
  edit:    (p) => <Ic d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" {...p} />,
  archive: (p) => <Ic {...p}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/></Ic>,
  trash:   (p) => <Ic d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6" {...p} />,
  doc:     (p) => <Ic {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></Ic>,
  search:  (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></Ic>,
  filter:  (p) => <Ic d="M3 5h18l-7 8v6l-4-2v-4z" {...p} />,
  restore: (p) => <Ic d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" {...p} />,
  voice:   (p) => <Ic d="M3 12h2l2-6 3 14 3-18 3 14 2-4h3" {...p} />,
  ext:     (p) => <Ic {...p}><path d="M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></Ic>,
  building:(p) => <Ic {...p}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 21v-4h6v4M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01"/></Ic>,
  key:     (p) => <Ic {...p}><circle cx="8" cy="8" r="4.5"/><path d="M11.2 11.2L20 20M16.5 16.5l2.5-2.5M13.8 13.8l2.5-2.5"/></Ic>,
  server:  (p) => <Ic {...p}><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/></Ic>,
  wrench:  (p) => <Ic d="M14.5 6.2a4 4 0 0 0-5.3 5.3L3 17.7 6.3 21l6.2-6.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.7-.6-.6-2.7z" {...p} />,
  box:     (p) => <Ic {...p}><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/></Ic>,
  logo:    (p) => <Ic size={p.size||24} sw={0} fill="currentColor"><path d="M12 2c-2.5 2-4 4.8-4 8 0 1.6.5 3 1.3 4.2C7.6 13.4 6 12 4.5 12c0 4 3.2 8 7.5 8s7.5-4 7.5-8c-1.5 0-3.1 1.4-4.8 2.2.8-1.2 1.3-2.6 1.3-4.2 0-3.2-1.5-6-4-8z"/></Ic>,
};

window.Icons = Icons;
window.Ic = Ic;


/* ===================== data.jsx ===================== */
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


/* ===================== ui.jsx ===================== */
// ===== UI primitives (compose tokens only — no new color/type) =====
const { useState, useEffect, useRef, useCallback } = React;

const Btn = ({ variant="primary", size, className="", children, ...p }) => (
  <button className={`btn btn-${variant} ${size?"btn-"+size:""} ${className}`} {...p}>{children}</button>
);
const IconBtn = ({ children, className="", ...p }) => (
  <button className={`iconbtn ${className}`} {...p}>{children}</button>
);

const Card = ({ hover, className="", style, children, ...p }) => (
  <div className={`card ${hover?"card-hover":""} ${className}`} style={style} {...p}>{children}</div>
);

const PhaseBadge = ({ phase, className="" }) => {
  const ph = PHASES[phase]; if (!ph) return null;
  return <span className={`badge ${ph.badge} ${className}`}>{ph.label}</span>;
};

const Pill = ({ accent, className="", children, style }) => (
  <span className={`pill ${accent?"pill-accent":""} ${className}`} style={style}>{children}</span>
);

const StatusDot = ({ band, color, size=8 }) => {
  const c = color || (band==="strong"?"var(--success)":band==="moderate"?"var(--accent)":band==="weak"?"var(--danger)":"var(--text-muted)");
  return <span className="dot" style={{ width:size, height:size, background:c }} />;
};
const LiveDot = () => <span className="live-dot" />;

const Avatar = ({ kind="user", label, size=30 }) => (
  <span className={`avatar avatar-${kind}`} style={{ width:size, height:size, fontSize:size*0.4 }}>{label}</span>
);

// Hatchly brand lockup — real logo, theme-aware (light/dark variants swapped via CSS)
const Logo = ({ h=28 }) => (
  <span className="hatchly-logo" style={{ display:"inline-flex", alignItems:"center", height:h }}>
    <img className="hatchly-logo-light" src={(window.__resources&&window.__resources.logoLight)||"crop/hatchly-logo.png"} alt="Hatchly" style={{ height:h, width:"auto" }}/>
    <img className="hatchly-logo-dark" src={(window.__resources&&window.__resources.logoDark)||"crop/hatchly-logo-dark.png"} alt="Hatchly" style={{ height:h, width:"auto" }}/>
  </span>
);

const ProgressBar = ({ value, color, height=6 }) => (
  <div className="progress" style={{ height }}>
    <span style={{ width:`${value}%`, background: color || "var(--accent)" }} />
  </div>
);

// animated count-up
function CountUp({ to, dur=900, className }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(e * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // fallback: ensure final value even if rAF is throttled/paused (offscreen/export)
    const safety = setTimeout(() => setN(to), dur + 250);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [to, dur]);
  return <span className={className}>{n}</span>;
}

// SVG score ring
function ScoreRing({ value, size=92, stroke=7, color, label, animate=true, sub }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [shown, setShown] = useState(animate ? 0 : value);
  useEffect(() => { setShown(value); }, [value, animate]);
  const c = color || (value>=75?"var(--success)":value>=60?"var(--accent)":"var(--danger)");
  return (
    <div style={{ position:"relative", width:size, height:size, flex:"none" }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (shown/100)*circ}
          style={{ transition:"stroke-dashoffset 1100ms cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
        <span style={{ fontSize:size*0.30, fontWeight:600, letterSpacing:"-0.02em" }}>
          {animate ? <CountUp to={value} /> : value}
        </span>
        {(label||sub) && <span className="faint" style={{ fontSize:size*0.12, marginTop:3, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{label||sub}</span>}
      </div>
    </div>
  );
}

// typewriter for assistant lines
function Typewriter({ text, speed=16, onDone, className }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    let id;
    const step = () => { setI(p => { if (p >= text.length) { onDone&&onDone(); return p; } id = setTimeout(step, speed); return p+1; }); };
    id = setTimeout(step, speed);
    return () => clearTimeout(id);
  }, [text]);
  return <span className={className}>{text.slice(0,i)}{i<text.length && <span style={{opacity:0.4}}>▍</span>}</span>;
}

const TypingDots = () => <span className="typing-dots"><i/><i/><i/></span>;

// stagger children entrance
function Stagger({ children, step=70, start=0, className="", style }) {
  const arr = React.Children.toArray(children);
  return (
    <div className={`stagger ${className}`} style={style}>
      {arr.map((ch, i) => React.cloneElement(ch, { key:ch.key??i, style:{ ...(ch.props.style||{}), animationDelay:`${start + i*step}ms` } }))}
    </div>
  );
}

// source-type glyph for memory items
function SourceGlyph({ type, size=26 }) {
  const map = { chat:Icons.dots, link:Icons.link, voice:Icons.voice, file:Icons.doc };
  const I = map[type] || Icons.dots;
  return (
    <span className="avatar avatar-user" style={{ width:size, height:size, borderRadius:8 }}>
      <I size={size*0.55} />
    </span>
  );
}

const SectionLabel = ({ children, style }) => (
  <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text-muted)", ...style }}>{children}</div>
);

const Empty = ({ icon:I=Icons.sparkle, title, body, action }) => (
  <div style={{ textAlign:"center", padding:"56px 24px", maxWidth:380, margin:"0 auto" }}>
    <div style={{ width:46, height:46, borderRadius:12, background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"var(--text-muted)" }}><I size={22}/></div>
    <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{title}</div>
    <div className="muted" style={{ fontSize:13.5, marginBottom:action?18:0 }}>{body}</div>
    {action}
  </div>
);

Object.assign(window, { Btn, IconBtn, Card, PhaseBadge, Pill, StatusDot, LiveDot, Avatar, Logo, ProgressBar, CountUp, ScoreRing, Typewriter, TypingDots, Stagger, SourceGlyph, SectionLabel, Empty });


/* ===================== marketing.jsx ===================== */
// ===== Marketing: landing + how it works =====

function MarkNav({ go, loggedIn }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:10, background:"color-mix(in srgb, var(--background) 86%, transparent)", backdropFilter:"blur(10px)", borderBottom:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 40px", height:64, display:"flex", alignItems:"center", gap:14 }}>
        <div className="row gap8" style={{ cursor:"pointer" }} onClick={()=>go({screen:"marketing"})}>
          <Logo h={30}/>
        </div>
        <div className="spacer" />
        <a className="muted" style={{ fontSize:13.5, padding:"6px 10px" }} onClick={()=>go({screen:"how"})}>How it works</a>
        {loggedIn
          ? <Btn variant="primary" size="sm" onClick={()=>go({screen:"ideas"})}>Open Hatchly</Btn>
          : <><a className="muted" style={{ fontSize:13.5, padding:"6px 10px" }} onClick={()=>go({screen:"auth", mode:"login"})}>Log in</a>
             <Btn variant="primary" size="sm" onClick={()=>go({screen:"auth", mode:"signup"})}>Start an idea</Btn></>}
      </div>
    </div>
  );
}

function PhaseStrip({ compact }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", background:"var(--surface-raised)" }}>
      {PHASE_ORDER.map((k,i)=>{ const ph=PHASES[k]; return (
        <div key={k} style={{ padding:"22px 22px", borderRight:i<3?"1px solid var(--border)":"none" }}>
          <PhaseBadge phase={k} />
          <div style={{ fontWeight:600, fontSize:16, margin:"12px 0 4px", letterSpacing:"-0.01em" }}>{ph.verb}</div>
          {!compact && <div className="muted" style={{ fontSize:12.5, lineHeight:1.5 }}>{[
            "Chat captures the idea, builds tagged memory, fills the rubric.",
            "Score the 13 dimensions, generate the report, run action items.",
            "Archetype playbook becomes a real task board: legal, payments, ops.",
            "Chat becomes the standing advisor and source of truth.",
          ][i]}</div>}
        </div>
      );})}
    </div>
  );
}

function Landing({ go, loggedIn }) {
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <MarkNav go={go} loggedIn={loggedIn} />
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 40px 120px" }}>
        {/* hero */}
        <header style={{ padding:"96px 0 64px" }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent-text)", marginBottom:22 }}>From a sentence to a business</div>
          <h1 style={{ fontSize:72, lineHeight:1.0, letterSpacing:"-0.02em", margin:"0 0 26px", fontWeight:600, maxWidth:820 }}>
            The AI that takes your idea<br/><span className="serif italic" style={{ fontWeight:400 }}>all the way to launched.</span>
          </h1>
          <p className="muted" style={{ fontSize:19, lineHeight:1.6, maxWidth:600, margin:"0 0 32px" }}>
            Hatchly carries one idea from a rough sentence to a running business — shaping it, pressure-testing it, and walking the launch with you. One chat that remembers everything along the way.
          </p>
          <div className="row gap12">
            <Btn variant="primary" size="lg" onClick={()=>go(loggedIn?{screen:"ideas"}:{screen:"auth",mode:"signup"})}>Start an idea <Icons.chevR size={16}/></Btn>
            <Btn variant="secondary" size="lg" onClick={()=>go({screen:"how"})}>See how it works</Btn>
          </div>
          <div className="row gap24" style={{ marginTop:44, color:"var(--text-muted)", fontSize:13 }}>
            <div className="row gap8"><b style={{ color:"var(--text-primary)", fontSize:18, fontWeight:600 }}>12,400+</b> ideas shaped</div>
            <div className="row gap8"><b style={{ color:"var(--text-primary)", fontSize:18, fontWeight:600 }}>840</b> businesses launched</div>
            <div className="row gap8"><LiveDot/> live now</div>
          </div>
        </header>

        {/* lifecycle */}
        <section style={{ paddingTop:24 }}>
          <SectionLabel style={{ marginBottom:14 }}>The lifecycle · four phases</SectionLabel>
          <PhaseStrip />
        </section>

        {/* a chat that remembers */}
        <section style={{ paddingTop:80, display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div>
            <h2 className="serif italic" style={{ fontSize:40, margin:"0 0 16px", fontWeight:400, letterSpacing:"-0.01em" }}>A chat that remembers everything.</h2>
            <p className="muted" style={{ fontSize:15.5, lineHeight:1.65 }}>Every message becomes tagged memory. The agent reads the whole idea each turn — so "the distribution problem" resolves to a real dimension, and "that task" to a real card. It pressure-tests honestly, never flatters, and writes into every tab as you talk.</p>
            <div className="row gap8" style={{ marginTop:20, flexWrap:"wrap" }}>
              <Pill>Text</Pill><Pill>Paste a link</Pill><Pill>Voice</Pill><Pill accent>Tagged memory</Pill>
            </div>
          </div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div className="row gap8" style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>
              <Avatar kind="ai" label="H" size={24}/><span style={{ fontWeight:600, fontSize:13 }}>Loop</span>
              <Pill accent style={{ fontSize:10 }}>Validation</Pill>
            </div>
            <div className="col gap12" style={{ padding:18 }}>
              <ChatBubblePreview role="user" text="what's actually holding distribution back?"/>
              <ChatBubblePreview role="assistant" text="Two things in memory: the channel is crowded and you have no audience seed. The fix is a wedge — weekly essays + three founder podcasts. Want me to add both as action items?"/>
              <div className="row gap6" style={{ fontSize:11, color:"var(--text-muted)" }}><Icons.bolt size={13}/> create_action_item · tagged Distribution</div>
            </div>
          </Card>
        </section>

        {/* scorecard preview */}
        <section style={{ paddingTop:80 }}>
          <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:18 }}>
            <div><SectionLabel style={{ marginBottom:8 }}>Honest, not encouraging</SectionLabel><h2 style={{ fontSize:30, margin:0, letterSpacing:"-0.02em", fontWeight:600 }}>A 13-dimension scorecard</h2></div>
          </div>
          <Card>
            <div className="row gap24" style={{ alignItems:"center", flexWrap:"wrap" }}>
              <ScoreRing value={84} size={104} label="Loop · v2" />
              <div style={{ flex:1, minWidth:260 }}>
                <div className="serif italic" style={{ fontSize:22, marginBottom:10 }}>"Promising. A defensible bet with a clear ICP and a soft GTM."</div>
                <div className="grid" style={{ gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                  {Object.entries({Foundation:84,Position:68,Business:67,Execution:74}).map(([k,v])=>(
                    <div key={k}><div className="faint" style={{ fontSize:11, marginBottom:4 }}>{k}</div><ProgressBar value={v}/><div style={{ fontSize:13, fontWeight:600, marginTop:5 }}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* footer cta */}
        <section style={{ paddingTop:84 }}>
          <Card style={{ textAlign:"center", padding:"52px 24px", background:"var(--surface)" }}>
            <h2 className="serif italic" style={{ fontSize:38, margin:"0 0 10px", fontWeight:400 }}>What will you hatch?</h2>
            <p className="muted" style={{ fontSize:15, margin:"0 0 24px" }}>A sentence is enough to start.</p>
            <Btn variant="primary" size="lg" onClick={()=>go(loggedIn?{screen:"ideas"}:{screen:"auth",mode:"signup"})}>Start an idea</Btn>
          </Card>
          <div className="row" style={{ justifyContent:"space-between", marginTop:40, color:"var(--text-muted)", fontSize:12.5 }}>
            <div className="row gap8" style={{ alignItems:"center" }}><Logo h={18}/></div>
            <div>© 2026 · A standalone product</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ChatBubblePreview({ role, text }) {
  const ai = role==="assistant";
  return (
    <div className="row gap8" style={{ alignItems:"flex-start", flexDirection: ai?"row":"row-reverse" }}>
      <Avatar kind={ai?"ai":"user"} label={ai?"H":"A"} size={24}/>
      <div style={{ background: ai?"var(--surface)":"var(--accent-soft)", color: ai?"var(--text-primary)":"var(--text-primary)", padding:"9px 12px", borderRadius:12, fontSize:13, lineHeight:1.5, maxWidth:"82%" }}>{text}</div>
    </div>
  );
}

function HowItWorks({ go, loggedIn }) {
  const blocks = [
    { phase:"ideation", title:"Shape it", body:"You start with a sentence — or a link, or just talk. The agent interviews you as a conversation, extracting tagged memory and quietly filling a 13-dimension rubric. No forms.", does:"Captures memory · auto-tags · fills the rubric" },
    { phase:"validation", title:"Pressure-test it", body:"Once the idea is clear enough, the agent scores all 13 dimensions honestly and generates a versioned report — strongest, weakest, SWOT, competitors, and a ranked action plan. It will tell you when something is a 58.", does:"Scores dimensions · generates the report · seeds action items" },
    { phase:"launch", title:"Ship it", body:"Confirm your business type and the agent instantiates a real launch board from a proven playbook — legal, payments, ops, marketing — customized to your idea, with vendor suggestions.", does:"Instantiates the playbook · suggests vendors · tracks blockers" },
    { phase:"operating", title:"Run it", body:"After launch, the chat becomes your standing advisor and source of truth — answering from everything it remembers, logging decisions, and creating ongoing operational tasks.", does:"Retrieves context · logs decisions · advises" },
  ];
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <MarkNav go={go} loggedIn={loggedIn} />
      <div style={{ maxWidth:840, margin:"0 auto", padding:"0 40px 120px" }}>
        <header style={{ padding:"80px 0 48px" }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent-text)", marginBottom:20 }}>How it works</div>
          <h1 style={{ fontSize:54, lineHeight:1.04, letterSpacing:"-0.02em", margin:"0 0 18px", fontWeight:600 }}>Four phases,<br/><span className="serif italic" style={{ fontWeight:400 }}>one growing idea.</span></h1>
          <p className="muted" style={{ fontSize:18, maxWidth:560 }}>Phases are views over one record that accumulates state — not separate apps. Here's the whole arc.</p>
        </header>
        <Stagger className="col gap14">
          {blocks.map((b,i)=>(
            <Card key={b.phase} className="row gap24" style={{ alignItems:"flex-start", padding:28 }}>
              <div style={{ flex:"none", width:48, textAlign:"right" }}>
                <span className="mono" style={{ fontSize:22, color:"var(--text-muted)", fontWeight:500 }}>0{i+1}</span>
              </div>
              <div style={{ flex:1 }}>
                <div className="row gap10" style={{ marginBottom:10 }}><PhaseBadge phase={b.phase}/><span style={{ fontWeight:600, fontSize:18 }}>{b.title}</span></div>
                <p className="muted" style={{ fontSize:14.5, lineHeight:1.6, margin:"0 0 12px" }}>{b.body}</p>
                <div className="row gap6" style={{ fontSize:12, color:"var(--accent-text)" }}><Icons.sparkle size={14}/> {b.does}</div>
              </div>
            </Card>
          ))}
        </Stagger>
        <Card style={{ marginTop:24, background:"var(--surface)" }}>
          <div style={{ fontWeight:600, marginBottom:6 }}>Gates between phases</div>
          <p className="muted" style={{ fontSize:13.5, lineHeight:1.6, margin:0 }}>You advance only when a gate is met: enough of the rubric filled to validate, action items closed and archetype confirmed to launch, blocking tasks done to go live. Phase is status — you can't skip it.</p>
        </Card>
        <div style={{ textAlign:"center", marginTop:40 }}>
          <Btn variant="primary" size="lg" onClick={()=>go(loggedIn?{screen:"ideas"}:{screen:"auth",mode:"signup"})}>Start an idea</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, HowItWorks, PhaseStrip });


/* ===================== auth.jsx ===================== */
// ===== Auth: centered card, signup/login toggle =====

function Auth({ go, mode:initialMode="signup", onAuth }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const signup = mode === "signup";

  const submit = (e) => {
    e && e.preventDefault();
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(); }, 850);
  };

  return (
    <div style={{ minHeight:"100%", display:"flex", flexDirection:"column", background:"var(--background)" }}>
      <div style={{ padding:"28px 40px" }}>
        <div className="row gap8" style={{ cursor:"pointer", width:"fit-content" }} onClick={()=>go({screen:"marketing"})}>
          <Logo h={30}/>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 20px 80px" }}>
        <div style={{ width:400, maxWidth:"100%", animation:"scaleIn 320ms cubic-bezier(.22,1,.36,1)" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <h1 className="serif italic" style={{ fontSize:34, margin:"0 0 6px", fontWeight:400 }}>{signup?"Start an idea":"Welcome back"}</h1>
            <p className="muted" style={{ fontSize:14, margin:0 }}>{signup?"A sentence is enough to begin.":"Pick up where you left off."}</p>
          </div>
          <Card style={{ padding:26 }}>
            <div className="col gap10" style={{ marginBottom:14 }}>
              <Btn variant="secondary" onClick={submit}><Icons.globe size={16}/> Continue with Google</Btn>
              <Btn variant="secondary" onClick={submit}><Icons.ext size={16}/> Continue with GitHub</Btn>
            </div>
            <div className="row gap10" style={{ margin:"4px 0 16px", color:"var(--text-muted)", fontSize:12 }}>
              <div className="hr" style={{ flex:1 }}/> or <div className="hr" style={{ flex:1 }}/>
            </div>
            <form onSubmit={submit} className="col gap12">
              {signup && <div><label className="label">Name</label><input className="field" placeholder="Alex Rivera" defaultValue="Alex Rivera"/></div>}
              <div><label className="label">Email</label><input className="field" type="email" placeholder="you@founder.co" defaultValue="alex@rivera.co"/></div>
              <div>
                <label className="label">Password</label>
                <input className="field" type="password" placeholder="••••••••" defaultValue="hatchly-demo"/>
                {err && <div style={{ color:"var(--danger-text)", fontSize:12, marginTop:6 }}>{err}</div>}
              </div>
              <Btn variant="primary" type="submit" disabled={loading} style={{ marginTop:4 }}>
                {loading ? <TypingDots/> : (signup?"Continue":"Log in")}
              </Btn>
            </form>
          </Card>
          <div className="muted" style={{ textAlign:"center", fontSize:13, marginTop:18 }}>
            {signup ? "Already have an account? " : "New to Hatchly? "}
            <a style={{ color:"var(--accent-text)", fontWeight:500 }} onClick={()=>{ setErr(""); setMode(signup?"login":"signup"); }}>
              {signup ? "Log in" : "Create one"}
            </a>
          </div>
          {!signup && <div className="muted" style={{ textAlign:"center", fontSize:12.5, marginTop:8 }}><a style={{ textDecoration:"underline" }}>Forgot password?</a></div>}
        </div>
      </div>
    </div>
  );
}

window.Auth = Auth;


/* ===================== dashboard.jsx ===================== */
// ===== All-ideas dashboard: insights strip + idea grid =====

function AccountMenu({ go, onLogout, size=30 }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ cursor:"pointer", display:"flex" }} title={USER.name}>
        <Avatar kind="user" label={USER.avatar} size={size}/>
      </div>
      {open && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={()=>setOpen(false)}/>
          <div className="card" style={{ position:"absolute", top:size+10, right:0, zIndex:51, padding:6, width:220, boxShadow:"var(--shadow-lift)" }}>
            <div className="row gap10" style={{ padding:"8px 9px 10px", borderBottom:"1px solid var(--border)", marginBottom:5 }}>
              <Avatar kind="user" label={USER.avatar} size={34}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{USER.name}</div>
                <div className="faint" style={{ fontSize:11.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{USER.email}</div>
              </div>
            </div>
            {[["Settings", Icons.settings, ()=>{ setOpen(false); go({screen:"settings"}); }]].map(([t,I,fn])=>(
              <div key={t} className="row gap10" style={{ padding:"8px 9px", borderRadius:7, fontSize:13, cursor:"pointer", color:"var(--text-primary)" }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--surface)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={fn}><I size={15}/> {t}</div>
            ))}
            <div className="hr" style={{ margin:"5px 0" }}/>
            <div className="row gap10" style={{ padding:"8px 9px", borderRadius:7, fontSize:13, cursor:"pointer", color:"var(--danger-text)" }}
              onMouseEnter={e=>e.currentTarget.style.background="var(--danger-soft)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              onClick={()=>{ setOpen(false); onLogout && onLogout(); }}><Icons.shield size={15}/> Log out</div>
          </div>
        </>
      )}
    </div>
  );
}

function TopBar({ go, theme, setTheme, active, onLogout }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:10, background:"color-mix(in srgb, var(--background) 88%, transparent)", backdropFilter:"blur(10px)", borderBottom:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 36px", height:60, display:"flex", alignItems:"center", gap:16 }}>
        <div className="row gap8" style={{ cursor:"pointer" }} onClick={()=>go({screen:"ideas"})}>
          <Logo h={28}/>
        </div>
        <div className="spacer"/>
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <IconBtn onClick={()=>go({screen:"settings"})} title="Settings"><Icons.settings size={18}/></IconBtn>
        <AccountMenu go={go} onLogout={onLogout} size={30}/>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <div style={{ display:"inline-flex", gap:2, padding:3, borderRadius:9, background:"var(--surface)", border:"1px solid var(--border)" }}>
      {["light","dark"].map(t=>(
        <button key={t} onClick={()=>setTheme(t)} style={{ padding:"5px 11px", borderRadius:6, border:"none", fontSize:12, fontWeight:500, background: theme===t?"var(--surface-raised)":"transparent", color: theme===t?"var(--text-primary)":"var(--text-secondary)", boxShadow: theme===t?"var(--shadow-card)":"none", textTransform:"capitalize" }}>{t}</button>
      ))}
    </div>
  );
}

function InsightStrip({ ideas, go }) {
  const active = ideas.filter(i=>!i.archived);
  if (active.length === 0) return null;
  if (active.length === 1) {
    return (
      <Card className="row gap12" style={{ background:"var(--surface)", alignItems:"center", marginBottom:22 }}>
        <span style={{ color:"var(--accent-text)" }}><Icons.sparkle size={18}/></span>
        <div style={{ fontSize:13.5 }}>Keep going — the more you tell me, the sharper the picture gets.</div>
      </Card>
    );
  }
  const insights = [
    { kind:"stalled", icon:Icons.clock, color:"var(--danger)", tone:"var(--danger-soft)", label:"Stalled", text:"Pantry idle 9 days — 3 dimensions from validation", ideaId:"i_pantry", tab:"overview", fresh:false },
    { kind:"ready", icon:Icons.flag, color:"var(--success)", tone:"var(--success-soft)", label:"Ready to advance", text:"Loop is ready to move to Launch", ideaId:"i_loop", tab:"scorecard", fresh:true },
    { kind:"mover", icon:Icons.trend, color:"var(--info)", tone:"var(--info-soft)", label:"Top mover", text:"Drop +5 this week", ideaId:"i_drop", tab:"overview", fresh:false },
    { kind:"focus", icon:Icons.target, color:"var(--accent)", tone:"var(--accent-soft)", label:"Suggested focus", text:"Loop's distribution gap — the wedge to work next", ideaId:"i_loop", tab:"plan", fresh:false },
  ];
  return (
    <div style={{ marginBottom:26 }}>
      <div className="row gap8" style={{ marginBottom:12 }}>
        <span style={{ color:"var(--accent-text)" }}><Icons.sparkle size={16}/></span>
        <SectionLabel>Smart insights</SectionLabel>
        <div className="hr" style={{ flex:1 }}/>
      </div>
      <Stagger className="grid" step={60} style={{ gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {insights.map(ins=>(
          <Card key={ins.kind} hover onClick={()=>go({screen:"workspace", ideaId:ins.ideaId, tab:ins.tab})} style={{ padding:16, position:"relative" }}>
            {ins.fresh && <span className="dot" style={{ position:"absolute", top:14, right:14, width:7, height:7, background:"var(--accent)" }}/>}
            <div className="row gap8" style={{ marginBottom:10 }}>
              <span style={{ width:26, height:26, borderRadius:7, background:ins.tone, color:ins.color, display:"flex", alignItems:"center", justifyContent:"center" }}><ins.icon size={15}/></span>
              <span className="faint" style={{ fontSize:10.5, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{ins.label}</span>
            </div>
            <div style={{ fontSize:13, lineHeight:1.45, fontWeight:500 }}>{ins.text}</div>
          </Card>
        ))}
      </Stagger>
    </div>
  );
}

function IdeaCard({ idea, go, onArchive }) {
  const [menu, setMenu] = useState(false);
  const ideation = idea.phase === "ideation";
  return (
    <Card hover onClick={()=>go({screen:"workspace", ideaId:idea.id, tab:idea.lastTab})} style={{ padding:20, position:"relative", opacity:idea.archived?0.55:1 }}>
      <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <PhaseBadge phase={idea.phase}/>
        <div style={{ position:"relative" }}>
          <IconBtn onClick={(e)=>{ e.stopPropagation(); setMenu(m=>!m); }} style={{ width:26, height:26 }}><Icons.dots size={16}/></IconBtn>
          {menu && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:5 }} onClick={(e)=>{ e.stopPropagation(); setMenu(false); }}/>
              <div className="card" style={{ position:"absolute", top:30, right:0, zIndex:6, padding:5, width:150, boxShadow:"var(--shadow-lift)" }} onClick={e=>e.stopPropagation()}>
                {[["Rename",Icons.edit],["Archive",Icons.archive]].map(([t,I])=>(
                  <div key={t} className="row gap8" style={{ padding:"7px 9px", borderRadius:7, fontSize:13, cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--surface)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    onClick={()=>{ setMenu(false); if(t==="Archive") onArchive(idea.id); }}><I size={14}/> {t}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:19, fontWeight:600, letterSpacing:"-0.01em", marginBottom:4 }}>{idea.name}</div>
          <div className="muted clamp2" style={{ fontSize:13, lineHeight:1.5 }}>{idea.one_liner}</div>
        </div>
        {ideation
          ? <ScoreRing value={idea.completeness} size={62} stroke={5} color="var(--accent)" label="shaped" animate={false}/>
          : <ScoreRing value={idea.current_score} size={62} stroke={5} animate={false}/>}
      </div>
      <div className="row gap8" style={{ marginTop:16, paddingTop:14, borderTop:"1px solid var(--border)", alignItems:"flex-start" }}>
        <span style={{ color:"var(--accent-text)", marginTop:1 }}><Icons.sparkle size={14}/></span>
        <div style={{ flex:1, fontSize:12.5, lineHeight:1.45, color:"var(--text-secondary)" }}>{idea.next_move}</div>
      </div>
      <div className="row" style={{ justifyContent:"space-between", marginTop:14, alignItems:"center" }}>
        {idea.archetype
          ? <Pill style={{ textTransform:"capitalize" }}>{idea.archetype.replace("_"," ")}</Pill>
          : <Pill className="faint">unset type</Pill>}
        <span className="faint" style={{ fontSize:11.5 }}>{idea.stalled && <span style={{ color:"var(--danger-text)" }}>● </span>}{idea.last_activity}</span>
      </div>
    </Card>
  );
}

function Dashboard({ ideas, go, theme, setTheme, onNewIdea, onArchive, importedIdeas, importBatches, onImport, onConvertImport, onDismissImport, onRestoreImport, onLogout }) {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("active"); // active | archived
  const [mainTab, setMainTab] = useState("ideas"); // ideas | imported
  const [wizard, setWizard] = useState(false);
  const [quickLook, setQuickLook] = useState(null);
  const visible = ideas.filter(i => view==="archived" ? i.archived : !i.archived)
    .filter(i => filter==="all" ? true : i.phase===filter);
  const firstRun = ideas.filter(i=>!i.archived).length === 0;
  const stagedCount = (importedIdeas||[]).filter(i=>i.status==="staged").length;
  const qlBatch = quickLook ? (importBatches||[]).find(b=>b.id===quickLook.batch_id) : null;

  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <TopBar go={go} theme={theme} setTheme={setTheme} onLogout={onLogout}/>
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"32px 36px 100px" }}>

        {/* main tabs */}
        <div className="row gap4" style={{ borderBottom:"1px solid var(--border)", marginBottom:26 }}>
          {[["ideas","Your ideas",null],["imported","Imported ideas",stagedCount]].map(([k,l,badge])=>(
            <button key={k} onClick={()=>setMainTab(k)} style={{ background:"none", border:"none", cursor:"pointer", padding:"0 2px 12px", marginRight:22, position:"relative", display:"flex", alignItems:"center", gap:7,
              color: mainTab===k?"var(--text-primary)":"var(--text-secondary)", fontSize:15, fontWeight: mainTab===k?600:500 }}>
              {l}
              {badge>0 && <span style={{ fontSize:11, fontWeight:600, color: mainTab===k?"var(--accent-text)":"var(--text-muted)", background: mainTab===k?"var(--accent-soft)":"var(--surface)", borderRadius:999, padding:"1px 7px" }}>{badge}</span>}
              {mainTab===k && <span style={{ position:"absolute", left:0, right:0, bottom:-1, height:2, background:"var(--accent)", borderRadius:2 }}/>}
            </button>
          ))}
        </div>

        {mainTab==="imported" ? (
          <>
            <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
              <div>
                <h1 style={{ fontSize:30, margin:"0 0 4px", letterSpacing:"-0.02em", fontWeight:600 }}>Imported ideas</h1>
                <p className="muted" style={{ margin:0, fontSize:14 }}>Sparks mined from your chats. Convert the ones worth building — the rest stay out of your way.</p>
              </div>
              {(importedIdeas||[]).length>0 && <Btn variant="primary" onClick={()=>setWizard(true)}><Icons.plus size={16}/> Import more</Btn>}
            </div>
            <ImportedView batches={importBatches||[]} importedIdeas={importedIdeas||[]} ideas={ideas} go={go}
              onOpenWizard={()=>setWizard(true)} onConvert={onConvertImport} onDismiss={onDismissImport} onRestore={onRestoreImport}
              onQuickLook={setQuickLook}/>
          </>
        ) : (
        <>
        <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:26 }}>
          <div>
            <h1 style={{ fontSize:30, margin:"0 0 4px", letterSpacing:"-0.02em", fontWeight:600 }}>Your ideas</h1>
            <p className="muted" style={{ margin:0, fontSize:14 }}>One founder, {ideas.filter(i=>!i.archived).length} ideas in flight.</p>
          </div>
          <div className="row gap8">
            <Btn variant="secondary" onClick={()=>setWizard(true)}><Icons.sparkle size={15}/> Import from chats</Btn>
            <Btn variant="primary" onClick={onNewIdea}><Icons.plus size={16}/> New idea</Btn>
          </div>
        </div>

        {firstRun ? (
          <div style={{ textAlign:"center", padding:"100px 24px" }}>
            <h2 className="serif italic" style={{ fontSize:38, margin:"0 0 8px", fontWeight:400 }}>What will you hatch first?</h2>
            <p className="muted" style={{ fontSize:15, margin:"0 0 24px" }}>A sentence is enough. We'll shape it together from there.</p>
            <div className="row gap10" style={{ justifyContent:"center" }}>
              <Btn variant="primary" size="lg" onClick={onNewIdea}>Start your first idea</Btn>
              <Btn variant="secondary" size="lg" onClick={()=>setWizard(true)}><Icons.sparkle size={16}/> Import from your chats</Btn>
            </div>
          </div>
        ) : (
          <>
            {view==="active" && <InsightStrip ideas={ideas} go={go}/>}

            <div className="row gap8" style={{ marginBottom:18, flexWrap:"wrap" }}>
              {[["all","All"],["ideation","Ideation"],["validation","Validation"],["launch","Launch"]].map(([k,l])=>(
                <button key={k} onClick={()=>{ setFilter(k); setView("active"); }} className="pill" style={{ cursor:"pointer", border:"1px solid", borderColor: filter===k&&view==="active"?"var(--text-muted)":"var(--border)", background: filter===k&&view==="active"?"var(--surface-raised)":"var(--surface)", color: filter===k&&view==="active"?"var(--text-primary)":"var(--text-secondary)", padding:"6px 13px" }}>{l}</button>
              ))}
              <div className="spacer"/>
              <button onClick={()=>setView(v=>v==="archived"?"active":"archived")} className="pill" style={{ cursor:"pointer", padding:"6px 13px", color: view==="archived"?"var(--text-primary)":"var(--text-secondary)" }}><Icons.archive size={13}/> Archived</button>
            </div>

            {visible.length === 0
              ? <Empty icon={Icons.archive} title={view==="archived"?"Nothing archived":"No ideas here"} body={view==="archived"?"Archived ideas stay out of the main grid and insights.":"Try a different filter, or start something new."}/>
              : <Stagger className="grid" step={70} style={{ gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                  {visible.map(idea=>(
                    view==="archived"
                      ? <Card key={idea.id} style={{ padding:20, opacity:0.7 }}>
                          <div className="row" style={{ justifyContent:"space-between" }}><div style={{ fontWeight:600, fontSize:17 }}>{idea.name}</div><Btn variant="ghost" size="sm" onClick={()=>onArchive(idea.id)}><Icons.restore size={14}/> Restore</Btn></div>
                          <div className="muted clamp2" style={{ fontSize:13, marginTop:4 }}>{idea.one_liner}</div>
                        </Card>
                      : <IdeaCard key={idea.id} idea={idea} go={go} onArchive={onArchive}/>
                  ))}
                </Stagger>}
          </>
        )}
        </>
        )}
      </div>

      {wizard && <ImportWizard onClose={()=>setWizard(false)} onImport={(res,label)=>{ onImport(res,label); setWizard(false); setMainTab("imported"); }}/>}
      {quickLook && <ImportQuickLook item={quickLook} batch={qlBatch} ideas={ideas} onClose={()=>setQuickLook(null)} onConvert={onConvertImport} onDismiss={onDismissImport} go={go}/>}
    </div>
  );
}

Object.assign(window, { Dashboard, TopBar, ThemeToggle });


/* ===================== imports.jsx ===================== */
// ===== Imported ideas — "the Seal": mine ideas from the founder's own AI chats =====

/* ---------- the mining prompt (editable intent + locked schema) ---------- */
const PROMPT_INTENT_DEFAULT =
`Scan this conversation (and any I paste) for distinct product or
business ideas I've explored. Include half-formed ones. Focus on
the last 6 months. Return at most 15, strongest first.`;

const PROMPT_SCHEMA =
`# LOCKED — do not change; Hatchly needs this exact format
Output ONLY a single block in this exact shape, nothing before or after.
Use plain JSON. Do NOT base64-encode. Group ideas into 2–5 named clusters
by theme. Obey the caps. If there are more than 15 ideas, return the best
15 and set "more_available": true.

Caps: name ≤40 chars · one_liner ≤100 · ≤5 memories, each ≤140 chars.

===HATCHLY SEAL v1===
{
  "v": 1,
  "idea_count": <number of ideas below>,
  "more_available": false,
  "clusters": ["...", "..."],
  "ideas": [
    {
      "name": "...",
      "one_liner": "...",
      "cluster": "...",
      "confidence": "high|medium|low",
      "tags": ["...", "..."],
      "memories": ["short fact", "short fact"]
    }
  ]
}
===END SEAL===`;

const buildPrompt = (intent) => `# EDITABLE — the user can tune this part\n${intent}\n\n${PROMPT_SCHEMA}`;

// a realistic sample the demo user can drop into step 2
const EXAMPLE_SEAL = `Sure — here's everything I found across our chats:

===HATCHLY SEAL v1===
{
  "v": 1,
  "idea_count": 6,
  "more_available": true,
  "clusters": ["Founder tools", "Local commerce", "Health"],
  "ideas": [
    { "name": "Threadback", "one_liner": "Turns your old Slack threads into a searchable decision log.", "cluster": "Founder tools", "confidence": "high", "tags": ["saas","productivity","ai"],
      "memories": ["Keeps re-litigating settled decisions","Wants a 'why did we do this' search","Would pay per seat for a small team"] },
    { "name": "Warmly", "one_liner": "Auto-drafts intro emails from your CRM in your own voice.", "cluster": "Founder tools", "confidence": "medium", "tags": ["saas","ai","sales"],
      "memories": ["Hates writing the same intro 5x","Tone matters more than speed"] },
    { "name": "Corner", "one_liner": "A standing weekly order from one nearby restaurant.", "cluster": "Local commerce", "confidence": "medium", "tags": ["marketplace","local","food"],
      "memories": ["Likes the regular-at-a-spot feeling","Delivery apps feel transactional"] },
    { "name": "Stoop", "one_liner": "Hyper-local stoop sales, mapped and notified.", "cluster": "Local commerce", "confidence": "low", "tags": ["marketplace","local"],
      "memories": ["Loves a neighborhood treasure hunt","Liability + flaky sellers worry me"] },
    { "name": "Taper", "one_liner": "Caffeine tracker that nudges you down, not off.", "cluster": "Health", "confidence": "high", "tags": ["mobile_app","health","consumer"],
      "memories": ["Quitting cold turkey always fails","Wants a gentle schedule, not shame","Apple Health integration is table stakes"] },
    { "name": "Mend", "one_liner": "Find a tailor for one garment, by photo.", "cluster": "Local commerce", "confidence": "low", "tags": ["marketplace","local","service"],
      "memories": ["Has a drawer of clothes that need small fixes"] }
  ]
}
===END SEAL===

Let me know if you want me to pull more — there were a few weaker ones I left out.`;

/* ---------- parser: robust, lenient ---------- */
function parseSeal(raw) {
  if (!raw || !raw.trim()) return { status: "empty" };
  const m = raw.match(/===\s*HATCHLY SEAL v1\s*===([\s\S]*?)===\s*END SEAL\s*===/i);
  if (!m) return { status: "no_seal" };
  let json;
  try { json = JSON.parse(m[1].trim()); }
  catch (e) { return { status: "bad_json" }; }
  const all = Array.isArray(json.ideas) ? json.ideas : [];
  const ideas = all.filter(x => x && typeof x.name === "string" && x.name.trim() && typeof x.one_liner === "string" && x.one_liner.trim());
  if (ideas.length === 0) return { status: "no_seal" };
  const declared = Number.isFinite(json.idea_count) ? json.idea_count : ideas.length;
  let clusters = Array.isArray(json.clusters) && json.clusters.length ? json.clusters.slice() : [];
  ideas.forEach(i => { if (i.cluster && !clusters.includes(i.cluster)) clusters.push(i.cluster); });
  if (!clusters.length) clusters = ["Ideas"];
  const status = declared !== ideas.length ? "partial" : "parsed";
  return { status, declared, parsed: ideas.length, dropped: declared - ideas.length, clusters, ideas, more: !!json.more_available };
}

function archFromTags(tags = []) {
  const t = tags.map(x => String(x).toLowerCase());
  if (t.includes("marketplace")) return "marketplace";
  if (t.includes("ecom") || t.includes("subscription") || t.includes("commerce")) return "physical_ecom";
  if (t.includes("mobile_app") || t.includes("mobile")) return "mobile_app";
  if (t.includes("content") || t.includes("creator")) return "content";
  if (t.includes("service")) return "service";
  if (t.includes("saas") || t.includes("ai") || t.includes("productivity")) return "saas";
  return null;
}

const CONF = {
  high: { band: "strong", label: "High" },
  medium: { band: "moderate", label: "Medium" },
  low: { band: "weak", label: "Low" },
};

/* ---------- import wizard (3 steps) ---------- */
function WizardSteps({ step }) {
  const labels = ["Copy prompt", "Paste the seal", "Review"];
  return (
    <div className="row gap8" style={{ alignItems: "center" }}>
      {labels.map((l, i) => {
        const n = i + 1, done = n < step, cur = n === step;
        return (
          <React.Fragment key={l}>
            <div className="row gap6" style={{ alignItems: "center", color: cur ? "var(--text-primary)" : "var(--text-muted)" }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, background: done ? "var(--accent)" : cur ? "var(--accent-soft)" : "var(--surface)", color: done ? "#fff" : cur ? "var(--accent-text)" : "var(--text-muted)", border: cur ? "none" : "1px solid var(--border)" }}>{done ? <Icons.check size={12} /> : n}</span>
              <span style={{ fontSize: 12.5, fontWeight: cur ? 600 : 500 }}>{l}</span>
            </div>
            {i < 2 && <div style={{ width: 24, height: 1, background: "var(--border-strong)" }}></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ImportWizard({ onClose, onImport }) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState(PROMPT_INTENT_DEFAULT);
  const [showSchema, setShowSchema] = useState(false);
  const [copied, setCopied] = useState(false);
  const [raw, setRaw] = useState("");
  const [label, setLabel] = useState("ChatGPT · " + new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" }));

  const res = parseSeal(raw);
  const canContinue2 = res.status === "parsed" || res.status === "partial";

  const copyPrompt = () => { try { navigator.clipboard?.writeText(buildPrompt(intent)); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const finish = () => { onImport(res, label); };

  return (
    <>
      <Scrim onClose={onClose} />
      <div className="modal" style={{ width: 640 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
          <WizardSteps step={step} />
          <IconBtn onClick={onClose}><Icons.x size={18} /></IconBtn>
        </div>

        <div className="scrollarea" style={{ padding: 26, flex: 1 }}>
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="row gap8" style={{ marginBottom: 6 }}><span style={{ color: "var(--accent-text)" }}><Icons.sparkle size={17} /></span><h2 style={{ fontSize: 21, margin: 0 }}>Mine ideas from your chats</h2></div>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 20px" }}>Your AI already heard every idea you've talked through. Copy this prompt, run it in your own tool, and bring the result back — your chats never leave your hands.</p>

              <SectionLabel style={{ marginBottom: 8 }}>What to look for <span className="faint" style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>· editable</span></SectionLabel>
              <textarea className="field mono" value={intent} onChange={e => setIntent(e.target.value)} rows={4} style={{ resize: "vertical", fontSize: 12.5, lineHeight: 1.6 }}></textarea>

              <button onClick={() => setShowSchema(s => !s)} className="row gap6" style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 12.5, marginTop: 14, cursor: "pointer", padding: 0 }}>
                <Icons.lock size={13} /> Output format <span className="faint">(locked — the parser needs it)</span> <Icons.chevD size={14} style={{ transform: showSchema ? "rotate(180deg)" : "none", transition: "transform 160ms" }} />
              </button>
              {showSchema && <pre style={{ margin: "10px 0 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", fontFamily: "'Geist Mono', monospace", fontSize: 11, lineHeight: 1.6, color: "var(--text-muted)", whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}>{PROMPT_SCHEMA}</pre>}

              <div style={{ marginTop: 22, padding: "16px 18px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <div className="row gap10" style={{ alignItems: "center" }}>
                  <Btn variant="primary" onClick={copyPrompt} style={{ minWidth: 150 }}>{copied ? <><Icons.check size={15} /> Copied</> : <><Icons.doc size={15} /> Copy prompt</>}</Btn>
                  <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.45 }}>Paste it into ChatGPT, Claude, or Gemini — then bring the result back here.</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 21, margin: "0 0 6px" }}>Paste what it gave you</h2>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 16px" }}>Drop in everything the model returned — Hatchly finds the seal even if there's chatter around it.</p>

              <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={9} placeholder={"Paste the full reply here, including the\n===HATCHLY SEAL v1=== … ===END SEAL=== lines."}
                className="field mono" style={{ resize: "vertical", fontSize: 12, lineHeight: 1.6, borderStyle: raw ? "solid" : "dashed", borderColor: res.status === "no_seal" || res.status === "bad_json" ? "var(--danger)" : (canContinue2 ? "var(--success)" : "var(--border-strong)") }}></textarea>

              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 12 }}>
                <div style={{ minHeight: 20, flex: 1 }}><SealStatus res={res} /></div>
                <button onClick={() => setRaw(EXAMPLE_SEAL)} className="row gap5" style={{ background: "none", border: "none", color: "var(--accent-text)", fontSize: 12, cursor: "pointer", flex: "none", whiteSpace: "nowrap" }}><Icons.sparkle size={12} /> Use a sample seal</button>
              </div>
            </div>
          )}

          {/* STEP 3 — reveal */}
          {step === 3 && <RevealStep res={res} label={label} setLabel={setLabel} />}
        </div>

        {/* footer */}
        <div className="row gap10" style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", alignItems: "center" }}>
          {step > 1 ? <Btn variant="ghost" onClick={() => setStep(step - 1)}><Icons.chevL size={15} /> Back</Btn> : <Btn variant="ghost" onClick={onClose}>Cancel</Btn>}
          <div className="spacer"></div>
          {step === 1 && <Btn variant="primary" onClick={() => setStep(2)}>I've run it — paste the seal <Icons.chevR size={15} /></Btn>}
          {step === 2 && <Btn variant="primary" disabled={!canContinue2} onClick={() => setStep(3)}>Continue <Icons.chevR size={15} /></Btn>}
          {step === 3 && <Btn variant="primary" onClick={finish}><Icons.sparkle size={15} /> Add {res.parsed} to Imported ideas</Btn>}
        </div>
      </div>
    </>
  );
}

function SealStatus({ res }) {
  if (res.status === "empty") return <span className="faint" style={{ fontSize: 12.5 }}>Waiting for a paste…</span>;
  if (res.status === "no_seal") return <span style={{ fontSize: 12.5, color: "var(--danger-text)" }}>Couldn't find a Hatchly seal — copy the whole block, including the <span className="mono">===HATCHLY SEAL===</span> lines.</span>;
  if (res.status === "bad_json") return <span style={{ fontSize: 12.5, color: "var(--danger-text)" }}>Found the seal but the JSON looks corrupted — try re-pasting.</span>;
  if (res.status === "partial") return <span className="row gap6" style={{ fontSize: 12.5, color: "var(--accent-text)" }}><Icons.alert size={14} /> Looks cut off — got {res.parsed} of {res.declared}. Re-paste, or import these {res.parsed}.</span>;
  return <span className="row gap6" style={{ fontSize: 12.5, color: "var(--success-text)" }}><Icons.check size={14} /> Found {res.parsed} idea{res.parsed !== 1 ? "s" : ""} in {res.clusters.length} cluster{res.clusters.length !== 1 ? "s" : ""}.</span>;
}

function RevealStep({ res, label, setLabel }) {
  const byCluster = res.clusters.map(c => ({ cluster: c, items: res.ideas.filter(i => (i.cluster || res.clusters[0]) === c) })).filter(g => g.items.length);
  let idx = 0;
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", animation: "scaleIn 420ms cubic-bezier(.22,1,.36,1)" }}><Icons.sparkle size={24} /></div>
        <h2 className="serif italic" style={{ fontSize: 27, margin: "0 0 4px", fontWeight: 400 }}>{res.parsed} ideas crystallized</h2>
        <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>Pulled out of the chaos of your chats{res.more ? " — and there are more where these came from." : "."}</p>
      </div>

      {res.status === "partial" && <div className="row gap8" style={{ alignItems: "center", padding: "10px 14px", background: "var(--accent-softer)", borderRadius: 10, marginBottom: 16, fontSize: 12.5, color: "var(--accent-text)" }}><Icons.alert size={14} /> The paste looked cut off — importing the {res.parsed} that came through cleanly.</div>}

      <div className="col gap18">
        {byCluster.map(g => (
          <div key={g.cluster}>
            <div className="row gap8" style={{ marginBottom: 10 }}><SectionLabel>{g.cluster}</SectionLabel><span className="faint" style={{ fontSize: 11 }}>{g.items.length}</span><div className="hr" style={{ flex: 1 }}></div></div>
            <div className="col gap8">
              {g.items.map(it => {
                const c = CONF[it.confidence] || CONF.medium;
                const delay = (idx++) * 80;
                return (
                  <div key={it.name} className="row gap10" style={{ alignItems: "flex-start", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 11, background: "var(--surface-raised)", opacity: 0, animation: "fadeUp 460ms cubic-bezier(.22,1,.36,1) forwards", animationDelay: delay + "ms" }}>
                    <StatusDot band={c.band} size={8} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</div>
                      <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{it.one_liner}</div>
                    </div>
                    <span className="faint mono" style={{ fontSize: 10.5, flex: "none", paddingTop: 2 }}>{(it.memories || []).length}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <label className="label">Label this import</label>
        <input className="field" value={label} onChange={e => setLabel(e.target.value)} />
      </div>
    </div>
  );
}

/* ---------- imported-ideas staging view (dashboard tab) ---------- */
function ImportedIdeaCard({ item, batch, ideas, onConvert, onQuickLook, go }) {
  const c = CONF[item.confidence] || CONF.medium;
  const converted = item.status === "converted";
  const dup = !converted && ideas.some(i => !i.archived && i.name.toLowerCase() === item.name.toLowerCase());
  return (
    <Card style={{ padding: 18, opacity: converted ? 0.62 : 1, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="row gap8" style={{ alignItems: "center" }}>
          <StatusDot band={c.band} size={9} />
          <span className="faint" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label} signal</span>
        </div>
        {dup && <Pill style={{ fontSize: 10, color: "var(--accent-text)", background: "var(--accent-soft)", border: "none" }}>possible dup</Pill>}
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 3 }}>{item.name}</div>
        <div className="muted clamp2" style={{ fontSize: 13, lineHeight: 1.5 }}>{item.one_liner}</div>
      </div>
      <div className="row gap6" style={{ flexWrap: "wrap" }}>
        {(item.tags || []).slice(0, 3).map(t => <Pill key={t} style={{ fontSize: 10.5 }}>{t}</Pill>)}
      </div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <span className="faint" style={{ fontSize: 11.5 }}>{(item.extracted_memories || []).length} memories</span>
        {converted
          ? <Btn variant="ghost" size="sm" onClick={() => item.converted_idea_id && go({ screen: "workspace", ideaId: item.converted_idea_id, tab: "overview" })}>Open project <Icons.chevR size={14} /></Btn>
          : <div className="row gap6">
              <Btn variant="ghost" size="sm" onClick={() => onQuickLook(item)}>Quick look</Btn>
              <Btn variant="soft" size="sm" onClick={() => onConvert(item.id)}><Icons.plus size={13} /> Convert</Btn>
            </div>}
      </div>
    </Card>
  );
}

function ImportedView({ batches, importedIdeas, ideas, onOpenWizard, onConvert, onQuickLook, onRestore, go }) {
  const [showDismissed, setShowDismissed] = useState(false);
  const live = importedIdeas.filter(i => i.status !== "dismissed");
  const dismissed = importedIdeas.filter(i => i.status === "dismissed");

  if (importedIdeas.length === 0) {
    return (
      <div style={{ padding: "30px 0" }}>
        <Empty icon={Icons.sparkle} title="Mine your first ideas" body="Pull the ideas you've already talked through with ChatGPT, Claude, or Gemini into Hatchly — no integration, your chats stay yours."
          action={<Btn variant="primary" onClick={onOpenWizard}><Icons.plus size={15} /> Import ideas</Btn>} />
      </div>
    );
  }

  const clusters = [];
  live.forEach(i => { if (!clusters.includes(i.cluster_label)) clusters.push(i.cluster_label); });
  const batchById = Object.fromEntries(batches.map(b => [b.id, b]));
  const staged = live.filter(i => i.status === "staged").length;

  return (
    <div>
      {/* batches strip */}
      <div className="row gap10" style={{ flexWrap: "wrap", marginBottom: 22 }}>
        {batches.map(b => (
          <div key={b.id} className="row gap8" style={{ alignItems: "center", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <span style={{ color: "var(--text-muted)" }}><Icons.doc size={14} /></span>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{b.source_label}</span>
            <span className="faint" style={{ fontSize: 11.5 }}>· {b.parsed_count} ideas · {b.created_at}</span>
            {b.status === "partial" && <Pill style={{ fontSize: 10, color: "var(--accent-text)", background: "var(--accent-soft)", border: "none" }}>partial</Pill>}
          </div>
        ))}
      </div>

      {/* clusters */}
      <div className="col gap28">
        {clusters.map(cl => {
          const items = live.filter(i => i.cluster_label === cl);
          return (
            <div key={cl}>
              <div className="row gap10" style={{ marginBottom: 14, alignItems: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>{cl}</h3>
                <span className="faint" style={{ fontSize: 12 }}>{items.length}</span>
                <div className="hr" style={{ flex: 1 }}></div>
              </div>
              <Stagger className="grid" step={55} style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {items.map(it => <ImportedIdeaCard key={it.id} item={it} batch={batchById[it.batch_id]} ideas={ideas} onConvert={onConvert} onQuickLook={onQuickLook} go={go} />)}
              </Stagger>
            </div>
          );
        })}
      </div>

      {/* dismissed */}
      {dismissed.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <button onClick={() => setShowDismissed(s => !s)} className="row gap6" style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer", padding: 0 }}>
            <Icons.chevR size={14} style={{ transform: showDismissed ? "rotate(90deg)" : "none", transition: "transform 160ms" }} /> Dismissed · {dismissed.length}
          </button>
          {showDismissed && (
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 14 }}>
              {dismissed.map(it => (
                <Card key={it.id} style={{ padding: 16, opacity: 0.6 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{it.name}</div>
                    <Btn variant="ghost" size="sm" onClick={() => onRestore(it.id)}><Icons.restore size={13} /> Restore</Btn>
                  </div>
                  <div className="muted clamp2" style={{ fontSize: 12.5, marginTop: 4 }}>{it.one_liner}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- quick look drawer ---------- */
function ImportQuickLook({ item, batch, ideas, onClose, onConvert, onDismiss, go }) {
  if (!item) return null;
  const c = CONF[item.confidence] || CONF.medium;
  const converted = item.status === "converted";
  return (
    <>
      <Scrim onClose={onClose} />
      <div className="drawer" style={{ width: 440 }}>
        <DrawerHead title="Quick look" onClose={onClose} />
        <div className="scrollarea" style={{ padding: 22, flex: 1 }}>
          <div className="row gap8" style={{ marginBottom: 12 }}>
            <span className="row gap5" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: c.band === "strong" ? "var(--success-text)" : c.band === "weak" ? "var(--danger-text)" : "var(--accent-text)" }}><StatusDot band={c.band} size={7} />{c.label} signal</span>
            <Pill style={{ fontSize: 10 }}>{item.cluster_label}</Pill>
          </div>
          <h2 style={{ fontSize: 24, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{item.name}</h2>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 18px" }}>{item.one_liner}</p>

          <div className="row gap6" style={{ flexWrap: "wrap", marginBottom: 20 }}>
            {(item.tags || []).map(t => <Pill key={t}>{t}</Pill>)}
            {item.suggested_archetype && <Pill accent style={{ textTransform: "capitalize" }}>{item.suggested_archetype.replace("_", " ")}</Pill>}
          </div>

          <SectionLabel style={{ marginBottom: 10 }}>Extracted memories · {(item.extracted_memories || []).length}</SectionLabel>
          <div className="col gap8">
            {(item.extracted_memories || []).map((m, i) => (
              <div key={i} className="row gap10" style={{ padding: "11px 12px", border: "1px solid var(--border)", borderRadius: 10, alignItems: "flex-start", background: "var(--surface-raised)" }}>
                <span style={{ color: "var(--text-muted)", marginTop: 1 }}><Icons.brain size={15} /></span>
                <span style={{ fontSize: 13, lineHeight: 1.5 }}>{m}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: 12, background: "var(--surface)", borderRadius: 10 }}>
            <div className="row gap8" style={{ alignItems: "flex-start" }}><Avatar kind="ai" label="H" size={24} /><div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>Converting lands this in Ideation as a real project — name, one-liner, and these {(item.extracted_memories || []).length} memories already attached. From {batch ? batch.source_label : "your import"}.</div></div>
          </div>
        </div>
        <div className="row gap10" style={{ padding: 16, borderTop: "1px solid var(--border)", alignItems: "center" }}>
          {converted ? (
            <Btn variant="primary" onClick={() => { item.converted_idea_id && go({ screen: "workspace", ideaId: item.converted_idea_id, tab: "overview" }); }}>Open project <Icons.chevR size={15} /></Btn>
          ) : (
            <>
              <Btn variant="ghost" style={{ color: "var(--danger-text)" }} onClick={() => { onDismiss(item.id); onClose(); }}>Dismiss</Btn>
              <div className="spacer"></div>
              <Btn variant="primary" onClick={() => { onConvert(item.id); onClose(); }}><Icons.plus size={15} /> Convert to project</Btn>
            </>
          )}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { parseSeal, archFromTags, ImportWizard, ImportedView, ImportQuickLook, CONF });


/* ===================== tabs.jsx ===================== */
// ===== Workspace tabs: Overview · Memory · Scorecard · Plan · Brand =====

const ACT_ICON = { score_changed:Icons.trend, memory_added:Icons.brain, link_captured:Icons.link, voice_added:Icons.voice, task_done:Icons.check, gate_unlocked:Icons.lock, phase_advanced:Icons.flag };

function TabHeader({ title, sub, right }) {
  return (
    <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:22, gap:14 }}>
      <div><h1 style={{ fontSize:26, margin:"0 0 4px", letterSpacing:"-0.02em", fontWeight:600 }}>{title}</h1>{sub && <p className="muted" style={{ margin:0, fontSize:13.5 }}>{sub}</p>}</div>
      {right}
    </div>
  );
}

function LockedTab({ title, body, progress }) {
  return (
    <div style={{ maxWidth:440, margin:"60px auto", textAlign:"center" }}>
      <div style={{ width:52, height:52, borderRadius:14, background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", color:"var(--text-muted)" }}><Icons.lock size={24}/></div>
      <h2 style={{ fontSize:20, margin:"0 0 8px", fontWeight:600 }}>{title}</h2>
      <p className="muted" style={{ fontSize:14, lineHeight:1.6, margin:"0 0 20px" }}>{body}</p>
      {progress!=null && (
        <div style={{ maxWidth:280, margin:"0 auto" }}>
          <div className="row" style={{ justifyContent:"space-between", fontSize:12, marginBottom:6 }}><span className="faint">Rubric filled</span><span style={{ fontWeight:600 }}>{progress}%</span></div>
          <ProgressBar value={progress}/>
        </div>
      )}
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function OverviewTab({ idea, go, openChat }) {
  const ideation = idea.phase==="ideation";
  const dims = idea.snapshot?.dimensions;
  const strongest = dims && [...dims].sort((a,b)=>b.value-a.value)[0];
  const weakest = dims && [...dims].sort((a,b)=>a.value-b.value)[0];
  return (
    <div>
      <TabHeader title="Overview" sub="The command center for this idea — and the single most useful next move."/>
      <Stagger className="col gap14">
        {/* what's next */}
        <Card style={{ borderColor:"var(--accent)", borderWidth:1.5, background:"var(--accent-softer)" }}>
          <div className="row gap8" style={{ marginBottom:8 }}>
            <span style={{ color:"var(--accent-text)" }}><Icons.sparkle size={16}/></span>
            <SectionLabel style={{ color:"var(--accent-text)" }}>What's next</SectionLabel>
          </div>
          <div style={{ fontSize:16, lineHeight:1.5, fontWeight:500, marginBottom:14, maxWidth:620 }}>{idea.next_move}</div>
          <Btn variant="primary" size="sm" onClick={openChat}><Icons.sparkle size={14}/> Work on it in chat</Btn>
        </Card>

        {/* metrics row */}
        <div className="grid gap14" style={{ gridTemplateColumns:"1.1fr 1fr 1fr" }}>
          <Card className="row gap16" style={{ alignItems:"center" }}>
            {ideation
              ? <ScoreRing value={idea.completeness} size={84} color="var(--accent)" label="shaped"/>
              : <ScoreRing value={idea.current_score} size={84} label={`v${idea.snapshot.version}`}/>}
            <div>
              <SectionLabel style={{ marginBottom:6 }}>{ideation?"Completeness":"Overall score"}</SectionLabel>
              <PhaseBadge phase={idea.phase}/>
              <div className="faint" style={{ fontSize:12, marginTop:8 }}>{ideation?`${idea.dimsWithSignal||5} of 13 dimensions have signal`:idea.snapshot.inputs}</div>
            </div>
          </Card>
          {ideation ? (
            <Card style={{ gridColumn:"span 2" }}>
              <SectionLabel style={{ marginBottom:10 }}>What I still need to know</SectionLabel>
              <div className="col gap8">
                {["Who exactly is this for, in one sentence","How it'll make money","Who you're really up against"].map((t,i)=>(
                  <div key={i} className="row gap8" style={{ fontSize:13.5 }}><StatusDot color="var(--text-muted)"/> {t}</div>
                ))}
              </div>
            </Card>
          ) : (
            <>
              <MetricCard label="Strongest" dim={strongest} band="strong"/>
              <MetricCard label="Weakest" dim={weakest} band="weak"/>
            </>
          )}
        </div>

        {/* activity feed */}
        <Card>
          <SectionLabel style={{ marginBottom:14 }}>Recent activity</SectionLabel>
          <div className="col gap2">
            {idea.activity.map((a,i)=>{ const I = ACT_ICON[a.type]||Icons.dots; return (
              <div key={i} className="row gap12" style={{ padding:"10px 0", borderBottom: i<idea.activity.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
                <span style={{ width:30, height:30, borderRadius:8, background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)", flex:"none" }}><I size={15}/></span>
                <div style={{ flex:1, fontSize:13.5 }}>{a.summary}</div>
                <span className="faint" style={{ fontSize:12 }}>{a.at}</span>
              </div>
            );})}
          </div>
        </Card>
      </Stagger>
    </div>
  );
}
function MetricCard({ label, dim, band }) {
  if (!dim) return <Card/>;
  return (
    <Card>
      <SectionLabel style={{ marginBottom:10 }}>{label}</SectionLabel>
      <div className="row gap8" style={{ alignItems:"baseline" }}>
        <span style={{ fontSize:28, fontWeight:600, letterSpacing:"-0.02em" }} className={`band-${dim.band||band}`}>{dim.value}</span>
        {dim.delta!=null && <Pill style={{ fontSize:11, color: dim.delta>=0?"var(--success-text)":"var(--danger-text)" }}>{dim.delta>=0?"+":""}{dim.delta}</Pill>}
      </div>
      <div style={{ fontSize:13.5, fontWeight:500, marginTop:4 }}>{dim.label}</div>
    </Card>
  );
}

/* ---------------- MEMORY ---------------- */
const TAG_LABEL = (t) => DIM[t]?.label || ({problem:"Problem",customer:"Customer",competitor:"Competitor",risk:"Risk",decision:"Decision",founder:"Founder",feature:"Feature"}[t] || t);

function MemoryTab({ idea, onEdit }) {
  const [tag, setTag] = useState("all");
  const [q, setQ] = useState("");
  const allTags = [...new Set(idea.memories.flatMap(m=>m.tags))];
  const filtered = idea.memories.filter(m =>
    (tag==="all"||m.tags.includes(tag)) && (q==="" || m.content.toLowerCase().includes(q.toLowerCase())));

  if (idea.memories.length===0) return <div><TabHeader title="Memory"/><Empty icon={Icons.brain} title="Nothing captured yet" body="Start talking in the chat and memories appear here — tagged and traceable."/></div>;

  return (
    <div>
      <TabHeader title="Memory" sub="What I know about this idea — browsable, traceable, and yours to correct."/>
      <div className="row gap10" style={{ marginBottom:16 }}>
        <div style={{ position:"relative", flex:1, maxWidth:320 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}><Icons.search size={15}/></span>
          <input className="field" style={{ paddingLeft:33 }} placeholder="Search memory…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      <div className="row gap6" style={{ marginBottom:18, flexWrap:"wrap" }}>
        <FilterChip active={tag==="all"} onClick={()=>setTag("all")}>All · {idea.memories.length}</FilterChip>
        {allTags.map(t=>(<FilterChip key={t} active={tag===t} onClick={()=>setTag(t)}>{TAG_LABEL(t)}</FilterChip>))}
      </div>
      <Stagger className="col gap10" step={50}>
        {filtered.map(m=>(
          <Card key={m.id} className="row gap14" style={{ alignItems:"flex-start", padding:16 }}>
            <SourceGlyph type={m.src}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, lineHeight:1.5, marginBottom:8 }}>{m.content}</div>
              <div className="row gap6" style={{ flexWrap:"wrap", alignItems:"center" }}>
                {m.tags.map(t=><Pill key={t} accent={!!DIM[t]} style={{ fontSize:10.5 }}>{TAG_LABEL(t)}</Pill>)}
                <span className="faint" style={{ fontSize:11, marginLeft:4 }}>·</span>
                <ConfBadge c={m.confidence}/>
                {m.edited && <span className="faint" style={{ fontSize:11 }}>· edited</span>}
              </div>
            </div>
            <div className="col gap4" style={{ alignItems:"flex-end" }}>
              <button className="row gap4 faint" style={{ fontSize:11.5, background:"none", border:"none", color:"var(--text-muted)" }} onClick={()=>onEdit(m)}><Icons.link size={12}/> {m.srcLabel}</button>
              <IconBtn style={{ width:26, height:26 }} onClick={()=>onEdit(m)} title="Edit memory"><Icons.edit size={14}/></IconBtn>
            </div>
          </Card>
        ))}
        {filtered.length===0 && <div className="faint" style={{ textAlign:"center", padding:30, fontSize:13 }}>No memories match.</div>}
      </Stagger>
    </div>
  );
}
function FilterChip({ active, onClick, children }) {
  return <button onClick={onClick} className="pill" style={{ cursor:"pointer", border:"1px solid", borderColor: active?"var(--text-muted)":"var(--border)", background: active?"var(--surface-raised)":"var(--surface)", color: active?"var(--text-primary)":"var(--text-secondary)", padding:"5px 11px" }}>{children}</button>;
}
function ConfBadge({ c }) {
  const col = c==="high"?"var(--success-text)":c==="medium"?"var(--accent-text)":"var(--text-muted)";
  return <span className="row gap4" style={{ fontSize:11, color:col }}><StatusDot color={col} size={6}/>{c} confidence</span>;
}

/* ---------------- SCORECARD ---------------- */
function ScorecardTab({ idea, onRegenerate, onAddTask }) {
  const [open, setOpen] = useState(null);
  if (idea.phase==="ideation") {
    const left = 13 - (idea.dimsWithSignal||5);
    return <div><TabHeader title="Scorecard"/><LockedTab title="Not unlocked yet" body={`Unlocks when your idea is clear enough to assess — about ${left} of 13 dimensions to go. Keep talking in the chat.`} progress={idea.completeness}/></div>;
  }
  const s = idea.snapshot;
  const ranked = [...s.dimensions].sort((a,b)=>b.value-a.value);
  return (
    <div>
      <TabHeader title="Scorecard" sub={`Version ${s.version} · ${s.inputs}`} right={<Btn variant="secondary" size="sm" onClick={onRegenerate}><Icons.sparkle size={14}/> Regenerate</Btn>}/>
      <Stagger className="col gap14">
        {/* headline */}
        <Card className="row gap24" style={{ alignItems:"center", flexWrap:"wrap" }}>
          <ScoreRing value={s.overall} size={112} stroke={8} label={`v${s.version}`}/>
          <div style={{ flex:1, minWidth:260 }}>
            <div className="row gap8" style={{ marginBottom:8 }}><PhaseBadge phase={idea.phase}/><ConfBadge c={s.confidence}/></div>
            <div className="serif italic" style={{ fontSize:23, lineHeight:1.3 }}>"{s.verdict}"</div>
          </div>
        </Card>

        {/* category scoreboard */}
        <div className="grid gap12" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
          {Object.entries(s.category_scores).map(([k,v])=>(
            <Card key={k} style={{ padding:16 }}>
              <div className="row" style={{ justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, textTransform:"capitalize" }}>{k}</span>
                <span style={{ fontSize:20, fontWeight:600 }} className={`band-${bandOf(v)}`}><CountUp to={v}/></span>
              </div>
              <ProgressBar value={v} color={v>=75?"var(--success)":v>=60?"var(--accent)":"var(--danger)"}/>
              <div className="faint" style={{ fontSize:11, marginTop:8 }}>{CATEGORIES[k]?.blurb}</div>
            </Card>
          ))}
        </div>

        {/* 13 dimensions ranked */}
        <Card>
          <SectionLabel style={{ marginBottom:14 }}>All 13 dimensions · ranked</SectionLabel>
          <div className="col">
            {ranked.map((d,i)=>(
              <div key={d.key}>
                <div className="row gap12" style={{ padding:"9px 0", cursor: d.evidence?"pointer":"default", alignItems:"center" }} onClick={()=>d.evidence&&setOpen(open===d.key?null:d.key)}>
                  <span className="faint mono" style={{ fontSize:11, width:18 }}>{String(i+1).padStart(2,"0")}</span>
                  <StatusDot band={d.band}/>
                  <span style={{ fontSize:13.5, fontWeight:500, width:150 }}>{d.label}</span>
                  <div style={{ flex:1 }}><ProgressBar value={d.value} color={d.band==="strong"?"var(--success)":d.band==="moderate"?"var(--accent)":"var(--danger)"}/></div>
                  <span style={{ fontSize:14, fontWeight:600, width:30, textAlign:"right" }} className={`band-${d.band}`}>{d.value}</span>
                  {d.delta!=null ? <span style={{ fontSize:11.5, width:34, textAlign:"right", color: d.delta>=0?"var(--success-text)":"var(--danger-text)" }}>{d.delta>=0?"+":""}{d.delta}</span> : <span style={{ width:34 }}/>}
                  {d.evidence ? <span style={{ color:"var(--text-muted)", transform:open===d.key?"rotate(90deg)":"none", transition:"transform 160ms" }}><Icons.chevR size={14}/></span> : <span style={{ width:14 }}/>}
                </div>
                {open===d.key && d.evidence && (
                  <div style={{ padding:"4px 0 16px 42px", animation:"fadeIn 200ms ease" }}>
                    <div className="grid gap16" style={{ gridTemplateColumns:"1fr 1fr" }}>
                      <DimList title="Evidence" items={d.evidence} color="var(--success-text)"/>
                      <DimList title="Risks" items={d.risks} color="var(--danger-text)"/>
                    </div>
                    {d.improvements?.length>0 && (
                      <div style={{ marginTop:12, padding:12, background:"var(--accent-softer)", borderRadius:10 }}>
                        <SectionLabel style={{ color:"var(--accent-text)", marginBottom:8 }}>Improve this</SectionLabel>
                        {d.improvements.map((im,j)=>(
                          <div key={j} className="row" style={{ justifyContent:"space-between", alignItems:"center", padding:"4px 0", gap:10 }}>
                            <span style={{ fontSize:13 }}>{im}</span>
                            <Btn variant="soft" size="sm" onClick={()=>onAddTask({ title:im, origin_ref:d.key })}><Icons.plus size={12}/> Add to plan</Btn>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {i<ranked.length-1 && <div className="hr"/>}
              </div>
            ))}
          </div>
        </Card>

        {/* SWOT */}
        <div className="grid gap12" style={{ gridTemplateColumns:"repeat(2,1fr)" }}>
          {[["strengths","Strengths","var(--success-text)"],["weaknesses","Weaknesses","var(--danger-text)"],["opportunities","Opportunities","var(--info-text)"],["threats","Threats","var(--accent-text)"]].map(([k,l,c])=>(
            <Card key={k} style={{ padding:16 }}>
              <SectionLabel style={{ color:c, marginBottom:10 }}>{l}</SectionLabel>
              <div className="col gap6">{s.swot[k].map((t,i)=><div key={i} className="row gap8" style={{ fontSize:13 }}><StatusDot color={c} size={6}/>{t}</div>)}</div>
            </Card>
          ))}
        </div>

        {/* competitors */}
        {s.competitors.length>0 && (
          <Card>
            <SectionLabel style={{ marginBottom:12 }}>Competitive landscape</SectionLabel>
            <div className="col gap8">
              {s.competitors.map((c,i)=>(
                <div key={i} className="row gap12" style={{ padding:"8px 0", borderBottom: i<s.competitors.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
                  <span style={{ fontSize:13.5, fontWeight:600, width:110 }}>{c.name}</span>
                  <Pill style={{ fontSize:10.5 }}>{c.stance}</Pill>
                  <span className="muted" style={{ fontSize:13, flex:1 }}>{c.gap}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* action plan */}
        {s.action_plan.length>0 && (
          <Card>
            <SectionLabel style={{ marginBottom:12 }}>Top action plan</SectionLabel>
            <div className="col gap8">
              {s.action_plan.map((a,i)=>(
                <div key={i} className="row gap12" style={{ alignItems:"center" }}>
                  <span className="mono faint" style={{ fontSize:12, width:16 }}>{i+1}</span>
                  <div style={{ flex:1, fontSize:13.5 }}>{a.text}</div>
                  <Pill style={{ fontSize:10.5 }}>{DIM[a.closes]?.label} · {a.current}</Pill>
                  <Btn variant="soft" size="sm" onClick={()=>onAddTask({ title:a.text, origin_ref:a.closes })}><Icons.plus size={12}/> Add</Btn>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Stagger>
    </div>
  );
}
function DimList({ title, items, color }) {
  if (!items||items.length===0) return <div><SectionLabel style={{ marginBottom:8 }}>{title}</SectionLabel><div className="faint" style={{ fontSize:12.5 }}>None noted.</div></div>;
  return <div><SectionLabel style={{ marginBottom:8 }}>{title}</SectionLabel><div className="col gap5">{items.map((t,i)=><div key={i} className="row gap8" style={{ fontSize:12.5, lineHeight:1.45 }}><StatusDot color={color} size={6}/>{t}</div>)}</div></div>;
}

Object.assign(window, { OverviewTab, MemoryTab, ScorecardTab, TabHeader, LockedTab, TAG_LABEL });


/* ===================== tabs2.jsx ===================== */
// ===== Plan board (draggable) + Brand tab =====

const CAT_META = {
  validation:{ label:"Validation", color:"var(--info)" },
  legal:{ label:"Legal", color:"var(--accent)" },
  payments:{ label:"Payments", color:"var(--success)" },
  ops:{ label:"Ops", color:"var(--text-secondary)" },
  marketing:{ label:"Marketing", color:"var(--info)" },
  product:{ label:"Product", color:"var(--accent)" },
  ongoing:{ label:"Ongoing", color:"var(--text-secondary)" },
};
const STATUS_COLS = [
  { key:"todo", label:"To do" },
  { key:"in_progress", label:"In progress" },
  { key:"done", label:"Done" },
];

function PlanTab({ idea, onMoveTask, onOpenTask, onGenerate }) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const launch = idea.phase==="launch" || idea.phase==="operating";

  if (idea.tasks.length===0) {
    return <div><TabHeader title="Plan"/>
      <Empty icon={Icons.board} title="No plan yet"
        body={idea.phase==="ideation" ? "Your validation plan appears once the scorecard is generated." : "Generate your validation plan from the scorecard's action items."}
        action={idea.phase!=="ideation" && <Btn variant="primary" onClick={onGenerate}><Icons.sparkle size={14}/> Generate validation plan</Btn>}/>
    </div>;
  }

  const done = idea.tasks.filter(t=>t.status==="done").length;
  return (
    <div>
      <TabHeader title="Plan" sub={launch ? "Your launch board — instantiated from the playbook, customized to the idea." : "Validation action items from the scorecard."}
        right={<div className="row gap10"><span className="faint" style={{ fontSize:12.5 }}>{done} / {idea.tasks.length} done</span><div style={{ width:90 }}><ProgressBar value={Math.round(done/idea.tasks.length*100)} color="var(--success)"/></div></div>}/>
      <div className="grid gap12" style={{ gridTemplateColumns:"repeat(3,1fr)", alignItems:"start" }}>
        {STATUS_COLS.map(col=>{
          const items = idea.tasks.filter(t=>t.status===col.key);
          return (
            <div key={col.key}
              onDragOver={e=>{ e.preventDefault(); setOver(col.key); }}
              onDragLeave={()=>setOver(o=>o===col.key?null:o)}
              onDrop={()=>{ if(drag) onMoveTask(drag, col.key); setDrag(null); setOver(null); }}
              style={{ background: over===col.key?"var(--accent-softer)":"var(--surface)", border:"1px solid", borderColor: over===col.key?"var(--accent)":"var(--border)", borderRadius:14, padding:10, minHeight:120, transition:"background 140ms, border-color 140ms" }}>
              <div className="row" style={{ justifyContent:"space-between", padding:"4px 6px 10px" }}>
                <span style={{ fontSize:12, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--text-secondary)" }}>{col.label}</span>
                <span className="faint mono" style={{ fontSize:11 }}>{items.length}</span>
              </div>
              <div className="col gap8">
                {items.map(t=>(
                  <div key={t.id} draggable onDragStart={()=>setDrag(t.id)} onDragEnd={()=>{ setDrag(null); setOver(null); }}
                    onClick={()=>onOpenTask(t.id)}
                    className="card" style={{ padding:13, cursor:"grab", opacity: drag===t.id?0.4:1, boxShadow:"var(--shadow-card)" }}>
                    <div className="row gap6" style={{ marginBottom:8, alignItems:"center" }}>
                      <span className="row gap5" style={{ fontSize:10.5, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:CAT_META[t.category]?.color }}>
                        <StatusDot color={CAT_META[t.category]?.color} size={6}/>{CAT_META[t.category]?.label}</span>
                      {t.blocking && <Pill style={{ fontSize:9.5, color:"var(--danger-text)", background:"var(--danger-soft)", border:"none" }}>blocking</Pill>}
                      <div className="spacer"/>
                      {t.completed_via==="chat_detected" && <span title="Detected from chat" style={{ color:"var(--accent-text)" }}><Icons.sparkle size={13}/></span>}
                    </div>
                    <div style={{ fontSize:13.5, fontWeight:500, lineHeight:1.4, marginBottom: t.subtasks?.length?8:0 }}>{t.title}</div>
                    {t.subtasks?.length>0 && (
                      <div className="row gap8" style={{ alignItems:"center" }}>
                        <div style={{ flex:1 }}><ProgressBar value={Math.round(t.subtasks.filter(s=>s.d).length/t.subtasks.length*100)} height={4}/></div>
                        <span className="faint mono" style={{ fontSize:10.5 }}>{t.subtasks.filter(s=>s.d).length}/{t.subtasks.length}</span>
                      </div>
                    )}
                    {t.vendor_suggestions?.length>0 && (
                      <div className="row gap4" style={{ marginTop:8, flexWrap:"wrap" }}>
                        {t.vendor_suggestions.slice(0,3).map((v,i)=><span key={i} className="kbd">{v.name}</span>)}
                      </div>
                    )}
                  </div>
                ))}
                {items.length===0 && <div className="faint" style={{ fontSize:12, textAlign:"center", padding:"14px 0" }}>—</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="faint row gap6" style={{ fontSize:12, marginTop:14, justifyContent:"center" }}><Icons.bolt size={13}/> Drag cards between columns — or just tell the chat "the bank account is open" and it moves itself.</div>
    </div>
  );
}

Object.assign(window, { PlanTab, CAT_META });


/* ===================== brandkit.jsx ===================== */
// ===== Brand kit — the full drafted-brand page (spec: "Your brand, drafted") =====

/* ---------- logo marks (simple geometric, brand-colored) ---------- */
function bkSpiralPath() {
  const cx = 50, cy = 50, turns = 2.35, steps = 90, maxR = 33, minR = 3;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = t * turns * 2 * Math.PI - Math.PI / 2;
    const r = minR + (maxR - minR) * t;
    const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
  }
  return d.trim();
}

function BrandMark({ kind, color = "#1F3A30", size = 64, sw = 5 }) {
  const common = { width: size, height: size, viewBox: "0 0 100 100", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  if (kind === "rhythm") return (
    <svg {...common}>
      <path d="M20 64 A30 30 0 0 1 80 64" />
      <path d="M31 64 A19 19 0 0 1 69 64" />
      <path d="M42 64 A8 8 0 0 1 58 64" />
      <circle cx="50" cy="64" r="3.4" fill={color} stroke="none" />
    </svg>
  );
  if (kind === "compound") return (
    <svg {...common} stroke="none">
      <circle cx="28" cy="52" r="5" fill={color} opacity="0.5" />
      <circle cx="49" cy="52" r="7.5" fill={color} opacity="0.75" />
      <circle cx="73" cy="52" r="10.5" fill={color} />
    </svg>
  );
  if (kind === "spiral") return (
    <svg {...common}><path d={bkSpiralPath()} /></svg>
  );
  if (kind === "stack") return (
    <svg {...common}>
      <rect x="26" y="58" width="48" height="17" rx="4" />
      <rect x="31" y="40" width="38" height="15" rx="4" />
      <rect x="36" y="23" width="28" height="13" rx="3.5" />
    </svg>
  );
  if (kind === "burst") {
    const lines = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 2 * Math.PI - Math.PI / 2;
      const long = i % 2 === 0;
      const r1 = 13, r2 = long ? 36 : 26;
      lines.push(<line key={i} x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1} x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2} />);
    }
    return <svg {...common}>{lines}<circle cx="50" cy="50" r="4" fill={color} stroke="none" /></svg>;
  }
  // wordmark fallback handled by caller
  return null;
}

// wordmark lockup: small mark + serif italic wordmark
function BrandLockup({ kit, markKey, color, size = 18, gap = 8 }) {
  const d = kit.type[0];
  const display = d.stack;
  const fw = d.weightCss || (d.italic ? 400 : 700);
  return (
    <span className="row" style={{ gap, alignItems: "center", color }}>
      <BrandMark kind={markKey} color={color} size={size + 8} sw={6} />
      <span style={{ fontFamily: display, fontStyle: d.italic ? "italic" : "normal", fontWeight: fw, fontSize: size, lineHeight: 1 }}>{kit.hero.wordmark}</span>
    </span>
  );
}

/* ---------- small layout helpers ---------- */
function BkEyebrow({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--text-muted)" }}>{children}</div>;
}
function BkLabel({ children }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>{children}</div>;
}
function BkSection({ n, kicker, title, desc, children }) {
  return (
    <section style={{ marginTop: 46 }} data-screen-label={`Brand · ${kicker}`}>
      <BkEyebrow>{n} · {kicker}</BkEyebrow>
      <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.01em", margin: "10px 0 0" }}>{title}</h2>
      {desc && <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 580 }}>{desc}</p>}
      <div style={{ marginTop: 22 }}>{children}</div>
    </section>
  );
}

function bkLum(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/* ---------- palette swatch (click to copy) ---------- */
function BkSwatch({ c, ink, paper }) {
  const [copied, setCopied] = useState(false);
  const onSwatch = bkLum(c.hex) < 0.6 ? paper : ink;
  const copy = () => { try { navigator.clipboard?.writeText(c.hex); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1100); };
  return (
    <button onClick={copy} style={{ textAlign: "left", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface-raised)", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 92, background: c.hex, position: "relative", display: "flex", alignItems: "flex-end", padding: 10 }}>
        <span className="mono" style={{ fontSize: 11, color: onSwatch, opacity: 0.9 }}>{copied ? "copied ✓" : c.hex}</span>
      </div>
      <div style={{ padding: "10px 11px 12px" }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 2, lineHeight: 1.4 }}>{c.role}</div>
        <div className="mono faint" style={{ fontSize: 9.5, marginTop: 8, letterSpacing: "0.04em" }}>{c.contrast}</div>
      </div>
    </button>
  );
}

const BK_MEM_ICON = { sparkle: Icons.sparkle, voice: Icons.voice, doc: Icons.doc, brain: Icons.brain };

/* ============================ BRAND TAB ============================ */
function BrandTab({ idea, onOpenDomain }) {
  const kit = idea.brand_kit;
  if (idea.phase === "ideation" || !kit) {
    return <div><TabHeader title="Brand kit" /><LockedTab title="Not drafted yet" body="Your brand drafts once your positioning is clear. Keep shaping the idea — then Hatchly drafts a full kit from your validation report and memory." /></div>;
  }

  const [ink, brand, paper, accent, second] = kit.palette.map(p => p.hex);
  const onP = kit.on_primary || "#F5F2EC";
  const display = kit.type[0].stack;
  const dI = kit.type[0].italic;
  const dW = kit.type[0].weightCss || (dI ? 400 : 700);
  const USE_GREEN = "#3F7A55";

  const [tagSel, setTagSel] = useState(() => Math.max(0, kit.taglines.findIndex(t => t.selected)));
  const [len, setLen] = useState(kit.description.selected || "medium");
  const [markSel, setMarkSel] = useState(() => Math.max(0, kit.logo_concepts.findIndex(c => c.selected)));
  const [descCopied, setDescCopied] = useState(false);
  const markKey = kit.logo_concepts[markSel].key;

  const lenOpts = [["short", "Short · 4w"], ["medium", "Medium · 30w"], ["long", "Long · 100w"]];
  const copyDesc = () => { try { navigator.clipboard?.writeText(kit.description[len]); } catch (e) {} setDescCopied(true); setTimeout(() => setDescCopied(false), 1100); };

  return (
    <div className="bk-root">
      {/* ---------------- header ---------------- */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        <div style={{ minWidth: 280, flex: 1 }}>
          <div className="row gap8" style={{ alignItems: "center" }}>
            <span className="dot" style={{ background: "var(--accent)" }}></span>
            <BkEyebrow>Generation {kit.generation} · Drafted {kit.drafted_ago} · From {kit.source}</BkEyebrow>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", margin: "10px 0 0" }}>Your brand, drafted</h1>
          <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 520 }}>Built from your validation report and the themes in your memory. Refine anything — Hatchly regenerates downstream applications so the system stays in sync.</p>
        </div>
        <div className="row gap8" style={{ flex: "none" }}>
          <Btn variant="secondary"><Icons.restore size={15} /> Regenerate</Btn>
          <Btn variant="primary"><Icons.ext size={15} /> Export kit</Btn>
        </div>
      </div>

      {/* ---------------- hero showcase ---------------- */}
      <div className="bk-hero" style={{ marginTop: 22, borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
        {/* left */}
        <div style={{ background: paper, color: ink, padding: "34px 32px", display: "flex", flexDirection: "column", minHeight: 380 }}>
          <BrandLockup kit={kit} markKey={markKey} color={brand} size={19} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "26px 0" }}>
            <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 42, lineHeight: 1.04, color: brand, maxWidth: 360 }}>{kit.hero.headline}</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: ink, opacity: 0.72, margin: "20px 0 0", maxWidth: 320 }}>{kit.hero.blurb}</p>
          </div>
          <div className="row gap8">
            {kit.hero.dots.map((d, i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 999, background: d, border: bkLum(d) > 0.85 ? "1px solid rgba(0,0,0,0.12)" : "none" }}></span>)}
          </div>
        </div>
        {/* right — phone */}
        <div style={{ background: brand, display: "flex", alignItems: "center", justifyContent: "center", padding: "30px 20px" }}>
          <BkPhone kit={kit} brand={brand} onP={onP} accent={accent} />
        </div>
      </div>

      {/* ---------------- 01 name & tagline ---------------- */}
      <BkSection n="01" kicker="Name & tagline" title="The name carries the moat" desc={kit.name_note}>
        <div className="bk-2col">
          {kit.taglines.map((t, i) => {
            const sel = i === tagSel;
            return (
              <button key={i} onClick={() => setTagSel(i)} style={{ textAlign: "left", cursor: "pointer", borderRadius: 14, padding: "20px 22px", border: "1.5px solid", borderColor: sel ? "var(--accent)" : "var(--border)", background: sel ? "var(--accent-softer)" : "var(--surface-raised)", position: "relative", transition: "border-color 150ms, background 150ms" }}>
                <span style={{ position: "absolute", top: 18, right: 18, width: 20, height: 20, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "var(--accent)" : "transparent", border: sel ? "none" : "1.5px solid var(--border-strong)", color: "#fff" }}>{sel && <Icons.check size={12} />}</span>
                <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 22, lineHeight: 1.15, color: "var(--text-primary)", paddingRight: 30 }}>{t.text}</div>
                <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, margin: "12px 0 0" }}>{t.rationale}</p>
              </button>
            );
          })}
        </div>
        {/* description */}
        <div style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: "18px 20px" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div className="row gap12" style={{ alignItems: "center" }}>
              <BkLabel>Description</BkLabel>
              <div className="row gap2" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: 3 }}>
                {lenOpts.map(([k, lbl]) => (
                  <button key={k} onClick={() => setLen(k)} style={{ border: "none", borderRadius: 6, padding: "5px 11px", fontSize: 12, fontWeight: 500, cursor: "pointer", background: len === k ? "var(--background)" : "transparent", color: len === k ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: len === k ? "var(--shadow-card)" : "none" }}>{lbl}</button>
                ))}
              </div>
            </div>
            <button onClick={copyDesc} className="iconbtn" title="Copy description">{descCopied ? <Icons.check size={15} /> : <Icons.doc size={15} />}</button>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, margin: "16px 0 0", color: "var(--text-primary)" }}>{kit.description[len]}</p>
        </div>
      </BkSection>

      {/* ---------------- 02 visual identity ---------------- */}
      <BkSection n="02" kicker="Visual identity" title={kit.identity_title} desc={kit.identity_desc}>
        <BkLabel>Logo concepts · {kit.logo_concepts.length}</BkLabel>
        <div className="bk-2col" style={{ marginTop: 12 }}>
          {kit.logo_concepts.map((c, i) => {
            const sel = i === markSel;
            return (
              <button key={c.key} onClick={() => setMarkSel(i)} style={{ textAlign: "left", cursor: "pointer", borderRadius: 14, overflow: "hidden", border: "1.5px solid", borderColor: sel ? "var(--accent)" : "var(--border)", background: "var(--surface-raised)", padding: 0, boxShadow: sel ? "0 0 0 3px var(--accent-softer)" : "none", transition: "border-color 150ms" }}>
                <div style={{ background: paper, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {c.key === "wordmark"
                    ? <span style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 30, letterSpacing: "0.04em", color: brand }}>{kit.hero.wordmark.toLowerCase()}</span>
                    : <BrandMark kind={c.key} color={brand} size={62} sw={5} />}
                </div>
                <div style={{ padding: "13px 15px 15px" }}>
                  <div className="row gap8" style={{ alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                    {sel && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-text)" }}>Selected</span>}
                  </div>
                  <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, margin: "5px 0 0" }}>{c.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <BkLabel>Palette · {kit.palette.length} colors</BkLabel>
        <div className="bk-pal" style={{ marginTop: 12 }}>
          {kit.palette.map(c => <BkSwatch key={c.hex} c={c} ink={ink} paper={paper} />)}
        </div>

        <div style={{ marginTop: 22 }}><BkLabel>Type system</BkLabel></div>
        <div className="col gap12" style={{ marginTop: 12 }}>
          {kit.type.map((t, i) => (
            <div key={i} className="bk-type-row" style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: 18 }}>
              <div>
                <BkLabel>{t.role}</BkLabel>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{t.font}</div>
                <div className="faint" style={{ fontSize: 12, marginTop: 1 }}>{t.weight}</div>
                <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, margin: "12px 0 0" }}>{t.note}</p>
              </div>
              <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", display: "flex", alignItems: "center" }}>
                <div style={{ fontFamily: t.stack, fontStyle: t.italic ? "italic" : "normal", fontWeight: t.weightCss || 400, fontSize: t.big ? 32 : t.mono ? 14 : 17, lineHeight: 1.25, color: "var(--text-primary)", whiteSpace: "pre-line" }}>{t.specimen}</div>
              </div>
            </div>
          ))}
        </div>
      </BkSection>

      {/* ---------------- 03 voice & tone ---------------- */}
      <BkSection n="03" kicker="Voice & tone" title={kit.voice_title} desc={kit.voice_desc}>
        <div className="bk-2col">
          <BkVoiceCard tone="good" title="Sounds like" items={kit.voice_sounds} />
          <BkVoiceCard tone="bad" title="Doesn't sound like" items={kit.voice_avoid} />
        </div>
        {/* word dna */}
        <div style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", overflow: "hidden" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "15px 18px", borderBottom: "1px solid var(--border)" }}>
            <BkLabel>Word DNA · {kit.word_dna.length} swaps</BkLabel>
            <span className="faint" style={{ fontSize: 11.5 }}>Hatchly enforces these in generated copy</span>
          </div>
          <div className="row" style={{ padding: "9px 18px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            <span style={{ flex: "0 0 26%" }}>Use</span><span style={{ flex: "0 0 28%" }}>Instead of</span><span style={{ flex: 1 }}>Why</span>
          </div>
          {kit.word_dna.map((w, i) => (
            <div key={i} className="row" style={{ padding: "13px 18px", fontSize: 13, borderTop: "1px solid var(--border)", alignItems: "baseline" }}>
              <span style={{ flex: "0 0 26%", fontWeight: 600, color: USE_GREEN }}>{w.use}</span>
              <span style={{ flex: "0 0 28%", color: accent, textDecoration: "line-through", opacity: 0.85 }}>{w.instead}</span>
              <span className="muted" style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45 }}>{w.why}</span>
            </div>
          ))}
        </div>
      </BkSection>

      {/* ---------------- 04 in the wild ---------------- */}
      <BkSection n="04" kicker="In the wild" title="Applied across surfaces" desc="Hatchly applies the brand to the launch artifacts automatically — landing copy, app icon, social cards. Edit the kit above, these re-render.">
        <div className="bk-wild">
          {/* landing */}
          <div style={{ background: paper, color: ink, borderRadius: 16, padding: "26px 28px 30px", minHeight: 360, display: "flex", flexDirection: "column", border: "1px solid var(--border)" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <BrandLockup kit={kit} markKey={markKey} color={brand} size={16} />
              <div className="row gap14" style={{ fontSize: 12, color: ink, opacity: 0.6 }}>{kit.wild.nav.map(n => <span key={n}>{n}</span>)}</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "26px 0" }}>
              <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 36, lineHeight: 1.05, color: brand, maxWidth: 380 }}>{kit.hero.headline}</div>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: ink, opacity: 0.7, margin: "18px 0 0", maxWidth: 320 }}>{kit.wild.landing_blurb}</p>
              <div className="row gap10" style={{ marginTop: 22 }}>
                <span style={{ background: accent, color: onP, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999 }}>{kit.wild.primary_cta}</span>
                <span style={{ border: `1px solid ${brand}`, color: brand, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999 }}>{kit.wild.secondary_cta}</span>
              </div>
            </div>
          </div>
          {/* right column: app icon + card */}
          <div className="col gap14">
            <div style={{ background: brand, borderRadius: 22, aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)" }}>
              <BrandMark kind={markKey === "wordmark" ? "rhythm" : markKey} color={onP} size={78} sw={5} />
            </div>
            <div style={{ background: paper, color: ink, borderRadius: 16, padding: "18px 20px", border: "1px solid var(--border)" }}>
              <BrandMark kind={markKey === "wordmark" ? "rhythm" : markKey} color={brand} size={26} sw={6} />
              <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 22, color: brand, marginTop: 18 }}>{kit.wild.card_name}</div>
              <div style={{ fontSize: 11.5, color: ink, opacity: 0.6, marginTop: 6 }}>{kit.wild.card_role}</div>
              <div className="mono" style={{ fontSize: 11, color: ink, opacity: 0.55, marginTop: 3 }}>{kit.wild.card_contact}</div>
            </div>
          </div>
        </div>
        {/* social card */}
        <div style={{ marginTop: 14, background: brand, color: onP, borderRadius: 16, padding: "40px 40px 34px", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <BrandLockup kit={kit} markKey={markKey} color={onP} size={16} />
          <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 34, lineHeight: 1.18, maxWidth: 560, marginTop: 28 }}>
            {kit.wild.social_pre}<span style={{ color: accent }}>{kit.wild.social_em}</span>{kit.wild.social_post}
          </div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.12em", opacity: 0.6, marginTop: 28 }}>{kit.wild.social_footer}</div>
        </div>
      </BkSection>

      {/* ---------------- 05 reasoning ---------------- */}
      <BkSection n="05" kicker="Reasoning" title="Why these choices?" desc="Every decision in this kit is anchored to something in your memory or validation report. Click any source to revisit.">
        <div className="bk-2col" style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: 22, gap: 28 }}>
          <div>
            <BkLabel>Themes the kit draws from</BkLabel>
            <div className="row gap8" style={{ flexWrap: "wrap", marginTop: 12 }}>
              {kit.reasoning.themes.map(t => <span key={t} style={{ fontSize: 12.5, fontWeight: 500, color: "var(--accent-text)" }}>{t}</span>)}
            </div>
            <div style={{ marginTop: 24 }}><BkLabel>Validation scores anchored</BkLabel></div>
            <div className="col gap10" style={{ marginTop: 14 }}>
              {kit.reasoning.scores.map(s => (
                <div key={s.label} className="row gap12" style={{ alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, width: 110, flex: "none", color: "var(--text-secondary)" }}>{s.label}</span>
                  <div className="progress" style={{ flex: 1 }}><span style={{ width: s.value + "%" }}></span></div>
                  <span className="mono" style={{ fontSize: 12.5, width: 24, textAlign: "right", fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <BkLabel>Memory items used · {kit.reasoning.memory.length}</BkLabel>
            <div className="col gap8" style={{ marginTop: 12 }}>
              {kit.reasoning.memory.map((m, i) => {
                const I = BK_MEM_ICON[m.icon] || Icons.sparkle;
                return (
                  <button key={i} className="row gap10" style={{ width: "100%", textAlign: "left", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-raised)", cursor: "pointer" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, flex: "none", background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}><I size={14} /></span>
                    <span style={{ flex: 1, fontSize: 13 }}>{m.label}</span>
                    <span className="faint"><Icons.chevR size={15} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </BkSection>

      {/* ---------------- 06 domains (BrandBucket) ---------------- */}
      <BkSection n="06" kicker="The name" title="Claim the domain" desc="Curated to your positioning and ICP — not a storefront. Surfaced only here, once the idea has a clear shape.">
        <div className="row gap8" style={{ marginBottom: 14 }}><Pill accent style={{ fontSize: 10 }}>via BrandBucket</Pill></div>
        <div className="col gap10">
          {idea.domains.map(d => (
            <div key={d.name} className="row gap14" style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, alignItems: "center", background: "var(--surface-raised)" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flex: "none" }}><Icons.globe size={17} /></span>
              <div style={{ flex: 1 }}>
                <div className="row gap8" style={{ alignItems: "baseline" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{d.name}</span>
                  {d.status === "viewed" && <span className="faint" style={{ fontSize: 11 }}>· viewed</span>}
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2, maxWidth: 440 }}>{d.fit_reason}</div>
              </div>
              <Pill style={{ fontWeight: 600 }}>${d.price.toLocaleString()}</Pill>
              <Btn variant="soft" size="sm" onClick={() => onOpenDomain(d)}>View</Btn>
            </div>
          ))}
        </div>
      </BkSection>
    </div>
  );
}

/* ---------- phone mockup ---------- */
function BkPhone({ kit, brand, onP, accent }) {
  const line = "color-mix(in srgb, " + onP + " 18%, transparent)";
  const fill = "color-mix(in srgb, " + onP + " 9%, transparent)";
  return (
    <div style={{ width: 244, borderRadius: 30, background: brand, border: `1px solid ${line}`, padding: 18, boxShadow: "0 30px 60px rgba(0,0,0,0.35)", color: onP }}>
      <div className="row" style={{ justifyContent: "space-between", fontSize: 11, opacity: 0.55, padding: "0 4px 14px" }}>
        <span className="mono">9:41</span><Icons.dots size={15} />
      </div>
      <div style={{ fontFamily: kit.type[0].stack, fontStyle: kit.type[0].italic ? "italic" : "normal", fontWeight: kit.type[0].weightCss || (kit.type[0].italic ? 400 : 700), fontSize: 24, lineHeight: 1.1 }}>{kit.phone.greeting}</div>
      <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.72, margin: "12px 0 18px" }}>{kit.phone.body}</p>
      <div className="col gap8">
        {kit.phone.items.map((it, i) => (
          <div key={i} className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 11, background: it.active ? fill : "transparent", border: `1px solid ${line}` }}>
            <span style={{ fontSize: 13, fontWeight: it.active ? 600 : 500 }}>{it.label}</span>
            <span className="mono" style={{ fontSize: 10.5, opacity: 0.55 }}>{it.time}</span>
          </div>
        ))}
      </div>
      <div className="row gap8" style={{ justifyContent: "center", alignItems: "center", marginTop: 16, background: accent, color: onP, borderRadius: 999, padding: "12px 0", fontSize: 13, fontWeight: 600 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: onP }}></span>{kit.phone.cta}
      </div>
    </div>
  );
}

/* ---------- voice column card ---------- */
function BkVoiceCard({ tone, title, items }) {
  const good = tone === "good";
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: "20px 22px" }}>
      <div className="row gap8" style={{ alignItems: "center", color: good ? "var(--success-text)" : "var(--danger-text)" }}>
        {good ? <Icons.check size={15} /> : <Icons.x size={15} />}
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</span>
      </div>
      <div className="col gap16" style={{ marginTop: 18 }}>
        {items.map((it, i) => (
          <div key={i}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{it.label}</div>
            <div className="muted italic" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 3 }}>{it.ex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { BrandTab });


/* ===================== overlays.jsx ===================== */
// ===== Overlays: task drawer · memory source · report gen · launch unlock · domain · settings =====

function Scrim({ onClose }) { return <div className="scrim" onClick={onClose}/>; }
function DrawerHead({ title, onClose }) {
  return <div className="row" style={{ justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid var(--border)" }}>
    <span style={{ fontSize:13, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--text-secondary)" }}>{title}</span>
    <IconBtn onClick={onClose}><Icons.x size={18}/></IconBtn></div>;
}

/* ---- Task detail drawer ---- */
function TaskDrawer({ task, onClose, onToggleSub, onMove }) {
  if (!task) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="drawer">
        <DrawerHead title="Task" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:22, flex:1 }}>
          <div className="row gap8" style={{ marginBottom:12 }}>
            <span className="row gap5" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:CAT_META[task.category]?.color }}><StatusDot color={CAT_META[task.category]?.color} size={6}/>{CAT_META[task.category]?.label}</span>
            {task.blocking && <Pill style={{ fontSize:10, color:"var(--danger-text)", background:"var(--danger-soft)", border:"none" }}>blocking</Pill>}
            {task.origin && <Pill style={{ fontSize:10 }}>from {task.origin}</Pill>}
          </div>
          <h2 style={{ fontSize:21, margin:"0 0 12px", letterSpacing:"-0.01em", lineHeight:1.25 }}>{task.title}</h2>
          {task.description && <p className="muted" style={{ fontSize:14, lineHeight:1.6, margin:"0 0 20px" }}>{task.description}</p>}

          <SectionLabel style={{ marginBottom:8 }}>Status</SectionLabel>
          <div className="row gap6" style={{ marginBottom:20 }}>
            {STATUS_COLS.map(c=>(
              <button key={c.key} onClick={()=>onMove(task.id, c.key)} className="pill" style={{ cursor:"pointer", padding:"6px 12px", border:"1px solid", borderColor: task.status===c.key?"var(--text-muted)":"var(--border)", background: task.status===c.key?"var(--surface-raised)":"var(--surface)", color: task.status===c.key?"var(--text-primary)":"var(--text-secondary)" }}>{c.label}</button>
            ))}
          </div>

          {task.subtasks?.length>0 && (
            <div style={{ marginBottom:20 }}>
              <SectionLabel style={{ marginBottom:10 }}>Subtasks · {task.subtasks.filter(s=>s.d).length}/{task.subtasks.length}</SectionLabel>
              <div className="col gap8">
                {task.subtasks.map((s,i)=>(
                  <div key={i} className="row gap10" style={{ cursor:"pointer", alignItems:"center" }} onClick={()=>onToggleSub(task.id,i)}>
                    <span style={{ width:18, height:18, borderRadius:6, border:"1.5px solid", borderColor: s.d?"var(--success)":"var(--border-strong)", background: s.d?"var(--success)":"transparent", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}>{s.d && <Icons.check size={12} sw={2.5}/>}</span>
                    <span style={{ fontSize:13.5, textDecoration: s.d?"line-through":"none", color: s.d?"var(--text-muted)":"var(--text-primary)" }}>{s.t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.vendor_suggestions?.length>0 && (
            <div style={{ marginBottom:20 }}>
              <SectionLabel style={{ marginBottom:10 }}>Vendor suggestions</SectionLabel>
              <div className="col gap8">
                {task.vendor_suggestions.map((v,i)=>(
                  <div key={i} className="row" style={{ justifyContent:"space-between", padding:"10px 12px", border:"1px solid var(--border)", borderRadius:10, alignItems:"center" }}>
                    <div><div style={{ fontSize:13.5, fontWeight:600 }}>{v.name}</div>{v.note && <div className="faint" style={{ fontSize:12 }}>{v.note}</div>}</div>
                    <Btn variant="ghost" size="sm"><Icons.ext size={13}/> Open</Btn>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SectionLabel style={{ marginBottom:8 }}>Agent note</SectionLabel>
          <div className="row gap10" style={{ padding:12, background:"var(--surface)", borderRadius:10, alignItems:"flex-start" }}>
            <Avatar kind="ai" label="H" size={24}/>
            <div style={{ fontSize:13, lineHeight:1.5, color:"var(--text-secondary)" }}>I authored this from {task.origin==="scorecard"?"a weak dimension in your scorecard":task.origin==="playbook"?"the launch playbook for your archetype":"our conversation"}. Tell me when it's done and I'll update the board and re-score.</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Memory source viewer ---- */
function MemorySourceModal({ mem, onClose }) {
  if (!mem) return null;
  const raw = {
    chat:`…Alex: Most of my users are solo founders in that first messy year after going full-time. The pain isn't tools — it's losing rhythm around 3pm with no one to push back…`,
    link:`Sunsama — Daily planner\nPlan your day across calendar and tasks. Drag tasks in, set durations, reflect at end of day. Manual, deliberate, forms-driven workflow…`,
    voice:`[transcript] "…the honest worry is distribution. IndieHackers and Twitter are where these founders are, but everyone's shouting there. It's crowded…"`,
    file:`[document excerpt]`,
  }[mem.src];
  const hl = mem.content;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal">
        <DrawerHead title={`Source · ${mem.srcLabel}`} onClose={onClose}/>
        <div className="scrollarea" style={{ padding:22 }}>
          <div className="row gap8" style={{ marginBottom:14 }}><SourceGlyph type={mem.src}/><div><div style={{ fontWeight:600, fontSize:13.5, textTransform:"capitalize" }}>{mem.src} source</div><div className="faint" style={{ fontSize:12 }}>The original input this memory was extracted from.</div></div></div>
          <div style={{ padding:16, background:"var(--surface)", borderRadius:12, fontSize:13.5, lineHeight:1.7, color:"var(--text-secondary)", whiteSpace:"pre-wrap", fontFamily: mem.src==="link"?"'Geist Mono', monospace":"inherit" }}>{raw}</div>
          <SectionLabel style={{ margin:"20px 0 8px" }}>Extracted memory</SectionLabel>
          <div style={{ padding:14, background:"var(--accent-softer)", border:"1px solid var(--accent)", borderRadius:12 }}>
            <div style={{ fontSize:14, marginBottom:8 }}>{hl}</div>
            <div className="row gap6">{mem.tags.map(t=><Pill key={t} accent style={{ fontSize:10 }}>{TAG_LABEL(t)}</Pill>)}</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Memory edit drawer ---- */
function MemoryEditDrawer({ mem, onClose, onViewSource, onSave }) {
  const [text, setText] = useState(mem?.content || "");
  useEffect(()=>{ setText(mem?.content||""); }, [mem]);
  if (!mem) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="drawer" style={{ width:420 }}>
        <DrawerHead title="Edit memory" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:22, flex:1 }}>
          <label className="label">Memory</label>
          <textarea className="field" rows={4} value={text} onChange={e=>setText(e.target.value)} style={{ resize:"vertical", lineHeight:1.5 }}/>
          <div className="row gap6" style={{ margin:"14px 0", flexWrap:"wrap" }}>{mem.tags.map(t=><Pill key={t} accent={!!DIM[t]}>{TAG_LABEL(t)} <span style={{ marginLeft:2, opacity:0.5 }}>×</span></Pill>)}<Pill style={{ cursor:"pointer" }}><Icons.plus size={11}/> tag</Pill></div>
          <div style={{ padding:12, background:"var(--surface)", borderRadius:10 }}>
            <div className="faint" style={{ fontSize:11.5, marginBottom:6 }}>Correcting a memory re-scores the affected dimensions.</div>
            <button className="row gap6" style={{ fontSize:12.5, color:"var(--accent-text)", background:"none", border:"none" }} onClick={onViewSource}><Icons.link size={13}/> View source · {mem.srcLabel}</button>
          </div>
        </div>
        <div className="row gap10" style={{ padding:16, borderTop:"1px solid var(--border)" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn><div className="spacer"/><Btn variant="primary" onClick={()=>onSave(mem.id,text)}>Save & re-score</Btn>
        </div>
      </div>
    </>
  );
}

/* ---- Report generation (Ideation -> Validation moment) ---- */
function ReportGenModal({ idea, onClose, onDone }) {
  const [stage, setStage] = useState(0); // 0 intro, 1 scoring, 2 done
  const dims = idea.snapshot?.dimensions || [];
  useEffect(()=>{ if(stage===1){ const t=setTimeout(()=>setStage(2), 2600); return ()=>clearTimeout(t); } }, [stage]);
  return (
    <>
      <Scrim onClose={stage===1?undefined:onClose}/>
      <div className="modal" style={{ width:560 }}>
        <div className="scrollarea" style={{ padding:30 }}>
          {stage===0 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:14, background:"var(--info-soft)", color:"var(--info-text)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}><Icons.target size={24}/></div>
              <h2 style={{ fontSize:22, margin:"0 0 8px" }}>Generate the scorecard</h2>
              <p className="muted" style={{ fontSize:14, lineHeight:1.6, maxWidth:380, margin:"0 auto 22px" }}>I'll score all 13 dimensions against everything in memory — honestly, not generously. This becomes version {(idea.snapshot?.version||0)+1}.</p>
              <Btn variant="primary" size="lg" onClick={()=>setStage(1)}><Icons.sparkle size={16}/> Score it</Btn>
            </div>
          )}
          {stage===1 && (
            <div style={{ textAlign:"center" }}>
              <ScoreRing value={idea.snapshot?.overall||0} size={120} stroke={9}/>
              <div className="row gap8" style={{ justifyContent:"center", margin:"18px 0 6px" }}><TypingDots/><span className="muted" style={{ fontSize:13 }}>Scoring dimensions…</span></div>
              <div className="col gap5" style={{ maxWidth:300, margin:"14px auto 0" }}>
                {dims.slice(0,5).map((d,i)=>(
                  <div key={d.key} className="row gap8" style={{ fontSize:12.5, opacity:0, animation:`fadeUp 400ms ease forwards`, animationDelay:`${i*340}ms` }}>
                    <StatusDot band={d.band}/><span style={{ flex:1, textAlign:"left" }}>{d.label}</span><span style={{ fontWeight:600 }} className={`band-${d.band}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stage===2 && (
            <div style={{ textAlign:"center" }}>
              <ScoreRing value={idea.snapshot?.overall||0} size={120} stroke={9} label="overall"/>
              <h2 className="serif italic" style={{ fontSize:24, margin:"16px 0 6px", fontWeight:400 }}>Scorecard ready.</h2>
              <p className="muted" style={{ fontSize:14, maxWidth:380, margin:"0 auto 22px" }}>"{idea.snapshot?.verdict}"</p>
              <Btn variant="primary" size="lg" onClick={onDone}>Open the scorecard <Icons.chevR size={15}/></Btn>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---- Launch unlock (Validation -> Launch) ---- */
const ARCHETYPES = [
  ["physical_ecom","Physical e-com"],["dropship","Dropship"],["saas","SaaS"],["marketplace","Marketplace"],["service","Service"],["content","Content"],["mobile_app","Mobile app"],["other","Other"]
];
function LaunchUnlockModal({ idea, onClose, onConfirm }) {
  const [arch, setArch] = useState(idea.archetype || "saas");
  const [stage, setStage] = useState(0);
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal" style={{ width:540 }}>
        <div className="scrollarea" style={{ padding:30 }}>
          {stage===0 ? (
            <>
              <div style={{ width:52, height:52, borderRadius:14, background:"var(--success-soft)", color:"var(--success-text)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 0 16px" }}><Icons.flag size={24}/></div>
              <h2 style={{ fontSize:22, margin:"0 0 6px" }}>Ready to launch {idea.name}</h2>
              <p className="muted" style={{ fontSize:14, lineHeight:1.6, margin:"0 0 22px" }}>Confirm the business type and I'll instantiate the launch playbook into your Plan — legal, payments, ops, marketing — customized to {idea.name}.</p>
              <SectionLabel style={{ marginBottom:10 }}>Business archetype</SectionLabel>
              <div className="grid gap8" style={{ gridTemplateColumns:"repeat(4,1fr)", marginBottom:24 }}>
                {ARCHETYPES.map(([k,l])=>(
                  <button key={k} onClick={()=>setArch(k)} style={{ padding:"12px 8px", borderRadius:10, border:"1.5px solid", borderColor: arch===k?"var(--success)":"var(--border-strong)", background: arch===k?"var(--success-soft)":"var(--surface-raised)", fontSize:12, fontWeight:500, color: arch===k?"var(--success-text)":"var(--text-secondary)", cursor:"pointer" }}>{l}</button>
                ))}
              </div>
              <div className="row gap10"><Btn variant="ghost" onClick={onClose}>Not yet</Btn><div className="spacer"/><Btn variant="primary" onClick={()=>setStage(1)} style={{ background:"var(--success)" }}><Icons.bolt size={15}/> Build the launch board</Btn></div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"var(--success-soft)", color:"var(--success-text)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", animation:"scaleIn 400ms ease" }}><Icons.check size={28} sw={2.5}/></div>
              <h2 className="serif italic" style={{ fontSize:26, margin:"0 0 6px", fontWeight:400 }}>{idea.name} is in Launch.</h2>
              <p className="muted" style={{ fontSize:14, maxWidth:360, margin:"0 auto 22px" }}>I've built {idea.tasks?.length||9} tasks from the {ARCHETYPES.find(a=>a[0]===arch)?.[1]} playbook. Blocking tasks are flagged.</p>
              <Btn variant="primary" size="lg" style={{ background:"var(--success)" }} onClick={()=>onConfirm(arch)}>Open the board <Icons.chevR size={15}/></Btn>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---- Domain detail / handoff ---- */
function DomainModal({ domain, idea, onClose }) {
  if (!domain) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal" style={{ width:480 }}>
        <DrawerHead title="Domain · BrandBucket" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:26 }}>
          <div className="row gap12" style={{ alignItems:"center", marginBottom:18 }}>
            <span style={{ width:44, height:44, borderRadius:12, background:"var(--surface)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icons.globe size={22}/></span>
            <div><div style={{ fontSize:22, fontWeight:600, letterSpacing:"-0.01em" }}>{domain.name}</div><div className="faint" style={{ fontSize:12.5 }}>Premium domain · curated listing</div></div>
            <div className="spacer"/><div style={{ fontSize:22, fontWeight:600 }}>${domain.price.toLocaleString()}</div>
          </div>
          <SectionLabel style={{ marginBottom:8 }}>Why it fits {idea.name}</SectionLabel>
          <p style={{ fontSize:14, lineHeight:1.6, margin:"0 0 20px", color:"var(--text-secondary)" }}>{domain.fit_reason}</p>
          <div style={{ padding:14, background:"var(--surface)", borderRadius:12, marginBottom:20 }}>
            <div className="row gap8" style={{ alignItems:"flex-start" }}><Avatar kind="ai" label="H" size={24}/><div style={{ fontSize:13, lineHeight:1.5, color:"var(--text-secondary)" }}>This isn't an ad — it surfaced because your positioning and ICP are clear enough for me to match names to what you're building.</div></div>
          </div>
          <div className="row gap10">
            <Btn variant="secondary" onClick={onClose}>Maybe later</Btn><div className="spacer"/>
            <Btn variant="primary" onClick={onClose}><Icons.ext size={15}/> Acquire on BrandBucket</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Idea settings modal ---- */
function IdeaSettingsModal({ idea, onClose, onSave, onArchive }) {
  const [name, setName] = useState(idea.name);
  const [oneLiner, setOneLiner] = useState(idea.one_liner);
  const [arch, setArch] = useState(idea.archetype||"");
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal" style={{ width:500 }}>
        <DrawerHead title="Idea settings" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:24 }}>
          <div className="col gap16">
            <div><label className="label">Name</label><input className="field" value={name} onChange={e=>setName(e.target.value)}/></div>
            <div><label className="label">One-liner</label><textarea className="field" rows={2} value={oneLiner} onChange={e=>setOneLiner(e.target.value)} style={{ resize:"vertical" }}/></div>
            <div>
              <label className="label">Business archetype</label>
              <div className="grid gap8" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
                {ARCHETYPES.map(([k,l])=>(<button key={k} onClick={()=>setArch(k)} style={{ padding:"9px 6px", borderRadius:9, border:"1.5px solid", borderColor: arch===k?"var(--accent)":"var(--border-strong)", background: arch===k?"var(--accent-softer)":"var(--surface-raised)", fontSize:11.5, color: arch===k?"var(--accent-text)":"var(--text-secondary)", cursor:"pointer" }}>{l}</button>))}
              </div>
              {arch && arch!==idea.archetype && <div className="faint" style={{ fontSize:11.5, marginTop:8 }}>Changing the archetype can re-derive launch tasks.</div>}
            </div>
          </div>
          <div className="hr" style={{ margin:"22px 0" }}/>
          <div className="row gap10">
            <Btn variant="ghost" style={{ color:"var(--danger-text)" }} onClick={()=>{ onArchive(idea.id); onClose(); }}><Icons.archive size={14}/> Archive</Btn>
            <div className="spacer"/>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>onSave({ name, one_liner:oneLiner, archetype:arch||null })}>Save</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { TaskDrawer, MemorySourceModal, MemoryEditDrawer, ReportGenModal, LaunchUnlockModal, DomainModal, IdeaSettingsModal });


/* ===================== workspace.jsx ===================== */
// ===== Workspace shell: sidebar + phase tracker + tab view + persistent chat =====

const NAV = [
  { key:"overview", label:"Overview", icon:Icons.compass },
  { key:"memory",   label:"Memory",   icon:Icons.brain },
  { key:"scorecard",label:"Scorecard",icon:Icons.target, lockIn:["ideation"] },
  { key:"plan",     label:"Plan",     icon:Icons.board },
  { key:"brand",    label:"Brand",    icon:Icons.tag, lockIn:["ideation"], dot:(idea)=>idea.phase==="validation" },
  { key:"apps",     label:"Apps",     icon:Icons.grid },
];

function PhaseTracker({ phase }) {
  const cur = PHASE_ORDER.indexOf(phase);
  return (
    <div className="col gap2" style={{ padding:"4px 0" }}>
      {PHASE_ORDER.map((k,i)=>{
        const ph = PHASES[k];
        const state = i<cur ? "done" : i===cur ? "current" : "future";
        return (
          <div key={k} className="row gap10" style={{ padding:"5px 0", alignItems:"center" }}>
            <span style={{ width:18, height:18, borderRadius:999, flex:"none", display:"flex", alignItems:"center", justifyContent:"center",
              background: state==="current"?ph.soft:"transparent", color: state==="done"?"var(--success)":state==="current"?ph.color:"var(--text-muted)",
              border: state==="future"?"1px solid var(--border-strong)":"none" }}>
              {state==="done" ? <Icons.check size={12} sw={2.5}/> : state==="current" ? <span className="dot" style={{ width:7, height:7, background:ph.color }}/> : <Icons.lock size={10}/>}
            </span>
            <span style={{ fontSize:12.5, fontWeight: state==="current"?600:400, color: state==="future"?"var(--text-muted)":"var(--text-primary)" }}>{ph.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Sidebar({ idea, tab, setTab, go, onSettings }) {
  return (
    <div style={{ width:212, flex:"none", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", background:"var(--surface)", height:"100%" }}>
      <div style={{ padding:"16px 16px 0" }}>
        <button className="row gap6 muted" style={{ background:"none", border:"none", fontSize:12.5, padding:"4px 0", marginBottom:14 }} onClick={()=>go({screen:"ideas"})}><Icons.back size={14}/> All ideas</button>
        <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:600, letterSpacing:"-0.01em" }}>{idea.name}</div>
            <div className="muted clamp2" style={{ fontSize:11.5, lineHeight:1.4, marginTop:2 }}>{idea.one_liner}</div>
          </div>
          {idea.phase==="ideation"
            ? <ScoreRing value={idea.completeness} size={40} stroke={4} color="var(--accent)" animate={false}/>
            : <ScoreRing value={idea.current_score} size={40} stroke={4} animate={false}/>}
        </div>
      </div>
      <div style={{ padding:"14px 12px 10px", margin:"14px 12px 0", borderTop:"1px solid var(--border)" }}>
        <PhaseTracker phase={idea.phase}/>
      </div>
      <div className="hr" style={{ margin:"6px 16px" }}/>
      <div className="col gap2 scrollarea" style={{ padding:"6px 12px", flex:1 }}>
        {NAV.map(n=>{
          const locked = n.lockIn?.includes(idea.phase);
          const active = tab===n.key;
          return (
            <button key={n.key} onClick={()=>!locked&&setTab(n.key)} title={locked?"Unlocks as your idea progresses":""}
              className="row gap10" style={{ padding:"9px 11px", borderRadius:9, border:"none", textAlign:"left", width:"100%", cursor: locked?"not-allowed":"pointer",
                background: active?"var(--surface-raised)":"transparent", boxShadow: active?"var(--shadow-card)":"none",
                color: locked?"var(--text-muted)":active?"var(--text-primary)":"var(--text-secondary)", fontSize:13.5, fontWeight: active?600:500, position:"relative" }}>
              <n.icon size={16}/> <span style={{ flex:1 }}>{n.label}</span>
              {locked && <Icons.lock size={13}/>}
              {!locked && n.dot?.(idea) && <span className="dot" style={{ width:6, height:6, background:"var(--accent)" }}/>}
            </button>
          );
        })}
      </div>
      <div style={{ padding:"10px 12px", borderTop:"1px solid var(--border)" }}>
        <button onClick={onSettings} className="row gap10" style={{ padding:"9px 11px", borderRadius:9, border:"none", width:"100%", background:"transparent", color:"var(--text-secondary)", fontSize:13.5, fontWeight:500 }}><Icons.settings size={16}/> Idea settings</button>
      </div>
    </div>
  );
}

/* ---------------- CHAT RAIL ---------------- */
function appReply(f) {
  if (!f) return null;
  if (f.kind==="connector") {
    if (f.status!=="connected") return `${f.name} isn't connected for this idea yet. Once you connect it, I can read from it live and act on it for you.`;
    if (f.key==="stripe") return "Pulling from your Stripe connection — 47 charges this week totaling $2,914, and MRR is $3,360 across 112 subscribers. Want it broken down by box tier?";
    if (f.key==="email") return "Your list is at 2,140 contacts and the last campaign opened at 38%. I can draft the next drop announcement in your brand voice — want a subject-line set?";
    return `I can read this ${f.name} connection live. Tell me what you want to know and I'll pull it.`;
  }
  return `The ${f.name} server is connected. I'll call its tools when a task needs them — and every call shows up right here for you to see and approve.`;
}
function appPrompt(f) {
  if (!f) return null;
  if (f.kind==="connector") {
    if (f.key==="stripe") return "How are sales this week?";
    if (f.key==="email") return "Draft a campaign for the next drop";
    if (f.status!=="connected") return `What does connecting ${f.name} unlock?`;
    return `Summarize this ${f.name} account`;
  }
  return `What can the ${f.name} server do?`;
}

function ChatRail({ idea, collapsed, setCollapsed, focusApp, hasKey=true, go }) {
  const script = CHATS[idea.id] || [{ role:"assistant", content:"What's the idea? A sentence is enough — or paste a link, or just talk." }];
  const [shown, setShown] = useState(()=>[script[0]]);
  const [idx, setIdx] = useState(1);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [animating, setAnimating] = useState(false);
  const bodyRef = useRef(null);

  useEffect(()=>{ setShown([script[0]]); setIdx(1); setTyping(false); setDraft(""); }, [idea.id]);
  useEffect(()=>{ if(bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [shown, typing]);

  const nextUserChip = script[idx]?.role==="user" ? script[idx].content : null;

  const send = (text) => {
    if (!text.trim() || typing || animating) return;
    setDraft("");
    setShown(s=>[...s, { role:"user", content:text }]);
    // advance past matching user turn
    let p = idx; if (script[p]?.role==="user") p++;
    const nextAsst = (()=>{ while(p<script.length && script[p].role!=="assistant") p++; return script[p]; })();
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      const msg = nextAsst || (focusApp
        ? { role:"assistant", content:appReply(focusApp), tool: focusApp.kind==="connector" ? "read · "+focusApp.name : "tools · "+focusApp.name }
        : { role:"assistant", content:"Got it — I've saved that to memory and tagged it. Keep going whenever you're ready.", tool:"save_memory" });
      setShown(s=>[...s, { ...msg, _new:true }]);
      setIdx(nextAsst ? p+1 : idx);
      setAnimating(true);
    }, 850);
  };

  if (collapsed) {
    return (
      <div style={{ width:48, flex:"none", borderLeft:"1px solid var(--border)", background:"var(--surface)", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:14, gap:14, height:"100%" }}>
        <IconBtn onClick={()=>setCollapsed(false)} title="Open chat"><Icons.chevL size={18}/></IconBtn>
        <div style={{ writingMode:"vertical-rl", fontSize:12, fontWeight:600, color:"var(--text-secondary)", letterSpacing:"0.04em", marginTop:6 }}>Chat</div>
        <Avatar kind="ai" label="H" size={26}/>
      </div>
    );
  }

  return (
    <div style={{ width:336, flex:"none", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", background:"var(--background)", height:"100%" }}>
      <div className="row gap8" style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
        <Avatar kind="ai" label="H" size={28}/>
        <div style={{ flex:1 }}><div className="row gap6" style={{ alignItems:"center" }}><span style={{ fontWeight:600, fontSize:13.5 }}>Hatchly</span><LiveDot/></div><div className="faint" style={{ fontSize:11 }}>{PHASES[idea.phase].label} · phase-aware</div></div>
        <IconBtn onClick={()=>setCollapsed(true)} title="Collapse"><Icons.chevR size={18}/></IconBtn>
      </div>

      {focusApp && (
        <div className="row gap8" style={{ padding:"8px 16px", borderBottom:"1px solid var(--border)", background:"var(--accent-softer)", fontSize:12 }}>
          <span style={{ color:"var(--accent-text)", flex:"none" }}>{focusApp.kind==="connector" ? <Icons.plug size={13}/> : <Icons.server size={13}/>}</span>
          <span className="faint">In focus</span>
          <span style={{ fontWeight:600 }}>{focusApp.name}</span>
          <span className="faint" style={{ marginLeft:"auto" }}>{focusApp.kind==="connector" ? "connector" : "MCP"}</span>
        </div>
      )}

      <div ref={bodyRef} className="scrollarea" style={{ flex:1, padding:"16px 14px", display:"flex", flexDirection:"column", gap:12 }}>
        {shown.map((m,i)=><ChatMsg key={i} m={m} onTyped={()=>{ if(bodyRef.current) bodyRef.current.scrollTop=bodyRef.current.scrollHeight; setAnimating(false); }}/>)}
        {typing && <div className="row gap8" style={{ alignItems:"flex-end" }}><Avatar kind="ai" label="H" size={24}/><div style={{ background:"var(--surface)", padding:"11px 13px", borderRadius:13 }}><TypingDots/></div></div>}
      </div>

      {nextUserChip && !typing && !animating && (
        <div style={{ padding:"0 14px 10px" }}>
          <button onClick={()=>send(nextUserChip)} className="row gap6" style={{ width:"100%", textAlign:"left", padding:"9px 12px", borderRadius:10, border:"1px dashed var(--border-strong)", background:"var(--surface-raised)", color:"var(--text-secondary)", fontSize:12.5, cursor:"pointer" }}>
            <Icons.arrowUp size={13}/> <span style={{ flex:1 }}>{nextUserChip}</span>
          </button>
        </div>
      )}

      {!nextUserChip && focusApp && hasKey && !typing && !animating && (
        <div style={{ padding:"0 14px 10px" }}>
          <button onClick={()=>send(appPrompt(focusApp))} className="row gap6" style={{ width:"100%", textAlign:"left", padding:"9px 12px", borderRadius:10, border:"1px dashed var(--accent)", background:"var(--accent-softer)", color:"var(--accent-text)", fontSize:12.5, cursor:"pointer" }}>
            <Icons.sparkle size={13}/> <span style={{ flex:1 }}>{appPrompt(focusApp)}</span>
          </button>
        </div>
      )}

      {!hasKey ? (
        <div style={{ padding:"14px 16px", borderTop:"1px solid var(--border)" }}>
          <div className="row gap8" style={{ marginBottom:10, color:"var(--text-secondary)", fontSize:12.5 }}><Icons.lock size={14}/> Connect a model key to chat.</div>
          <Btn variant="soft" size="sm" style={{ width:"100%" }} onClick={()=>go&&go({screen:"settings"})}><Icons.key size={14}/> Connect a key</Btn>
        </div>
      ) : (
      <div style={{ padding:"12px 14px 14px", borderTop:"1px solid var(--border)" }}>
        <div style={{ background:"var(--surface-raised)", border:"1px solid var(--border-strong)", borderRadius:13, padding:"6px 6px 6px 12px" }}>
          <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(draft); } }}
            rows={1} placeholder="Type, paste a link, or record…"
            style={{ width:"100%", border:"none", background:"transparent", resize:"none", outline:"none", fontSize:13.5, lineHeight:1.5, padding:"5px 0", maxHeight:90 }}/>
          <div className="row gap4" style={{ alignItems:"center" }}>
            <IconBtn style={{ width:28, height:28 }} title="Attach link"><Icons.link size={15}/></IconBtn>
            <IconBtn style={{ width:28, height:28 }} title="Record voice"><Icons.mic size={15}/></IconBtn>
            <div className="spacer"/>
            <button onClick={()=>send(draft)} disabled={!draft.trim()} className="btn btn-primary btn-sm" style={{ width:30, height:30, padding:0, borderRadius:8 }}><Icons.arrowUp size={16}/></button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function ChatMsg({ m, onTyped }) {
  const ai = m.role==="assistant";
  return (
    <div className="col gap5" style={{ alignItems: ai?"flex-start":"flex-end" }}>
      <div className="row gap8" style={{ alignItems:"flex-end", flexDirection: ai?"row":"row-reverse", maxWidth:"92%" }}>
        <Avatar kind={ai?"ai":"user"} label={ai?"H":USER.avatar} size={24}/>
        <div style={{ background: ai?"var(--surface)":"var(--accent-soft)", padding:"10px 13px", borderRadius:13, fontSize:13.5, lineHeight:1.55 }}>
          {ai && m._new ? <Typewriter text={m.content} onDone={onTyped}/> : m.content}
        </div>
      </div>
      {m.tool && <div className="row gap5 faint" style={{ fontSize:11, paddingLeft:32, color:"var(--accent-text)" }}><Icons.bolt size={12}/> {m.tool}</div>}
    </div>
  );
}

/* ---------------- WORKSPACE ---------------- */
function Workspace({ idea, tab, setTab, go, theme, setTheme, updateIdea, onArchive, hasKey, onLogout }) {
  const [collapsed, setCollapsed] = useState(idea.phase==="launch"||idea.phase==="operating");
  const [overlay, setOverlay] = useState(null); // {type, data}
  const [chatPulse, setChatPulse] = useState(0);
  const [focusApp, setFocusApp] = useState(null);

  useEffect(()=>{ setCollapsed(idea.phase==="launch"||idea.phase==="operating"); }, [idea.id]);
  useEffect(()=>{ if(tab!=="apps") setFocusApp(null); }, [tab]);
  useEffect(()=>{ setFocusApp(null); }, [idea.id]);

  const openChat = () => { setCollapsed(false); setChatPulse(p=>p+1); };

  // task ops
  const moveTask = (taskId, status) => updateIdea(idea.id, d=>({ ...d, tasks:d.tasks.map(t=>t.id===taskId?{...t,status}:t) }));
  const toggleSub = (taskId, i) => updateIdea(idea.id, d=>({ ...d, tasks:d.tasks.map(t=>t.id===taskId?{...t, subtasks:t.subtasks.map((s,j)=>j===i?{...s,d:!s.d}:s)}:t) }));
  const addTask = ({ title, origin_ref }) => {
    updateIdea(idea.id, d=>({ ...d, tasks:[...d.tasks, { id:"nt"+Date.now(), title, status:"todo", category:"validation", origin:"scorecard", origin_ref, description:"Added from the scorecard. I'll track signal that this moves the dimension.", subtasks:[] }] }));
    setTab("plan");
  };
  const saveMemory = (id, content) => { updateIdea(idea.id, d=>({ ...d, memories:d.memories.map(m=>m.id===id?{...m,content,edited:true}:m) })); setOverlay(null); };
  const chooseName = (name) => updateIdea(idea.id, d=>({ ...d, name, brand_candidates:d.brand_candidates.map(c=>({...c, chosen:c.name===name})) }));

  const task = overlay?.type==="task" ? idea.tasks.find(t=>t.id===overlay.data) : null;

  let body;
  if (tab==="overview")  body = <OverviewTab idea={idea} go={go} openChat={openChat}/>;
  else if (tab==="memory")    body = <MemoryTab idea={idea} onEdit={m=>setOverlay({type:"memEdit", data:m})}/>;
  else if (tab==="scorecard") body = <ScorecardTab idea={idea} onRegenerate={()=>setOverlay({type:"report"})} onAddTask={addTask}/>;
  else if (tab==="plan")      body = <PlanTab idea={idea} onMoveTask={moveTask} onOpenTask={id=>setOverlay({type:"task", data:id})} onGenerate={()=>setOverlay({type:"report"})}/>;
  else if (tab==="brand")     body = <BrandTab idea={idea} onOpenDomain={d=>setOverlay({type:"domain", data:d})} onChooseName={chooseName}/>;
  else if (tab==="apps")      body = <AppsTab idea={idea} setFocusApp={setFocusApp}/>;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* top strip */}
      <div className="row gap12" style={{ height:52, flex:"none", borderBottom:"1px solid var(--border)", padding:"0 18px", background:"var(--background)" }}>
        <div className="row gap8" style={{ cursor:"pointer" }} onClick={()=>go({screen:"ideas"})}><Logo h={26}/></div>
        <div className="spacer"/>
        {idea.phase==="validation" && <Btn variant="secondary" size="sm" onClick={()=>setOverlay({type:"launch"})}><Icons.flag size={14}/> Advance to Launch</Btn>}
        <ThemeToggle theme={theme} setTheme={setTheme}/>
        <AccountMenu go={go} onLogout={onLogout} size={28}/>
      </div>
      {/* 3-column */}
      <div style={{ flex:1, display:"flex", minHeight:0 }}>
        <Sidebar idea={idea} tab={tab} setTab={setTab} go={go} onSettings={()=>setOverlay({type:"ideaSettings"})}/>
        <div className="scrollarea" style={{ flex:1, padding:"28px 32px 60px", minWidth:0 }}>
          <div style={{ maxWidth: tab==="brand"?1080:tab==="apps"?940:780, margin:"0 auto" }}>{body}</div>
        </div>
        <ChatRail key={idea.id+chatPulse} idea={idea} collapsed={collapsed} setCollapsed={setCollapsed} focusApp={focusApp} hasKey={hasKey} go={go}/>
      </div>

      {/* overlays */}
      {task && <TaskDrawer task={task} onClose={()=>setOverlay(null)} onToggleSub={toggleSub} onMove={(id,s)=>{ moveTask(id,s); }}/>}
      {overlay?.type==="memEdit" && <MemoryEditDrawer mem={overlay.data} onClose={()=>setOverlay(null)} onViewSource={()=>setOverlay({type:"memSource", data:overlay.data})} onSave={saveMemory}/>}
      {overlay?.type==="memSource" && <MemorySourceModal mem={overlay.data} onClose={()=>setOverlay(null)}/>}
      {overlay?.type==="report" && <ReportGenModal idea={idea} onClose={()=>setOverlay(null)} onDone={()=>{ setOverlay(null); setTab("scorecard"); }}/>}
      {overlay?.type==="launch" && <LaunchUnlockModal idea={idea} onClose={()=>setOverlay(null)} onConfirm={(arch)=>{ updateIdea(idea.id, d=>({...d, phase:"launch", archetype:arch, lastTab:"plan"})); setOverlay(null); setTab("plan"); setCollapsed(true); }}/>}
      {overlay?.type==="domain" && <DomainModal domain={overlay.data} idea={idea} onClose={()=>setOverlay(null)}/>}
      {overlay?.type==="ideaSettings" && <IdeaSettingsModal idea={idea} onClose={()=>setOverlay(null)} onSave={(patch)=>{ updateIdea(idea.id, d=>({...d,...patch})); setOverlay(null); }} onArchive={onArchive}/>}
    </div>
  );
}

Object.assign(window, { Workspace });


/* ===================== settings.jsx ===================== */
// ===== Account & settings =====

const CONN_ICON = { stripe:Icons.card, email:Icons.bell, shopify:Icons.building, bank:Icons.building, domain:Icons.globe, analytics:Icons.trend };
const CONN_STATE = {
  connected:{ label:"Connected", color:"var(--success)" },
  not_connected:{ label:"Not connected", color:"var(--text-muted)" },
  error:{ label:"Needs attention", color:"var(--danger)" },
};
const SETTINGS_NAV = [
  { key:"profile", label:"Profile", icon:Icons.user },
  { key:"modelkey", label:"Model key", icon:Icons.key },
  { key:"billing", label:"Billing", icon:Icons.card },
  { key:"notifications", label:"Notifications", icon:Icons.bell },
  { key:"security", label:"Security", icon:Icons.shield },
];

function Settings({ go, theme, setTheme, onLogout, keyApi }) {
  const [tab, setTab] = useState("profile");
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <TopBar go={go} theme={theme} setTheme={setTheme} onLogout={onLogout}/>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"36px 36px 100px" }}>
        <h1 style={{ fontSize:30, margin:"0 0 24px", letterSpacing:"-0.02em", fontWeight:600 }}>Settings</h1>
        <div className="row gap28" style={{ alignItems:"flex-start", gap:32 }}>
          <div className="col gap2" style={{ width:184, flex:"none", position:"sticky", top:80 }}>
            {SETTINGS_NAV.map(n=>(
              <button key={n.key} onClick={()=>setTab(n.key)} className="row gap10" style={{ padding:"9px 11px", borderRadius:9, border:"none", textAlign:"left", width:"100%", background: tab===n.key?"var(--surface-raised)":"transparent", boxShadow: tab===n.key?"var(--shadow-card)":"none", color: tab===n.key?"var(--text-primary)":"var(--text-secondary)", fontSize:13.5, fontWeight: tab===n.key?600:500, cursor:"pointer" }}><n.icon size={16}/> {n.label}</button>
            ))}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            {tab==="profile" && <ProfilePane/>}
            {tab==="modelkey" && <ModelKeyPane keyApi={keyApi}/>}
            {tab==="billing" && <BillingPane/>}
            {tab==="notifications" && <NotificationsPane/>}
            {tab==="security" && <SecurityPane/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaneHead({ title, sub }) { return <div style={{ marginBottom:18 }}><h2 style={{ fontSize:19, margin:"0 0 4px", fontWeight:600 }}>{title}</h2>{sub && <p className="muted" style={{ margin:0, fontSize:13.5 }}>{sub}</p>}</div>; }
window.PaneHead = PaneHead;

function ProfilePane() {
  return (
    <div>
      <PaneHead title="Profile" sub="Your founder info — this also feeds Founder–Market Fit scoring."/>
      <Card className="col gap16">
        <div className="row gap14" style={{ alignItems:"center" }}>
          <Avatar kind="user" label={USER.avatar} size={56}/>
          <div><Btn variant="secondary" size="sm">Change photo</Btn></div>
        </div>
        <div className="grid gap14" style={{ gridTemplateColumns:"1fr 1fr" }}>
          <div><label className="label">Name</label><input className="field" defaultValue={USER.name}/></div>
          <div><label className="label">Email</label><input className="field" defaultValue={USER.email}/></div>
        </div>
        <div><label className="label">Background / bio</label><textarea className="field" rows={3} defaultValue={USER.bio} style={{ resize:"vertical", lineHeight:1.5 }}/>
          <div className="faint row gap6" style={{ fontSize:11.5, marginTop:6 }}><Icons.sparkle size={12}/> The agent reads this when scoring how well you fit the markets you explore.</div>
        </div>
        <div className="row"><div className="spacer"/><Btn variant="primary">Save changes</Btn></div>
      </Card>
    </div>
  );
}

function BillingPane() {
  return (
    <div>
      <PaneHead title="Billing" sub="Your plan and payment method."/>
      <Card className="row" style={{ justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div className="row gap12"><span style={{ width:40, height:40, borderRadius:10, background:"var(--accent-soft)", color:"var(--accent-text)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icons.bolt size={20}/></span>
          <div><div className="row gap8"><span style={{ fontWeight:600, fontSize:15, textTransform:"capitalize" }}>{USER.plan} plan</span><Pill accent style={{ fontSize:10 }}>Current</Pill></div><div className="faint" style={{ fontSize:12.5 }}>$29 / month · renews Jul 2, 2026</div></div></div>
        <Btn variant="secondary" size="sm">Change plan</Btn>
      </Card>
      <Card>
        <SectionLabel style={{ marginBottom:12 }}>Payment method</SectionLabel>
        <div className="row gap12" style={{ alignItems:"center" }}><span style={{ color:"var(--text-secondary)" }}><Icons.card size={22}/></span><div style={{ flex:1 }}><div style={{ fontSize:13.5, fontWeight:500 }}>Visa ending 4242</div><div className="faint" style={{ fontSize:12 }}>Expires 09 / 27</div></div><Btn variant="ghost" size="sm">Update</Btn></div>
        <div className="hr" style={{ margin:"14px 0" }}/>
        <SectionLabel style={{ marginBottom:10 }}>Recent invoices</SectionLabel>
        {[["Jun 2, 2026","$29.00"],["May 2, 2026","$29.00"],["Apr 2, 2026","$29.00"]].map(([d,a],i)=>(
          <div key={i} className="row" style={{ justifyContent:"space-between", padding:"7px 0", fontSize:13, borderBottom: i<2?"1px solid var(--border)":"none" }}><span className="muted">{d}</span><span className="row gap10">{a} <a style={{ color:"var(--accent-text)" }}>PDF</a></span></div>
        ))}
      </Card>
    </div>
  );
}

function ConnectionsPane() {
  const [conns, setConns] = useState(CONNECTIONS);
  const toggle = (kind) => setConns(cs=>cs.map(c=>c.kind===kind?{...c, status:c.status==="connected"?"not_connected":"connected"}:c));
  return (
    <div>
      <PaneHead title="Connections" sub="Account-level integrations, reused across every idea. Surfaced contextually during launch."/>
      <Card style={{ padding:8 }}>
        {conns.map((c,i)=>{ const I=CONN_ICON[c.kind]; const st=CONN_STATE[c.status]; return (
          <div key={c.kind} className="row gap14" style={{ padding:"14px 12px", borderBottom: i<conns.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
            <span style={{ width:38, height:38, borderRadius:10, background:"var(--surface)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}><I size={19}/></span>
            <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600 }}>{c.label}</div><div className="faint" style={{ fontSize:12 }}>{c.note}</div></div>
            <span className="row gap6" style={{ fontSize:12, color:st.color }}><StatusDot color={st.color} size={7}/>{st.label}</span>
            <Btn variant={c.status==="connected"?"ghost":"secondary"} size="sm" onClick={()=>toggle(c.kind)}>{c.status==="connected"?"Manage":c.status==="error"?"Reconnect":"Connect"}</Btn>
          </div>
        );})}
      </Card>
    </div>
  );
}

function NotificationsPane() {
  const [prefs, setPrefs] = useState({ stalled:true, gate:true, score:false, digest:true });
  const items = [["stalled","Stalled ideas","When an idea goes quiet for a week"],["gate","Gate unlocked","When an idea is ready to advance a phase"],["score","Score moved","Every time a dimension score changes"],["digest","Weekly digest","A Monday summary across all ideas"]];
  return (
    <div>
      <PaneHead title="Notifications" sub="What's worth interrupting you for."/>
      <Card style={{ padding:8 }}>
        {items.map(([k,t,d],i)=>(
          <div key={k} className="row gap14" style={{ padding:"14px 12px", borderBottom: i<items.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
            <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:500 }}>{t}</div><div className="faint" style={{ fontSize:12 }}>{d}</div></div>
            <Toggle on={prefs[k]} onClick={()=>setPrefs(p=>({...p,[k]:!p[k]}))}/>
          </div>
        ))}
      </Card>
    </div>
  );
}
function Toggle({ on, onClick }) {
  return <button onClick={onClick} style={{ width:40, height:23, borderRadius:999, border:"none", background: on?"var(--accent)":"var(--border-strong)", position:"relative", cursor:"pointer", transition:"background 160ms", flex:"none" }}>
    <span style={{ position:"absolute", top:2.5, left: on?20:2.5, width:18, height:18, borderRadius:999, background:"#fff", transition:"left 180ms cubic-bezier(.22,1,.36,1)", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/></button>;
}

function SecurityPane() {
  return (
    <div>
      <PaneHead title="Security" sub="Password and active sessions."/>
      <Card className="col gap14" style={{ marginBottom:14 }}>
        <SectionLabel>Change password</SectionLabel>
        <div><label className="label">Current password</label><input className="field" type="password" defaultValue="••••••••"/></div>
        <div className="grid gap14" style={{ gridTemplateColumns:"1fr 1fr" }}>
          <div><label className="label">New password</label><input className="field" type="password"/></div>
          <div><label className="label">Confirm</label><input className="field" type="password"/></div>
        </div>
        <div className="row"><div className="spacer"/><Btn variant="primary">Update password</Btn></div>
      </Card>
      <Card>
        <SectionLabel style={{ marginBottom:12 }}>Active sessions</SectionLabel>
        {[["MacBook Pro · San Francisco","Active now",true],["iPhone 15 · San Francisco","2 days ago",false]].map(([d,t,cur],i)=>(
          <div key={i} className="row" style={{ justifyContent:"space-between", padding:"9px 0", borderBottom: i<1?"1px solid var(--border)":"none", alignItems:"center" }}>
            <div><div style={{ fontSize:13.5, fontWeight:500 }}>{d}</div><div className="faint" style={{ fontSize:12 }}>{t}</div></div>
            {cur ? <Pill style={{ fontSize:10, color:"var(--success-text)" }}>This device</Pill> : <Btn variant="ghost" size="sm" onClick={onLogout}>Sign out</Btn>}
          </div>
        ))}
        <div className="hr" style={{ margin:"14px 0" }}/>
        <Btn variant="ghost" style={{ color:"var(--danger-text)" }} onClick={onLogout}><Icons.shield size={14}/> Sign out everywhere</Btn>
      </Card>
    </div>
  );
}

Object.assign(window, { Settings });


/* ===================== app.jsx ===================== */
// ===== App: routing + state =====

function App() {
  const [theme, setThemeState] = useState(()=>localStorage.getItem("hatchly-theme")||"light");
  const [loggedIn, setLoggedIn] = useState(()=>localStorage.getItem("hatchly-auth")==="1");
  const [ideas, setIdeas] = useState(()=>JSON.parse(JSON.stringify(IDEAS)));
  const [importBatches, setImportBatches] = useState(()=>JSON.parse(JSON.stringify(IMPORT_BATCHES)));
  const [importedIdeas, setImportedIdeas] = useState(()=>JSON.parse(JSON.stringify(IMPORTED_IDEAS)));
  const [modelKey, setModelKey] = useState(()=>{
    try { const s = JSON.parse(localStorage.getItem("hatchly-modelkey")); if (s) return s; } catch(e){}
    if (localStorage.getItem("hatchly-auth")==="1") {
      const seed = { active:"anthropic", providers:{ anthropic:{ masked:"sk-ant-a •••• 4f2a", since:"Apr 2026" } } };
      localStorage.setItem("hatchly-modelkey", JSON.stringify(seed));
      return seed;
    }
    return null;
  });
  const [route, setRoute] = useState(()=>{
    try { const r = JSON.parse(localStorage.getItem("hatchly-route")); if (r) return r; } catch(e){}
    return { screen: localStorage.getItem("hatchly-auth")==="1" ? "ideas" : "marketing" };
  });

  const setTheme = (t)=>{ setThemeState(t); localStorage.setItem("hatchly-theme",t); document.documentElement.setAttribute("data-theme",t); };
  useEffect(()=>{ document.documentElement.setAttribute("data-theme",theme); }, []);

  const go = (r)=>{ const next = typeof r==="string"?{screen:r}:r; setRoute(next); localStorage.setItem("hatchly-route", JSON.stringify(next));
    const sa = document.querySelector(".scrollarea"); if(sa) sa.scrollTop=0; };

  const updateIdea = (id, fn)=> setIdeas(list=>list.map(i=>i.id===id?fn(i):i));
  const archiveIdea = (id)=> setIdeas(list=>list.map(i=>i.id===id?{...i, archived:!i.archived}:i));

  const newIdea = ()=>{
    const id = "i_new"+Date.now();
    const idea = { id, name:"Untitled idea", one_liner:"A new idea, still taking shape.", phase:"ideation", archetype:null,
      completeness:0, current_score:null, last_activity:"just now", lastTab:"overview", dimsWithSignal:0,
      next_move:"Tell me about the idea in the chat — a sentence is enough.",
      memories:[], tasks:[], brand_candidates:[], domains:[],
      activity:[{ type:"memory_added", summary:"Idea created", at:"now" }] };
    setIdeas(list=>[idea, ...list]);
    CHATS[id] = [{ role:"assistant", content:"What's the idea? A sentence is enough — or paste a link, or just talk." }];
    go({ screen:"workspace", ideaId:id, tab:"overview" });
  };

  const onAuth = ()=>{ localStorage.setItem("hatchly-auth","1"); setLoggedIn(true); go(modelKey?.active ? { screen:"ideas" } : { screen:"keysetup" }); };
  const onLogout = ()=>{ localStorage.removeItem("hatchly-auth"); setLoggedIn(false); go({ screen:"marketing" }); };

  // ---- account model key (BYOK) ----
  const persistKey = (v)=>{ if(v) localStorage.setItem("hatchly-modelkey", JSON.stringify(v)); else localStorage.removeItem("hatchly-modelkey"); };
  const connectKey = (provider, masked)=> setModelKey(mk=>{ const next={ active:provider, providers:{ ...(mk?.providers||{}), [provider]:{ masked, since:"Just now" } } }; persistKey(next); return next; });
  const setActiveKey = (p)=> setModelKey(mk=>{ if(!mk?.providers?.[p]) return mk; const next={...mk, active:p}; persistKey(next); return next; });
  const disconnectKey = (p)=> setModelKey(mk=>{ if(!mk) return mk; const providers={...mk.providers}; delete providers[p]; let active=mk.active; if(active===p){ active=Object.keys(providers)[0]||null; } const next={ active, providers }; persistKey(next); return next; });
  const keyApi = { modelKey, connect:connectKey, setActive:setActiveKey, disconnect:disconnectKey };
  const hasKey = !!modelKey?.active;

  // ---- imported ideas ("the Seal") ----
  const importSeal = (res, label)=>{
    if(!res || !res.ideas?.length) return;
    const bid = "b_"+Date.now();
    const batch = { id:bid, source_label: label || "Imported chat", declared_count: res.declared, parsed_count: res.parsed, status: res.status, created_at:"just now" };
    const mined = res.ideas.map((it,i)=>({
      id:"ii_"+Date.now()+"_"+i, batch_id:bid, name:it.name, one_liner:it.one_liner,
      cluster_label: it.cluster || res.clusters[0] || "Ideas",
      confidence: it.confidence || "medium", tags: Array.isArray(it.tags)?it.tags:[],
      extracted_memories: Array.isArray(it.memories)?it.memories:[],
      suggested_archetype: archFromTags(it.tags), status:"staged", converted_idea_id:null,
    }));
    setImportBatches(b=>[batch, ...b]);
    setImportedIdeas(list=>[...mined, ...list]);
  };

  const convertImport = (impId)=>{
    const x = importedIdeas.find(i=>i.id===impId);
    if(!x || x.status==="converted") return;
    const batch = importBatches.find(b=>b.id===x.batch_id);
    const srcLabel = "Imported · " + (batch?batch.source_label:"chat");
    const id = "i_imp"+Date.now();
    const mems = (x.extracted_memories||[]).map((m,i)=>({ id:id+"_m"+i, content:m, tags:(x.tags||[]).slice(0,2), confidence:x.confidence||"medium", src:"import", srcLabel, edited:false }));
    const idea = { id, name:x.name, one_liner:x.one_liner, phase:"ideation", archetype:x.suggested_archetype||null,
      completeness: Math.min(15 + mems.length*9, 50), current_score:null, last_activity:"just now", lastTab:"overview",
      dimsWithSignal: Math.min(mems.length+1, 6), imported:true,
      next_move:"Imported from your chats with "+mems.length+" memories. Keep shaping it — tell me what's missing.",
      memories:mems, tasks:[], brand_candidates:[], domains:[],
      activity:[{ type:"memory_added", summary:"Converted from imported idea · "+(batch?batch.source_label:"chat"), at:"now" }] };
    setIdeas(list=>[idea, ...list]);
    CHATS[id] = [{ role:"assistant", content:`I pulled "${x.name}" out of your chats — it's here in Ideation with ${mems.length} memories already attached. Want to keep shaping it, or should I tell you which dimensions are still blank?` }];
    setImportedIdeas(list=>list.map(i=>i.id===impId?{...i, status:"converted", converted_idea_id:id}:i));
  };

  const dismissImport = (impId)=> setImportedIdeas(list=>list.map(i=>i.id===impId?{...i, status:"dismissed"}:i));
  const restoreImport = (impId)=> setImportedIdeas(list=>list.map(i=>i.id===impId?{...i, status:"staged"}:i));

  const setTab = (tab)=>{ const next={...route, tab}; setRoute(next); localStorage.setItem("hatchly-route",JSON.stringify(next));
    if(route.ideaId) updateIdea(route.ideaId, d=>({...d, lastTab:tab})); };

  // render
  if (route.screen==="marketing") return <Landing go={go} loggedIn={loggedIn}/>;
  if (route.screen==="how")       return <HowItWorks go={go} loggedIn={loggedIn}/>;
  if (route.screen==="auth")      return <Auth go={go} mode={route.mode} onAuth={onAuth}/>;
  if (route.screen==="keysetup")  return <KeySetup go={go} onConnect={(prov,masked)=>{ connectKey(prov, masked); go({ screen:"ideas" }); }}/>;
  if (route.screen==="settings")  return <Settings go={go} theme={theme} setTheme={setTheme} onLogout={onLogout} keyApi={keyApi}/>;
  if (route.screen==="workspace") {
    const idea = ideas.find(i=>i.id===route.ideaId);
    if (!idea) { go({screen:"ideas"}); return null; }
    return <Workspace idea={idea} tab={route.tab||idea.lastTab||"overview"} setTab={setTab} go={go} theme={theme} setTheme={setTheme} updateIdea={updateIdea} onArchive={archiveIdea} hasKey={hasKey} onLogout={onLogout}/>;
  }
  return <Dashboard ideas={ideas} go={go} theme={theme} setTheme={setTheme} onNewIdea={newIdea} onArchive={archiveIdea}
    importedIdeas={importedIdeas} importBatches={importBatches} onImport={importSeal} onConvertImport={convertImport} onDismissImport={dismissImport} onRestoreImport={restoreImport} onLogout={onLogout}/>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
