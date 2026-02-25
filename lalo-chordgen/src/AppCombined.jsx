import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";

// ─── Shared Store ─────────────────────────────────────────────────────────────

const SECTION_COLORS = {
  Verse:"#2d5a8e", Chorus:"#6b2d8e", Bridge:"#8e6b2d",
  "Pre-Chorus":"#2d8e6b", Intro:"#3d3d6b", Outro:"#6b3d3d",
  Hook:"#8e2d5a", Break:"#4a4a4a",
};
const MODE_COLORS = {
  Ionian:"#60c0f0", Dorian:"#60d0a0", Phrygian:"#e06060",
  Lydian:"#f0c040", Mixolydian:"#80e060", Aeolian:"#8080e0", Locrian:"#c040c0",
};
const ALL_MODES = [
  { name:"Ionian",     tensionLevel:"low",    brightness:"bright", emotionalQuality:"Happy, triumphant",      typicalUse:"Pop, classical" },
  { name:"Dorian",     tensionLevel:"medium", brightness:"neutral",emotionalQuality:"Cool, introspective",    typicalUse:"Jazz, folk, rock" },
  { name:"Phrygian",   tensionLevel:"high",   brightness:"dark",   emotionalQuality:"Dark, Spanish, dramatic",typicalUse:"Flamenco, metal" },
  { name:"Lydian",     tensionLevel:"medium", brightness:"bright", emotionalQuality:"Ethereal, magical",      typicalUse:"Film, jazz, prog" },
  { name:"Mixolydian", tensionLevel:"medium", brightness:"neutral",emotionalQuality:"Laid-back, bluesy",      typicalUse:"Rock, blues" },
  { name:"Aeolian",    tensionLevel:"medium", brightness:"dark",   emotionalQuality:"Sad, contemplative",     typicalUse:"Ballads, rock" },
  { name:"Locrian",    tensionLevel:"high",   brightness:"dark",   emotionalQuality:"Unsettling, dissonant",  typicalUse:"Experimental" },
];
const MODAL_PROGRESSIONS = [
  { mode:"Dorian",     degrees:[1,4,7,4], feel:"Jazzy, soulful" },
  { mode:"Phrygian",   degrees:[1,2,7,1], feel:"Dark, Spanish" },
  { mode:"Lydian",     degrees:[1,2,5,1], feel:"Ethereal" },
  { mode:"Mixolydian", degrees:[1,7,4,1], feel:"Groovy, bluesy" },
  { mode:"Aeolian",    degrees:[1,6,4,5], feel:"Melancholic" },
];
const PATTERNS = [
  { id:"pop_1-5-6-4",  name:"I–V–vi–IV",  degrees:["1","5","6","4"], qualities:["Maj","Maj","min","Maj"] },
  { id:"jazz_ii-v-i",  name:"ii–V–I",     degrees:["2","5","1"],     qualities:["min7","dom7","Maj7"] },
  { id:"blues_12bar",  name:"I–IV–I–V",   degrees:["1","4","1","5"], qualities:["dom7","dom7","dom7","dom7"] },
  { id:"andalusian",   name:"vi–V–IV–III", degrees:["6","5","4","3"], qualities:["min","Maj","Maj","Maj"] },
  { id:"circle",       name:"vi–ii–V–I",  degrees:["6","2","5","1"], qualities:["min7","min7","dom7","Maj7"] },
];
const CADENCES = [
  { id:"perfect_authentic", name:"Perfect Authentic", type:"authentic", strength:"strong",   emotionalQuality:"Final, conclusive",    degrees:["5","1"]      },
  { id:"plagal",            name:"Plagal (Amen)",     type:"plagal",    strength:"moderate", emotionalQuality:"Gentle, peaceful",     degrees:["4","1"]      },
  { id:"half",              name:"Half Cadence",      type:"half",      strength:"weak",     emotionalQuality:"Open, suspenseful",    degrees:["4","5"]      },
  { id:"deceptive",         name:"Deceptive",         type:"deceptive", strength:"weak",     emotionalQuality:"Surprising, yearning", degrees:["5","6"]      },
  { id:"jazz_ii_v_i",       name:"Jazz ii–V–I",       type:"jazz",      strength:"strong",   emotionalQuality:"Sophisticated",        degrees:["2","5","1"]  },
  { id:"phrygian_modal",    name:"Phrygian Modal",    type:"modal",     strength:"moderate", emotionalQuality:"Exotic, Spanish",      degrees:["1","b2","1"] },
];
const TRANSITION_TYPES = [
  { id:"v_i",       label:"V → I",      desc:"Dominant resolution",    color:"#f87171" },
  { id:"iv_i",      label:"IV → I",     desc:"Plagal / subdominant",   color:"#34d399" },
  { id:"ii_v_i",    label:"ii–V–I",     desc:"Full jazz cadence",      color:"#fbbf24" },
  { id:"pivot",     label:"Pivot",      desc:"Chromatic pivot chord",  color:"#38bdf8" },
  { id:"parallel",  label:"Parallel",   desc:"Parallel major/minor",   color:"#e879f9" },
  { id:"keychange", label:"Key ↑",      desc:"Direct modulation up",   color:"#fb923c" },
  { id:"deceptive", label:"Deceptive",  desc:"V → vi surprise",        color:"#f472b6" },
  { id:"none",      label:"Cut",        desc:"Direct cut",             color:"#2a2a3a" },
];
const KEYS_12 = ["C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B"];
const SECTION_TYPES_LIST = ["Verse","Chorus","Bridge","Pre-Chorus","Intro","Outro","Hook","Break"];

