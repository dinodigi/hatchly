// ===== Hatchly v4 — public idea stream + economy dataset =====

// ---- the founder using the app ----
const USER = {
  id:"u_alex", name:"Alex Rivera", handle:"alexr", email:"alex@rivera.co", avatar:"AR",
  bio:"Ex-PM building solo since 2024.",
};

// ---- Hatchly Bucks economy (play-money, prestige only) ----
const ECONOMY = {
  balance: 1240,         // current spendable bucks
  dailyClaim: 100,       // flat daily claim
  claimedToday: false,
  invested: 1260,        // lifetime bucks backing public ideas
  rank: 24,              // investor leaderboard rank
  returns: 3,            // ideas you backed early that later trended
  streak: 6,             // consecutive daily claims
};

// ---- author directory ----
const PEOPLE = {
  alexr:   { name:"Alex Rivera",   handle:"alexr",   avatar:"AR", color:"var(--surface)" },
  maya:    { name:"Maya Karim",    handle:"mayak",   avatar:"MK", color:"#E7DCC9" },
  sam:     { name:"Sam Okafor",    handle:"samok",   avatar:"SO", color:"#D9E3F0" },
  jules:   { name:"Jules Tan",     handle:"jtan",    avatar:"JT", color:"#E9DDE9" },
  devon:   { name:"Devon Hale",    handle:"devon",   avatar:"DH", color:"#DCEBDD" },
  priya:   { name:"Priya N.",      handle:"priyan",  avatar:"PN", color:"#F0E2D2" },
  noah:    { name:"Noah Frey",     handle:"noahf",   avatar:"NF", color:"#E2DCEF" },
  lena:    { name:"Lena Ruiz",     handle:"lenar",   avatar:"LR", color:"#E7DECB" },
};

// helper: empty PRD section reads "not captured yet"
const PRD_SECTIONS = [
  { key:"problem",  label:"Problem" },
  { key:"who",      label:"Who it's for" },
  { key:"value",    label:"Core value" },
  { key:"features", label:"Features", list:true },
  { key:"open",     label:"Open questions", list:true },
];

// completeness: needs problem + who + value + >=1 feature
function prdComplete(prd) {
  return !!(prd && prd.problem && prd.who && prd.value && (prd.features||[]).length >= 1);
}
function prdProgress(prd) {
  if (!prd) return 0;
  let n = 0; const total = 5;
  if (prd.problem) n++; if (prd.who) n++; if (prd.value) n++;
  if ((prd.features||[]).length) n++; if ((prd.open||[]).length) n++;
  return Math.round((n/total)*100);
}

