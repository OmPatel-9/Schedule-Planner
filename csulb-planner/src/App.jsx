import { FeaturesSection } from "./components/FeaturesSection";
import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// All prereqs/coreqs taken directly from BMS 2/5/2026 official flowchart
// GE double-counts: taking the major course automatically satisfies that GE area
// ─────────────────────────────────────────────────────────────────────────────

const TRACKS = {
  "ml-ai": {
    label: "Machine Learning / AI", icon: "🤖", color: "#7c3aed", light: "#a855f7",
    required: ["CECS 456"],
    electives: ["CECS 456","CECS 427","CECS 429","CECS 450","CECS 451","CECS 457","CECS 458"],
    needUnits: 12,
  },
  "cybersec": {
    label: "Cybersecurity", icon: "🔐", color: "#0891b2", light: "#22d3ee",
    required: ["CECS 478"],
    electives: ["CECS 478","CECS 303","CECS 456","CECS 457","CECS 474","CECS 479","IS 360"],
    needUnits: 12,
  },
  "software": {
    label: "Software Development", icon: "💻", color: "#059669", light: "#34d399",
    required: ["CECS 323"],
    electives: ["CECS 323","CECS 443","CECS 448","CECS 453","CECS 470","CECS 475"],
    needUnits: 12,
  },
};