let _uid = 100;
const mkId = () => `s${_uid++}`;
const mkTid = () => `t${_uid++}`;

const mkSection = (type, extra = {}) => ({
  id: mkId(), type, label: type,
  bars: 8, key: "", mode: "", bpm: "", notes: "", pattern: "", cadence: "",
  // canvas position (used in canvas view)
  x: 60 + Math.random() * 300, y: 60 + Math.random() * 200,
  collapsed: false,
  ...extra,
});

const mkTransition = (fromId, toId) => ({
  id: mkTid(), fromId, toId, type: "v_i", bars: 2,
});

// Context
const StoreCtx = createContext(null);
function StoreProvider({ children }) {
  const [sections, setSections] = useState([
    mkSection("Intro",   { bars:4, key:"E", mode:"Phrygian", bpm:"76", x:40,  y:80  }),
    mkSection("Verse",   { bars:8, key:"E", mode:"Phrygian", x:380, y:60  }),
    mkSection("Chorus",  { bars:8, key:"E", mode:"Aeolian",  x:720, y:80  }),
    mkSection("Bridge",  { bars:4, key:"G", mode:"Dorian",   x:1060,y:60  }),
    mkSection("Chorus",  { bars:8, key:"E", mode:"Aeolian",  x:1340,y:80  }),
  ]);
  const [transitions, setTransitions] = useState([]);

  // Keep transitions in sync with section order
  useEffect(() => {
    setTransitions(prev => {
      const next = [];
      for (let i = 0; i < sections.length - 1; i++) {
        const from = sections[i].id, to = sections[i+1].id;
        const ex = prev.find(t => t.fromId===from && t.toId===to);
        next.push(ex || mkTransition(from, to));
      }
      return next;
    });
  }, [sections.map(s=>s.id).join(",")]);

  const updateSection = useCallback((id, patch) =>
    setSections(ss => ss.map(s => s.id===id ? {...s,...patch} : s)), []);
  const deleteSection = useCallback((id) =>
    setSections(ss => ss.filter(s => s.id!==id)), []);
  const addSection = useCallback((type) =>
    setSections(ss => [...ss, mkSection(type)]), []);
  const reorderSections = useCallback((from, to) =>
    setSections(ss => {
      const next = [...ss];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    }), []);
  const updateTransition = useCallback((id, patch) =>
    setTransitions(ts => ts.map(t => t.id===id ? {...t,...patch} : t)), []);

  return (
    <StoreCtx.Provider value={{ sections, transitions, updateSection, deleteSection, addSection, reorderSections, updateTransition }}>
      {children}
    </StoreCtx.Provider>
  );
}
const useStore = () => useContext(StoreCtx);

// ─── Mode Map ─────────────────────────────────────────────────────────────────

const TENSION_V  = { low:0.15, medium:0.50, high:0.85 };
const BRIGHT_V   = { dark:0.10, neutral:0.50, bright:0.90 };