// ---- public idea stream (ranked) ----
// bucks = bucks invested · today = momentum (+today) · backers · spark = 7-day bucks trend
const STREAM = [
  {
    id:"loop", name:"Loop", author:"maya", category:"Founder tools", visibility:"public",
    one_liner:"A planner that remembers — voice-first habit coaching for solo founders.",
    bucks: 8420, today: 612, backers: 214, spark:[5,6,6,7,7,9,12], spotlight:true, ageDays:9, owner:false,
    prd:{
      problem:"Solo founders lose their rhythm. The pain peaks around 3pm — no one to push back, no structure, and tools that feel like forms instead of a relationship.",
      who:"Solo founders, 0–12 months post-corporate, who already tried a planner and bounced off it.",
      value:"A daily accountability ritual that remembers which check-in actually moved you forward, and weights tomorrow's prompts toward your real rhythm.",
      features:["Three voice check-ins a day (AM / mid-day / EOD)","Memory that compounds — it learns your week","Adaptive prompts, not static reminders","A weekly 'what actually moved' recap"],
      open:["What's the one metric a user checks daily?","Does memory recall stay cheap at scale?"],
    },
    signals:{ wouldUse:78, demand:"High", wtp:"$15–20/mo", notify:186 },
  },
  {
    id:"clipline", name:"Clipline", author:"jules", category:"Creator tools", visibility:"public",
    one_liner:"Turn long streams into vertical clips automatically — you publish, you don't edit.",
    bucks: 6190, today: 540, backers: 168, spark:[3,4,4,5,6,8,10], ageDays:5, owner:false,
    prd:{
      problem:"Streamers and podcasters sit on hours of footage but won't edit it. The clips that would grow them never get made.",
      who:"Live streamers and long-form podcasters with no editor and no time.",
      value:"Hook-detection finds the moments worth clipping and renders them vertical — done, not assisted.",
      features:["Auto hook-detection across a full stream","One-tap vertical render with captions","Publish straight to TikTok / Shorts / Reels"],
      open:["Pay per published clip or per month?","How good does hook-detection have to be to trust it?"],
    },
    signals:{ wouldUse:71, demand:"High", wtp:"per clip", notify:142 },
  },
  {
    id:"drop", name:"Drop", author:"sam", category:"Commerce", visibility:"public",
    one_liner:"A curated Funko mystery box every month — capped run, chase variants hidden inside.",
    bucks: 5240, today: 318, backers: 151, spark:[6,6,7,7,6,7,8], ageDays:14, owner:false,
    prd:{
      problem:"Collectors want the thrill of the drop without trawling resale sites — and want a shelf they're proud of, not a hoard.",
      who:"Funko collectors 25–40 with a completionist streak.",
      value:"One curated, quantity-capped drop a month, themed by era, with rare chase variants seeded through the run.",
      features:["Monthly capped drop with real scarcity","Reveal moment + duplicate trading","Stated chase odds — never faked"],
      open:["Do the unit economics survive shipping fragile figures?"],
    },
    signals:{ wouldUse:64, demand:"Medium", wtp:"$40/box", notify:97 },
  },
  {
    id:"plotline", name:"Plotline", author:"priya", category:"Creator tools", visibility:"public",
    one_liner:"A writing room that remembers your characters so they never go off-model.",
    bucks: 3870, today: 274, backers: 119, spark:[2,3,4,4,5,6,7], ageDays:7, owner:false,
    prd:{
      problem:"Long-form writers lose track of their own canon — eye color, timelines, who knows what — and AI tools forget it instantly.",
      who:"Novelists and serial fiction writers working across many chapters.",
      value:"A persistent story bible the drafting assistant actually obeys, flagging continuity breaks as you write.",
      features:["Auto-built character & world bible","Continuity warnings inline","Draft assist that stays on-canon"],
      open:["How much canon can you hold before recall degrades?"],
    },
    signals:{ wouldUse:69, demand:"Medium", wtp:"$12/mo", notify:88 },
  },
  {
    id:"mendly", name:"Mendly", author:"devon", category:"Marketplace", visibility:"public",
    one_liner:"Find someone local who'll repair it instead of replacing it.",
    bucks: 2960, today: 188, backers: 94, spark:[3,3,4,4,4,5,5], ageDays:11, owner:false,
    prd:{
      problem:"Fixing a lamp, a jacket, or a chair is cheaper and greener than buying new — but finding a trustworthy local fixer is nearly impossible.",
      who:"People who'd rather repair than replace, in mid-size cities.",
      value:"A vetted marketplace of local repair people, matched by what's broken and a photo.",
      features:["Snap a photo, get matched to a fixer","Vetted reviews by repair type","In-app quotes before you commit"],
      open:["Supply side: how do you seed enough fixers per city?"],
    },
    signals:{ wouldUse:58, demand:"Medium", wtp:"per job", notify:61 },
  },
  {
    id:"roamcal", name:"Roamcal", author:"noah", category:"Consumer", visibility:"public",
    one_liner:"A travel calendar that books itself around the dates your friends are free.",
    bucks: 1840, today: 142, backers: 73, spark:[1,2,2,3,3,4,5], ageDays:4, owner:false,
    prd:{
      problem:"Group trips die in the scheduling step — twelve message threads, nobody's dates line up, the trip never happens.",
      who:"Friend groups in their 20s–30s who keep saying 'we should travel.'",
      value:"Everyone drops their free windows once; it finds the overlap and surfaces bookable options inside it.",
      features:["Shared free-date overlap finder","Bookable trip options inside the window"],
      open:["Where does the travel inventory come from?","Is this a feature, not a company?"],
    },
    signals:{ wouldUse:52, demand:"Low", wtp:"free + affiliate", notify:44 },
  },
  {
    id:"standup", name:"Standup Solo", author:"alexr", category:"Founder tools", visibility:"public",
    one_liner:"Async standup for one-person teams — a daily nudge that pushes back.",
    bucks: 1420, today: 96, backers: 58, spark:[1,1,2,2,3,3,4], ageDays:3, owner:true,
    cover:"meadow", liveUrl:"https://standupsolo.app",
    contacts:[
      { id:"c1", name:"Devon Hale", handle:"devon", avatar:"DH", color:"#DCEBDD", note:"Wants the team version", at:"2 days ago" },
      { id:"c2", name:"Priya N.", handle:"priyan", avatar:"PN", color:"#F0E2D2", note:"Would beta test", at:"3 days ago" },
      { id:"c3", name:"Jules Tan", handle:"jtan", avatar:"JT", color:"#E9DDE9", note:"", at:"4 days ago" },
      { id:"c4", name:"Noah Frey", handle:"noahf", avatar:"NF", color:"#E2DCEF", note:"Will pay at launch", at:"5 days ago" },
      { id:"c5", name:"Lena Ruiz", handle:"lenar", avatar:"LR", color:"#E7DECB", note:"", at:"6 days ago" },
      { id:"c6", name:"Maya Karim", handle:"mayak", avatar:"MK", color:"#E7DCC9", note:"Backed + wants updates", at:"1 week ago" },
    ],
    feedback:[
      { id:"fb1", name:"Devon Hale", avatar:"DH", color:"#DCEBDD", text:"The 'what's stuck this week' surfacing is the real hook — lead with that, not the standup framing.", at:"2 days ago" },
      { id:"fb2", name:"Priya N.", avatar:"PN", color:"#F0E2D2", text:"I'd pay for this the second it reads my GitHub issues. Solo founders basically live there.", at:"4 days ago" },
    ],
    prd:{
      problem:"Solo founders skip the one ritual that keeps teams honest — the standup — because doing it alone feels pointless.",
      who:"One-person teams who miss the accountability of a standup.",
      value:"A daily check-in that doesn't just log progress, it surfaces what's actually stuck this week and pushes back.",
      features:["Daily progress nudge","Weekly 'what's stuck' surfacing"],
      open:["What makes the pushback feel earned, not annoying?","Would people pay, or is this a free habit tool?"],
    },
    signals:{ wouldUse:61, demand:"Medium", wtp:"$8/mo", notify:39 },
  },
  {
    id:"cohortly", name:"Cohortly", author:"lena", category:"Creator tools", visibility:"public",
    one_liner:"Run a paid cohort course from one Notion doc — no Zoom + Circle + Stripe juggling.",
    bucks: 980, today: 54, backers: 41, spark:[1,1,1,2,2,2,3], ageDays:6, owner:false,
    prd:{
      problem:"Creators who want to teach a cohort have to stitch together five tools and a payment flow before they can sell a single seat.",
      who:"Solo educators and creators selling their first paid cohort.",
      value:"One link that turns a Notion doc into a sellable, scheduled cohort with payments built in.",
      features:["Notion doc → course page","Built-in scheduling + payments"],
      open:["Is one link enough, or do people want a full LMS?"],
    },
    signals:{ wouldUse:55, demand:"Low", wtp:"10% of sales", notify:28 },
  },
];
const STREAM_BY_ID = Object.fromEntries(STREAM.map(s => [s.id, s]));