// prereqs = must be done BEFORE
// coreqs  = must take SAME semester (or already done)
// geArea  = this course satisfies that GE slot automatically
const COURSES = {
  // ── Lower Division ───────────────────────────────────────────────────────
  "CECS 105":  { title:"Intro to Computer Engineering and Computer Science", units:1, div:"lower", cat:"Core",    prereqs:[],                    coreqs:[] },
  "MATH 122":  { title:"Calculus I",                                         units:4, div:"lower", cat:"Math",    prereqs:[],                    coreqs:[], geArea:"ge-2",  note:"Must pass within first year | GE: 2/B4" },
  "CECS 174":  { title:"Introduction to Programming and Problem Solving",    units:3, div:"lower", cat:"Core",    prereqs:[],                    coreqs:["MATH 122"], note:"Co: MATH 122 | Must pass within first year" },
  "ENGR 101":  { title:"Introduction to the Engineering Profession",         units:1, div:"lower", cat:"Core",    prereqs:[],                    coreqs:["MATH 122"] },
  "PHYS 151":  { title:"Mechanics and Heat",                                 units:4, div:"lower", cat:"Science", prereqs:[],                    coreqs:["MATH 122"], geArea:"ge-5a", note:"Co: MATH 122+ | GE: 5A/B1 & 5C/B3 (satisfies both)" },
  "CHEM 111A": { title:"General Chemistry (alt. to PHYS 151)",               units:5, div:"lower", cat:"Science", prereqs:[],                    coreqs:[], geArea:"ge-5a", note:"Alternative to PHYS 151 | GE: 5A/B1 & 5C/B3" },
  "CECS 225":  { title:"Digital Logic and Assembly Programming",             units:3, div:"lower", cat:"Core",    prereqs:[],                    coreqs:["CECS 174"] },
  "CECS 274":  { title:"Data Structures",                                    units:3, div:"lower", cat:"Core",    prereqs:["CECS 174"],           coreqs:[], note:"CECS majors only" },
  "CECS 277":  { title:"Object Oriented Application Development",            units:3, div:"lower", cat:"Core",    prereqs:["CECS 174"],           coreqs:[], note:"CECS majors only" },
  "CECS 228":  { title:"Discrete Structures with Computing Applications",    units:3, div:"lower", cat:"Core",    prereqs:["MATH 122","CECS 174"],coreqs:[], note:"Pre: MATH 122, CECS 174 | CECS majors only" },
  "ENGR 102":  { title:"Academic Success Skills",                            units:1, div:"lower", cat:"Core",    prereqs:["ENGR 101"],           coreqs:[] },
  "MATH 123":  { title:"Calculus II",                                        units:4, div:"lower", cat:"Math",    prereqs:["MATH 122"],           coreqs:[] },
  "BIOL 200":  { title:"General Biology",                                    units:4, div:"lower", cat:"Science", prereqs:[],                    coreqs:[], geArea:"ge-5b", note:"Approved science elective | GE: 5B/B2" },
  "BIOL 205":  { title:"Human Biology",                                      units:4, div:"lower", cat:"Science", prereqs:[],                    coreqs:[], geArea:"ge-5b", note:"Approved science elective | GE: 5B/B2" },
  "BIOL 207":  { title:"Human Physiology",                                   units:4, div:"lower", cat:"Science", prereqs:[],                    coreqs:[], geArea:"ge-5b", note:"Approved science elective | GE: 5B/B2" },
  "CECS 229":  { title:"Discrete Structures with Computing Applications II", units:3, div:"lower", cat:"Core",    prereqs:["CECS 228"],           coreqs:[] },

  // ── Upper Division Core ──────────────────────────────────────────────────
  "CECS 341":  { title:"Computer Architecture and Organization",             units:3, div:"upper", cat:"Core",    prereqs:["CECS 225"],           coreqs:[] },
  "CECS 325":  { title:"System Programming",                                 units:3, div:"upper", cat:"Core",    prereqs:["CECS 274","CECS 277"],coreqs:[] },
  "CECS 343":  { title:"Introduction to Software Engineering",               units:3, div:"upper", cat:"Core",    prereqs:["CECS 277"],           coreqs:[], note:"Pre: CECS 277" },
  "CECS 328":  { title:"Algorithms",                                         units:3, div:"upper", cat:"Core",    prereqs:["CECS 228","CECS 274"],coreqs:[], note:"Pre: CECS 228, CECS 274" },
  "CECS 381":  { title:"Stochastic Computing",                               units:3, div:"upper", cat:"Math",    prereqs:["CECS 229"],           coreqs:[], note:"Pre: CECS 229 | OR take EE 381 instead" },
  "EE 381":    { title:"Probability & Statistics (alt. to CECS 381)",        units:3, div:"upper", cat:"Math",    prereqs:["CECS 229"],           coreqs:[], note:"Alternative to CECS 381" },
  "CECS 326":  { title:"Operating Systems",                                  units:3, div:"upper", cat:"Core",    prereqs:["CECS 325","CECS 341"],coreqs:[], note:"Pre: CECS 325, CECS 341" },
  "CECS 342":  { title:"Principles of Programming Languages",                units:3, div:"upper", cat:"Core",    prereqs:["CECS 328"],           coreqs:[] },
  "CECS 329":  { title:"Concepts of Computer Science Theory",                units:3, div:"upper", cat:"Core",    prereqs:["CECS 328"],           coreqs:[] },
  "CECS 378":  { title:"Introduction to Computer Security Principles",       units:3, div:"upper", cat:"Core",    prereqs:["CECS 229","CECS 274"],coreqs:[], note:"Pre: CECS 229, CECS 274" },
  "CECS 327":  { title:"Introduction to Networks and Distributed Computing", units:3, div:"upper", cat:"Core",    prereqs:["CECS 326"],           coreqs:[] },
  "ENGR 350":  { title:"Computers, Ethics and Society",                      units:3, div:"upper", cat:"Core",    prereqs:[],                    coreqs:[], geArea:"ge-ud-c", note:"Pre: 60+ units | GE: UD-C (double-counts)" },
  "ENGR 361":  { title:"Scientific Research Communication (WI)",             units:3, div:"upper", cat:"Core",    prereqs:[],                    coreqs:[], geArea:"ge-wi",  note:"Pre: GE Foundations + 60u+ | Writing Intensive (GWAR)" },
  "ENGR 390":  { title:"Info & Comm Tech for Sustainability (WI, alt.)",     units:3, div:"upper", cat:"Core",    prereqs:[],                    coreqs:[], geArea:"ge-wi",  note:"Alternative to ENGR 361 | Writing Intensive" },
  "CECS 491A": { title:"Computer Science Senior Project I",                  units:3, div:"upper", cat:"Capstone",prereqs:["CECS 343","ENGR 350"],coreqs:["CECS 328"], geArea:"ge-ud-b", note:"Pre: CECS 343, ENGR 350 | Co: CECS 328 | GE: UD-B" },
  "CECS 491B": { title:"Computer Science Senior Project II",                 units:3, div:"upper", cat:"Capstone",prereqs:["CECS 491A"],          coreqs:[] },

  // ── ML/AI Track ──────────────────────────────────────────────────────────
  "CECS 456":  { title:"Machine Learning",               units:3, div:"upper", cat:"Track", tracks:["ml-ai","cybersec"], prereqs:["CECS 328","CECS 381"], coreqs:[], note:"★ Required for ML/AI track" },
  "CECS 427":  { title:"Dynamic Networks",               units:3, div:"upper", cat:"Track", tracks:["ml-ai"],           prereqs:["CECS 328","CECS 229"], coreqs:[], geArea:"ge-ud-d", note:"GE: UD-D double-count (optional)" },
  "CECS 429":  { title:"Search Engine Technology",       units:3, div:"upper", cat:"Track", tracks:["ml-ai"],           prereqs:["CECS 323","CECS 328"], coreqs:[] },
  "CECS 450":  { title:"Data Visualization",             units:3, div:"upper", cat:"Track", tracks:["ml-ai"],           prereqs:["CECS 343"],           coreqs:[] },
  "CECS 451":  { title:"Artificial Intelligence",        units:3, div:"upper", cat:"Track", tracks:["ml-ai"],           prereqs:["CECS 277","CECS 328"], coreqs:[] },
  "CECS 457":  { title:"Applied Machine Learning",       units:3, div:"upper", cat:"Track", tracks:["ml-ai","cybersec"],prereqs:["CECS 456"],            coreqs:[] },
  "CECS 458":  { title:"Deep Learning",                  units:3, div:"upper", cat:"Track", tracks:["ml-ai"],           prereqs:["CECS 456"],            coreqs:[] },

  // ── Cybersecurity Track ───────────────────────────────────────────────────
  "CECS 478":  { title:"Introduction to Computer Security",       units:3, div:"upper", cat:"Track", tracks:["cybersec"],prereqs:["CECS 328"],           coreqs:[], note:"★ Required for Cybersecurity track | Pre: CECS 328" },
  "CECS 303":  { title:"Networks and Network Security",           units:3, div:"upper", cat:"Track", tracks:["cybersec"],prereqs:["CECS 229","CECS 274"], coreqs:[] },
  "CECS 474":  { title:"Computer Network Interoperability",       units:3, div:"upper", cat:"Track", tracks:["cybersec"],prereqs:["CECS 326"],            coreqs:[] },
  "CECS 479":  { title:"Penetration Testing",                     units:3, div:"upper", cat:"Track", tracks:["cybersec"],prereqs:["CECS 378"],            coreqs:[] },
  "IS 360":    { title:"Cybersecurity in Business",               units:3, div:"upper", cat:"Track", tracks:["cybersec"],prereqs:[],                     coreqs:[] },

  // ── Software Dev Track ────────────────────────────────────────────────────
  "CECS 323":  { title:"Database Fundamentals",                   units:3, div:"upper", cat:"Track", tracks:["software"],prereqs:["CECS 228","CECS 277"], coreqs:[], note:"★ Required for Software Dev track" },
  "CECS 443":  { title:"Software Project Management and Testing", units:3, div:"upper", cat:"Track", tracks:["software"],prereqs:["CECS 343"],            coreqs:[] },
  "CECS 448":  { title:"User Interface Design",                   units:3, div:"upper", cat:"Track", tracks:["software"],prereqs:["CECS 343"],            coreqs:[] },
  "CECS 453":  { title:"Mobile Application Development",          units:3, div:"upper", cat:"Track", tracks:["software"],prereqs:["CECS 328"],            coreqs:[] },
  "CECS 470":  { title:"Web Programming and Accessibility",       units:3, div:"upper", cat:"Track", tracks:["software"],prereqs:["CECS 323","CECS 343"], coreqs:[] },
  "CECS 475":  { title:"Software Development with Frameworks",    units:3, div:"upper", cat:"Track", tracks:["software"],prereqs:["CECS 343"],            coreqs:[] },

  // ── CS Free Electives (6u) ────────────────────────────────────────────────
  "CECS 406":  { title:"Selected Topics in Computer Science",    units:3, div:"upper", cat:"CSElective", prereqs:[],                    coreqs:[], note:"Senior standing" },
  "CECS 419":  { title:"Theory of Computation",                  units:3, div:"upper", cat:"CSElective", prereqs:["CECS 328"],           coreqs:[] },
  "CECS 428":  { title:"Analysis of Algorithms",                 units:3, div:"upper", cat:"CSElective", prereqs:["CECS 328"],           coreqs:[] },
  "CECS 444":  { title:"Compiler Construction",                  units:3, div:"upper", cat:"CSElective", prereqs:["CECS 328","CECS 342"],coreqs:[] },
  "CECS 449":  { title:"Computer Graphics",                      units:3, div:"upper", cat:"CSElective", prereqs:["CECS 328","CECS 229"],coreqs:[] },
  "CECS 455":  { title:"Introduction to Game Programming",       units:3, div:"upper", cat:"CSElective", prereqs:["CECS 274"],           coreqs:[] },
  "CECS 461":  { title:"Hardware/Software Co-design",            units:3, div:"upper", cat:"CSElective", prereqs:["CECS 341"],           coreqs:[] },
  "CECS 480":  { title:"Quantum Computation",                    units:3, div:"upper", cat:"CSElective", prereqs:["CECS 328"],           coreqs:[] },
  "CECS 495":  { title:"Computational Physiology",               units:3, div:"upper", cat:"CSElective", prereqs:[],                    coreqs:[] },
  "CECS 497":  { title:"Directed Studies",                       units:3, div:"upper", cat:"CSElective", prereqs:[],                    coreqs:[], note:"Consent of instructor" },
  "MATH 323":  { title:"Introduction to Numerical Analysis",     units:4, div:"upper", cat:"CSElective", prereqs:["MATH 123"],           coreqs:[] },
};