function ModeMap({ selected, onSelect }) {
  const W=300, H=180;
  return (
    <svg width={W} height={H} style={{display:"block"}}>
      <line x1={W/2} y1={5} x2={W/2} y2={H-5} stroke="#131320" strokeWidth={1}/>
      <line x1={5} y1={H/2} x2={W-5} y2={H/2} stroke="#131320" strokeWidth={1}/>
      {ALL_MODES.map(m => {
        const x = BRIGHT_V[m.brightness] * (W-60) + 30;
        const y = (1-TENSION_V[m.tensionLevel]) * (H-60) + 30;
        const color = MODE_COLORS[m.name]||"#aaa";
        const sel = selected===m.name;
        return (
          <g key={m.name} transform={`translate(${x},${y})`} onClick={()=>onSelect(m.name)} style={{cursor:"pointer"}}>
            {sel && <circle r={22} fill="none" stroke={color} strokeWidth={1} strokeDasharray="3 2" opacity={0.5}/>}
            <circle r={sel?14:10} fill={color+(sel?"28":"14")} stroke={color} strokeWidth={sel?2:1}/>
            <circle r={3} fill={color} opacity={sel?1:0.5}/>
            <text y={sel?26:22} textAnchor="middle" fill={sel?color:color+"99"}
              fontSize={sel?10:9} fontFamily="'DM Mono',monospace">{m.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Canvas Card ──────────────────────────────────────────────────────────────

function CanvasCard({ section, onUpdate, onDelete, zoom, onOpenMap, connectMode, isSource }) {
  const [dragging, setDragging] = useState(false);
  const [editLabel, setEditLabel] = useState(false);
  const drag0 = useRef(null);
  const color = SECTION_COLORS[section.type]||"#444";
  const modeColor = section.mode ? (MODE_COLORS[section.mode]||color) : color;
  const modeData = ALL_MODES.find(m=>m.name===section.mode);
  const progs = modeData ? MODAL_PROGRESSIONS.filter(p=>p.mode===modeData.name) : [];

  const onMouseDown = (e) => {
    if (e.target.closest(".nd")) return;
    e.stopPropagation();
    setDragging(true);
    drag0.current = { mx:e.clientX, my:e.clientY, cx:section.x, cy:section.y };
  };
  useEffect(()=>{
    if (!dragging) return;
    const mv=(e)=>onUpdate({x:drag0.current.cx+(e.clientX-drag0.current.mx)/zoom,y:drag0.current.cy+(e.clientY-drag0.current.my)/zoom});
    const up=()=>setDragging(false);
    window.addEventListener("mousemove",mv); window.addEventListener("mouseup",up);
    return()=>{ window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); };
  },[dragging,zoom]);

  return (
    <div onMouseDown={onMouseDown} style={{
      position:"absolute", left:section.x, top:section.y, width:280,
      cursor:dragging?"grabbing":"grab", userSelect:"none", zIndex:dragging?999:1,
      filter:`drop-shadow(0 0 ${dragging?16:5}px ${modeColor}18) drop-shadow(0 2px 8px #0008)`,
      outline: connectMode ? (isSource?"2px solid #4ade80":"1px dashed #38bdf822") : "none",
      borderRadius:8,
    }}>
      <div style={{
        background:"linear-gradient(160deg,#0b0e15 0%,#070a10 100%)",
        border:`1px solid ${color}33`, borderTop:`2px solid ${color}`,
        borderRadius:8, boxShadow:section.mode?`inset 0 0 20px ${modeColor}06`:"none",
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",borderBottom:"1px solid #ffffff05"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:color}}/>
            {editLabel
              ? <input className="nd" autoFocus value={section.label} onChange={e=>onUpdate({label:e.target.value})} onBlur={()=>setEditLabel(false)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")setEditLabel(false);}} style={{background:"transparent",border:"none",borderBottom:`1px solid ${color}`,color:"#ccc",fontSize:11,fontFamily:"'DM Mono',monospace",outline:"none",width:100}}/>
              : <span onDoubleClick={()=>setEditLabel(true)} style={{color:"#bbb",fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.04em"}}>{section.label}</span>
            }
            {section.key && <span style={{fontSize:8,color:"#4ade80aa",background:"#1a2a1a",border:"1px solid #4ade8015",borderRadius:3,padding:"1px 4px",fontFamily:"'DM Mono',monospace"}}>{section.key}</span>}
          </div>
          <div className="nd" style={{display:"flex",gap:4,alignItems:"center"}}>
            {section.bpm && <span style={{fontSize:9,color:"#333",fontFamily:"'DM Mono',monospace"}}>{section.bpm}♩</span>}
            <button onClick={()=>onUpdate({collapsed:!section.collapsed})} style={{background:"none",border:"none",color:"#2a2a3a",cursor:"pointer",fontSize:11,padding:2}}>{section.collapsed?"▸":"▾"}</button>
            <button onClick={onDelete} style={{background:"none",border:"none",color:"#1e1e1e",cursor:"pointer",fontSize:13,padding:2}}>×</button>
          </div>
        </div>

        {!section.collapsed && (
          <div style={{padding:"8px 10px"}}>
            {/* Quick row */}
            <div className="nd" style={{display:"flex",gap:5,marginBottom:8}}>
              <input value={section.bpm} onChange={e=>onUpdate({bpm:e.target.value})} placeholder="BPM"
                style={{width:44,background:"#0b0e15",border:"1px solid #141420",borderRadius:3,color:"#777",padding:"2px 5px",fontSize:10,fontFamily:"'DM Mono',monospace",outline:"none"}}/>
              <select value={section.key} onChange={e=>onUpdate({key:e.target.value})}
                style={{background:"#0b0e15",border:"1px solid #141420",borderRadius:3,color:section.key?"#4ade80":"#2a2a3a",padding:"2px 4px",fontSize:10,fontFamily:"'DM Mono',monospace",cursor:"pointer",outline:"none",flex:1}}>
                <option value="">Key</option>
                {KEYS_12.map(k=><option key={k} value={k}>{k}</option>)}
              </select>
              <input value={section.bars} onChange={e=>onUpdate({bars:Math.max(1,parseInt(e.target.value)||1)})} placeholder="bars"
                style={{width:36,background:"#0b0e15",border:"1px solid #141420",borderRadius:3,color:"#777",padding:"2px 5px",fontSize:10,fontFamily:"'DM Mono',monospace",outline:"none"}}
                title="Bars"/>
            </div>

            {/* Mode selector */}
            <div className="nd" style={{marginBottom:7}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:4}}>
                {ALL_MODES.map(m=>(
                  <button key={m.name} onClick={()=>onUpdate({mode:section.mode===m.name?"":m.name})}
                    style={{padding:"2px 6px",borderRadius:3,fontSize:9,cursor:"pointer",
                      background:section.mode===m.name?MODE_COLORS[m.name]+"22":"transparent",
                      border:`1px solid ${section.mode===m.name?MODE_COLORS[m.name]:"#141420"}`,
                      color:section.mode===m.name?MODE_COLORS[m.name]:"#2a2a3a",
                      fontFamily:"'DM Mono',monospace"}}>
                    {m.name}
                  </button>
                ))}
                <button onClick={()=>onOpenMap()} style={{padding:"2px 6px",borderRadius:3,fontSize:9,cursor:"pointer",background:"transparent",border:"1px dashed #1e1e2e",color:"#2a2a3a",fontFamily:"'DM Mono',monospace"}}>map</button>
              </div>
              {section.mode && modeData && (
                <div style={{fontSize:9,color:modeColor+"66",fontFamily:"'DM Mono',monospace"}}>
                  {modeData.emotionalQuality}
                </div>
              )}
              {progs.length>0 && (
                <div style={{display:"flex",gap:3,marginTop:4,flexWrap:"wrap"}}>
                  {progs.map((p,i)=>(
                    <span key={i} style={{fontSize:9,color:modeColor+"55",background:modeColor+"0a",border:`1px solid ${modeColor}15`,borderRadius:2,padding:"1px 5px",fontFamily:"'DM Mono',monospace"}}>
                      {p.degrees.join("–")}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bars display */}
            <div className="nd" style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:9,color:"#252535",fontFamily:"'DM Mono',monospace"}}>bars</span>
              <div style={{display:"flex",gap:2,flex:1}}>
                {Array.from({length:Math.min(section.bars,16)}).map((_,i)=>(
                  <div key={i} style={{flex:1,height:4,background:color+"33",borderRadius:1}}/>
                ))}
                {section.bars>16 && <span style={{fontSize:8,color:"#252535",fontFamily:"'DM Mono',monospace"}}>+{section.bars-16}</span>}
              </div>
              <span style={{fontSize:9,color:"#252535",fontFamily:"'DM Mono',monospace"}}>{section.bars}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Canvas View ──────────────────────────────────────────────────────────────

function CanvasView() {
  const { sections, transitions, updateSection, deleteSection, addSection, updateTransition } = useStore();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const [panning, setPanning] = useState(false);
  const panRef = useRef(null);
  const canvasRef = useRef(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);
  const [transPick, setTransPick] = useState(null);
  const [mapFor, setMapFor] = useState(null); // section id for mode map

  const onBgDown=(e)=>{
    if (e.target!==canvasRef.current && !e.target.closest("svg.bsvg")) return;
    setPanning(true);
    panRef.current={mx:e.clientX,my:e.clientY,px:pan.x,py:pan.y};
  };
  useEffect(()=>{
    if (!panning) return;
    const mv=(e)=>setPan({x:panRef.current.px+e.clientX-panRef.current.mx,y:panRef.current.py+e.clientY-panRef.current.my});
    const up=()=>setPanning(false);
    window.addEventListener("mousemove",mv); window.addEventListener("mouseup",up);
    return()=>{ window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); };
  },[panning]);
  useEffect(()=>{
    const el=canvasRef.current; if (!el) return;
    const wh=(e)=>{ e.preventDefault(); setZoom(z=>Math.max(0.3,Math.min(2.5,z*(e.deltaY<0?1.08:0.93)))); };
    el.addEventListener("wheel",wh,{passive:false});
    return()=>el.removeEventListener("wheel",wh);
  },[]);

  const handleCardClick=(id)=>{
    if (!connectMode) return;
    if (!connectFrom){ setConnectFrom(id); return; }
    if (connectFrom!==id){ setTransPick({from:connectFrom,to:id}); setConnectFrom(null); }
  };

  return (
    <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>
      {/* Canvas */}
      <div ref={canvasRef} onMouseDown={onBgDown} style={{
        flex:1,position:"relative",overflow:"hidden",cursor:panning?"grabbing":"default",
        backgroundImage:`radial-gradient(circle,#111420 1px,transparent 1px)`,
        backgroundSize:`${20*zoom}px ${20*zoom}px`,
        backgroundPosition:`${pan.x%(20*zoom)}px ${pan.y%(20*zoom)}px`,
      }}>
        {/* Connection SVG */}
        <svg className="bsvg" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}>
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#38bdf844"/>
            </marker>
          </defs>
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {transitions.map((tr,i)=>{
              const from=sections.find(s=>s.id===tr.fromId), to=sections.find(s=>s.id===tr.toId);
              if (!from||!to) return null;
              const ttype=TRANSITION_TYPES.find(t=>t.id===tr.type)||TRANSITION_TYPES[0];
              const fx=from.x+140, fy=from.y+36, tx=to.x+140, ty=to.y+36;
              const cy=Math.min(fy,ty)-40;
              return (
                <g key={i}>
                  <path d={`M${fx},${fy} Q${(fx+tx)/2},${cy} ${tx},${ty}`}
                    stroke={ttype.color+"33"} strokeWidth={1.5} fill="none"
                    strokeDasharray="5 3" markerEnd="url(#arr)"/>
                  <text x={(fx+tx)/2} y={cy+10} textAnchor="middle"
                    fill={ttype.color+"55"} fontSize={9} fontFamily="'DM Mono',monospace">
                    {ttype.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Cards */}
        <div style={{position:"absolute",inset:0,transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,transformOrigin:"0 0"}}>
          {sections.map(s=>(
            <div key={s.id} onClick={()=>handleCardClick(s.id)}>
              <CanvasCard
                section={s}
                onUpdate={p=>updateSection(s.id,p)}
                onDelete={()=>deleteSection(s.id)}
                zoom={zoom}
                onOpenMap={()=>setMapFor(s.id)}
                connectMode={connectMode}
                isSource={connectFrom===s.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mode map panel */}
      {mapFor && (
        <div style={{width:340,background:"#06080f",borderLeft:"1px solid #0e1018",padding:14,flexShrink:0,overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:9,color:"#2a2a5a",letterSpacing:"0.12em"}}>ASSIGN MODE → {sections.find(s=>s.id===mapFor)?.label}</span>
            <button onClick={()=>setMapFor(null)} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:14}}>×</button>
          </div>
          <ModeMap
            selected={sections.find(s=>s.id===mapFor)?.mode||""}
            onSelect={m=>{ updateSection(mapFor,{mode:m}); setMapFor(null); }}
          />
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
            {ALL_MODES.map(m=>(
              <div key={m.name} onClick={()=>{ updateSection(mapFor,{mode:m.name}); setMapFor(null); }}
                style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:4,cursor:"pointer",background:"#0a0d14",border:`1px solid ${MODE_COLORS[m.name]}15`}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=MODE_COLORS[m.name]+"44"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=MODE_COLORS[m.name]+"15"}>
                <div style={{width:6,height:6,borderRadius:"50%",background:MODE_COLORS[m.name],flexShrink:0}}/>
                <span style={{fontSize:10,color:MODE_COLORS[m.name],fontFamily:"'DM Mono',monospace",flex:1}}>{m.name}</span>
                <span style={{fontSize:9,color:"#333",fontFamily:"'DM Mono',monospace"}}>{m.emotionalQuality}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect transition picker */}
      {transPick && (
        <div style={{position:"fixed",inset:0,background:"#000b",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setTransPick(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#06080f",border:"1px solid #141420",borderRadius:10,padding:16,width:250}}>
            <div style={{color:"#2a2a5a",fontSize:9,letterSpacing:"0.14em",marginBottom:10}}>TRANSITION TYPE</div>
            {TRANSITION_TYPES.map(t=>(
              <button key={t.id} onClick={()=>{
                // Find the existing transition between these two sections and update its type
                const existing = transitions.find(tr => tr.fromId===transPick.from && tr.toId===transPick.to);
                if (existing) {
                  updateTransition(existing.id, { type: t.id });
                }
                setTransPick(null); setConnectMode(false);
              }} style={{width:"100%",background:"#090c14",border:`1px solid ${t.color}22`,color:t.color,borderRadius:4,padding:"5px 9px",cursor:"pointer",fontSize:10,fontFamily:"'DM Mono',monospace",textAlign:"left",marginBottom:3}}>
                {t.label} <span style={{opacity:0.4,fontSize:9}}>— {t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas toolbar */}
      <div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6,background:"#06080f",border:"1px solid #0e1018",borderRadius:6,padding:"5px 8px",zIndex:50}}>
        <button onClick={()=>{setConnectMode(!connectMode);setConnectFrom(null);}}
          style={{background:connectMode?"#142014":"transparent",border:`1px solid ${connectMode?"#4ade80":"#1a1a2a"}`,color:connectMode?"#4ade80":"#333",borderRadius:3,padding:"2px 8px",cursor:"pointer",fontSize:9,fontFamily:"'DM Mono',monospace"}}>
          {connectMode?(connectFrom?"↔ pick target":"↔ source"):"↔ connect"}
        </button>
        <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}}
          style={{background:"transparent",border:"1px solid #1a1a2a",color:"#333",borderRadius:3,padding:"2px 8px",cursor:"pointer",fontSize:9}}>reset</button>
        <span style={{fontSize:9,color:"#1e1e2e",padding:"2px 4px",fontFamily:"'DM Mono',monospace"}}>{Math.round(zoom*100)}%</span>
      </div>
    </div>
  );
}

// ─── Timeline View ─────────────────────────────────────────────────────────────

const PX_PER_BAR_DEFAULT = 64;

function TransitionBlock({ tr, onUpdate, pxPerBar }) {
  const [open, setOpen] = useState(false);
  const ttype = TRANSITION_TYPES.find(t=>t.id===tr.type)||TRANSITION_TYPES[0];
  const w = tr.bars * pxPerBar;
  return (
    <div style={{position:"relative",flexShrink:0}}>
      <div onClick={()=>setOpen(!open)} style={{
        width:w, height:72, flexShrink:0,
        background:`linear-gradient(90deg,#07090e 0%,${ttype.color}0a 50%,#07090e 100%)`,
        border:`1px solid ${ttype.color}${open?"55":"22"}`,
        borderRadius:4, cursor:"pointer",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
        transition:"border-color 0.12s",
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=ttype.color+"44"}
        onMouseLeave={e=>{ if(!open) e.currentTarget.style.borderColor=ttype.color+"22"; }}
      >
        <svg width={w} height={72} style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          <polyline points={`4,36 ${w*.38},18 ${w*.62},54 ${w-4},36`}
            fill="none" stroke={ttype.color} strokeWidth={1} opacity={0.18}/>
        </svg>
        <span style={{fontSize:9,color:ttype.color,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",position:"relative"}}>{ttype.label}</span>
        <span style={{fontSize:8,color:ttype.color+"55",fontFamily:"'DM Mono',monospace",position:"relative"}}>{tr.bars}b</span>
      </div>
      {open && (
        <div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",
          width:210,background:"#07090e",border:`1px solid ${ttype.color}33`,borderRadius:8,padding:10,zIndex:200,
          boxShadow:`0 8px 24px #000a`}}>
          <div style={{fontSize:9,color:"#2a2a3a",letterSpacing:"0.1em",marginBottom:7}}>TRANSITION</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:9}}>
            {TRANSITION_TYPES.map(t=>(
              <button key={t.id} onClick={()=>onUpdate({type:t.id})}
                style={{padding:"2px 6px",borderRadius:3,fontSize:9,cursor:"pointer",
                  background:tr.type===t.id?t.color+"22":"transparent",
                  border:`1px solid ${tr.type===t.id?t.color:"#1a1a2a"}`,
                  color:tr.type===t.id?t.color:"#333",fontFamily:"'DM Mono',monospace"}}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:9,color:"#333",fontFamily:"'DM Mono',monospace",flex:1}}>bars</span>
            <button onClick={()=>onUpdate({bars:Math.max(1,tr.bars-1)})}
              style={{background:"none",border:"1px solid #1a1a2a",color:"#444",borderRadius:2,width:20,height:20,cursor:"pointer",fontSize:13,lineHeight:1}}>−</button>
            <span style={{fontSize:13,color:ttype.color,fontFamily:"'DM Mono',monospace",minWidth:14,textAlign:"center"}}>{tr.bars}</span>
            <button onClick={()=>onUpdate({bars:Math.min(16,tr.bars+1)})}
              style={{background:"none",border:"1px solid #1a1a2a",color:"#444",borderRadius:2,width:20,height:20,cursor:"pointer",fontSize:13,lineHeight:1}}>+</button>
          </div>
          <button onClick={()=>setOpen(false)} style={{position:"absolute",top:7,right:9,background:"none",border:"none",color:"#2a2a3a",cursor:"pointer",fontSize:13}}>×</button>
        </div>
      )}
    </div>
  );
}

function TimelineView() {
  const { sections, transitions, updateSection, deleteSection, addSection, reorderSections, updateTransition } = useStore();
  const [pxPerBar, setPxPerBar] = useState(PX_PER_BAR_DEFAULT);
  const [dragIdx, setDragIdx] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);

  const totalBars = sections.reduce((s,sec)=>s+sec.bars,0) + transitions.reduce((s,t)=>s+t.bars,0);

  // Build interleaved sequence
  const sequence = [];
  sections.forEach((s,i)=>{
    sequence.push({kind:"section",data:s,idx:i});
    if (i < sections.length-1) {
      const tr=transitions.find(t=>t.fromId===s.id&&t.toId===sections[i+1].id);
      if (tr) sequence.push({kind:"transition",data:tr});
    }
  });

  // Running bar counter for ruler
  let rulerBar = 1;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Controls */}
      <div style={{height:32,background:"#06080f",borderBottom:"1px solid #0e1018",display:"flex",alignItems:"center",padding:"0 12px",gap:10,flexShrink:0}}>
        <span style={{fontSize:9,color:"#1e1e2e",fontFamily:"'DM Mono',monospace"}}>{totalBars} bars total</span>
        <div style={{flex:1}}/>
        {SECTION_TYPES_LIST.map(t=>{
          const c=SECTION_COLORS[t]||"#444";
          return (
            <button key={t} onClick={()=>addSection(t)}
              style={{padding:"1px 6px",borderRadius:3,fontSize:8,cursor:"pointer",background:"transparent",border:`1px solid ${c}22`,color:c+"55",fontFamily:"'DM Mono',monospace"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=c+"55";e.currentTarget.style.color=c+"99";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=c+"22";e.currentTarget.style.color=c+"55";}}>
              +{t.slice(0,3)}
            </button>
          );
        })}
        <div style={{width:1,height:16,background:"#0e1018",margin:"0 4px"}}/>
        <button onClick={()=>setPxPerBar(p=>Math.max(24,p-8))} style={{background:"none",border:"1px solid #0e1018",color:"#252535",borderRadius:2,width:18,height:18,cursor:"pointer",fontSize:13,lineHeight:1}}>−</button>
        <span style={{fontSize:8,color:"#1e1e2e",fontFamily:"'DM Mono',monospace",minWidth:28,textAlign:"center"}}>{pxPerBar}px</span>
        <button onClick={()=>setPxPerBar(p=>Math.min(128,p+8))} style={{background:"none",border:"1px solid #0e1018",color:"#252535",borderRadius:2,width:18,height:18,cursor:"pointer",fontSize:13,lineHeight:1}}>+</button>
      </div>

      {/* Ruler */}
      <div style={{height:18,background:"#06080f",borderBottom:"1px solid #0e1018",overflowX:"hidden",flexShrink:0}}>
        <div style={{display:"flex",height:"100%",paddingLeft:0}}>
          {sequence.map((item,i)=>{
            if (item.kind==="section") {
              const bars=item.data.bars, w=bars*pxPerBar;
              const ticks=Array.from({length:bars},(_,b)=>rulerBar+b);
              rulerBar+=bars;
              return (
                <div key={i} style={{width:w,flexShrink:0,display:"flex"}}>
                  {ticks.map((n,j)=>(
                    <div key={j} style={{flex:1,borderLeft:"1px solid #0e1018",paddingLeft:2,display:"flex",alignItems:"center"}}>
                      {j%2===0&&<span style={{fontSize:7,color:"#252535",fontFamily:"'DM Mono',monospace"}}>{n}</span>}
                    </div>
                  ))}
                </div>
              );
            } else {
              const w=item.data.bars*pxPerBar;
              rulerBar+=item.data.bars;
              return <div key={i} style={{width:w,flexShrink:0,borderLeft:"1px dashed #0e1018"}}/>;
            }
          })}
        </div>
      </div>

      {/* Track */}
      <div style={{flex:1,overflowX:"auto",overflowY:"hidden",padding:"12px 12px"}}>
        <div style={{display:"flex",alignItems:"stretch",gap:0,height:80,minWidth:"max-content"}}>
          {sequence.map((item,seqIdx)=>{
            if (item.kind==="section") {
              const s=item.data, sIdx=item.idx;
              const w=s.bars*pxPerBar;
              const color=SECTION_COLORS[s.type]||"#444";
              const modeColor=s.mode?(MODE_COLORS[s.mode]||color):color;
              const isDragging=dragIdx===sIdx;
              const isDropTarget=dropIdx===sIdx&&dragIdx!==sIdx;
              return (
                <div key={s.id}
                  draggable
                  onDragStart={e=>{setDragIdx(sIdx);e.dataTransfer.effectAllowed="move";}}
                  onDragEnter={()=>setDropIdx(sIdx)}
                  onDragEnd={()=>{ if(dragIdx!==null&&dropIdx!==null&&dragIdx!==dropIdx)reorderSections(dragIdx,dropIdx); setDragIdx(null);setDropIdx(null); }}
                  onDragOver={e=>e.preventDefault()}
                  style={{
                    width:w, flexShrink:0, opacity:isDragging?0.35:1,
                    outline:isDropTarget?"2px dashed #38bdf833":"none", borderRadius:4,
                    transition:"opacity 0.12s",
                  }}>
                  <div style={{
                    width:"100%", height:80,
                    background:"linear-gradient(160deg,#0b0e15,#070a10)",
                    border:`1px solid ${color}33`, borderTop:`2px solid ${color}`,
                    borderRadius:4, padding:"6px 8px",
                    display:"flex",flexDirection:"column",justifyContent:"space-between",
                    boxShadow:s.mode?`inset 0 0 16px ${modeColor}06`:"none",
                  }}>
                    {/* Bar ticks */}
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,display:"flex",overflow:"hidden",pointerEvents:"none"}}>
                      {Array.from({length:s.bars}).map((_,i)=>(
                        <div key={i} style={{flex:1,borderLeft:i>0?"1px solid #ffffff05":"none"}}/>
                      ))}
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontSize:7,color:"#1e1e2e",cursor:"grab"}}>⠿</span>
                        <div style={{width:5,height:5,borderRadius:"50%",background:color}}/>
                        <span style={{fontSize:10,color:"#aaa",fontFamily:"'DM Mono',monospace"}}>{s.label}</span>
                        {s.key&&<span style={{fontSize:8,color:"#4ade80aa",background:"#1a2a1a",border:"1px solid #4ade8015",borderRadius:2,padding:"0 3px",fontFamily:"'DM Mono',monospace"}}>{s.key}</span>}
                        {s.mode&&<span style={{fontSize:8,color:(MODE_COLORS[s.mode]||"#aaa")+"88",background:(MODE_COLORS[s.mode]||"#333")+"0f",border:`1px solid ${(MODE_COLORS[s.mode]||"#333")}18`,borderRadius:2,padding:"0 3px",fontFamily:"'DM Mono',monospace"}}>{s.mode}</span>}
                      </div>
                      <button onClick={()=>deleteSection(s.id)} style={{background:"none",border:"none",color:"#1e1e2e",cursor:"pointer",fontSize:12,padding:0}}>×</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",gap:2}}>
                        {Array.from({length:Math.min(s.bars,16)}).map((_,i)=>(
                          <div key={i} style={{width:Math.max(2,(w-16)/Math.min(s.bars,16)-2),height:3,background:color+"44",borderRadius:1}}/>
                        ))}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <button onClick={()=>updateSection(s.id,{bars:Math.max(1,s.bars-1)})} style={{background:"none",border:"1px solid #141420",color:"#252535",borderRadius:2,width:14,height:14,cursor:"pointer",fontSize:10,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                        <span style={{fontSize:9,color:"#333",fontFamily:"'DM Mono',monospace",minWidth:16,textAlign:"center"}}>{s.bars}b</span>
                        <button onClick={()=>updateSection(s.id,{bars:Math.min(64,s.bars+1)})} style={{background:"none",border:"1px solid #141420",color:"#252535",borderRadius:2,width:14,height:14,cursor:"pointer",fontSize:10,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              const tr=transitions.find(t=>t.id===item.data.id)||item.data;
              return <TransitionBlock key={tr.id} tr={tr} onUpdate={p=>updateTransition(tr.id,p)} pxPerBar={pxPerBar}/>;
            }
          })}
          <div style={{width:32,flexShrink:0,height:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:1,height:56,background:"#1a1a2a"}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("canvas");

  return (
    <StoreProvider>
      <div style={{width:"100vw",height:"100vh",background:"#050810",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'DM Mono',monospace"}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700&display=swap');
          *{box-sizing:border-box;margin:0;padding:0;}
          select option{background:#0b0e15;color:#888;}
          ::-webkit-scrollbar{height:4px;width:3px;} ::-webkit-scrollbar-track{background:#050810;} ::-webkit-scrollbar-thumb{background:#141420;border-radius:2px;}
        `}</style>

        {/* Top bar */}
        <div style={{height:40,background:"#06080f",borderBottom:"1px solid #0e1018",display:"flex",alignItems:"center",padding:"0 14px",gap:10,flexShrink:0,zIndex:200}}>
          <span style={{fontSize:14,color:"#252545",fontFamily:"'Syne',sans-serif",fontWeight:700,letterSpacing:"0.06em"}}>LALO</span>
          <span style={{fontSize:9,color:"#151525",letterSpacing:"0.2em"}}>·</span>

          {/* View switcher */}
          <div style={{display:"flex",background:"#0a0d14",border:"1px solid #0e1018",borderRadius:4,padding:2,gap:2}}>
            {[["canvas","⬡ canvas"],["timeline","≋ timeline"]].map(([v,label])=>(
              <button key={v} onClick={()=>setView(v)} style={{
                padding:"2px 10px",borderRadius:3,fontSize:9,cursor:"pointer",
                background:view===v?"#14182a":"transparent",
                border:`1px solid ${view===v?"#2a2a5a":"transparent"}`,
                color:view===v?"#6060c0":"#252535",
                fontFamily:"'DM Mono',monospace", transition:"all 0.12s",
              }}>{label}</button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <span style={{fontSize:9,color:"#1e1e2e",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>SONG CANVAS</span>
        </div>

        {view==="canvas" ? <CanvasView/> : <TimelineView/>}
      </div>
    </StoreProvider>
  );
}