// ---- the founder's own ideas (workspace) ----
// stage: ideation (private) · public (on the stream) · build
const MY_IDEAS = [
  {
    id:"pantry", name:"Pantry", stage:"ideation", visibility:"private", lastActive:"9 days ago",
    one_liner:"Tell it what's in your fridge; it plans dinner.",
    description:"A meal-planning idea for parents who are tired of deciding what to cook. Still shaping the core value and the money model.",
    prd:{
      problem:"The 6pm 'what's for dinner' decision is decision fatigue, not a lack of recipes.",
      who:"Busy parents who cook most nights and dread the daily choice.",
      value:"",
      features:["Tell it what's in the fridge, get a plan"],
      open:["Subscription or grocery-affiliate revenue?","Who is it really up against — recipe apps or meal kits?"],
    },
    memories:[
      { id:"p1", content:"Target: busy parents who hate the 6pm 'what's for dinner' decision", input:"it's for parents who are slammed and dread that 6pm 'ok what are we even eating tonight' moment", src:"chat", chatTitle:"Shaping Pantry", srcLabel:"Shaping Pantry · turn 2", feeds:"Who it's for" },
      { id:"p2", content:"Pain is decision fatigue, not a lack of recipes", input:"they already have a million recipes saved, the problem is they're just exhausted from deciding", src:"chat", chatTitle:"Shaping Pantry", srcLabel:"Shaping Pantry · turn 3", feeds:"Problem" },
      { id:"p3", content:"Unsure on monetization — subscription vs grocery affiliate", input:"honestly not sure on money yet", src:"voice", chatTitle:"Shaping Pantry", srcLabel:"Voice note · 0:21", feeds:"Open questions" },
    ],
  },
  {
    id:"standup", name:"Standup Solo", stage:"public", visibility:"public", lastActive:"3 days ago",
    one_liner:"Async standup for one-person teams — a daily nudge that pushes back.",
    description:"Live on the stream. A daily accountability ritual for solo founders that doesn't just log progress — it pushes back on what's stuck.",
    streamId:"standup", cover:"meadow", liveUrl:"https://standupsolo.app", publicDocs:["standup_f1"],
    prd: null, // filled from STREAM at runtime
    memories:[
      { id:"s1", content:"Wants a daily nudge to log progress", input:"i just want something to poke me every morning to write down what i did", src:"chat", chatTitle:"Pushback mechanics", srcLabel:"Pushback mechanics · turn 1", feeds:"Features" },
      { id:"s2", content:"Solo standups feel pointless without pushback", input:"doing a standup alone is useless, no one challenges you on anything", src:"chat", chatTitle:"Pushback mechanics", srcLabel:"Pushback mechanics · turn 3", feeds:"Core value" },
      { id:"s3", content:"Would pay if it surfaced what's stuck this week", input:"i'd actually pay if it told me 'hey this thing has been stuck 3 days'", src:"chat", chatTitle:"Pricing — free vs paid", srcLabel:"Pricing — free vs paid · turn 2", feeds:"Open questions" },
    ],
  },
  {
    id:"inbox", name:"Inbox Triage", stage:"ideation", visibility:"link", lastActive:"yesterday",
    one_liner:"An AI chief-of-staff that drafts replies in your voice.",
    description:"Link-only while advisors weigh in. Brief is build-ready — the open call is local vs cloud for privacy.",
    prd:{
      problem:"Founders lose ~90 minutes a day to email, and the tools that promise to help never learn their actual tone.",
      who:"Founders and operators living in their inbox.",
      value:"A chief-of-staff that drafts replies in your voice and learns from every edit.",
      features:["Voice-matched draft replies","Learns tone from your edits","Triage: what needs you vs what doesn't"],
      open:["Privacy is the dealbreaker — local or cloud?"],
    },
    memories:[
      { id:"x1", content:"Spends ~90 min/day in email", input:"i lose like an hour and a half a day just in my inbox", src:"chat", chatTitle:"Privacy: local vs cloud", srcLabel:"Privacy: local vs cloud · turn 2", feeds:"Problem" },
      { id:"x2", content:"Existing tools don't learn tone", input:"every tool i tried writes like a robot, none of them sound like me", src:"chat", chatTitle:"Privacy: local vs cloud", srcLabel:"Privacy: local vs cloud · turn 4", feeds:"Core value" },
      { id:"x3", content:"Privacy is the dealbreaker for most users", input:"the people i'd sell this to will not let email leave their machine", src:"chat", chatTitle:"Privacy: local vs cloud", srcLabel:"Privacy: local vs cloud · turn 6", feeds:"Open questions" },
    ],
  },
];