// GE requirements — courses with geArea auto-satisfy their slot
// standalone = needs a separate class (not double-counted)
const GE_REQS = [
  { id:"ge-1a",   area:"1A / A2", label:"English Composition",                    units:3, div:"lower", standalone:true,  satisfiedBy:null },
  { id:"ge-1b",   area:"1B / A3", label:"Critical Thinking",                      units:3, div:"lower", standalone:false, satisfiedBy:"Waived for Engineering majors", waived:true },
  { id:"ge-1c",   area:"1C / A1", label:"Oral Communication",                     units:3, div:"lower", standalone:true,  satisfiedBy:null },
  { id:"ge-2",    area:"2 / B4",  label:"Mathematics",                            units:3, div:"lower", standalone:false, satisfiedBy:"MATH 122 (major course)" },
  { id:"ge-3a",   area:"3A / C1", label:"Arts",                                   units:3, div:"lower", standalone:true,  satisfiedBy:null },
  { id:"ge-3b",   area:"3B / C2", label:"Humanities",                             units:3, div:"lower", standalone:true,  satisfiedBy:null },
  { id:"ge-4a",   area:"4A / D1", label:"U.S. History",                           units:3, div:"lower", standalone:false, satisfiedBy:"HIST 172 or HIST 173" },
  { id:"ge-4b",   area:"4B / D2", label:"U.S. Constitution & American Ideals",    units:3, div:"lower", standalone:false, satisfiedBy:"POSC 100" },
  { id:"ge-5a",   area:"5A+5C",   label:"Physical Science + Lab",                 units:4, div:"lower", standalone:false, satisfiedBy:"PHYS 151 or CHEM 111A (major course)" },
  { id:"ge-5b",   area:"5B / B2", label:"Biological Science",                     units:3, div:"lower", standalone:false, satisfiedBy:"BIOL 200, 205, or 207" },
  { id:"ge-6",    area:"6 / F",   label:"Ethnic Studies",                         units:3, div:"lower", standalone:true,  satisfiedBy:null },
  { id:"ge-ud-b", area:"UD-B",    label:"Upper Div: Science / Math",              units:3, div:"upper", standalone:false, satisfiedBy:"CECS 491A (major course)" },
  { id:"ge-ud-c", area:"UD-C",    label:"Upper Div: Arts or Humanities",          units:3, div:"upper", standalone:false, satisfiedBy:"ENGR 350 (major course)" },
  { id:"ge-ud-d", area:"UD-D",    label:"Upper Div: Social & Behavioral Sciences",units:3, div:"upper", standalone:false, satisfiedBy:"CECS 427 (if taken) or separate course" },
  { id:"ge-wi",   area:"WI/GWAR", label:"Writing Intensive",                      units:3, div:"upper", standalone:false, satisfiedBy:"ENGR 361 or ENGR 390 (major course)" },
];

// Which course IDs auto-satisfy each GE slot
const GE_AUTO_SATISFY = {
  "ge-2":    ["MATH 122"],
  "ge-5a":   ["PHYS 151","CHEM 111A"],
  "ge-5b":   ["BIOL 200","BIOL 205","BIOL 207"],
  "ge-ud-b": ["CECS 491A"],
  "ge-ud-c": ["ENGR 350"],
  "ge-ud-d": ["CECS 427"],
  "ge-wi":   ["ENGR 361","ENGR 390"],
};

const CAT_STYLE = {
  Core:       { bg:"#0d1830", border:"#2563eb", text:"#93c5fd", badge:"#1d4ed8" },
  Math:       { bg:"#0d1f0d", border:"#16a34a", text:"#86efac", badge:"#15803d" },
  Science:    { bg:"#1a1500", border:"#ca8a04", text:"#fde047", badge:"#a16207" },
  Track:      { bg:"#1a0830", border:"#7c3aed", text:"#c4b5fd", badge:"#6d28d9" },
  CSElective: { bg:"#081820", border:"#0891b2", text:"#67e8f9", badge:"#0e7490" },
  Capstone:   { bg:"#220a08", border:"#dc2626", text:"#fca5a5", badge:"#b91c1c" },
};

const SEMESTERS = ["Fall 2024","Spring 2025","Fall 2025","Spring 2026","Fall 2026","Spring 2027"];