// ---- scripted workspace chats per idea ----
const CHATS = {
  pantry:[
    { role:"assistant", content:"Pantry's been quiet for 9 days. You've got a clear customer and a sharp problem — but the core value and the money question are still blank. Want to nail down what Pantry actually does for someone, in one line?" },
    { role:"user", content:"honestly not sure on money yet" },
    { role:"assistant", content:"That's fine — uncertainty is signal, and I've kept it in the PRD's open questions. Two common paths for a meal tool: a thin monthly subscription, or grocery-affiliate where you take a cut of the cart. They pull the product in different directions. Want to talk through which fits a parent at 6pm?", prdUpdate:{ section:"open" } },
  ],
  standup:[
    { role:"assistant", content:"Standup Solo is live on the stream — 58 backers and 1,420 bucks so far. The PRD's in good shape. Want to fold the 'pushback' question into a feature, or keep pulling on community signal first?" },
    { role:"user", content:"what are people saying they'd pay?" },
    { role:"assistant", content:"On the public page, willingness-to-pay is clustering around $8/mo, and 61% say they'd use it. The soft spot is whether it's a paid product or a free habit — that's still your sharpest open question.", prdUpdate:null },
  ],
  inbox:[
    { role:"assistant", content:"Inbox Triage is link-only right now — your advisors can see it, but it's not on the stream. The PRD has a problem, an audience, a core value, and three features. That clears the bar to build. Want to publish it for community signal first, or go straight to building?" },
    { role:"user", content:"what's the one thing still missing?" },
    { role:"assistant", content:"Just the privacy decision — local vs cloud. It's the dealbreaker your notes keep flagging, and it changes the architecture. Everything else is ready. I'd lock that before you build.", prdUpdate:null },
  ],
};

// ---- chats per idea (an idea is a project; it holds many chats) ----
const IDEA_CHATS = {
  pantry: [
    { id:"pantry_c1", title:"Shaping Pantry", at:"9 days ago", thread: CHATS.pantry },
  ],
  standup: [
    { id:"standup_c1", title:"Pushback mechanics", at:"3 days ago", thread: CHATS.standup },
    { id:"standup_c2", title:"Pricing — free vs paid", at:"5 days ago", thread:[
      { role:"assistant", content:"Two camps for Standup Solo: a free habit tool that grows fast, or a paid product that surfaces what's stuck. Which feels truer to you?" },
      { role:"user", content:"i'd pay if it told me what's been stuck" },
      { role:"assistant", content:"That's the lean, then — the 'what's stuck this week' surfacing is the paid wedge. I logged it to memory and flagged pricing as your open question.", tool:"captured memory · pricing signal" },
    ] },
  ],
  inbox: [
    { id:"inbox_c1", title:"Privacy: local vs cloud", at:"yesterday", thread: CHATS.inbox },
  ],
};

// ---- files per idea (Pages = docs the chat writes · Kanban = boards the agent proposes) ----
const IDEA_FILES = {
  pantry: [
    { id:"pantry_f1", type:"page", title:"Product brief", subtitle:"Auto-written from chat", source:"prd", updated:"9 days ago" },
  ],
  standup: [
    { id:"standup_f1", type:"page", title:"Product brief", subtitle:"Auto-written from chat", source:"prd", updated:"3 days ago" },
    { id:"standup_f3", type:"page", title:"MVP scope", subtitle:"Drafted past the build gate", updated:"2 days ago", body:[
      { h:"The core loop", p:"Every morning a nudge asks 'what did you move yesterday, and what's stuck?'. The reply is parsed into progress + blockers. On Fridays, anything tagged stuck for 3+ days is surfaced as a digest." },
      { h:"Wow moment", p:"The first Friday digest — seeing 'this has been stuck 4 days' in writing is the thing that makes a solo founder feel seen, and the moment they'd tell a friend about it." },
      { list:["AM nudge with one real follow-up question","Progress + blocker parsing from a plain-text reply","Friday 'what's stuck' digest","A shareable public streak"], lh:"In scope for v1" },
      { list:["Slack / GitHub integrations","Team mode","Analytics dashboard"], lh:"Explicitly out of v1" },
    ] },
    { id:"standup_f4", type:"page", title:"Pricing notes", subtitle:"From the 'free vs paid' chat", updated:"5 days ago", body:[
      { h:"The decision", p:"Lean: free daily nudge, paid 'what's stuck' surfacing. The habit is the funnel; the insight is the upgrade. WTP is clustering around $8/mo from the public page." },
      { list:["Free: daily nudge + progress log","Pro ($8/mo): Friday digest, stuck-detection, public streak"], lh:"Tiers" },
      { h:"Open risk", p:"If the free tier is too good, no one upgrades. Keep stuck-detection strictly paid — it's the only feature that needs memory across days." },
    ] },
  ],
  inbox: [
    { id:"inbox_f1", type:"page", title:"Product brief", subtitle:"Auto-written from chat", source:"prd", updated:"yesterday" },
  ],
};
const LEADERBOARD = [
  { rank:1, handle:"mayak",  name:"Maya Karim",  avatar:"MK", color:"#E7DCC9", invested:14200, returns:9, backed:31, hot:true },
  { rank:2, handle:"devon",  name:"Devon Hale",  avatar:"DH", color:"#DCEBDD", invested:11800, returns:7, backed:24 },
  { rank:3, handle:"jtan",   name:"Jules Tan",   avatar:"JT", color:"#E9DDE9", invested:9650,  returns:6, backed:22, hot:true },
  { rank:4, handle:"priyan", name:"Priya N.",    avatar:"PN", color:"#F0E2D2", invested:8100,  returns:5, backed:19 },
  { rank:5, handle:"noahf",  name:"Noah Frey",   avatar:"NF", color:"#E2DCEF", invested:6400,  returns:4, backed:17 },
  { rank:6, handle:"lenar",  name:"Lena Ruiz",   avatar:"LR", color:"#E7DECB", invested:5200,  returns:3, backed:14 },
];