export default function App() {
  const [track, setTrack] = useState("ml-ai");
  const [tab,   setTab]   = useState("dashboard");

  const [completed, setCompleted] = useState(new Set([
    "CECS 105","CECS 174","CECS 225","CECS 228","CECS 229",
    "CECS 274","CECS 277","ENGR 101","ENGR 102",
    "MATH 122","MATH 123","PHYS 151",
  ]));

  // Standalone GE courses (ones that don't double-count with major)
  const [geStandalone, setGeStandalone] = useState(new Set(["ge-1a","ge-1c","ge-3a","ge-3b"]));

  const [plan, setPlan] = useState({
    "Fall 2025":   ["CECS 325","CECS 328","CECS 341","CECS 343"],
    "Spring 2026": ["CECS 326","CECS 378","CECS 381","CECS 456"],
  });
  const [hover, setHover] = useState(null);

  const ti = TRACKS[track];
  const plannedSet = useMemo(()=>new Set(Object.values(plan).flat()),[plan]);
  const allDone    = useMemo(()=>new Set([...completed,...plannedSet]),[completed,plannedSet]);

  // Auto-compute which GE areas are satisfied
  const geSatisfied = useMemo(()=>{
    const sat = new Set(geStandalone);
    // waived
    sat.add("ge-1b");
    // auto from major courses
    Object.entries(GE_AUTO_SATISFY).forEach(([geId, courseIds])=>{
      if (courseIds.some(id=>completed.has(id)||plannedSet.has(id))) sat.add(geId);
    });
    return sat;
  },[geStandalone, completed, plannedSet]);

  const geTotal = useMemo(()=>{
    return [...geSatisfied].reduce((s,id)=>{ const g=GE_REQS.find(x=>x.id===id); return s+(g?.units||0); },0);
  },[geSatisfied]);

  const completedUnits = useMemo(()=>[...completed].reduce((s,id)=>s+(COURSES[id]?.units||0),0),[completed]);
  const plannedUnits   = useMemo(()=>Object.values(plan).flat().reduce((s,id)=>s+(COURSES[id]?.units||0),0),[plan]);

  const isAvail = (id) => {
    if (completed.has(id)||plannedSet.has(id)) return false;
    const c = COURSES[id]; if (!c) return false;
    return c.prereqs.every(p=>completed.has(p)) && c.coreqs.every(p=>completed.has(p)||plannedSet.has(p));
  };
  const availNow = useMemo(()=>Object.keys(COURSES).filter(id=>isAvail(id)),[completed,plannedSet]);

  const trackDoneUnits = ti.electives.filter(id=>completed.has(id)||plannedSet.has(id)).reduce((s,id)=>s+(COURSES[id]?.units||0),0);
  const totalUnits  = completedUnits + plannedUnits;
  const compPct     = Math.min(100, completedUnits/120*100);
  const projPct     = Math.min(100, totalUnits/120*100);

  const toggleDone   = (id)  => setCompleted(p=>{ const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleGeStand= (id)  => setGeStandalone(p=>{ const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const semOf        = (id)  => Object.entries(plan).find(([,cs])=>cs.includes(id))?.[0];
  const addToPlan    = (id,sem) => setPlan(p=>{ const n={...p}; Object.keys(n).forEach(s=>{n[s]=n[s].filter(c=>c!==id)}); n[sem]=[...(n[sem]||[]),id]; return n; });
  const removePlan   = (id,sem) => setPlan(p=>({...p,[sem]:(p[sem]||[]).filter(c=>c!==id)}));

  const TABS = [
    {id:"dashboard", label:"Overview"},
    {id:"track",     label:`${ti.icon} Track`},
    {id:"available", label:"Available Now"},
    {id:"prereqs",   label:"Prereq Map"},
    {id:"plan",      label:"Semester Plan"},
    {id:"ge",        label:"GE Requirements"},
  ];

  const MiniCard = ({id}) => {
    const c=COURSES[id]; if(!c)return null;
    const col=CAT_STYLE[c.cat];
    const done=completed.has(id), avail=isAvail(id), inPlan=plannedSet.has(id), locked=!done&&!avail&&!inPlan;
    const isTrack=ti.electives.includes(id), semP=semOf(id);
    const pre=c.prereqs.map(p=>({id:p,met:completed.has(p)}));
    const co=c.coreqs.map(p=>({id:p,met:completed.has(p)||plannedSet.has(p)}));
    return(
      <div className="cc"
        style={{background:done?col.bg:"#080f1c",borderColor:done?col.border:inPlan?ti.color+"99":avail?"#0f380f":"#0c1820",opacity:locked?.4:1}}
        onClick={()=>toggleDone(id)} onMouseEnter={()=>setHover(id)} onMouseLeave={()=>setHover(null)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:600,color:done?col.text:"#4a7090",marginBottom:2}}>{id}</div>
            <div style={{fontSize:10,color:done?"#7aa8c0":"#2e4050",lineHeight:1.4}}>{c.title}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
            <span className="badge" style={{background:done?col.badge:"#0e1d2e",color:done?"#fff":"#2e4a68"}}>{c.units}u</span>
            {done   &&<span style={{fontSize:11,color:col.text}}>✓</span>}
            {avail  &&!done&&<span className="badge" style={{background:"#0b2a0b",color:"#4ade80"}}>AVAIL</span>}
            {inPlan &&!done&&<span className="badge" style={{background:ti.color+"22",color:ti.light}}>PLANNED</span>}
            {c.geArea&&<span className="badge" style={{background:"#182610",color:"#a3e635"}}>GE ✓</span>}
            {isTrack&&<span style={{fontSize:9}}>{ti.icon}</span>}
          </div>
        </div>
        {hover===id&&(pre.length>0||co.length>0||c.note)&&(
          <div style={{marginTop:7,borderTop:"1px solid #0e1c2c",paddingTop:6}}>
            {pre.length>0&&<div style={{marginBottom:4}}>
              <span style={{fontSize:9,color:"#2e4e70",letterSpacing:".06em"}}>PRE: </span>
              {pre.map(p=><span key={p.id} className="tag" style={{color:p.met?"#4ade80":"#f87171",marginRight:3}}>{p.met?"✓":"✗"} {p.id}</span>)}
            </div>}
            {co.length>0&&<div style={{marginBottom:4}}>
              <span style={{fontSize:9,color:"#92400e",letterSpacing:".06em"}}>CO: </span>
              {co.map(p=><span key={p.id} className="tag" style={{color:p.met?"#fb923c":"#fbbf24",borderColor:"#2a1a05",marginRight:3}}>◐ {p.id}</span>)}
            </div>}
            {c.note&&<div style={{fontSize:9,color:"#3a4a5a",fontStyle:"italic"}}>{c.note}</div>}
          </div>
        )}
      </div>
    );
  };

  return(
    <>
      <FeaturesSection />
    <div style={{fontFamily:"'IBM Plex Mono',monospace",background:"#060b15",minHeight:"100vh",color:"#b8cce4"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#08111f}::-webkit-scrollbar-thumb{background:#1e3354;border-radius:3px}
        .tab{background:none;border:none;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:12px;padding:7px 13px;border-radius:5px;transition:all .18s;color:#4a6a9a}
        .tab:hover{background:#0d1c2e;color:#7aa0cc}.tab.on{background:#112036;color:#60a5fa}
        .cc{border-radius:8px;padding:10px 12px;border:1px solid transparent;transition:all .18s;cursor:pointer}
        .cc:hover{transform:translateY(-1px);filter:brightness(1.08)}
        .btn{border:none;cursor:pointer;font-family:'IBM Plex Mono',monospace;border-radius:5px;font-size:11px;padding:4px 9px;transition:all .14s}
        .btn:hover{opacity:.85;transform:translateY(-1px)}
        .badge{display:inline-block;font-size:9px;padding:2px 6px;border-radius:3px;font-weight:600;letter-spacing:.05em}
        .pbar{height:5px;border-radius:3px;background:#0e1d2e;overflow:hidden}
        .pfill{height:100%;border-radius:3px;transition:width .5s ease}
        .stcard{background:#091525;border:1px solid #112030;border-radius:10px;padding:14px 16px}
        .stitle{font-size:10px;letter-spacing:.12em;color:#2e4e70;margin-bottom:7px;text-transform:uppercase}
        .tag{display:inline-flex;align-items:center;background:#0b1828;border:1px solid #182d42;border-radius:3px;padding:2px 6px;font-size:10px;gap:3px}
        .semcol{background:#07111e;border:1px solid #112030;border-radius:9px;padding:12px;min-height:130px}
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        .ai{animation:fi .25s ease forwards}
        .tpill{border-radius:8px;padding:12px 14px;cursor:pointer;border:2px solid transparent;transition:all .2s}
        .tpill:hover{filter:brightness(1.1)}
        .dot{width:6px;height:6px;border-radius:50%;display:inline-block}
      `}</style>

      {/* Header */}
      <div style={{background:"#06101c",borderBottom:"1px solid #0e1c2c",padding:"0 18px"}}>
        <div style={{maxWidth:1160,margin:"0 auto",display:"flex",alignItems:"center",height:54,gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{width:28,height:28,background:`linear-gradient(135deg,${ti.color},#1a3080)`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🎓</div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"#ddeeff"}}>CSULB CS Planner</div>
              <div style={{fontSize:9,color:ti.light,letterSpacing:".08em"}}>{ti.icon} {ti.label.toUpperCase()} · 2025–2026</div>
            </div>
          </div>
          <div style={{display:"flex",gap:2,flex:1,flexWrap:"wrap"}}>
            {TABS.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}
          </div>
          <div style={{display:"flex",gap:5,flexShrink:0}}>
            {Object.entries(TRACKS).map(([id,t])=>(
              <button key={id} className="btn"
                style={{background:track===id?t.color+"33":"#0b1825",color:track===id?t.light:"#3a5a82",border:`1px solid ${track===id?t.color:"#182d40"}`}}
                onClick={()=>setTrack(id)}>{t.icon} {t.label.split(" ")[0]}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1160,margin:"0 auto",padding:"22px 18px"}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div className="ai">
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
              {[
                {label:"Major Units Done",  val:completedUnits,    total:120, color:"#2563eb"},
                {label:"Units Planned",     val:plannedUnits,      total:120, color:ti.color},
                {label:"GE Areas Done",     val:geSatisfied.size,  total:GE_REQS.length, color:"#059669"},
                {label:"Track Progress",    val:trackDoneUnits,    total:12,  color:ti.light},
                {label:"Now Available",     val:availNow.length,   total:null,color:"#f59e0b"},
              ].map(s=>(
                <div key={s.label} className="stcard">
                  <div className="stitle">{s.label}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:s.color,lineHeight:1}}>
                    {s.val}{s.total?<span style={{fontSize:12,color:"#1e3050",fontWeight:400}}>/{s.total}</span>:""}
                  </div>
                  {s.total&&<div className="pbar" style={{marginTop:7}}><div className="pfill" style={{width:`${Math.min(100,s.val/s.total*100)}%`,background:s.color}}/></div>}
                </div>
              ))}
            </div>

            <div style={{background:"#091525",border:"1px solid #112030",borderRadius:10,padding:"14px 18px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,color:"#c0d8ff"}}>Graduation Progress</div>
                <div style={{fontSize:10,color:"#2e4e70"}}>{totalUnits} / 120 units · {Math.max(0,120-totalUnits)} remaining</div>
              </div>
              <div className="pbar" style={{height:8,position:"relative"}}>
                <div className="pfill" style={{width:`${compPct}%`,background:"linear-gradient(90deg,#1a3fa8,#2563eb)",position:"absolute",left:0,top:0,height:"100%"}}/>
                <div style={{position:"absolute",left:`${compPct}%`,width:`${projPct-compPct}%`,height:"100%",background:ti.color+"44",borderRight:`2px dashed ${ti.color}`}}/>
              </div>
              <div style={{display:"flex",gap:16,marginTop:7,fontSize:10,color:"#2e4e70"}}>
                <span><span className="dot" style={{background:"#2563eb",marginRight:4}}/>Completed ({completedUnits}u)</span>
                <span><span className="dot" style={{background:ti.color+"88",marginRight:4}}/>Planned ({plannedUnits}u)</span>
              </div>
            </div>

            <div style={{fontSize:10,background:"#07111e",border:"1px solid #0e1c2c",borderRadius:6,padding:"7px 11px",marginBottom:14,color:"#3a5a82"}}>
              💡 Hover any card to see prereqs/coreqs · Click to mark complete · <span style={{color:"#a3e635"}}>GE ✓</span> = this course automatically satisfies a GE area
            </div>

            {["Core","Math","Science","Track","CSElective","Capstone"].map(cat=>{
              const catC=Object.entries(COURSES).filter(([,c])=>c.cat===cat);
              if(!catC.length)return null;
              const col=CAT_STYLE[cat];
              const doneN=catC.filter(([id])=>completed.has(id)).length;
              const labels={Core:"Core Required",Math:"Math / Stats",Science:"Science Electives",Track:`Track Electives — ${ti.label}`,CSElective:"CS Free Electives (pick 6u)",Capstone:"Capstone"};
              return(
                <div key={cat} style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:col.text,letterSpacing:".1em",marginBottom:6,display:"flex",alignItems:"center",gap:7}}>
                    <span className="dot" style={{background:col.badge}}/>{labels[cat].toUpperCase()} — {doneN}/{catC.length}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:6}}>
                    {catC.map(([id])=><MiniCard key={id} id={id}/>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TRACK ══ */}
        {tab==="track"&&(
          <div className="ai">
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
              {Object.entries(TRACKS).map(([id,t])=>(
                <div key={id} className="tpill"
                  style={{background:track===id?t.color+"22":"#091525",borderColor:track===id?t.color:"#112030",border:"2px solid"}}
                  onClick={()=>setTrack(id)}>
                  <div style={{fontSize:22,marginBottom:5}}>{t.icon}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:track===id?t.light:"#5a80a0",marginBottom:4}}>{t.label}</div>
                  <div style={{fontSize:10,color:"#2e4e70",lineHeight:1.6}}>
                    <strong style={{color:track===id?"#fff":"#4a6a9a"}}>★ Required:</strong> {t.required[0]}<br/>
                    <strong style={{color:"#2e4e70"}}>+ 9u from:</strong> {t.electives.filter(e=>!t.required.includes(e)).join(", ")}
                  </div>
                </div>
              ))}
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:"#ddeeff",marginBottom:4}}>{ti.icon} {ti.label} — {trackDoneUnits}/12 units</div>
            <div className="pbar" style={{height:7,marginBottom:20}}><div className="pfill" style={{width:`${Math.min(100,trackDoneUnits/12*100)}%`,background:`linear-gradient(90deg,${ti.color},${ti.light})`}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
              {ti.electives.map(id=>{
                const c=COURSES[id]; if(!c)return null;
                const done=completed.has(id),avail=isAvail(id),inPlan=plannedSet.has(id),isReq=ti.required.includes(id),semP=semOf(id);
                const pre=c.prereqs.map(p=>({id:p,met:completed.has(p)}));
                const co=c.coreqs.map(p=>({id:p,met:completed.has(p)||plannedSet.has(p)}));
                return(
                  <div key={id} style={{background:done?"#1a0830":"#090e1c",border:`1px solid ${done?ti.color:isReq?ti.color+"66":"#112030"}`,borderRadius:10,padding:14}}>
                    <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                      <span className="badge" style={{background:ti.color,color:"#fff"}}>{id}</span>
                      <span className="badge" style={{background:"#0e1d2e",color:"#3a5a82"}}>{c.units}u</span>
                      {isReq&&<span className="badge" style={{background:"#2a0808",color:"#f87171",border:"1px solid #4a1010"}}>★ REQUIRED</span>}
                      {c.geArea&&<span className="badge" style={{background:"#182610",color:"#a3e635"}}>GE ✓</span>}
                      {done&&<span style={{color:ti.light,fontSize:14,marginLeft:"auto"}}>✓</span>}
                    </div>
                    <div style={{fontSize:13,color:done?ti.light:"#7090b0",marginBottom:8,fontWeight:500}}>{c.title}</div>
                    {pre.length>0&&<div style={{marginBottom:6}}>
                      <div style={{fontSize:9,color:"#2e4e70",marginBottom:3}}>PREREQUISITES</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{pre.map(p=><span key={p.id} className="tag" style={{color:p.met?"#4ade80":"#f87171"}}>{p.met?"✓":"✗"} {p.id}</span>)}</div>
                    </div>}
                    {co.length>0&&<div style={{marginBottom:8}}>
                      <div style={{fontSize:9,color:"#92400e",marginBottom:3}}>COREQUISITES (same semester ok)</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{co.map(p=><span key={p.id} className="tag" style={{color:p.met?"#fb923c":"#fbbf24",borderColor:"#2a1a05"}}>◐ {p.id}</span>)}</div>
                    </div>}
                    {c.note&&<div style={{fontSize:9,color:"#3a4a5a",marginBottom:8,fontStyle:"italic"}}>{c.note}</div>}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      <button className="btn" onClick={()=>toggleDone(id)} style={{background:done?"#1e0808":"#0e1d2e",color:done?"#f87171":"#60a5fa",border:`1px solid ${done?"#3a1010":"#1e3050"}`}}>
                        {done?"✗ Undo":"✓ Mark Done"}
                      </button>
                      {!done&&avail&&SEMESTERS.slice(2).map(s=>(
                        <button key={s} className="btn"
                          style={{background:semP===s?ti.color:"#091525",color:semP===s?"#fff":"#2e4e70",border:`1px solid ${semP===s?ti.color:"#112030"}`}}
                          onClick={()=>semP===s?removePlan(id,s):addToPlan(id,s)}>
                          {semP===s?"✓ ":"+ "}{s.split(" ")[0][0]}{s.split(" ")[1].slice(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ AVAILABLE ══ */}
        {tab==="available"&&(
          <div className="ai">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#ddeeff",marginBottom:4}}>Classes You Can Enroll Next Semester</div>
            <div style={{fontSize:11,color:"#2e4e70",marginBottom:18}}>{availNow.length} courses unlocked</div>
            {availNow.length===0
              ?<div style={{background:"#091525",border:"1px solid #112030",borderRadius:10,padding:40,textAlign:"center",color:"#2e4e70"}}>No new courses available — mark more as completed in Overview.</div>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                {availNow.map(id=>{
                  const c=COURSES[id]; const col=CAT_STYLE[c.cat];
                  const isTrack=ti.electives.includes(id), semP=semOf(id);
                  const pre=c.prereqs.map(p=>({id:p,met:true}));
                  const co=c.coreqs.map(p=>({id:p,met:completed.has(p)||plannedSet.has(p)}));
                  return(
                    <div key={id} style={{background:col.bg,border:`1px solid ${isTrack?ti.color:col.border}`,borderRadius:10,padding:14,boxShadow:isTrack?`0 0 14px ${ti.color}22`:"none"}}>
                      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                        <span className="badge" style={{background:col.badge,color:"#fff"}}>{id}</span>
                        <span className="badge" style={{background:"#0e1d2e",color:"#3a5a82"}}>{c.units}u</span>
                        {isTrack&&<span className="badge" style={{background:ti.color+"33",color:ti.light,border:`1px solid ${ti.color}`}}>TRACK {ti.icon}</span>}
                        {c.geArea&&<span className="badge" style={{background:"#182610",color:"#a3e635"}}>GE ✓</span>}
                        <span className="badge" style={{background:"#0b2a0b",color:"#4ade80",marginLeft:"auto"}}>READY ✓</span>
                      </div>
                      <div style={{fontSize:12,color:col.text,fontWeight:500,marginBottom:8}}>{c.title}</div>
                      {pre.length>0&&<div style={{marginBottom:co.length?6:8}}>
                        <div style={{fontSize:9,color:"#2e4e70",marginBottom:3}}>PREREQS MET</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{pre.map(p=><span key={p.id} className="tag" style={{color:"#4ade80"}}>✓ {p.id}</span>)}</div>
                      </div>}
                      {co.length>0&&<div style={{marginBottom:8}}>
                        <div style={{fontSize:9,color:"#92400e",marginBottom:3}}>COREQS — add to same semester</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{co.map(p=><span key={p.id} className="tag" style={{color:p.met?"#fb923c":"#fbbf24",borderColor:"#2a1a05"}}>◐ {p.id}{!p.met&&" ⚠"}</span>)}</div>
                      </div>}
                      {c.note&&<div style={{fontSize:9,color:"#3a4a5a",marginBottom:8,fontStyle:"italic"}}>{c.note}</div>}
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {SEMESTERS.slice(1).map(s=>(
                          <button key={s} className="btn"
                            style={{background:semP===s?"#1d4ed8":"#0e1d2e",color:semP===s?"#fff":"#2e4e70",border:`1px solid ${semP===s?"#2563eb":"#1e3050"}`}}
                            onClick={()=>semP===s?removePlan(id,s):addToPlan(id,s)}>
                            {semP===s?"✓ ":"+ "}{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        )}

        {/* ══ PREREQS ══ */}
        {tab==="prereqs"&&(
          <div className="ai">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#ddeeff",marginBottom:4}}>Prerequisite & Corequisite Map</div>
            <div style={{fontSize:11,color:"#2e4e70",marginBottom:16}}>
              <span style={{color:"#f87171"}}>✗ red</span> = missing prereq &nbsp;·&nbsp;
              <span style={{color:"#fbbf24"}}>○ yellow</span> = missing coreq (can plan same semester) &nbsp;·&nbsp;
              <span style={{color:"#4ade80"}}>✓ green</span> = satisfied
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div>
                <div className="stitle" style={{marginBottom:8}}>🔒 Locked</div>
                {Object.entries(COURSES).filter(([id])=>!completed.has(id)&&!isAvail(id)&&!plannedSet.has(id)).map(([id,c])=>{
                  const missPre=c.prereqs.filter(p=>!completed.has(p));
                  const missCo=c.coreqs.filter(p=>!completed.has(p)&&!plannedSet.has(p));
                  return(
                    <div key={id} style={{background:"#07111e",border:"1px solid #0e1c2c",borderRadius:7,padding:"9px 11px",marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:(missPre.length||missCo.length)?6:0}}>
                        <div><span style={{fontSize:11,fontWeight:600,color:"#3a5870"}}>{id}</span><span style={{fontSize:9,color:"#1e3040",marginLeft:7}}>{c.title}</span></div>
                        <span className="badge" style={{background:"#180505",color:"#f87171",border:"1px solid #360d0d",flexShrink:0}}>locked</span>
                      </div>
                      {missPre.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:3}}>
                        <span style={{fontSize:9,color:"#2e4e70"}}>NEED: </span>
                        {missPre.map(p=><span key={p} className="tag" style={{color:"#f87171",borderColor:"#280a0a"}}>✗ {p}</span>)}
                      </div>}
                      {missCo.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:9,color:"#92400e"}}>CO: </span>
                        {missCo.map(p=><span key={p} className="tag" style={{color:"#fbbf24",borderColor:"#2a1a05"}}>○ {p}</span>)}
                      </div>}
                    </div>
                  );
                })}
              </div>
              <div>
                <div className="stitle" style={{marginBottom:8}}>🔓 Available now</div>
                {availNow.map(id=>{
                  const c=COURSES[id]; const col=CAT_STYLE[c.cat]; const isTrack=ti.electives.includes(id);
                  const unlocks=Object.entries(COURSES).filter(([,oc])=>(oc.prereqs.includes(id)||oc.coreqs.includes(id))&&!completed.has(id)&&!isAvail(id));
                  return(
                    <div key={id} style={{background:col.bg,border:`1px solid ${isTrack?ti.color:col.border}`,borderRadius:7,padding:"9px 11px",marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:unlocks.length?6:0}}>
                        <span style={{fontSize:11,fontWeight:600,color:col.text}}>{id}{isTrack&&` ${ti.icon}`} <span style={{fontWeight:400,fontSize:9,color:"#3a5870"}}>{c.title}</span></span>
                        <span className="badge" style={{background:"#0b2a0b",color:"#4ade80",flexShrink:0}}>ready</span>
                      </div>
                      {unlocks.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        <span style={{fontSize:9,color:"#2e4e70"}}>unlocks: </span>
                        {unlocks.map(([uid])=><span key={uid} className="tag" style={{color:ti.electives.includes(uid)?ti.light:"#818cf8",borderColor:"#1a1838"}}>→ {uid}</span>)}
                      </div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PLAN ══ */}
        {tab==="plan"&&(
          <div className="ai">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#ddeeff",marginBottom:4}}>Multi-Semester Plan</div>
            <div style={{fontSize:11,color:"#2e4e70",marginBottom:18}}>{plannedUnits} units planned · coreqs must be in the same semester</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
              {SEMESTERS.map(sem=>{
                const sc=plan[sem]||[]; const su=sc.reduce((s,id)=>s+(COURSES[id]?.units||0),0); const over=su>16;
                return(
                  <div key={sem} className="semcol">
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,letterSpacing:".08em",color:"#3a5a82",textTransform:"uppercase"}}>{sem}</div>
                      <span className="badge" style={{background:over?"#180505":"#0e1d2e",color:over?"#f87171":"#2e4e70",border:`1px solid ${over?"#360d0d":"#1e3050"}`}}>{su}u{over?" ⚠":""}</span>
                    </div>
                    {sc.length===0
                      ?<div style={{fontSize:10,color:"#1e3050",textAlign:"center",padding:"14px 0"}}>No courses planned</div>
                      :sc.map(id=>{
                        const c=COURSES[id]; if(!c)return null;
                        const col=CAT_STYLE[c.cat]; const isTrack=ti.electives.includes(id);
                        return(
                          <div key={id} style={{background:col.bg,border:`1px solid ${isTrack?ti.color:col.border}`,borderRadius:6,padding:"7px 9px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{minWidth:0}}>
                              <div style={{fontSize:11,color:col.text,fontWeight:600}}>{id}{isTrack&&` ${ti.icon}`}</div>
                              <div style={{fontSize:9,color:"#2e4050",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                            </div>
                            <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0,marginLeft:6}}>
                              <span className="badge" style={{background:col.badge,color:"#fff"}}>{c.units}u</span>
                              <button className="btn" style={{background:"#180505",color:"#f87171",border:"1px solid #360d0d",padding:"2px 5px"}} onClick={()=>removePlan(id,sem)}>✕</button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
            <div style={{background:"#091525",border:"1px solid #112030",borderRadius:10,padding:14}}>
              <div className="stitle">Quick-add available courses</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {availNow.filter(id=>!plannedSet.has(id)).map(id=>{
                  const c=COURSES[id]; const col=CAT_STYLE[c.cat]; const isTrack=ti.electives.includes(id);
                  return(
                    <div key={id} style={{display:"flex",alignItems:"center",gap:5,background:col.bg,border:`1px solid ${isTrack?ti.color:col.border}`,borderRadius:6,padding:"5px 8px"}}>
                      <span style={{fontSize:11,color:col.text,fontWeight:600}}>{id}</span>
                      <span style={{fontSize:9,color:"#2e4e70"}}>{c.units}u</span>
                      {isTrack&&<span style={{fontSize:10}}>{ti.icon}</span>}
                      {SEMESTERS.slice(1).map(s=>(
                        <button key={s} className="btn" style={{background:"#0e1d2e",color:"#2e4e70",border:"1px solid #182d40",fontSize:10,padding:"2px 5px"}} onClick={()=>addToPlan(id,s)}>+{s.split(" ")[0][0]}{s.split(" ")[1].slice(2)}</button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ GE ══ */}
        {tab==="ge"&&(
          <div className="ai">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#ddeeff",marginBottom:4}}>GE Requirements</div>
            <div style={{fontSize:11,color:"#2e4e70",marginBottom:10}}>{geSatisfied.size}/{GE_REQS.length} areas satisfied · {geTotal} units</div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
              <div style={{background:"#0c1a08",border:"1px solid #182e10",borderRadius:8,padding:"10px 14px",fontSize:11,color:"#4a7a3a",lineHeight:1.7}}>
                <div style={{fontWeight:600,color:"#a3e635",marginBottom:4}}>✓ Auto-satisfied by major courses</div>
                These GE areas are covered by courses you're already taking — no extra class needed:<br/>
                GE 2/B4 → MATH 122 &nbsp;·&nbsp; 5A+5C → PHYS 151 &nbsp;·&nbsp; 5B → BIOL 2xx<br/>
                UD-B → CECS 491A &nbsp;·&nbsp; UD-C → ENGR 350 &nbsp;·&nbsp; WI → ENGR 361/390<br/>
                UD-D → CECS 427 (if taken) &nbsp;·&nbsp; 4A → HIST 172/173 &nbsp;·&nbsp; 4B → POSC 100
              </div>
              <div style={{background:"#1a1208",border:"1px solid #2e2010",borderRadius:8,padding:"10px 14px",fontSize:11,color:"#7a6a3a",lineHeight:1.7}}>
                <div style={{fontWeight:600,color:"#f59e0b",marginBottom:4}}>★ Standalone classes you still need</div>
                These require separate courses not covered by your major:<br/>
                1A/A2: English Composition &nbsp;·&nbsp; 1C/A1: Oral Communication<br/>
                3A/C1: Arts &nbsp;·&nbsp; 3B/C2: Humanities &nbsp;·&nbsp; 6/F: Ethnic Studies<br/>
                <span style={{color:"#4a6a9a"}}>1B/A3: Critical Thinking — waived for Engineering ✓</span>
              </div>
            </div>

            <div className="stitle" style={{marginBottom:8}}>Lower Division — 34 units</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:7,marginBottom:20}}>
              {GE_REQS.filter(g=>g.div==="lower").map(ge=>{
                const autoSat = !ge.standalone && !ge.waived;
                const done = geSatisfied.has(ge.id);
                const canToggle = ge.standalone && !ge.waived;
                return(
                  <div key={ge.id}
                    style={{background:done?"#091e0a":"#08121f",border:`1px solid ${done?"#14532a":ge.waived?"#2a2000":"#112030"}`,borderRadius:8,padding:"10px 12px",cursor:canToggle?"pointer":"default"}}
                    onClick={()=>canToggle&&toggleGeStand(ge.id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:10,color:done?"#4ade80":ge.waived?"#ca8a04":"#2e4e70",letterSpacing:".05em",marginBottom:2}}>{ge.area}</div>
                        <div style={{fontSize:12,color:done?"#86efac":ge.waived?"#fde047":"#4a6a8a",fontWeight:500}}>{ge.label}</div>
                        {ge.satisfiedBy&&<div style={{fontSize:10,color:autoSat?"#a3e635":"#6a8a4a",marginTop:3}}>
                          {autoSat?"= ":"→ "}{ge.satisfiedBy}
                        </div>}
                        {ge.waived&&<div style={{fontSize:10,color:"#ca8a04",marginTop:3}}>⚡ Waived for Engineering</div>}
                        {ge.standalone&&!ge.waived&&!done&&<div style={{fontSize:9,color:"#f87171",marginTop:3}}>⚠ Need a separate course</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                        <span className="badge" style={{background:done?"#14532a":ge.waived?"#2a1a00":"#0e1d2e",color:done?"#4ade80":ge.waived?"#fde047":"#2e4e70"}}>{ge.units}u</span>
                        {done&&<span style={{fontSize:11,color:"#4ade80"}}>✓</span>}
                        {canToggle&&<span style={{fontSize:9,color:"#2e4e70"}}>click</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="stitle" style={{marginBottom:8}}>Upper Division — 9 units + WI</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:7}}>
              {GE_REQS.filter(g=>g.div==="upper").map(ge=>{
                const done=geSatisfied.has(ge.id);
                const isUdD = ge.id==="ge-ud-d";
                return(
                  <div key={ge.id}
                    style={{background:done?"#091e0a":"#08121f",border:`1px solid ${done?"#14532a":"#112030"}`,borderRadius:8,padding:"10px 12px",cursor:isUdD?"pointer":"default"}}
                    onClick={()=>isUdD&&toggleGeStand(ge.id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:10,color:done?"#4ade80":"#2e4e70",letterSpacing:".05em",marginBottom:2}}>{ge.area}</div>
                        <div style={{fontSize:12,color:done?"#86efac":"#4a6a8a",fontWeight:500}}>{ge.label}</div>
                        {ge.satisfiedBy&&<div style={{fontSize:10,color:"#a3e635",marginTop:3}}>= {ge.satisfiedBy}</div>}
                        {!done&&!isUdD&&<div style={{fontSize:9,color:"#4ade80",marginTop:3}}>Auto-satisfied when major course completed</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                        <span className="badge" style={{background:done?"#14532a":"#0e1d2e",color:done?"#4ade80":"#2e4e70"}}>{ge.units}u</span>
                        {done&&<span style={{fontSize:11,color:"#4ade80"}}>✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
}