window.fmt = (n)=> n>=1000 ? (n/1000).toFixed(n%1000>=100?1:0)+"k" : ""+n;

// ---- public-page cover presets (tasteful tonal washes) ----
const COVERS = {
  meadow: { label:"Meadow", css:"linear-gradient(120deg, #E7EDE0, #CFE0CB 55%, #B8D0BE)" },
  linen:  { label:"Linen",  css:"linear-gradient(120deg, #F3ECDF, #E7D9C3 60%, #DCC9AC)" },
  dusk:   { label:"Dusk",   css:"linear-gradient(120deg, #E3E0EC, #D2CCE0 55%, #BFC2DC)" },
  gold:   { label:"Gold",   css:"linear-gradient(120deg, #F6E6C4, #EDCF8E 55%, #DCA032)" },
  slate:  { label:"Slate",  css:"linear-gradient(120deg, #E4E6E7, #CDD2D4 55%, #B4BBBD)" },
};

Object.assign(window, { COVERS });

// ---- predefined tags users can apply to an idea ----
const TAGS = ["AI","SaaS","Consumer","Marketplace","B2B","Mobile","Productivity","Creator","Commerce","Fintech","Health","Education"];

// ---- give every stream idea a cover, tags, and a description ----
const STREAM_COVERS = { loop:"meadow", clipline:"dusk", drop:"gold", plotline:"linen", mendly:"slate", roamcal:"dusk", standup:"meadow", cohortly:"linen" };
const STREAM_TAGS = { loop:["AI","Productivity","B2B"], clipline:["AI","Creator","Mobile"], drop:["Commerce","Consumer"], plotline:["AI","Creator"], mendly:["Marketplace","Consumer"], roamcal:["Consumer","Mobile"], standup:["SaaS","Productivity"], cohortly:["Creator","Education"] };
STREAM.forEach(s=>{ s.cover = s.cover || STREAM_COVERS[s.id]; s.tags = s.tags || STREAM_TAGS[s.id] || [s.category]; s.description = s.description || s.prd.value; s.feedback = s.feedback || []; s.contacts = s.contacts || []; });

// fee to unlock the contact list of people who asked to be notified
const CONTACTS_FEE = 150;

// ---- spotlight auction: a featured slot held by the highest bidder; escrow until outbid ----
const SPOTLIGHT = { ideaId:"loop", holder:"maya", holderName:"Maya Karim", amount:600 };

// ---- wallet transactions (most recent first) ----
const TXNS = [
  { id:"t1", type:"claim",    label:"Daily login bonus",            amount:100,  at:"Today, 8:02am" },
  { id:"t2", type:"invest",   label:"Backed Clipline",              amount:-100, at:"2 days ago" },
  { id:"t3", type:"invest",   label:"Backed Loop",                  amount:-250, at:"4 days ago" },
  { id:"t4", type:"refund",   label:"Outbid on spotlight — refund", amount:400,  at:"5 days ago" },
  { id:"t5", type:"spotlight",label:"Spotlight bid — Standup Solo", amount:-400, at:"6 days ago" },
  { id:"t6", type:"claim",    label:"Daily login bonus",            amount:100,  at:"6 days ago" },
  { id:"t7", type:"bonus",    label:"Signup bonus",                 amount:100,  at:"2 weeks ago" },
];

Object.assign(window, { TAGS, SPOTLIGHT, TXNS, CONTACTS_FEE });

// ---- artifact library: the set of things the chat can produce ----
const ARTIFACT_TYPES = [
  { key:"brief",       title:"Product brief",        desc:"Problem, who it's for, value, features, open questions.", auto:true,
    sections:["Problem","Who it's for","Core value","Features","Open questions"] },
  { key:"problem",     title:"Problem statement",    desc:"The one-paragraph 'why this matters, now.'",
    sections:["The problem","Who feels it","Why now","Cost of doing nothing"] },
  { key:"icp",         title:"ICP & personas",       desc:"Who exactly it's for, in detail.",
    sections:["Primary persona","Their day","Triggers to try","Who it's NOT for"] },
  { key:"positioning", title:"Positioning",          desc:"For X who Y, we're the Z that…",
    sections:["Positioning statement","Category","Key differentiator","Alternatives"] },
  { key:"mvp",         title:"MVP scope",            desc:"The smallest thing worth shipping.",
    sections:["The core loop","Wow moment","In scope for v1","Explicitly out"] },
  { key:"pricing",     title:"Pricing model",        desc:"How it makes money.",
    sections:["Model","Tiers","Willingness to pay","Open risk"] },
  { key:"landing",     title:"Landing page copy",    desc:"Hero, subhead, and the three reasons.",
    sections:["Headline","Subhead","Three reasons","Call to action"] },
  { key:"competitive", title:"Competitive landscape",desc:"Who else is here and the gap.",
    sections:["Direct alternatives","Indirect alternatives","The gap you fill"] },
  { key:"gtm",         title:"Go-to-market",         desc:"First 100 users, honestly.",
    sections:["First channel","The wedge","First 100 users","What we won't do yet"] },
  { key:"brand",       title:"Name & brand",         desc:"Name, tagline, and the feeling.",
    sections:["Name","Tagline","Tone","Look & feel"] },
];

// ---- Quick Ideas: a Reddit-style board of one-line 'someone should build this' posts ----
const QUICK_IDEAS = [
  { id:"q1", title:"Uber for dog walkers you already trust", desc:"Match with walkers your friends actually use, not strangers with a badge.", author:"maya", tag:"Marketplace", upvotes:342, comments:[{ id:"qc1", author:"devon", text:"The trust angle is everything — Rover feels like strangers. I'd use this today.", ago:"3h" },{ id:"qc2", author:"jules", text:"How do you seed the friend graph without it being empty on day one?", ago:"2h" }], upvotes:342, cloned:12, ago:"5h", voted:false },
  { id:"q2", title:"Spotify Wrapped, but for your bank account", desc:"A yearly story of where your money actually went — shareable, a little brutal.", author:"jules", tag:"Fintech", comments:[{ id:"qc3", author:"priya", text:"The 'a little brutal' part is the hook. Make it shareable and it goes viral every December.", ago:"6h" }], upvotes:298, cloned:9, ago:"8h", voted:false },
  { id:"q3", title:"A calendar that says no for you", desc:"", author:"devon", tag:"Productivity", comments:[], upvotes:271, cloned:7, ago:"11h", voted:false },
  { id:"q4", title:"Duolingo for reading the docs", desc:"Turn any framework's documentation into a 5-minute daily streak.", author:"priya", tag:"Education", comments:[{ id:"qc4", author:"noah", text:"I'd hit a streak on the React docs for sure.", ago:"1d" }], upvotes:214, cloned:6, ago:"1d", voted:false },
  { id:"q5", title:"Airbnb for home-cooked dinners", desc:"Eat a real meal in a neighbor's kitchen instead of another delivery.", author:"noah", tag:"Consumer", comments:[], upvotes:188, cloned:5, ago:"1d", voted:false },
  { id:"q6", title:"An AI that files your expenses by watching your inbox", desc:"", author:"lena", tag:"AI", comments:[], upvotes:161, cloned:4, ago:"1d", voted:false },
  { id:"q7", title:"Strava for reading books", desc:"Log pages, keep streaks, and get gently peer-pressured by friends.", author:"sam", tag:"Consumer", comments:[{ id:"qc5", author:"maya", text:"The peer pressure is the feature. Solo reading apps never stick.", ago:"2d" }], upvotes:143, cloned:3, ago:"2d", voted:false },
  { id:"q8", title:"Figma but for planning a wedding", desc:"One canvas for the seating, the budget, and the group chat chaos.", author:"maya", tag:"Consumer", comments:[], upvotes:120, cloned:2, ago:"2d", voted:false },
  { id:"q9", title:"A browser extension that summarizes any Zoom you missed", desc:"", author:"jules", tag:"Productivity", comments:[], upvotes:98, cloned:1, ago:"3d", voted:false },
  { id:"q10", title:"Robinhood for buying a stake in your favorite creator", desc:"Back a YouTuber early, share in the upside as they grow. (Play-money, obviously.)", author:"devon", tag:"Creator", comments:[], upvotes:76, cloned:1, ago:"3d", voted:false }];

// ---- per-idea activity / change log (idea tracking) ----
const ACTIVITY = {
  pantry:[
    { id:"a1", type:"chat",    text:"Started chat 'Shaping Pantry'", at:"9 days ago" },
    { id:"a2", type:"memory",  text:"Captured — target is parents who dread the 6pm decision", at:"9 days ago" },
    { id:"a3", type:"change",  text:"Changed the audience", from:"Anyone who cooks at home", to:"Busy parents who cook most nights", at:"8 days ago" },
    { id:"a4", type:"memory",  text:"Captured — pain is decision fatigue, not recipes", at:"8 days ago" },
    { id:"a5", type:"change",  text:"Dropped a feature", from:"Full weekly meal calendar", to:"—", at:"8 days ago", note:"Decided it was scope creep for v1" },
  ],
  standup:[
    { id:"b1", type:"chat",    text:"Started chat 'Pushback mechanics'", at:"1 week ago" },
    { id:"b2", type:"memory",  text:"Captured — solo standups feel pointless without pushback", at:"1 week ago" },
    { id:"b3", type:"change",  text:"Reframed the core value", from:"A daily progress log", to:"A standup that pushes back on what's stuck", at:"6 days ago", note:"Changed their mind: logging isn't the point, accountability is" },
    { id:"b4", type:"artifact",text:"Agent drafted 'MVP scope'", at:"2 days ago" },
    { id:"b5", type:"publish", text:"Published to the stream", at:"3 days ago" },
    { id:"b6", type:"change",  text:"Raised the price point", from:"$5/mo", to:"$8/mo", at:"2 days ago", note:"Public WTP came in higher than expected" },
  ],
  inbox:[
    { id:"c1", type:"chat",    text:"Started chat 'Privacy: local vs cloud'", at:"yesterday" },
    { id:"c2", type:"memory",  text:"Captured — privacy is the dealbreaker", at:"yesterday" },
    { id:"c3", type:"change",  text:"Narrowed the audience", from:"Anyone with a busy inbox", to:"Founders and operators", at:"yesterday" },
  ],
};

Object.assign(window, { ARTIFACT_TYPES, QUICK_IDEAS, ACTIVITY });




Object.assign(window, { USER, ECONOMY, PEOPLE, PRD_SECTIONS, prdComplete, prdProgress, STREAM, STREAM_BY_ID, MY_IDEAS, CHATS, IDEA_CHATS, IDEA_FILES, LEADERBOARD });
