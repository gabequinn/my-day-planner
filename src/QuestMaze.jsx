import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#000;overflow:hidden;user-select:none;}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
  @keyframes pulse{0%,100%{opacity:.65}50%{opacity:1}}
  @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.35)}28%{transform:scale(1)}42%{transform:scale(1.2)}}
  @keyframes slideUp{from{transform:translateY(36px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{transform:scale(0.75);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes tw{0%,100%{opacity:.04}50%{opacity:.92}}
  @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes levelIn{from{transform:scale(1.5);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes bloodPulse{0%,100%{opacity:0}50%{opacity:1}}
`;


/* ══ LEADERBOARD ═══════════════════════════════════════════════
   Stored in localStorage as JSON array, max 5 entries.
   Sorted descending by score. New entry displaces lowest if it
   beats it, or fills an empty slot.
════════════════════════════════════════════════════════════ */
const LB_KEY = 'qa_maze_leaderboard_v1';
const LB_MAX = 5;

function loadLeaderboard() {
  try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; } catch { return []; }
}

function qualifiesForLeaderboard(score) {
  const lb = loadLeaderboard();
  if (lb.length < LB_MAX) return true;
  return score > Math.min(...lb.map(e => e.score));
}

function submitScore(name, score, kidId) {
  let lb = loadLeaderboard();
  const entry = { name: name.trim().toUpperCase().slice(0, 12), score, kidId, date: new Date().toLocaleDateString() };
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score);
  lb = lb.slice(0, LB_MAX);
  try { localStorage.setItem(LB_KEY, JSON.stringify(lb)); } catch {}
  return lb;
}

/* ── LeaderboardTable — shared display component ── */
function LeaderboardTable({ entries, highlightName }) {
  const MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣'];
  const kidColors = { arthur:'#FF69B4', elliot:'#69F0AE', owen:'#FF8C42' };
  return (
    <div style={{ width:'100%', fontFamily:"'Press Start 2P'" }}>
      {entries.length === 0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,.25)', fontSize:'.3rem', padding:'18px 0', lineHeight:2.4 }}>
          No scores yet.<br/>Be the first to escape the maze!
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[...Array(LB_MAX)].map((_, i) => {
            const e = entries[i];
            const isHighlight = e && highlightName && e.name === highlightName.trim().toUpperCase().slice(0,12);
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:10,
                background: isHighlight ? 'rgba(255,215,0,0.12)' : i === 0 ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.03)',
                border: isHighlight ? '1px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius:8, padding:'8px 12px',
                transition:'all .2s',
              }}>
                <span style={{ fontSize:'1rem', width:28, textAlign:'center', flexShrink:0 }}>{MEDALS[i]}</span>
                {e ? (
                  <>
                    <span style={{ color: kidColors[e.kidId] || '#fff', fontSize:'.32rem', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</span>
                    <span style={{ color:'rgba(255,255,255,.3)', fontSize:'.26rem', marginRight:6 }}>{e.kidId?.toUpperCase()}</span>
                    <span style={{ color: isHighlight ? '#FFD700' : '#fff', fontSize:'.48rem', textShadow: isHighlight ? '0 0 10px #FFD700' : 'none', minWidth:40, textAlign:'right' }}>{e.score}</span>
                    <span style={{ color:'rgba(255,255,255,.2)', fontSize:'.22rem', minWidth:48, textAlign:'right' }}>{e.date}</span>
                  </>
                ) : (
                  <span style={{ color:'rgba(255,255,255,.15)', fontSize:'.28rem', flex:1 }}>— empty —</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── ScoreSubmit — name entry + submit ── */
function ScoreSubmit({ score, kidId, onDone }) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lb, setLb] = useState(loadLeaderboard());
  const qualifies = qualifiesForLeaderboard(score);

  function handleSubmit() {
    if (!name.trim()) return;
    const newLb = submitScore(name, score, kidId);
    setLb(newLb);
    setSubmitted(true);
  }

  return (
    <div style={{ width:'100%', maxWidth:480, fontFamily:"'Press Start 2P'" }}>
      {!submitted ? (
        <div style={{ marginBottom:20 }}>
          {qualifies ? (
            <>
              <div style={{ color:'#FFD700', fontSize:'.38rem', marginBottom:14, textAlign:'center', textShadow:'0 0 12px #FFD700' }}>
                🏆 YOU MADE THE LEADERBOARD!
              </div>
              <div style={{ color:'rgba(255,255,255,.5)', fontSize:'.28rem', marginBottom:10, textAlign:'center' }}>ENTER YOUR NAME</div>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input
                  autoFocus
                  maxLength={12}
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key==='Enter' && handleSubmit()}
                  placeholder="YOUR NAME"
                  style={{
                    flex:1, background:'rgba(255,255,255,.07)', border:'2px solid rgba(255,215,0,.5)',
                    borderRadius:8, padding:'10px 14px', color:'#FFD700', fontFamily:"'Press Start 2P'",
                    fontSize:'.42rem', outline:'none', letterSpacing:2,
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  style={{ background: name.trim() ? '#FFD700' : 'rgba(255,215,0,.2)', color:'#000', border:'none', borderRadius:8, padding:'10px 18px', fontFamily:"'Press Start 2P'", fontSize:'.38rem', cursor: name.trim() ? 'pointer' : 'default', transition:'all .15s' }}
                >
                  SUBMIT
                </button>
              </div>
            </>
          ) : (
            <div style={{ color:'rgba(255,150,150,.6)', fontSize:'.3rem', textAlign:'center', marginBottom:14, lineHeight:2 }}>
              Score of {score} didn't make the top {LB_MAX}.<br/>Keep trying!
            </div>
          )}
          <button onClick={onDone} style={{ display:'block', width:'100%', background:'transparent', color:'rgba(255,255,255,.3)', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, padding:'9px', fontFamily:"'Press Start 2P'", fontSize:'.3rem', cursor:'pointer' }}>
            {qualifies ? 'SKIP' : 'BACK TO MENU'}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom:20, textAlign:'center' }}>
          <div style={{ color:'#00ff88', fontSize:'.38rem', marginBottom:12 }}>✅ SCORE SAVED!</div>
          <LeaderboardTable entries={lb} highlightName={name} />
          <button onClick={onDone} style={{ marginTop:14, background:'#FFD700', color:'#000', border:'none', borderRadius:8, padding:'10px 24px', fontFamily:"'Press Start 2P'", fontSize:'.38rem', cursor:'pointer', fontWeight:700 }}>🏠 MENU</button>
        </div>
      )}
      {!submitted && qualifies && <LeaderboardTable entries={lb} />}
    </div>
  );
}

/* ══ QUESTION BANKS ════════════════════════════════════════════ */
const Q = {
  arthur:[
    {q:"What is 3 × 4?",a:"12",c:["10","12","14","9"],d:"easy"},
    {q:"What is 5 × 5?",a:"25",c:["20","25","30","15"],d:"easy"},
    {q:"What is 47 + 36?",a:"83",c:["73","83","93","71"],d:"easy"},
    {q:"What is 72 - 38?",a:"34",c:["26","34","44","24"],d:"easy"},
    {q:"In 352, which digit is in the TENS place?",a:"5",c:["3","5","2","35"],d:"easy"},
    {q:"How many minutes in 1 hour?",a:"60",c:["30","45","60","100"],d:"easy"},
    {q:"What is 6 × 3?",a:"18",c:["15","18","21","12"],d:"easy"},
    {q:"What is 85 - 47?",a:"38",c:["28","38","48","32"],d:"easy"},
    {q:"What is 4 × 7?",a:"28",c:["21","28","35","24"],d:"easy"},
    {q:"What is 7 × 6?",a:"42",c:["36","42","48","40"],d:"medium"},
    {q:"What is 8 × 9?",a:"72",c:["63","70","72","81"],d:"medium"},
    {q:"6 × ___ = 54?",a:"9",c:["7","8","9","10"],d:"medium"},
    {q:"What is 345 + 278?",a:"623",c:["613","623","633","524"],d:"medium"},
    {q:"Round 347 to nearest hundred.",a:"300",c:["300","350","400","340"],d:"medium"},
    {q:"Which fraction is larger: 1/3 or 1/4?",a:"1/3",c:["1/4","1/3","equal","neither"],d:"medium"},
    {q:"Square with 5 cm sides. Perimeter?",a:"20 cm",c:["10 cm","15 cm","20 cm","25 cm"],d:"medium"},
    {q:"School 8AM-3PM. How many hours?",a:"7",c:["5","6","7","8"],d:"medium"},
    {q:"What is 9 × 8?",a:"72",c:["63","72","81","64"],d:"medium"},
    {q:"Area of rectangle 6 cm x 9 cm?",a:"54 sq cm",c:["30 sq cm","45 sq cm","54 sq cm","63 sq cm"],d:"hard"},
    {q:"Which fraction equals 1/2?",a:"4/8",c:["2/6","3/8","4/8","1/4"],d:"hard"},
    {q:"3/4 or 2/3 - which is greater?",a:"3/4",c:["3/4","2/3","equal","neither"],d:"hard"},
    {q:"36 gems / 4 fairies. Each gets?",a:"9",c:["6","8","9","12"],d:"hard"},
    {q:"What is 56 / 7?",a:"8",c:["6","7","8","9"],d:"hard"},
    {q:"Album $9, buy 7. Total?",a:"$63",c:["$54","$63","$72","$56"],d:"hard"},
    {q:"Area of garden 8 ft x 5 ft?",a:"40 sq ft",c:["26 sq ft","40 sq ft","45 sq ft","13 sq ft"],d:"hard"},
    {q:"What is 8 × 8?",a:"64",c:["56","60","64","72"],d:"hard"},
    {q:"What is 9 × 7?",a:"63",c:["54","56","63","72"],d:"hard"},
  ],
  elliot:[
    {q:"Which word has a SHORT 'a' sound?",a:"map",c:["cape","map","rain","play"],d:"easy"},
    {q:"Which word has the OW sound (like cow)?",a:"town",c:["snow","town","crow","blow"],d:"easy"},
    {q:"Correctly spelled?",a:"because",c:["becaus","becuase","because","becose"],d:"easy"},
    {q:"Correctly spelled?",a:"friend",c:["freind","frend","friend","frind"],d:"easy"},
    {q:"Opposite of hot?",a:"cold",c:["warm","fast","cold","hard"],d:"easy"},
    {q:"Which word is a NOUN?",a:"castle",c:["run","castle","quickly","big"],d:"easy"},
    {q:"Which word is a VERB?",a:"jumped",c:["blue","jumped","tall","funny"],d:"easy"},
    {q:"Exhausted means?",a:"Very tired",c:["Very happy","Very hungry","Very tired","Very scared"],d:"easy"},
    {q:"Which sentence needs a question mark?",a:"Where did you go",c:["I love pizza","Where did you go","She ran fast","The dog barked"],d:"easy"},
    {q:"Which has the OUGHT sound (thought)?",a:"bought",c:["boat","boot","bought","bolt"],d:"medium"},
    {q:"Main idea: Dogs make great pets. They are loyal.",a:"Dogs make great pets",c:["Dogs are loyal","Families love pets","Dogs make great pets","Dogs are fun"],d:"medium"},
    {q:"It rained so the game was cancelled. Cause?",a:"The rain",c:["The players","The rain","The coach","The field"],d:"medium"},
    {q:"Plural of wolf?",a:"wolves",c:["wolfs","wolfes","wolves","wolve"],d:"medium"},
    {q:"Correct past tense?",a:"They played outside.",c:["They play outside.","They played outside.","They playing outside.","They will played."],d:"medium"},
    {q:"Synonym for happy?",a:"joyful",c:["angry","joyful","tired","cold"],d:"medium"},
    {q:"Ancient means?",a:"Very old",c:["Very new","Very old","Very big","Very cold"],d:"medium"},
    {q:"What does un- mean in unhappy?",a:"Not",c:["Very","Not","Again","Before"],d:"medium"},
    {q:"He ran like the wind. This is a?",a:"Simile",c:["Fact","Simile","Metaphor","Opinion"],d:"hard"},
    {q:"The classroom was a ZOO. This is a?",a:"Metaphor",c:["Fact","Simile","Metaphor","Rhyme"],d:"hard"},
    {q:"I walked to school. Point of view?",a:"1st person",c:["3rd person","1st person","2nd person","None"],d:"hard"},
    {q:"Which is a FACT?",a:"Cats have four legs.",c:["Cats are the best.","Cats have four legs.","Cats beat dogs.","Cats are cute."],d:"hard"},
    {q:"Which is COMPOUND?",a:"I like Minecraft, and I like Pokemon.",c:["I like Minecraft.","I like Minecraft and Pokemon.","I like Minecraft, and I like Pokemon.","Because I like Minecraft."],d:"hard"},
    {q:"Root word in thoughtfully?",a:"thought",c:["full","thought","thoughtful","fully"],d:"hard"},
    {q:"Remarkable means?",a:"Impressive",c:["Boring","Impressive","Common","Small"],d:"hard"},
    {q:"She was DISTRAUGHT. How did she feel?",a:"Very upset",c:["Happy","Tired","Very upset","Confused"],d:"hard"},
    {q:"Which is an OPINION?",a:"Pizza is delicious.",c:["Pizza has cheese.","Pizza is round.","Pizza is delicious.","Pizza is baked."],d:"hard"},
  ],
  owen:[
    {q:"What is 1/2 + 1/2?",a:"1",c:["1/2","1","1 1/2","2"],d:"easy"},
    {q:"Which decimal equals 1/4?",a:"0.25",c:["0.14","0.25","0.4","0.75"],d:"easy"},
    {q:"Reduce 4/8 to lowest terms.",a:"1/2",c:["1/4","1/2","2/3","3/8"],d:"easy"},
    {q:"What is 1.5 + 2.3?",a:"3.8",c:["3.5","3.8","4.0","3.2"],d:"easy"},
    {q:"What is 2.7 × 10?",a:"27",c:["2.70","27","270","0.27"],d:"easy"},
    {q:"What is 10% of 80?",a:"8",c:["8","10","18","80"],d:"easy"},
    {q:"Which is less than zero?",a:"-3",c:["3","0","7","-3"],d:"easy"},
    {q:"Absolute value of -9?",a:"9",c:["-9","0","9","1"],d:"easy"},
    {q:"What is 5 × 0.2?",a:"1",c:["0.1","1","10","0.01"],d:"easy"},
    {q:"What is 2/3 + 1/4?",a:"11/12",c:["6/8","11/12","3/7","7/12"],d:"medium"},
    {q:"What is 4 1/2 - 1 3/4?",a:"2 3/4",c:["2 1/2","2 3/4","3 1/4","3"],d:"medium"},
    {q:"Pilot covers 3/5 of 45 km. How far?",a:"27 km",c:["18 km","27 km","30 km","9 km"],d:"medium"},
    {q:"Mech runs 60 km in 3 hrs. Speed?",a:"20 km/h",c:["15","18","20","57"],d:"medium"},
    {q:"What is 15% of 200?",a:"30",c:["15","20","30","45"],d:"medium"},
    {q:"What is (3+5) × 2 - 4?",a:"12",c:["10","12","14","16"],d:"medium"},
    {q:"What is -4 + 10?",a:"6",c:["-6","6","14","-14"],d:"medium"},
    {q:"Median of: 3, 7, 2, 9, 5?",a:"5",c:["3","5","7","9"],d:"medium"},
    {q:"What is 1 / (3/4)?",a:"1 1/3",c:["3/4","1","1 1/3","1 1/2"],d:"hard"},
    {q:"Titan uses 3/5 of 150 fuel. Remains?",a:"60",c:["50","60","90","75"],d:"hard"},
    {q:"Solve: x + 2.7 = 8.1",a:"x = 5.4",c:["5.1","5.4","6.3","10.8"],d:"hard"},
    {q:"$120 up 15%. New price?",a:"$138",c:["$108","$135","$138","$150"],d:"hard"},
    {q:"3x + 7 when x = 5?",a:"22",c:["19","22","37","57"],d:"hard"},
    {q:"Solve: 2x = 18",a:"x = 9",c:["7","8","9","10"],d:"hard"},
    {q:"Triangle base 10m, height 6m. Area?",a:"30 sq m",c:["60","30","15","25"],d:"hard"},
    {q:"What is 5 - (-3)?",a:"8",c:["2","8","-8","15"],d:"hard"},
    {q:"GCF of 24 and 36?",a:"12",c:["6","8","12","18"],d:"hard"},
  ],
};

const KIDS = {
  arthur:{name:"Arthur",emoji:"👸",color:"#FF69B4",accent:"#FF1493",desc:"3rd Grade · Math",bg:"linear-gradient(135deg,#1a0010,#2e0020)"},
  elliot:{name:"Elliot",emoji:"⛏️",color:"#69F0AE",accent:"#00E5FF",desc:"5th Grade · Reading",bg:"linear-gradient(135deg,#001a08,#002e14)"},
  owen:  {name:"Owen",  emoji:"🪖",color:"#FF8C42",accent:"#FFD700",desc:"6th Grade · Math",bg:"linear-gradient(135deg,#0d0500,#221000)"},
};

const THEMES = [
  { name:"DUNGEON", wallA:[88,68,46], wallB:[52,40,26], doorA:[160,100,32], doorB:[110,68,20],
    exitA:[24,180,80], exitB:[14,110,48], ceilR:8,ceilG:5,ceilB:10, floorR:26,floorG:20,floorB:14,
    fogR:6,fogG:4,fogB:9, fogDist:11, torchR:255,torchG:155,torchB:35,
    monsterCol:"#dd2200", monsterName:"THE SHADOW", ambR:55,ambG:18,ambB:0 },
  { name:"CRYPT",   wallA:[58,56,88], wallB:[32,30,55], doorA:[100,65,155], doorB:[58,38,95],
    exitA:[165,105,255], exitB:[92,58,162], ceilR:4,ceilG:4,ceilB:16, floorR:15,floorG:13,floorB:26,
    fogR:4,fogG:3,fogB:15, fogDist:9, torchR:115,torchG:75,torchB:255,
    monsterCol:"#6600ee", monsterName:"THE WRAITH", ambR:18,ambG:0,ambB:58 },
  { name:"VOLCANO", wallA:[128,48,12], wallB:[78,26,6], doorA:[185,62,0], doorB:[122,36,0],
    exitA:[255,198,0], exitB:[180,128,0], ceilR:18,ceilG:5,ceilB:2, floorR:34,floorG:13,floorB:4,
    fogR:22,fogG:5,fogB:0, fogDist:8, torchR:255,torchG:88,torchB:0,
    monsterCol:"#ff3300", monsterName:"THE INFERNO", ambR:78,ambG:9,ambB:0 },
];

const LEVEL_CFG = [
  {mw:11,mh:11,doors:5,traps:4,shrines:3,chests:3,monSpeed:0.038,wrongsAllowed:3},
  {mw:15,mh:13,doors:7,traps:5,shrines:4,chests:4,monSpeed:0.050,wrongsAllowed:3},
  {mw:19,mh:15,doors:9,traps:6,shrines:5,chests:5,monSpeed:0.064,wrongsAllowed:3},
];
const T_WALL=1, T_OPEN=0, T_DOOR=2, T_EXIT=3, T_TRAP=4, T_SHRINE=5, T_CHEST=6;

/* ══ MAZE GENERATOR ════════════════════════════════════════════ */
function generateMaze(mw, mh, numDoors, numTraps, numShrines, numChests) {
  const TW=mw*2+1, TH=mh*2+1;
  const tiles=Array.from({length:TH},()=>new Uint8Array(TW).fill(T_WALL));
  const vis=Array.from({length:mh},()=>new Uint8Array(mw));
  function carve(cx,cy){
    vis[cy][cx]=1;
    const dirs=[[0,-1],[1,0],[0,1],[-1,0]].sort(()=>Math.random()-0.5);
    for(const [dx,dy] of dirs){
      const nx=cx+dx,ny=cy+dy;
      if(nx<0||ny<0||nx>=mw||ny>=mh||vis[ny][nx]) continue;
      tiles[cy*2+1+dy][cx*2+1+dx]=T_OPEN;
      tiles[cy*2+1][cx*2+1]=T_OPEN;
      carve(nx,ny);
    }
    tiles[cy*2+1][cx*2+1]=T_OPEN;
  }
  carve(0,0);
  const exitTX=mw*2-1, exitTY=mh*2-1;
  tiles[exitTY][exitTX]=T_EXIT;

  // All open tiles with distance from start
  const allOpen=[];
  for(let y=1;y<TH-1;y++) for(let x=1;x<TW-1;x++){
    if(tiles[y][x]===T_OPEN) allOpen.push([x,y,Math.hypot(x-1,y-1)]);
  }

  // DOORS — corridor tiles (walls on 2 opposite sides), mid-to-far
  const doorCands=allOpen.filter(([x,y,d])=>{
    if(d<5||Math.hypot(x-exitTX,y-exitTY)<3) return false;
    const hC=tiles[y][x-1]===T_WALL&&tiles[y][x+1]===T_WALL;
    const vC=tiles[y-1][x]===T_WALL&&tiles[y+1][x]===T_WALL;
    return hC||vC;
  }).sort(()=>Math.random()-0.5);
  for(let i=0;i<Math.min(numDoors,doorCands.length);i++) tiles[doorCands[i][1]][doorCands[i][0]]=T_DOOR;

  // TRAPS — open floor tiles scattered through maze, player walks onto them
  const trapCands=allOpen.filter(([x,y,d])=>d>3&&Math.hypot(x-exitTX,y-exitTY)>2&&tiles[y][x]===T_OPEN).sort(()=>Math.random()-0.5);
  for(let i=0;i<Math.min(numTraps,trapCands.length);i++) tiles[trapCands[i][1]][trapCands[i][0]]=T_TRAP;

  // SHRINES — dead-end tiles (1 open neighbor), walk up and interact
  const shrineCands=allOpen.filter(([x,y,d])=>{
    if(d<3||tiles[y][x]!==T_OPEN) return false;
    let n=0;
    for(const[dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){ const t=tiles[y+dy]&&tiles[y+dy][x+dx]; if(t===T_OPEN||t===T_TRAP||t===T_EXIT) n++; }
    return n===1;
  }).sort(()=>Math.random()-0.5);
  for(let i=0;i<Math.min(numShrines,shrineCands.length);i++) tiles[shrineCands[i][1]][shrineCands[i][0]]=T_SHRINE;

  // CHESTS — placed at dead ends not already used by shrines, spread around maze
  const chestCands=allOpen.filter(([x,y,d])=>{
    if(d<6||tiles[y][x]!==T_OPEN) return false;
    let n=0;
    for(const[dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){ const t=tiles[y+dy]&&tiles[y+dy][x+dx]; if(t===T_OPEN||t===T_TRAP||t===T_EXIT||t===T_SHRINE) n++; }
    return n<=2; // dead end or corner = good chest spot
  }).sort(()=>Math.random()-0.5);
  for(let i=0;i<Math.min(numChests||3,chestCands.length);i++) tiles[chestCands[i][1]][chestCands[i][0]]=T_CHEST;

  // MONSTER START — 6-10 tiles away so it's visible from second 1
  const monCands=allOpen.filter(([x,y,d])=>d>=5&&d<=10&&tiles[y][x]===T_OPEN).sort((a,b)=>a[2]-b[2]);
  const monStart=monCands.length>0?{x:monCands[0][0]+0.5,y:monCands[0][1]+0.5}:{x:exitTX-0.5,y:exitTY-0.5};

  return{tiles,TW,TH,playerStart:{x:1.5,y:1.5},monsterStart:monStart,exitPos:{x:exitTX+0.5,y:exitTY+0.5}};
}

/* ══ BFS ════════════════════════════════════════════════════════ */
function bfsPath(tiles,TW,TH,fx,fy,tx,ty){
  const sx=Math.floor(fx),sy=Math.floor(fy),ex=Math.floor(tx),ey=Math.floor(ty);
  if(sx===ex&&sy===ey) return null;
  const q=[[sx,sy,[]]];
  const seen=new Set([`${sx},${sy}`]);
  while(q.length){
    const [cx,cy,path]=q.shift();
    for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
      const nx=cx+dx,ny=cy+dy;
      const k=`${nx},${ny}`;
      if(nx<0||ny<0||nx>=TW||ny>=TH||seen.has(k)) continue;
      if(tiles[ny][nx]===T_WALL||tiles[ny][nx]===T_DOOR) continue;
      const np=[...path,[nx,ny]];
      if(nx===ex&&ny===ey) return np;
      seen.add(k);q.push([nx,ny,np]);
    }
  }
  return null;
}

/* ══ TEXTURE SAMPLER ═══════════════════════════════════════════
   Returns a brightness multiplier 0..1.4 for each wall pixel.
   Called once per vertical pixel strip per frame.
══════════════════════════════════════════════════════════════ */
function texSample(tileType, wallX, wallY, ts){
  const tx=wallX, ty=wallY; // both 0..1
  if(tileType===T_WALL){
    // Stone brick pattern
    const row=Math.floor(ty*7);
    const offset=(row%2)*0.52;
    const col=Math.floor((tx+offset)*5);
    const mortarH=(ty*7)%1<0.085;
    const mortarV=((tx+offset)*5)%1<0.07;
    if(mortarH||mortarV) return 0.32;
    const bv=((row*7+col*13)%17)/17;
    return 0.68+bv*0.32;
  }
  if(tileType===T_DOOR){
    // Wood planks with iron bands
    const plankFrac=(tx*5)%1;
    const gap=plankFrac<0.055||plankFrac>0.945;
    if(gap) return 0.22;
    const band25=ty>0.21&&ty<0.29;
    const band75=ty>0.70&&ty<0.78;
    if(band25||band75){
      const rivet=Math.abs(plankFrac-0.5)<0.08&&(ty>0.235&&ty<0.255||ty>0.715&&ty<0.735);
      return rivet?1.3:0.42;
    }
    const grain=Math.sin(ty*38+Math.floor(tx*5)*3.5)*0.07;
    return 0.68+grain+Math.floor(tx*5)%2*0.07;
  }
  if(tileType===T_EXIT){
    const pulse=Math.sin(ts*0.004)*0.15+0.85;
    const edgeX=Math.min(tx,1-tx),edgeY=Math.min(ty,1-ty),edge=Math.min(edgeX,edgeY);
    if(edge<0.09) return 0.48*pulse;
    const dist=Math.hypot(tx-0.5,ty-0.5);
    return Math.max(0,(1.3-dist*1.9)*pulse);
  }
  return 0.7;
}

/* ══ RAYCASTER ════════════════════════════════════════════════
   Pixel-level texture rendering via ImageData.
   Ceiling and floor shaded by distance from horizon.
════════════════════════════════════════════════════════════ */
function renderScene(ctx, W, H, px, py, angle, tiles, TW, TH, theme, ts, openDoors, clearedTraps){
  const HALF_H=H/2, MAX_D=16;
  const dirX=Math.cos(angle),dirY=Math.sin(angle);
  const plX=-dirY*0.66,plY=dirX*0.66;
  const img=ctx.createImageData(W,H);
  const d=img.data;

  function px_(x,y,r,g,b){
    if(x<0||x>=W||y<0||y>=H) return;
    const i=(y*W+x)*4;
    d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;
  }

  // Ceiling
  for(let y=0;y<HALF_H;y++){
    const t=1-y/HALF_H;
    const dk=Math.max(0,1-t*1.5);
    const r=(theme.ceilR+theme.ambR*0.25)*dk|0;
    const g=(theme.ceilG+theme.ambG*0.25)*dk|0;
    const b=(theme.ceilB+theme.ambB*0.25)*dk|0;
    for(let x=0;x<W;x++) px_(x,y,r,g,b);
  }
  // Floor with trap/shrine coloring via floor-cast rays
  // First pass: base floor color
  for(let y=Math.ceil(HALF_H);y<H;y++){
    const t=(y-HALF_H)/HALF_H;
    const dk=Math.max(0,1-t*1.3);
    const baseR=(theme.floorR+theme.ambR*0.18)*dk|0;
    const baseG=(theme.floorG+theme.ambG*0.18)*dk|0;
    const baseB=(theme.floorB+theme.ambB*0.18)*dk|0;
    // Floor-cast to find tile at this row
    const rowDist=HALF_H/(y-HALF_H+0.001);
    for(let x=0;x<W;x++){
      const camX=2*x/W-1;
      const floorX=px+rowDist*(dirX+plX*camX);
      const floorY=py+rowDist*(dirY+plY*camX);
      const ftx=Math.floor(floorX), fty=Math.floor(floorY);
      let r=baseR,g=baseG,b=baseB;
      if(ftx>=0&&fty>=0&&ftx<TW&&fty<TH){
        const ft=tiles[fty][ftx];
        if(ft===T_SHRINE){
          // Purple mystic glow on shrine tiles
          const sp=Math.sin(ts*0.004+ftx*0.7+fty*0.9)*0.35+0.65;
          const cx2=Math.abs((floorX%1)-0.5), cy2=Math.abs((floorY%1)-0.5);
          const distC=Math.hypot(cx2,cy2);
          const glow=Math.max(0,1-distC*3)*sp;
          r=Math.min(255,baseR+(80*glow)|0);
          g=Math.max(0,baseG-(10*glow)|0);
          b=Math.min(255,baseB+(180*glow)|0);
        }
      }
      px_(x,y,r,g,b);
    }
  }

  const zBuf=new Float32Array(W).fill(MAX_D);

  for(let col=0;col<W;col++){
    const camX=2*col/W-1;
    const rdx=dirX+plX*camX, rdy=dirY+plY*camX;
    let mx=Math.floor(px),my=Math.floor(py);
    const ddx=Math.abs(rdx)<1e-9?1e15:Math.abs(1/rdx);
    const ddy=Math.abs(rdy)<1e-9?1e15:Math.abs(1/rdy);
    let sdx=rdx<0?(px-mx)*ddx:(mx+1-px)*ddx;
    let sdy=rdy<0?(py-my)*ddy:(my+1-py)*ddy;
    const sx=rdx<0?-1:1,sy=rdy<0?-1:1;
    let side=0,hitTile=T_WALL,hitX=0,hitY=0;

    for(let i=0;i<MAX_D*2;i++){
      if(sdx<sdy){sdx+=ddx;mx+=sx;side=0;}
      else{sdy+=ddy;my+=sy;side=1;}
      if(mx<0||my<0||mx>=TW||my>=TH){hitTile=T_WALL;break;}
      const t=tiles[my][mx];
      if(t===T_WALL||t===T_DOOR||t===T_EXIT){
        if(t===T_DOOR&&openDoors.has(`${mx},${my}`)) continue;
        hitTile=t;hitX=mx;hitY=my;break;
      }
    }

    const perp=side===0?(mx-px+(1-sx)/2)/rdx:(my-py+(1-sy)/2)/rdy;
    if(perp<=0){zBuf[col]=0.01;continue;}
    zBuf[col]=perp;

    // Wall-face fractional position for texture
    let wallFrac=side===0?(py+perp*rdy-Math.floor(py+perp*rdy)):(px+perp*rdx-Math.floor(px+perp*rdx));
    if(sx<0&&side===0) wallFrac=1-wallFrac;
    if(sy>0&&side===1) wallFrac=1-wallFrac;

    const lineH=Math.min(H*3,Math.floor(H/perp));
    const drawS=Math.max(0,Math.floor(HALF_H-lineH/2));
    const drawE=Math.min(H-1,Math.floor(HALF_H+lineH/2));

    // Fog + torch per-strip
    const fogT=Math.min(1,perp/theme.fogDist);
    const whx=side===0?hitX:px+perp*rdx;
    const why=side===0?py+perp*rdy:hitY;
    const th=(Math.floor(whx)*7+Math.floor(why)*13)%23;
    const torchStr=th<5?Math.max(0,1-Math.hypot((whx%1)-0.5,(why%1)-0.5)*2.2)*(0.55+Math.sin(ts*0.007+whx+why)*0.45):0;
    const sideFactor=side===0?1.0:0.7;

    const [bR,bG,bB]=hitTile===T_DOOR?(side===0?theme.doorA:theme.doorB):hitTile===T_EXIT?(side===0?theme.exitA:theme.exitB):(side===0?theme.wallA:theme.wallB);

    for(let y=drawS;y<=drawE;y++){
      const wallY=Math.max(0,Math.min(1,(y-drawS)/(drawE-drawS+1)));
      const tex=texSample(hitTile,wallFrac,wallY,ts);
      let r=(bR*tex*sideFactor)|0;
      let g=(bG*tex*sideFactor)|0;
      let b=(bB*tex*sideFactor)|0;
      // Torch
      r=Math.min(255,r+(theme.torchR*torchStr*0.55)|0);
      g=Math.min(255,g+(theme.torchG*torchStr*0.28)|0);
      b=Math.min(255,b+(theme.torchB*torchStr*0.1)|0);
      // Ambient
      r=Math.min(255,r+(theme.ambR*0.1)|0);
      g=Math.min(255,g+(theme.ambG*0.1)|0);
      b=Math.min(255,b+(theme.ambB*0.1)|0);
      // Fog
      r=Math.floor(r*(1-fogT)+theme.fogR*fogT);
      g=Math.floor(g*(1-fogT)+theme.fogG*fogT);
      b=Math.floor(b*(1-fogT)+theme.fogB*fogT);
      // Exit pulse
      if(hitTile===T_EXIT){const pulse=Math.sin(ts*0.004)*0.25+0.75;r=Math.min(255,(r*pulse+theme.exitA[0]*0.35)|0);g=Math.min(255,(g*pulse+theme.exitA[1]*0.35)|0);}
      px_(col,y,Math.min(255,r),Math.min(255,g),Math.min(255,b));
    }
    // Torch flame highlight on wall
    if(torchStr>0.45&&perp<5){
      const ty2=Math.floor(HALF_H)-2;
      if(ty2>drawS&&ty2<drawE){
        const fl=torchStr*(0.65+Math.sin(ts*0.012+col)*0.35);
        px_(col,ty2,  Math.min(255,(255*fl)|0),Math.min(255,(195*fl)|0),Math.min(255,(35*fl)|0));
        px_(col,ty2-1,Math.min(255,(210*fl)|0),Math.min(255,(130*fl)|0),18);
      }
    }
  }
  ctx.putImageData(img,0,0);
  return zBuf;
}

/* ══ CHEST & SHRINE SPRITES ════════════════════════════════════
   Drawn as proper 3D objects in world space via sprite projection.
════════════════════════════════════════════════════════════ */
function drawTrapSprite(ctx, W, H, px, py, angle, trapX, trapY, zBuf, theme, ts, cleared) {
  const proj = projSprite(W, H, px, py, angle, trapX + 0.5, trapY + 0.5);
  if (!proj) return;
  const {screenX, depth, sprH} = proj;
  if (depth > 9 || screenX < -sprH || screenX > W + sprH) return;

  // Occlusion
  const hw = Math.floor(sprH * 0.35);
  let vis = false;
  for (let sx = Math.max(0, screenX-hw); sx <= Math.min(W-1, screenX+hw); sx+=3) {
    if (depth < zBuf[sx] + 0.15) { vis = true; break; }
  }
  if (!vis) return;

  const HALF_H = H / 2;
  // Trap sits ON the floor — project it below the horizon line
  const floorY = HALF_H + sprH * 0.5; // base sits at floor level
  const fog = Math.min(1, depth / 8);
  const baseAlpha = Math.max(0.12, 1 - fog * 0.88);

  ctx.save();
  ctx.globalAlpha = cleared ? baseAlpha * 0.25 : baseAlpha;

  const cx = screenX;
  // Scale the hatch relative to how big this tile looks
  const hw2 = Math.max(10, Math.min(90, sprH * 0.42));
  const hh  = hw2 * 0.38; // flat, foreshortened — reads as floor

  const pulse = Math.sin(ts * 0.005 + trapX + trapY) * 0.4 + 0.6;

  if (!cleared) {
    // ── Red danger glow bleeding up through the grate ──
    const heatGlow = ctx.createRadialGradient(cx, floorY - hh*0.3, 0, cx, floorY - hh*0.3, hw2 * 1.1);
    heatGlow.addColorStop(0, `rgba(255,60,0,${pulse * 0.55})`);
    heatGlow.addColorStop(0.5, `rgba(180,20,0,${pulse * 0.22})`);
    heatGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = heatGlow;
    ctx.beginPath();
    ctx.ellipse(cx, floorY - hh*0.2, hw2 * 1.1, hh * 0.9, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // ── Outer iron frame — recessed into floor ──
  // Frame shadow/depth (slightly offset for 3D feel)
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath();
  ctx.ellipse(cx + hw2*0.04, floorY - hh*0.12 + hh*0.06, hw2*1.01, hh*1.01, 0, 0, Math.PI*2);
  ctx.fill();

  // Frame body — dark iron
  ctx.fillStyle = cleared ? '#303030' : '#2a1a10';
  ctx.beginPath();
  ctx.ellipse(cx, floorY - hh*0.12, hw2, hh, 0, 0, Math.PI*2);
  ctx.fill();

  // ── Grate bars — horizontal ──
  const barCount = 5;
  ctx.save();
  // Clip to the hatch ellipse
  ctx.beginPath();
  ctx.ellipse(cx, floorY - hh*0.12, hw2 * 0.88, hh * 0.82, 0, 0, Math.PI*2);
  ctx.clip();

  if (!cleared) {
    // Red-orange under-glow fill behind bars
    const innerGlow = ctx.createRadialGradient(cx, floorY - hh*0.15, 0, cx, floorY - hh*0.15, hw2*0.85);
    innerGlow.addColorStop(0, `rgba(255,80,0,${pulse*0.7})`);
    innerGlow.addColorStop(0.6, `rgba(140,20,0,${pulse*0.5})`);
    innerGlow.addColorStop(1, `rgba(60,5,0,0.4)`);
    ctx.fillStyle = innerGlow;
    ctx.fillRect(cx - hw2, floorY - hh*2, hw2*2, hh*4);
  } else {
    ctx.fillStyle = '#181412';
    ctx.fillRect(cx - hw2, floorY - hh*2, hw2*2, hh*4);
  }

  // Horizontal bars
  const barCol = cleared ? '#404040' : '#1a1008';
  for (let b = 0; b < barCount; b++) {
    const by = floorY - hh*0.85 + b * (hh*1.7/(barCount-1));
    const barThick = Math.max(1.5, hh * 0.13);
    ctx.fillStyle = barCol;
    ctx.fillRect(cx - hw2, by - barThick/2, hw2*2, barThick);
    // Bar highlight (top edge)
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(cx - hw2, by - barThick/2, hw2*2, barThick*0.35);
  }

  // Vertical bars (3)
  for (let b = -1; b <= 1; b++) {
    const bx = cx + b * hw2 * 0.52;
    const barThick = Math.max(1.5, hw2 * 0.08);
    ctx.fillStyle = barCol;
    ctx.fillRect(bx - barThick/2, floorY - hh*2, barThick, hh*4);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(bx - barThick/2, floorY - hh*2, barThick*0.4, hh*4);
  }

  ctx.restore(); // end clip

  // ── Iron frame ring (drawn over bars) ──
  ctx.strokeStyle = cleared ? '#555' : '#3a2510';
  ctx.lineWidth = Math.max(2, hh * 0.22);
  ctx.beginPath();
  ctx.ellipse(cx, floorY - hh*0.12, hw2 * 0.88, hh * 0.82, 0, 0, Math.PI*2);
  ctx.stroke();

  // Frame rivets at corners
  ctx.fillStyle = cleared ? '#666' : '#4a3018';
  for (let r = 0; r < 4; r++) {
    const ra = r * Math.PI/2 + Math.PI/4;
    const rx = cx + Math.cos(ra) * hw2 * 0.78;
    const ry = (floorY - hh*0.12) + Math.sin(ra) * hh * 0.72;
    ctx.beginPath();
    ctx.arc(rx, ry, Math.max(2, hw2*0.055), 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(rx - hw2*0.012, ry - hh*0.05, Math.max(1, hw2*0.022), 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = cleared ? '#666' : '#4a3018';
  }

  // ── Skull warning etched into the frame ──
  if (!cleared && hw2 > 18) {
    const sk = hw2 * 0.18;
    const skx = cx, sky = floorY - hh*0.12 - hh*0.62;
    // Skull
    ctx.fillStyle = `rgba(255,80,0,${pulse*0.9})`;
    ctx.beginPath(); ctx.ellipse(skx, sky, sk*0.55, sk*0.62, 0, 0, Math.PI*2); ctx.fill();
    // Jaw
    ctx.fillStyle = `rgba(220,60,0,${pulse*0.85})`;
    ctx.beginPath(); ctx.ellipse(skx, sky + sk*0.42, sk*0.52, sk*0.28, 0, 0, Math.PI); ctx.fill();
    // Eye sockets
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath(); ctx.ellipse(skx-sk*0.2, sky-sk*0.08, sk*0.16, sk*0.14, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(skx+sk*0.2, sky-sk*0.08, sk*0.16, sk*0.14, 0, 0, Math.PI*2); ctx.fill();
    // Nose
    ctx.beginPath(); ctx.ellipse(skx, sky+sk*0.18, sk*0.08, sk*0.1, 0, 0, Math.PI*2); ctx.fill();
    // Teeth
    ctx.fillStyle = `rgba(255,100,0,${pulse*0.7})`;
    for (let t=0;t<4;t++) {
      ctx.beginPath();
      ctx.rect(skx-sk*0.32+t*sk*0.22, sky+sk*0.28, sk*0.14, sk*0.16);
      ctx.fill();
    }
    // Warning glow around skull
    const wg = ctx.createRadialGradient(skx,sky,0,skx,sky,sk*0.9);
    wg.addColorStop(0,`rgba(255,80,0,${pulse*0.3})`); wg.addColorStop(1,'transparent');
    ctx.fillStyle=wg; ctx.beginPath(); ctx.arc(skx,sky,sk*0.9,0,Math.PI*2); ctx.fill();
  }

  // ── "WALK HERE" warning text when close ──
  const dist = Math.hypot(trapX+0.5-px, trapY+0.5-py);
  if (dist < 2.2 && !cleared) {
    ctx.globalAlpha = Math.min(1, baseAlpha * 1.4);
    ctx.font = `bold ${Math.max(6, hw2*0.16)}px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const labelY = floorY - hh * 1.4;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillText('⚠ TRAP', cx+1, labelY+1);
    ctx.fillStyle = `rgba(255,${100+pulse*100|0},0,0.95)`;
    ctx.fillText('⚠ TRAP', cx, labelY);
  }

  ctx.restore();
}

function drawChestSprite(ctx, W, H, px, py, angle, chestX, chestY, zBuf, ts, opened) {
  const proj = projSprite(W, H, px, py, angle, chestX + 0.5, chestY + 0.5);
  if (!proj) return;
  const {screenX, depth, sprH} = proj;
  if (depth > 10 || screenX < -sprH || screenX > W + sprH) return;

  // Occlusion check
  const hw = Math.floor(sprH * 0.3);
  let vis = false;
  for (let sx = Math.max(0, screenX - hw); sx <= Math.min(W-1, screenX + hw); sx += 3) {
    if (depth < zBuf[sx] + 0.15) { vis = true; break; }
  }
  if (!vis) return;

  const HALF_H = H / 2;
  const s = Math.max(16, Math.min(160, sprH * 0.65));
  const fog = Math.min(1, depth / 9);
  const baseAlpha = Math.max(0.15, 1 - fog * 0.85);
  const pulse = Math.sin(ts * 0.004 + chestX + chestY) * 0.3 + 0.7;

  ctx.save();
  ctx.globalAlpha = opened ? baseAlpha * 0.3 : baseAlpha;

  const cx = screenX;
  const cy = HALF_H + s * 0.1; // sits on the floor

  // ── Drop shadow on floor ──
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.42, s * 0.42, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!opened) {
    // ── Closed chest ──

    // Gold glow halo
    const glow = ctx.createRadialGradient(cx, cy + s*0.1, 0, cx, cy + s*0.1, s * 0.8);
    glow.addColorStop(0, `rgba(255,210,50,${pulse * 0.35})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.ellipse(cx, cy + s*0.1, s*0.8, s*0.5, 0, 0, Math.PI*2); ctx.fill();

    // Chest body — dark wood sides (perspective: front face + top)
    // Front face
    ctx.fillStyle = '#5a3510';
    ctx.beginPath();
    ctx.moveTo(cx - s*0.38, cy + s*0.05);
    ctx.lineTo(cx + s*0.38, cy + s*0.05);
    ctx.lineTo(cx + s*0.38, cy + s*0.40);
    ctx.lineTo(cx - s*0.38, cy + s*0.40);
    ctx.closePath(); ctx.fill();

    // Side face (right, slightly darker for depth)
    ctx.fillStyle = '#3d2408';
    ctx.beginPath();
    ctx.moveTo(cx + s*0.38, cy + s*0.05);
    ctx.lineTo(cx + s*0.48, cy - s*0.02);
    ctx.lineTo(cx + s*0.48, cy + s*0.32);
    ctx.lineTo(cx + s*0.38, cy + s*0.40);
    ctx.closePath(); ctx.fill();

    // Top face
    ctx.fillStyle = '#7a4a1a';
    ctx.beginPath();
    ctx.moveTo(cx - s*0.38, cy + s*0.05);
    ctx.lineTo(cx + s*0.38, cy + s*0.05);
    ctx.lineTo(cx + s*0.48, cy - s*0.02);
    ctx.lineTo(cx - s*0.28, cy - s*0.02);
    ctx.closePath(); ctx.fill();

    // Lid — arched top
    ctx.fillStyle = '#8a5520';
    ctx.beginPath();
    ctx.moveTo(cx - s*0.38, cy + s*0.05);
    ctx.lineTo(cx + s*0.38, cy + s*0.05);
    ctx.lineTo(cx + s*0.38, cy - s*0.08);
    ctx.bezierCurveTo(cx + s*0.38, cy - s*0.22, cx - s*0.38, cy - s*0.22, cx - s*0.38, cy - s*0.08);
    ctx.closePath(); ctx.fill();

    // Lid top face
    ctx.fillStyle = '#a06828';
    ctx.beginPath();
    ctx.moveTo(cx - s*0.38, cy - s*0.08);
    ctx.bezierCurveTo(cx - s*0.38, cy - s*0.22, cx + s*0.38, cy - s*0.22, cx + s*0.38, cy - s*0.08);
    ctx.lineTo(cx + s*0.48, cy - s*0.14);
    ctx.bezierCurveTo(cx + s*0.48, cy - s*0.28, cx - s*0.28, cy - s*0.28, cx - s*0.28, cy - s*0.14);
    ctx.closePath(); ctx.fill();

    // Wood planks — vertical lines on front face
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = s * 0.018;
    for (let p = -1; p <= 1; p++) {
      ctx.beginPath();
      ctx.moveTo(cx + p * s * 0.22, cy + s * 0.05);
      ctx.lineTo(cx + p * s * 0.22, cy + s * 0.40);
      ctx.stroke();
    }

    // Iron bands — horizontal straps
    ctx.fillStyle = '#606060';
    ctx.fillRect(cx - s*0.39, cy + s*0.12, s*0.78, s*0.055);
    ctx.fillRect(cx - s*0.39, cy + s*0.28, s*0.78, s*0.055);
    // Band rivets
    ctx.fillStyle = '#909090';
    for (const bx of [cx - s*0.28, cx, cx + s*0.28]) {
      ctx.beginPath(); ctx.arc(bx, cy + s*0.148, s*0.025, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx, cy + s*0.308, s*0.025, 0, Math.PI*2); ctx.fill();
    }

    // Lock — glowing gold padlock center
    const lp = Math.sin(ts * 0.005 + chestX) * 0.25 + 0.75;
    ctx.fillStyle = `rgba(255,210,50,${lp})`;
    ctx.beginPath(); ctx.arc(cx, cy + s*0.22, s*0.07, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c8920a';
    ctx.fillRect(cx - s*0.06, cy + s*0.215, s*0.12, s*0.08);
    // Lock shackle
    ctx.strokeStyle = `rgba(255,200,40,${lp})`;
    ctx.lineWidth = s * 0.03; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + s*0.19, s*0.055, Math.PI, 0);
    ctx.stroke();

    // Highlight edge on lid
    ctx.strokeStyle = 'rgba(255,220,120,0.4)'; ctx.lineWidth = s*0.015;
    ctx.beginPath();
    ctx.moveTo(cx - s*0.38, cy - s*0.08);
    ctx.bezierCurveTo(cx - s*0.38, cy - s*0.22, cx + s*0.38, cy - s*0.22, cx + s*0.38, cy - s*0.08);
    ctx.stroke();

  } else {
    // ── Opened chest — lid flung back, inside visible ──
    // Base
    ctx.fillStyle = '#3d2408';
    ctx.beginPath();
    ctx.moveTo(cx - s*0.38, cy + s*0.10);
    ctx.lineTo(cx + s*0.38, cy + s*0.10);
    ctx.lineTo(cx + s*0.38, cy + s*0.40);
    ctx.lineTo(cx - s*0.38, cy + s*0.40);
    ctx.closePath(); ctx.fill();
    // Inside of chest (dark hollow)
    ctx.fillStyle = '#1a0c04';
    ctx.fillRect(cx - s*0.32, cy + s*0.12, s*0.64, s*0.18);
    // Lid open (tilted back)
    ctx.fillStyle = '#5a3510';
    ctx.save();
    ctx.translate(cx, cy + s*0.10);
    ctx.rotate(-0.9);
    ctx.fillRect(-s*0.38, -s*0.25, s*0.76, s*0.26);
    ctx.restore();
    // Horizontal band on base
    ctx.fillStyle = '#555';
    ctx.fillRect(cx - s*0.39, cy + s*0.24, s*0.78, s*0.04);
  }

  // Distance prompt
  const dist = Math.hypot(chestX + 0.5 - px, chestY + 0.5 - py);
  if (dist < 2.5 && !opened) {
    ctx.globalAlpha = Math.min(1, baseAlpha * 1.5);
    ctx.font = `bold ${Math.max(7, s*0.14)}px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillText('[SPACE] OPEN', cx + 1, cy - s*0.35 + 1);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('[SPACE] OPEN', cx, cy - s*0.35);
  }

  ctx.restore();
}

function drawShrineSprite(ctx, W, H, px, py, angle, shrineX, shrineY, zBuf, theme, ts) {
  const proj = projSprite(W, H, px, py, angle, shrineX + 0.5, shrineY + 0.5);
  if (!proj) return;
  const {screenX, depth, sprH} = proj;
  if (depth > 10 || screenX < -sprH || screenX > W + sprH) return;

  let vis = false;
  const hw = Math.floor(sprH * 0.3);
  for (let sx = Math.max(0, screenX - hw); sx <= Math.min(W-1, screenX + hw); sx += 3) {
    if (depth < zBuf[sx] + 0.15) { vis = true; break; }
  }
  if (!vis) return;

  const HALF_H = H / 2;
  const s = Math.max(12, Math.min(140, sprH * 0.7));
  const fog = Math.min(1, depth / 9);
  ctx.save();
  ctx.globalAlpha = Math.max(0.15, 1 - fog * 0.85);

  const cx = screenX, cy = HALF_H;
  const pulse = Math.sin(ts * 0.003 + shrineX * 0.7 + shrineY * 0.9) * 0.35 + 0.65;
  const mr = parseInt(theme.monsterCol.slice(1,3),16)*0.3|0;

  // Purple aura
  const aura = ctx.createRadialGradient(cx, cy - s*0.1, 0, cx, cy - s*0.1, s * 0.9);
  aura.addColorStop(0, `rgba(140,50,255,${pulse*0.35})`);
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(cx, cy-s*0.1, s*0.9, s*1.0, 0, 0, Math.PI*2); ctx.fill();

  // Stone base slab
  ctx.fillStyle = '#3a3038';
  ctx.beginPath();
  ctx.moveTo(cx - s*0.32, cy + s*0.38);
  ctx.lineTo(cx + s*0.32, cy + s*0.38);
  ctx.lineTo(cx + s*0.36, cy + s*0.44);
  ctx.lineTo(cx - s*0.36, cy + s*0.44);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#504850';
  ctx.fillRect(cx - s*0.32, cy + s*0.28, s*0.64, s*0.11);

  // Central pillar
  ctx.fillStyle = '#2a2030';
  ctx.fillRect(cx - s*0.12, cy - s*0.20, s*0.24, s*0.48);
  ctx.fillStyle = '#3a3045';
  ctx.fillRect(cx - s*0.10, cy - s*0.20, s*0.08, s*0.48);

  // Floating crystal orb
  const orbY = cy - s*0.32 + Math.sin(ts*0.003)*s*0.04;
  const orbG = ctx.createRadialGradient(cx - s*0.06, orbY - s*0.06, 0, cx, orbY, s*0.2);
  orbG.addColorStop(0, 'rgba(220,180,255,0.95)');
  orbG.addColorStop(0.4, `rgba(140,50,255,${pulse*0.9})`);
  orbG.addColorStop(0.8, `rgba(80,0,180,${pulse*0.6})`);
  orbG.addColorStop(1, 'transparent');
  ctx.fillStyle = orbG; ctx.beginPath(); ctx.arc(cx, orbY, s*0.2, 0, Math.PI*2); ctx.fill();
  // Orb shine
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(cx - s*0.06, orbY - s*0.06, s*0.045, 0, Math.PI*2); ctx.fill();

  // Rotating rune particles
  for (let i = 0; i < 4; i++) {
    const ra = ts * 0.002 + i * Math.PI / 2;
    const rx = cx + Math.cos(ra) * s * 0.3, ry = orbY + Math.sin(ra) * s * 0.18;
    ctx.fillStyle = `rgba(180,100,255,${pulse*0.7})`;
    ctx.font = `${s*0.13}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('✦', rx, ry);
  }

  // Distance prompt
  const dist = Math.hypot(shrineX + 0.5 - px, shrineY + 0.5 - py);
  if (dist < 2.5) {
    ctx.globalAlpha = Math.max(0.3, 1 - fog * 0.85);
    ctx.font = `bold ${Math.max(7, s*0.14)}px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillText('[SPACE] PRAY', cx+1, cy - s*0.55+1);
    ctx.fillStyle = '#cc88ff'; ctx.fillText('[SPACE] PRAY', cx, cy - s*0.55);
  }

  ctx.restore();
}

/* ══ MONSTER RENDERER ═════════════════════════════════════════
   Horned skeletal demon — exposed ribcage, curved ram horns,
   hollow eye sockets, spine visible through rotting flesh.
════════════════════════════════════════════════════════════ */
function projSprite(W,H,px,py,angle,wx,wy){
  const dx=wx-px,dy=wy-py;
  const dX=Math.cos(angle),dY=Math.sin(angle);
  const pX=-dY*0.66,pY=dX*0.66;
  const inv=1/(pX*dY-dX*pY);
  const tX=inv*(dY*dx-dX*dy);
  const tY=inv*(-pY*dx+pX*dy);
  if(tY<=0.05) return null;
  return{screenX:Math.floor((W/2)*(1+tX/tY)),depth:tY,sprH:Math.abs(Math.floor(H/tY))};
}

function drawMonster(ctx,W,H,px,py,angle,monX,monY,zBuf,theme,ts,monHp){
  const proj=projSprite(W,H,px,py,angle,monX,monY);
  if(!proj) return;
  const{screenX,depth,sprH}=proj;
  if(depth>13||screenX<-sprH||screenX>W+sprH) return;
  let vis=false;
  const hw=Math.floor(sprH*0.42);
  for(let sx=Math.max(0,screenX-hw);sx<=Math.min(W-1,screenX+hw);sx+=3){
    if(depth<zBuf[sx]+0.2){vis=true;break;}
  }
  if(!vis) return;

  const HALF_H=H/2;
  const s=Math.max(28,Math.min(310,sprH*0.95));
  const cy=HALF_H;
  const fog=Math.min(1,depth/(theme.fogDist*1.3));
  const alpha=Math.max(0.07,1-fog*0.86);
  const bob=Math.sin(ts*0.004)*s*0.025;
  const breathe=Math.sin(ts*0.003)*s*0.012;
  const pulse=Math.sin(ts*0.005)*0.35+0.65;
  const rage=Math.sin(ts*0.009)*0.5+0.5; // extra animation for anger

  const mr=parseInt(theme.monsterCol.slice(1,3),16);
  const mg=parseInt(theme.monsterCol.slice(3,5),16);
  const mb=parseInt(theme.monsterCol.slice(5,7),16);

  // Hurt flash — monster flashes white when damaged
  const hurt = monHp < 3 && Math.sin(ts*0.02)>0.5;

  ctx.save();
  ctx.globalAlpha=alpha;

  // ── Massive outer hellfire aura ──
  const aura=ctx.createRadialGradient(screenX,cy+bob,0,screenX,cy+bob,s*1.3);
  aura.addColorStop(0,`rgba(${mr},${mg},${mb},${pulse*0.45})`);
  aura.addColorStop(0.3,`rgba(${mr},${mg},${mb},${pulse*0.18})`);
  aura.addColorStop(0.7,`rgba(${Math.min(255,mr+40)},0,0,${pulse*0.06})`);
  aura.addColorStop(1,'transparent');
  ctx.fillStyle=aura;
  ctx.beginPath();ctx.ellipse(screenX,cy+bob,s*1.3,s*1.5,0,0,Math.PI*2);ctx.fill();

  // ── Ground shadow pool ──
  const shadow=ctx.createRadialGradient(screenX,cy+s*0.55,0,screenX,cy+s*0.55,s*0.65);
  shadow.addColorStop(0,'rgba(0,0,0,0.7)');shadow.addColorStop(1,'transparent');
  ctx.fillStyle=shadow;
  ctx.beginPath();ctx.ellipse(screenX,cy+s*0.55,s*0.65,s*0.12,0,0,Math.PI*2);ctx.fill();

  // ────────────────────────────────────────────────────
  // LEGS — exposed bone legs visible below tattered skirt
  // ────────────────────────────────────────────────────
  const legY=cy+bob+s*0.25;
  const boneCol=hurt?'rgba(255,255,255,0.95)':'rgba(195,180,155,0.9)';
  const boneDark=hurt?'rgba(220,220,200,0.8)':'rgba(140,125,100,0.8)';
  ctx.strokeStyle=boneCol; ctx.lineCap='round';
  // Left leg
  ctx.lineWidth=s*0.045;
  ctx.beginPath();ctx.moveTo(screenX-s*0.12,legY);ctx.lineTo(screenX-s*0.15,legY+s*0.22);ctx.stroke();
  ctx.lineWidth=s*0.038;
  ctx.beginPath();ctx.moveTo(screenX-s*0.15,legY+s*0.22);ctx.lineTo(screenX-s*0.18+Math.sin(ts*0.004)*s*0.04,legY+s*0.44);ctx.stroke();
  // Knee knob left
  ctx.fillStyle=boneCol;ctx.beginPath();ctx.arc(screenX-s*0.15,legY+s*0.22,s*0.04,0,Math.PI*2);ctx.fill();
  // Right leg
  ctx.strokeStyle=boneDark; ctx.lineWidth=s*0.045;
  ctx.beginPath();ctx.moveTo(screenX+s*0.12,legY);ctx.lineTo(screenX+s*0.15,legY+s*0.22);ctx.stroke();
  ctx.lineWidth=s*0.038;
  ctx.beginPath();ctx.moveTo(screenX+s*0.15,legY+s*0.22);ctx.lineTo(screenX+s*0.18-Math.sin(ts*0.004)*s*0.04,legY+s*0.44);ctx.stroke();
  ctx.fillStyle=boneDark;ctx.beginPath();ctx.arc(screenX+s*0.15,legY+s*0.22,s*0.04,0,Math.PI*2);ctx.fill();
  // Feet claws
  ctx.strokeStyle=boneCol; ctx.lineWidth=s*0.022;
  for(let f=-1;f<=1;f+=2){
    const fx=screenX+f*(s*0.18+Math.sin(ts*0.004)*f*s*0.04);
    const fy=legY+s*0.44;
    for(let c=0;c<3;c++){
      ctx.beginPath();ctx.moveTo(fx,fy);
      ctx.lineTo(fx+f*(c*s*0.04+s*0.025),fy+s*0.06+c*s*0.01);ctx.stroke();
    }
  }

  // ────────────────────────────────────────────────────
  // TORSO — exposed ribcage with rotting flesh patches
  // ────────────────────────────────────────────────────
  const torsoTop=cy+bob-s*0.05;
  const torsoBot=cy+bob+s*0.3;
  // Spine column
  ctx.fillStyle=hurt?'rgba(255,240,200,0.95)':'rgba(188,172,145,0.9)';
  for(let v=0;v<6;v++){
    const vy=torsoTop+v*(torsoBot-torsoTop)/6;
    ctx.beginPath();ctx.ellipse(screenX,vy,s*0.028,s*0.022,0,0,Math.PI*2);ctx.fill();
  }
  // Ribs — 4 pairs, curving outward
  ctx.strokeStyle=hurt?'rgba(255,240,200,0.9)':'rgba(188,172,145,0.85)';
  ctx.lineCap='round';
  for(let r=0;r<4;r++){
    const ry=torsoTop+r*s*0.07+s*0.02;
    const ribW=s*(0.14+r*0.02);
    const ribDrop=s*(0.04+r*0.015);
    ctx.lineWidth=s*0.025;
    // Left rib
    ctx.beginPath();
    ctx.moveTo(screenX-s*0.028,ry);
    ctx.bezierCurveTo(screenX-ribW*0.6,ry+ribDrop*0.3,screenX-ribW,ry+ribDrop*0.7,screenX-ribW,ry+ribDrop);
    ctx.stroke();
    // Right rib (slightly different shade for depth)
    ctx.strokeStyle=hurt?'rgba(255,220,180,0.85)':'rgba(155,140,115,0.8)';
    ctx.beginPath();
    ctx.moveTo(screenX+s*0.028,ry);
    ctx.bezierCurveTo(screenX+ribW*0.6,ry+ribDrop*0.3,screenX+ribW,ry+ribDrop*0.7,screenX+ribW,ry+ribDrop);
    ctx.stroke();
    ctx.strokeStyle=hurt?'rgba(255,240,200,0.9)':'rgba(188,172,145,0.85)';
  }
  // Rotting flesh scraps hanging between ribs
  ctx.fillStyle=`rgba(${40+mr*0.15|0},12,10,0.65)`;
  for(let f=0;f<3;f++){
    const fx=screenX+(-0.3+f*0.3)*s*0.25;
    const fy=torsoTop+s*0.05+f*s*0.06;
    ctx.beginPath();
    ctx.moveTo(fx-s*0.04,fy);
    ctx.quadraticCurveTo(fx,fy+s*0.06,fx+s*0.04,fy+s*0.04+Math.sin(ts*0.003+f)*s*0.02);
    ctx.closePath();ctx.fill();
  }

  // ────────────────────────────────────────────────────
  // ARMS — elongated skeletal arms with huge clawed hands
  // ────────────────────────────────────────────────────
  const armY=cy+bob-s*0.02;
  const reach=Math.sin(ts*0.003)*s*0.05;
  const lunge=depth<3?s*0.1*(1-depth/3):0; // lunge arms forward when close
  ctx.strokeStyle=hurt?'rgba(255,240,200,0.92)':'rgba(188,172,145,0.88)';
  // Upper arms
  for(let sd of [-1,1]){
    const elbowX=screenX+sd*(s*0.28+reach*sd);
    const elbowY=armY+s*0.12;
    ctx.lineWidth=s*0.038;
    ctx.beginPath();ctx.moveTo(screenX+sd*s*0.1,armY-s*0.02);ctx.lineTo(elbowX,elbowY);ctx.stroke();
    // Elbow knob
    ctx.fillStyle=hurt?'rgba(255,240,200,0.9)':'rgba(195,180,155,0.9)';
    ctx.beginPath();ctx.arc(elbowX,elbowY,s*0.038,0,Math.PI*2);ctx.fill();
    // Forearm — reaching forward/outward
    const handX=screenX+sd*(s*0.42+reach*sd*1.5+lunge);
    const handY=armY+s*0.24+lunge*0.5;
    ctx.strokeStyle=hurt?'rgba(255,230,190,0.88)':'rgba(165,150,125,0.85)';
    ctx.lineWidth=s*0.03;
    ctx.beginPath();ctx.moveTo(elbowX,elbowY);ctx.lineTo(handX,handY);ctx.stroke();
    // Wrist knob
    ctx.fillStyle=hurt?'rgba(255,240,200,0.88)':'rgba(188,172,145,0.85)';
    ctx.beginPath();ctx.arc(handX,handY,s*0.032,0,Math.PI*2);ctx.fill();
    // 4 clawed fingers
    ctx.strokeStyle=hurt?'rgba(255,255,220,0.9)':hurt?'rgba(255,255,220,0.9)':`rgba(${mr*0.8|0},${mg*0.5|0},${mb*0.5|0},0.88)`;
    ctx.lineWidth=s*0.018;
    for(let c=0;c<4;c++){
      const ca=-0.4+c*0.25+Math.sin(ts*0.005+c)*0.06;
      const cl=s*(0.1+c*0.015);
      ctx.beginPath();
      ctx.moveTo(handX,handY);
      ctx.lineTo(handX+Math.cos(ca)*sd*cl,handY+Math.sin(ca+0.2)*cl*0.75);
      ctx.stroke();
    }
    ctx.strokeStyle=hurt?'rgba(255,240,200,0.92)':'rgba(188,172,145,0.88)';
  }

  // ────────────────────────────────────────────────────
  // SKULL — horned, cracked, huge hollow sockets
  // ────────────────────────────────────────────────────
  const skullY=cy+bob-s*0.32+breathe;
  const sk=s*0.175;

  // ── HORNS — curved ram horns sweeping out and forward ──
  const hornCol=hurt?'rgba(220,200,160,0.95)':`rgba(${30+mr*0.3|0},${mg*0.15|0},${mb*0.1|0},0.92)`;
  ctx.strokeStyle=hornCol; ctx.lineCap='round';
  // Left horn
  ctx.lineWidth=sk*0.38;
  ctx.beginPath();
  ctx.moveTo(screenX-sk*0.55,skullY-sk*0.55);
  ctx.bezierCurveTo(
    screenX-sk*1.1,skullY-sk*1.1,
    screenX-sk*1.5,skullY-sk*0.6,
    screenX-sk*1.2,skullY-sk*0.05
  );ctx.stroke();
  // Horn tip narrower
  ctx.lineWidth=sk*0.12;
  ctx.beginPath();
  ctx.moveTo(screenX-sk*1.3,skullY-sk*0.4);
  ctx.lineTo(screenX-sk*1.2,skullY-sk*0.05);ctx.stroke();
  // Horn texture ridges
  ctx.strokeStyle=hurt?'rgba(180,160,120,0.7)':'rgba(20,8,4,0.5)';
  ctx.lineWidth=sk*0.05;
  for(let r=0;r<3;r++){
    const t2=0.3+r*0.22;
    const rx=screenX-sk*(0.55+t2*0.65)-Math.sin(t2*2)*sk*0.15;
    const ry=skullY-sk*(0.55+t2*0.55)+Math.cos(t2*2)*sk*0.1;
    ctx.beginPath();ctx.arc(rx,ry,sk*0.08,0,Math.PI);ctx.stroke();
  }
  // Right horn
  ctx.strokeStyle=hornCol; ctx.lineWidth=sk*0.38;
  ctx.beginPath();
  ctx.moveTo(screenX+sk*0.55,skullY-sk*0.55);
  ctx.bezierCurveTo(
    screenX+sk*1.1,skullY-sk*1.1,
    screenX+sk*1.5,skullY-sk*0.6,
    screenX+sk*1.2,skullY-sk*0.05
  );ctx.stroke();
  ctx.lineWidth=sk*0.12;
  ctx.beginPath();
  ctx.moveTo(screenX+sk*1.3,skullY-sk*0.4);
  ctx.lineTo(screenX+sk*1.2,skullY-sk*0.05);ctx.stroke();
  // Right horn ridges
  ctx.strokeStyle=hurt?'rgba(180,160,120,0.7)':'rgba(20,8,4,0.5)';
  ctx.lineWidth=sk*0.05;
  for(let r=0;r<3;r++){
    const t2=0.3+r*0.22;
    const rx=screenX+sk*(0.55+t2*0.65)+Math.sin(t2*2)*sk*0.15;
    const ry=skullY-sk*(0.55+t2*0.55)+Math.cos(t2*2)*sk*0.1;
    ctx.beginPath();ctx.arc(rx,ry,sk*0.08,0,Math.PI);ctx.stroke();
  }

  // ── Skull cranium ──
  // Drop shadow
  ctx.fillStyle='rgba(0,0,0,0.72)';
  ctx.beginPath();ctx.ellipse(screenX+sk*0.07,skullY+sk*0.07,sk*1.08,sk*1.2,0,0,Math.PI*2);ctx.fill();
  // Main cranium
  const crCol=hurt?'rgba(240,228,200,0.97)':'rgba(16,11,10,0.97)';
  ctx.fillStyle=crCol;
  ctx.beginPath();ctx.ellipse(screenX,skullY,sk,sk*1.14,0,0,Math.PI*2);ctx.fill();
  // Cranium 3D shading
  const hl=ctx.createRadialGradient(screenX-sk*0.3,skullY-sk*0.35,0,screenX,skullY,sk*1.08);
  hl.addColorStop(0,hurt?'rgba(255,255,240,0.6)':'rgba(68,48,40,0.72)');
  hl.addColorStop(0.55,hurt?'rgba(200,185,160,0.2)':'rgba(24,16,12,0.3)');
  hl.addColorStop(1,'transparent');
  ctx.fillStyle=hl;ctx.beginPath();ctx.ellipse(screenX,skullY,sk,sk*1.14,0,0,Math.PI*2);ctx.fill();
  // Crack lines on skull
  ctx.strokeStyle=hurt?'rgba(255,200,150,0.5)':'rgba(0,0,0,0.6)';
  ctx.lineWidth=sk*0.025;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(screenX+sk*0.1,skullY-sk*0.8);ctx.lineTo(screenX+sk*0.25,skullY-sk*0.2);ctx.lineTo(screenX+sk*0.15,skullY+sk*0.1);ctx.stroke();
  ctx.beginPath();ctx.moveTo(screenX-sk*0.3,skullY-sk*0.5);ctx.lineTo(screenX-sk*0.1,skullY-sk*0.1);ctx.stroke();
  // Jaw — wider and more angular than human
  const jawCol=hurt?'rgba(225,210,185,0.94)':'rgba(12,8,8,0.94)';
  ctx.fillStyle=jawCol;
  ctx.beginPath();
  ctx.moveTo(screenX-sk*1.05,skullY+sk*0.35);
  ctx.bezierCurveTo(screenX-sk*1.05,skullY+sk*0.72,screenX-sk*0.5,skullY+sk*0.92,screenX,skullY+sk*0.9);
  ctx.bezierCurveTo(screenX+sk*0.5,skullY+sk*0.92,screenX+sk*1.05,skullY+sk*0.72,screenX+sk*1.05,skullY+sk*0.35);
  ctx.closePath();ctx.fill();

  // ── EYE SOCKETS — deep, wide, terrifying ──
  const eyeY=skullY-sk*0.06;
  const eyeOff=sk*0.38;
  for(const ex of [screenX-eyeOff,screenX+eyeOff]){
    // Deep black void
    ctx.fillStyle='rgba(0,0,0,1)';
    ctx.beginPath();ctx.ellipse(ex,eyeY,sk*0.3,sk*0.24,0,0,Math.PI*2);ctx.fill();
    // Inner glow — changes color with rage
    const eyeR=Math.min(255,mr+rage*60|0);
    const eyeG2=Math.min(255,mg+rage*20|0);
    const eyeG=ctx.createRadialGradient(ex,eyeY,0,ex,eyeY,sk*0.26);
    eyeG.addColorStop(0,'rgba(255,255,230,0.98)');
    eyeG.addColorStop(0.18,`rgba(${eyeR},${eyeG2},${mb},0.95)`);
    eyeG.addColorStop(0.55,`rgba(${mr},${mg},${mb},0.4)`);
    eyeG.addColorStop(1,'transparent');
    ctx.fillStyle=eyeG;
    ctx.beginPath();ctx.ellipse(ex,eyeY,sk*0.24,sk*0.18,0,0,Math.PI*2);ctx.fill();
    // Slit pupil — vertical like a demon
    ctx.fillStyle='rgba(0,0,0,1)';
    ctx.beginPath();ctx.ellipse(ex,eyeY,sk*0.04,sk*0.14,0,0,Math.PI*2);ctx.fill();
    // Eyeshine
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.beginPath();ctx.arc(ex-sk*0.07,eyeY-sk*0.06,sk*0.03,0,Math.PI*2);ctx.fill();
    // Brow ridge — heavy bone
    ctx.fillStyle=hurt?'rgba(210,195,168,0.85)':'rgba(8,5,5,0.88)';
    ctx.beginPath();
    ctx.moveTo(ex-sk*0.34,eyeY-sk*0.26);
    ctx.bezierCurveTo(ex-sk*0.2,eyeY-sk*0.36,ex+sk*0.2,eyeY-sk*0.36,ex+sk*0.34,eyeY-sk*0.26);
    ctx.closePath();ctx.fill();
  }

  // Nasal cavity — wide T-shaped void
  ctx.fillStyle='rgba(0,0,0,0.94)';
  ctx.beginPath();ctx.ellipse(screenX,skullY+sk*0.22,sk*0.12,sk*0.08,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(screenX-sk*0.12,skullY+sk*0.16,sk*0.07,sk*0.1,0.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(screenX+sk*0.12,skullY+sk*0.16,sk*0.07,sk*0.1,-0.2,0,Math.PI*2);ctx.fill();

  // ── TEETH — large jagged fangs ──
  const teethY=skullY+sk*0.62;
  // Upper teeth (from jaw bone, pointing down)
  ctx.fillStyle=hurt?'rgba(240,228,205,0.9)':'rgba(188,172,145,0.92)';
  const toothWidths=[0.12,0.22,0.18,0.18,0.22,0.12];
  const toothHeights=[0.22,0.32,0.28,0.28,0.32,0.22];
  for(let i=0;i<6;i++){
    const tx2=screenX-sk*0.55+i*sk*0.22;
    ctx.beginPath();
    ctx.moveTo(tx2,teethY-sk*0.04);
    ctx.lineTo(tx2+sk*toothWidths[i],teethY-sk*0.04);
    ctx.lineTo(tx2+sk*toothWidths[i]*0.6,teethY+sk*toothHeights[i]);
    ctx.lineTo(tx2+sk*toothWidths[i]*0.4,teethY+sk*toothHeights[i]);
    ctx.closePath();ctx.fill();
    // Fang shadow
    ctx.fillStyle=hurt?'rgba(200,185,160,0.6)':'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(tx2+sk*toothWidths[i]*0.5,teethY+sk*toothHeights[i]*0.4);
    ctx.lineTo(tx2+sk*toothWidths[i]*0.6,teethY+sk*toothHeights[i]);
    ctx.lineTo(tx2+sk*toothWidths[i]*0.4,teethY+sk*toothHeights[i]);
    ctx.closePath();ctx.fill();
    ctx.fillStyle=hurt?'rgba(240,228,205,0.9)':'rgba(188,172,145,0.92)';
  }
  // Jaw gap
  ctx.fillStyle='rgba(0,0,0,0.78)';
  ctx.fillRect(screenX-sk*0.52,teethY-sk*0.06,sk*1.04,sk*0.06);
  // Hellfire breath from mouth when close
  if(depth<4){
    const bf=Math.sin(ts*0.008+screenX)*0.4+0.6;
    const breathG=ctx.createRadialGradient(screenX,teethY+sk*0.2,0,screenX,teethY+sk*0.2,sk*0.5);
    breathG.addColorStop(0,`rgba(${mr},${Math.min(255,mg+60)},0,${bf*0.7*(1-depth/4)})`);
    breathG.addColorStop(1,'transparent');
    ctx.fillStyle=breathG;
    ctx.beginPath();ctx.ellipse(screenX,teethY+sk*0.2,sk*0.5,sk*0.3,0,0,Math.PI*2);ctx.fill();
  }

  // ── HP indicator — cracks appear as monster takes hits ──
  if(monHp<3){
    const crackAlpha=(3-monHp)/3*0.8;
    ctx.strokeStyle=`rgba(255,100,50,${crackAlpha})`;
    ctx.lineWidth=sk*0.03;ctx.lineCap='round';
    for(let c=0;c<(3-monHp)*2;c++){
      const cx2=screenX+(-0.5+c*0.18)*sk*1.2;
      const startY=skullY-sk*0.6+c*sk*0.25;
      ctx.beginPath();ctx.moveTo(cx2,startY);
      ctx.lineTo(cx2+sk*(0.1-c*0.05),startY+sk*0.2);
      ctx.lineTo(cx2-sk*0.05,startY+sk*0.35);ctx.stroke();
    }
  }

  // ── Smoke/hellfire rising from shoulders ──
  ctx.lineCap='round';
  for(let i=0;i<7;i++){
    const bx=screenX+(-0.5+i/6)*s*0.42;
    const prog=(ts*0.0013+i*0.36)%1;
    const tx3=bx+Math.sin(ts*0.003+i*2.1)*s*0.1;
    const ty3=cy+bob+s*0.1-prog*s*1.0;
    const ta=Math.max(0,(0.45-prog)*pulse*0.7);
    ctx.strokeStyle=`rgba(${mr*0.6|0},${mg*0.22|0},${mb*0.15|0},${ta})`;
    ctx.lineWidth=s*0.055*(1-prog);
    ctx.beginPath();ctx.moveTo(bx,cy+bob+s*0.12);ctx.quadraticCurveTo(tx3-s*0.07,ty3+s*0.3,tx3,ty3);ctx.stroke();
  }

  // ── Proximity: eyes FLARE, horns spark ──
  if(depth<3.5){
    const cp=(1-depth/3.5)*pulse;
    for(const ex of [screenX-eyeOff,screenX+eyeOff]){
      const wg=ctx.createRadialGradient(ex,eyeY,0,ex,eyeY,sk*0.85);
      wg.addColorStop(0,`rgba(255,255,200,${cp*0.95})`);
      wg.addColorStop(0.4,`rgba(${mr},${mg},${mb},${cp*0.5})`);
      wg.addColorStop(1,'transparent');
      ctx.fillStyle=wg;ctx.beginPath();ctx.arc(ex,eyeY,sk*0.85,0,Math.PI*2);ctx.fill();
    }
    // Horn tip sparks
    ctx.strokeStyle=`rgba(255,200,50,${cp*0.8})`;
    ctx.lineWidth=sk*0.06;
    for(let sd of [-1,1]){
      const htx=screenX+sd*sk*1.2, hty=skullY-sk*0.05;
      for(let sp=0;sp<4;sp++){
        const sa=ts*0.015+sp*1.5;
        ctx.beginPath();ctx.moveTo(htx,hty);ctx.lineTo(htx+Math.cos(sa)*sk*0.22,hty+Math.sin(sa)*sk*0.22);ctx.stroke();
      }
    }
  }

  ctx.restore();
}


/* ══ MAP OVERLAY (React component — rendered over the canvas) ══
   Full maze map as a DOM overlay. No canvas needed.
   Shows all tiles, encounters, player + monster positions.
════════════════════════════════════════════════════════════ */
function MapOverlay({gs, theme, onClose}) {
  const s = gs.current;
  if (!s) return null;

  const {maze, monX, monY, px, py, angle, openDoors, clearedTraps, openedChests} = s;
  const {tiles, TW, TH} = maze;

  // Build canvas ref to draw the map
  const cvs = useRef(null);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Background
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(0, 0, W, H);

    // Scale to fit
    const pad = 24;
    const legendH = 60;
    const scaleX = (W - pad * 2) / TW;
    const scaleY = (H - pad * 2 - legendH) / TH;
    const scale = Math.min(scaleX, scaleY, 20);
    const offX = Math.floor((W - TW * scale) / 2);
    const offY = Math.floor((H - legendH - TH * scale) / 2);

    // Draw tiles
    for (let ty = 0; ty < TH; ty++) {
      for (let tx = 0; tx < TW; tx++) {
        const t = tiles[ty][tx];
        const rx = offX + tx * scale, ry = offY + ty * scale;
        const w = Math.max(1, Math.ceil(scale)), h = Math.max(1, Math.ceil(scale));

        if (t === T_WALL) {
          ctx.fillStyle = '#52443a'; ctx.fillRect(rx, ry, w, h);
          ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(rx, ry, w, 1); ctx.fillRect(rx, ry, 1, h);
          ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(rx, ry + h - 1, w, 1); ctx.fillRect(rx + w - 1, ry, 1, h);
        } else {
          let c = '#221a14';
          const key = `${tx},${ty}`;
          if (t === T_DOOR && !openDoors.has(key))   c = `rgb(${theme.doorA[0]*0.55|0},${theme.doorA[1]*0.38|0},${theme.doorA[2]*0.18|0})`;
          else if (t === T_EXIT)                      c = `rgb(${theme.exitA[0]},${theme.exitA[1]},${theme.exitA[2]})`;
          else if (t === T_TRAP && !clearedTraps.has(key)) c = '#7a1e00';
          else if (t === T_SHRINE)                    c = '#3a0a70';
          else if (t === T_CHEST && !(openedChests||new Set()).has(key)) c = '#6a5000';
          ctx.fillStyle = c; ctx.fillRect(rx, ry, w, h);
          // Subtle grid
          ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(rx, ry, w, 1); ctx.fillRect(rx, ry, 1, h);
        }
      }
    }

    // Draw encounter icons (only if tiles are big enough to show them)
    if (scale >= 9) {
      const fs = Math.max(7, Math.min(14, scale * 0.85));
      ctx.font = `${fs}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let ty = 0; ty < TH; ty++) {
        for (let tx = 0; tx < TW; tx++) {
          const t = tiles[ty][tx];
          const key = `${tx},${ty}`;
          const cx2 = offX + tx * scale + scale / 2, cy2 = offY + ty * scale + scale / 2;
          if (t === T_DOOR && !openDoors.has(key))         ctx.fillText('🔒', cx2, cy2);
          else if (t === T_EXIT)                            ctx.fillText('🚪', cx2, cy2);
          else if (t === T_TRAP && !clearedTraps.has(key)) ctx.fillText('⚠', cx2, cy2);
          else if (t === T_SHRINE)                          ctx.fillText('🏛', cx2, cy2);
          else if (t === T_CHEST && !(openedChests||new Set()).has(key)) ctx.fillText('📦', cx2, cy2);
        }
      }
    } else {
      // Small scale: just dots for important things
      for (let ty = 0; ty < TH; ty++) {
        for (let tx = 0; tx < TW; tx++) {
          const t = tiles[ty][tx];
          const key = `${tx},${ty}`;
          const cx2 = offX + tx * scale + scale / 2, cy2 = offY + ty * scale + scale / 2;
          const r = Math.max(1.5, scale * 0.35);
          if (t === T_EXIT) { ctx.fillStyle = `rgb(${theme.exitA[0]},${theme.exitA[1]},${theme.exitA[2]})`; ctx.beginPath(); ctx.arc(cx2,cy2,r*1.4,0,Math.PI*2); ctx.fill(); }
        }
      }
    }

    // Monster — glowing colored dot
    const msx = offX + monX * scale, msy = offY + monY * scale;
    const mr = parseInt(theme.monsterCol.slice(1,3),16);
    const mg = parseInt(theme.monsterCol.slice(3,5),16);
    const mb = parseInt(theme.monsterCol.slice(5,7),16);
    const monR = scale * 2.2;
    const monGrd = ctx.createRadialGradient(msx, msy, 0, msx, msy, monR);
    monGrd.addColorStop(0, `rgba(${mr},${mg},${mb},0.9)`);
    monGrd.addColorStop(0.4, `rgba(${mr},${mg},${mb},0.4)`);
    monGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = monGrd; ctx.beginPath(); ctx.arc(msx, msy, monR, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(msx, msy, Math.max(2, scale*0.55), 0, Math.PI*2); ctx.fill();
    // Monster emoji label
    ctx.font = `${Math.max(10, scale * 0.9)}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('👁', msx, msy - scale * 0.3);

    // Player — bright white dot + direction arrow
    const psx = offX + px * scale, psy = offY + py * scale;
    const pGrd = ctx.createRadialGradient(psx, psy, 0, psx, psy, scale * 2.5);
    pGrd.addColorStop(0, 'rgba(255,255,255,0.7)'); pGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = pGrd; ctx.beginPath(); ctx.arc(psx, psy, scale * 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00ff88'; ctx.beginPath(); ctx.arc(psx, psy, Math.max(2.5, scale*0.65), 0, Math.PI*2); ctx.fill();
    // Direction arrow
    const aLen = scale * 2.5;
    const ax = psx + Math.cos(angle) * aLen, ay = psy + Math.sin(angle) * aLen;
    ctx.strokeStyle = '#00ff88'; ctx.lineWidth = Math.max(1.5, scale * 0.18); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(psx, psy); ctx.lineTo(ax, ay); ctx.stroke();
    ctx.fillStyle = '#00ff88'; ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax + Math.cos(angle + 2.5) * scale * 0.7, ay + Math.sin(angle + 2.5) * scale * 0.7);
    ctx.lineTo(ax + Math.cos(angle - 2.5) * scale * 0.7, ay + Math.sin(angle - 2.5) * scale * 0.7);
    ctx.closePath(); ctx.fill();

    // Legend bar
    const legendY = H - legendH + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, H - legendH, W, legendH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, H-legendH); ctx.lineTo(W, H-legendH); ctx.stroke();
    const items = [['🟢','YOU'],['👁','MONSTER'],['🔒','DOOR'],['⚠','TRAP'],['🏛','SHRINE'],['📦','CHEST'],['🚪','EXIT']];
    const itemW = Math.min(90, W / items.length);
    const startX = (W - items.length * itemW) / 2;
    items.forEach(([icon, label], i) => {
      const lx = startX + i * itemW + itemW / 2;
      ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(icon, lx, legendY + 10);
      ctx.font = "6px 'Press Start 2P',monospace"; ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(label, lx, legendY + 28);
    });

  }, []);  // draw once when mounted — state is captured from gs.current at mount time

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:800,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        background:'rgba(0,0,0,0.88)', backdropFilter:'blur(4px)',
        animation:'fadeIn .18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:'relative',
          width:'min(95vw, 700px)', height:'min(88vh, 600px)',
          background:'#0a0808',
          border:`2px solid ${theme.monsterCol}88`,
          borderRadius:16,
          boxShadow:`0 0 60px ${theme.monsterCol}44, 0 20px 60px rgba(0,0,0,0.9)`,
          overflow:'hidden',
          display:'flex', flexDirection:'column',
        }}
      >
        {/* Header */}
        <div style={{
          background:`linear-gradient(90deg,${theme.monsterCol}22,transparent)`,
          borderBottom:`1px solid ${theme.monsterCol}33`,
          padding:'10px 16px',
          display:'flex', alignItems:'center', gap:10,
          fontFamily:"'Press Start 2P'",
          flexShrink:0,
        }}>
          <span style={{fontSize:'1.1rem'}}>🗺️</span>
          <span style={{color:'#fff',fontSize:'.5rem',flex:1}}>MAZE MAP</span>
          <span style={{color:'rgba(255,255,255,.3)',fontSize:'.36rem'}}>MONSTER PAUSED</span>
          <button
            onClick={onClose}
            style={{background:'transparent',border:'1px solid rgba(255,255,255,.2)',borderRadius:6,color:'rgba(255,255,255,.5)',cursor:'pointer',padding:'4px 10px',fontFamily:"'Press Start 2P'",fontSize:'.36rem'}}
          >✕ CLOSE [M]</button>
        </div>
        {/* Map canvas */}
        <canvas
          ref={cvs}
          width={Math.min(window.innerWidth * 0.95, 700) - 4}
          height={Math.min(window.innerHeight * 0.88, 600) - 52}
          style={{display:'block', flex:1, width:'100%', height:'100%'}}
        />
      </div>
      <div style={{color:'rgba(255,255,255,.3)',fontFamily:"'Press Start 2P'",fontSize:'.28rem',marginTop:12}}>TAP OUTSIDE OR PRESS M TO CLOSE</div>
    </div>
  );
}


/* ══ MINIMAP ════════════════════════════════════════════════════ */
function drawMinimap(ctx,W,H,px,py,angle,tiles,TW,TH,monX,monY,theme,openDoors,clearedTraps){
  const S=3,RANGE=11;
  const mW=RANGE*2*S,mH=RANGE*2*S,ox=W-mW-8,oy=44;
  ctx.fillStyle='rgba(0,0,0,0.82)';ctx.fillRect(ox-2,oy-2,mW+4,mH+4);
  ctx.strokeStyle='rgba(255,255,255,0.09)';ctx.strokeRect(ox-2,oy-2,mW+4,mH+4);
  const sx=Math.floor(px)-RANGE,sy=Math.floor(py)-RANGE;
  for(let dy=0;dy<RANGE*2;dy++) for(let dx=0;dx<RANGE*2;dx++){
    const mx=sx+dx,my=sy+dy;
    if(mx<0||my<0||mx>=TW||my>=TH) continue;
    const t=tiles[my][mx];
    if(t===T_WALL){ctx.fillStyle='#3a3230';ctx.fillRect(ox+dx*S,oy+dy*S,S,S);}
    else if(t===T_DOOR){
      ctx.fillStyle=openDoors.has(`${mx},${my}`)?'#252010':`rgb(${theme.doorA[0]*0.7|0},${theme.doorA[1]*0.5|0},${theme.doorA[2]*0.3|0})`;
      ctx.fillRect(ox+dx*S,oy+dy*S,S,S);
    }
    else if(t===T_EXIT){ctx.fillStyle=`rgb(${theme.exitA[0]},${theme.exitA[1]},${theme.exitA[2]})`;ctx.fillRect(ox+dx*S,oy+dy*S,S,S);}
    else if(t===T_TRAP&&!clearedTraps.has(`${mx},${my}`)){ctx.fillStyle='#cc4400';ctx.fillRect(ox+dx*S,oy+dy*S,S,S);}
    else if(t===T_SHRINE){ctx.fillStyle='#8855cc';ctx.fillRect(ox+dx*S,oy+dy*S,S,S);}
    else if(t===T_CHEST){ctx.fillStyle='#ccaa00';ctx.fillRect(ox+dx*S,oy+dy*S,S,S);}
  }
  const mmx=Math.floor(monX)-sx,mmy=Math.floor(monY)-sy;
  if(mmx>=0&&mmy>=0&&mmx<RANGE*2&&mmy<RANGE*2){
    ctx.fillStyle=theme.monsterCol;
    ctx.beginPath();ctx.arc(ox+mmx*S+S/2,oy+mmy*S+S/2,S*0.95,0,Math.PI*2);ctx.fill();
  }
  const ppx=ox+RANGE*S,ppy=oy+RANGE*S;
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ppx,ppy,2.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(ppx,ppy);ctx.lineTo(ppx+Math.cos(angle)*7,ppy+Math.sin(angle)*7);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.16)';ctx.font="6px monospace";ctx.textAlign='center';
  ctx.fillText("MAP",ox+mW/2,oy-3);
}

/* ══ QUESTION DIALOG ════════════════════════════════════════════ */
function QuestionDialog({kidId,difficulty,encType,question,onCorrect,onWrong,monsterClose,theme}){
  const kid=KIDS[kidId];
  const[q,setQ]=useState(null);const[choices,setChoices]=useState([]);const[sel,setSel]=useState(null);const[answered,setAnswered]=useState(false);
  useEffect(()=>{const ch=question;if(!ch)return;setQ(ch);setChoices([...ch.c].sort(()=>Math.random()-0.5));},[]);
  function answer(c){if(answered)return;setSel(c);setAnswered(true);setTimeout(()=>{c===q.a?onCorrect():onWrong();},870);}
  if(!q)return null;
  const correct=sel===q?.a;
  const tc=answered?(correct?'#69f0ae':'#ff4444'):kid.color;
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.93)',backdropFilter:'blur(5px)',zIndex:600,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 12px 20px'}}>
      {monsterClose&&<div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,${theme.monsterCol}28 0%,transparent 50%)`,pointerEvents:'none',animation:'bloodPulse .7s ease infinite'}}/>}
      <div style={{width:'100%',maxWidth:660,background:'#07070f',border:`2px solid ${tc}`,borderRadius:20,boxShadow:`0 -6px 50px ${tc}44`,fontFamily:"'VT323'",overflow:'hidden',animation:'slideUp .2s ease'}}>
        <div style={{background:`linear-gradient(90deg,${tc}18,transparent)`,borderBottom:`1px solid ${tc}18`,padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:'1.5rem'}}>{encType==='catch'?'💀':encType==='trap'?'⚠️':encType==='shrine'?'🏛️':encType==='chest'?'📦':'🔒'}</div>
          <div style={{flex:1}}><div style={{color:tc,fontFamily:"'Press Start 2P'",fontSize:'.42rem'}}>{encType==='catch'?'IT HAS YOU — ANSWER TO ESCAPE!':encType==='trap'?'FLOOR TRAP — DISARM!':encType==='shrine'?'ANCIENT SHRINE':encType==='chest'?'LOCKED CHEST':'LOCKED DOOR'}</div><div style={{color:'rgba(255,255,255,.3)',fontSize:'.78rem',marginTop:2}}>{difficulty.toUpperCase()} · {kid.emoji} {kid.name}</div></div>
          {monsterClose&&<div style={{color:theme.monsterCol,fontFamily:"'Press Start 2P'",fontSize:'.35rem',animation:'pulse .5s ease infinite'}}>⚠ IT'S CLOSE</div>}
        </div>
        <div style={{padding:'14px 18px 14px'}}>
          <div style={{background:'rgba(255,255,255,.04)',border:`1px solid ${tc}18`,borderRadius:11,padding:'13px 15px',marginBottom:13}}>
            <p style={{color:'#f0f0f0',fontSize:'1.28rem',margin:0,lineHeight:1.65}}>{q.q}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {choices.map((c,i)=>{
              let bg='rgba(255,255,255,.04)',border='1px solid rgba(255,255,255,.09)',col='#bbb';
              if(answered){if(c===q.a){bg='#0a2e14';border='1px solid #4caf50';col='#69f0ae';}else if(c===sel){bg='#2e0a0a';border='1px solid #f44336';col='#ff5252';}else col='rgba(255,255,255,.2)';}
              return(<button key={i} onClick={()=>answer(c)} style={{background:bg,border,borderRadius:11,padding:'12px 10px',color:col,fontSize:'1.1rem',cursor:answered?'default':'pointer',textAlign:'center',transition:'all .15s',fontFamily:"'VT323'",lineHeight:1.3}}>
                <span style={{color:'rgba(255,255,255,.28)',marginRight:4}}>{String.fromCharCode(65+i)}.</span>{c}
              </button>);
            })}
          </div>
          {answered&&<div style={{textAlign:'center',marginTop:11,color:correct?'#69f0ae':'#ff4444',fontFamily:"'Press Start 2P'",fontSize:'.43rem'}}>{correct?'✅ DOOR UNLOCKED!':`❌ Wrong — answer: "${q.a}". Monster advances!`}</div>}
        </div>
      </div>
    </div>
  );
}

/* ══ UI SCREENS ═════════════════════════════════════════════════ */
function HeroSelect({onSelect}){
  const[hov,setHov]=useState(null);
  const[lb]=useState(()=>loadLeaderboard());
  return(
    <div style={{minHeight:'100vh',background:'radial-gradient(ellipse at 50% 30%,#0f0508,#040409 60%,#000)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 16px',fontFamily:"'Press Start 2P'",position:'relative',overflow:'hidden',gap:0}}>
      {[...Array(40)].map((_,i)=><div key={i} style={{position:'absolute',left:((i*37+i*13)%100)+'%',top:((i*23+i*7)%90)+'%',width:'2px',height:'2px',borderRadius:'50%',background:'white',animation:`tw ${1.2+i%4*0.6}s ease-in-out infinite`,animationDelay:(i*0.08)+'s',pointerEvents:'none'}}/>)}

      {/* Title */}
      <div style={{textAlign:'center',marginBottom:20,animation:'drift 4s ease infinite',zIndex:1}}>
        <div style={{fontSize:'clamp(.55rem,2vw,.85rem)',color:'#ff2200',textShadow:'0 0 32px #ff0000aa',letterSpacing:4,marginBottom:6}}>👁  QUEST ACADEMY  👁</div>
        <div style={{fontSize:'clamp(.4rem,1.5vw,.58rem)',color:'#880000',textShadow:'0 0 16px #88000088',letterSpacing:2}}>THE MAZE</div>
      </div>

      {/* Main layout: heroes left, leaderboard right */}
      <div style={{display:'flex',gap:24,flexWrap:'wrap',justifyContent:'center',alignItems:'flex-start',zIndex:1,width:'100%',maxWidth:900}}>

        {/* Hero cards */}
        <div style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',flex:'0 0 auto'}}>
          {Object.entries(KIDS).map(([id,kid],i)=>{const isH=hov===id;return(<button key={id} onClick={()=>onSelect(id)} onMouseEnter={()=>setHov(id)} onMouseLeave={()=>setHov(null)}
            style={{background:kid.bg,border:'2px solid '+(isH?kid.color:kid.color+'33'),borderRadius:18,padding:'22px 18px',cursor:'pointer',textAlign:'center',width:170,fontFamily:"'Press Start 2P'",boxShadow:isH?`0 0 40px ${kid.color}44,0 12px 32px rgba(0,0,0,.8)`:'0 4px 20px rgba(0,0,0,.6)',transform:isH?'translateY(-6px) scale(1.04)':'none',transition:'all .2s ease',animation:`scaleIn .4s ease ${i*0.1}s both`}}>
            <div style={{fontSize:'2.6rem',marginBottom:10}}>{kid.emoji}</div>
            <div style={{color:'#fff',fontSize:'.62rem',marginBottom:5,textShadow:'0 0 12px '+kid.color}}>{kid.name}</div>
            <div style={{color:kid.color,fontSize:'.29rem',marginBottom:14,opacity:.8,lineHeight:1.8}}>{kid.desc}</div>
            <div style={{background:isH?kid.color:'transparent',border:'1.5px solid '+kid.color,borderRadius:8,padding:'6px 10px',color:isH?'#000':kid.color,fontSize:'.34rem',transition:'all .18s'}}>▶ ENTER</div>
          </button>);})}
        </div>

        {/* Leaderboard panel */}
        <div style={{
          flex:'1 1 260px', minWidth:260, maxWidth:360,
          background:'rgba(0,0,0,0.6)',
          border:'1px solid rgba(255,215,0,0.2)',
          borderRadius:16, padding:'16px 18px',
          animation:'scaleIn .5s ease .3s both',
        }}>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{fontSize:'1.2rem',marginBottom:4}}>🏆</div>
            <div style={{color:'#FFD700',fontSize:'.42rem',textShadow:'0 0 12px #FFD700aa',letterSpacing:2}}>LEADERBOARD</div>
            <div style={{color:'rgba(255,215,0,.3)',fontSize:'.24rem',marginTop:4}}>TOP {LB_MAX} SCORES</div>
          </div>
          <LeaderboardTable entries={lb} />
        </div>
      </div>

      <div style={{color:'rgba(255,70,70,.14)',fontSize:'.22rem',marginTop:18,letterSpacing:2,zIndex:1}}>WASD MOVE · Q/E TURN · SPACE INTERACT</div>
    </div>
  );
}
function LevelIntro({level,theme,onStart}){
  useEffect(()=>{const t=setTimeout(onStart,2700);return()=>clearTimeout(t);},[]);
  return(<div style={{position:'fixed',inset:0,background:'#000',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:800,fontFamily:"'Press Start 2P'",cursor:'pointer',animation:'levelIn .5s ease'}} onClick={onStart}><div style={{textAlign:'center'}}>
    <div style={{fontSize:'clamp(.56rem,2vw,.78rem)',color:theme.monsterCol,textShadow:`0 0 42px ${theme.monsterCol}`,letterSpacing:3,marginBottom:10}}>LEVEL {level}</div>
    <div style={{color:'#fff',fontSize:'clamp(.44rem,1.6vw,.6rem)',marginBottom:6}}>{theme.name}</div>
    <div style={{color:'rgba(255,170,170,.45)',fontSize:'.3rem',marginBottom:4}}>{theme.monsterName} HUNTS YOU</div>
    <div style={{color:'rgba(255,255,255,.2)',fontSize:'.27rem',marginTop:30,letterSpacing:2,animation:'pulse 1.1s ease infinite'}}>TAP TO BEGIN</div>
  </div></div>);
}
function DeathScreen({kidId,lives,onRetry,onMenu}){
  const kid=KIDS[kidId];
  return(<div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 40%,#360000,#070000 70%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:900,fontFamily:"'Press Start 2P'",animation:'fadeIn .45s ease'}}>
    <div style={{textAlign:'center',maxWidth:440,padding:'0 24px'}}>
      <div style={{fontSize:'4.5rem',marginBottom:14,animation:'pulse 1s ease infinite'}}>💀</div>
      <div style={{fontSize:'clamp(.58rem,2.2vw,.82rem)',color:'#ff1a00',textShadow:'0 0 30px #ff0000',marginBottom:10,letterSpacing:2}}>CAUGHT!</div>
      <div style={{color:'rgba(255,170,170,.42)',fontSize:'.35rem',marginBottom:6,lineHeight:2}}>{kid.name} was taken.</div>
      <div style={{display:'flex',gap:5,justifyContent:'center',marginBottom:26}}>
        {[...Array(3)].map((_,i)=><span key={i} style={{fontSize:'1.4rem',opacity:i<lives?1:0.12}}>❤️</span>)}
        <span style={{color:'rgba(255,100,100,.45)',fontSize:'.28rem',alignSelf:'center',marginLeft:6}}>{lives} left</span>
      </div>
      <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
        <button onClick={onRetry} style={{background:'#bb1800',color:'#fff',border:'none',borderRadius:11,padding:'12px 22px',fontFamily:"'Press Start 2P'",fontSize:'.42rem',cursor:'pointer'}}>↩ RETRY</button>
        <button onClick={onMenu} style={{background:'transparent',color:'rgba(255,255,255,.32)',border:'1px solid rgba(255,255,255,.16)',borderRadius:11,padding:'12px 18px',fontFamily:"'Press Start 2P'",fontSize:'.36rem',cursor:'pointer'}}>MENU</button>
      </div>
    </div>
  </div>);
}
function GameOverScreen({kidId,score,onMenu}){
  const kid=KIDS[kidId];
  return(<div style={{position:'fixed',inset:0,background:'#000',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:900,fontFamily:"'Press Start 2P'",animation:'fadeIn .5s ease',overflowY:'auto',padding:'20px 0'}}>
    <div style={{textAlign:'center',maxWidth:480,padding:'0 24px',width:'100%'}}>
      <div style={{fontSize:'3.5rem',marginBottom:10}}>☠️</div>
      <div style={{fontSize:'clamp(.52rem,2vw,.78rem)',color:'#ff0000',textShadow:'0 0 42px #ff0000',marginBottom:8,letterSpacing:2}}>GAME OVER</div>
      <div style={{color:'rgba(255,140,140,.38)',fontSize:'.3rem',marginBottom:10,lineHeight:2}}>{kid.name} has been claimed.</div>
      <div style={{background:'rgba(0,0,0,0.6)',border:'1px solid rgba(255,100,100,0.4)',borderRadius:10,padding:'8px 20px',marginBottom:16,display:'inline-block'}}>
        <div style={{color:'rgba(255,100,100,0.4)',fontSize:'.22rem',letterSpacing:2,marginBottom:3}}>FINAL SCORE</div>
        <div style={{color:'rgba(255,150,150,0.9)',fontSize:'clamp(.9rem,3vw,1.3rem)',lineHeight:1}}>{score||0}</div>
      </div>
      <div style={{marginBottom:8}}><ScoreSubmit score={score||0} kidId={kidId} onDone={onMenu}/></div>
    </div>
  </div>);
}
function LevelClearScreen({kidId,level,lives,score,isLast,onNext,onMenu}){
  const kid=KIDS[kidId];
  return(<div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 40%,#002810,#000508 70%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:900,fontFamily:"'Press Start 2P'",animation:'fadeIn .4s ease',overflowY:'auto',padding:'20px 0'}}>
    <div style={{textAlign:'center',maxWidth:480,padding:'0 24px',width:'100%'}}>
      <div style={{fontSize:'3.5rem',marginBottom:10}}>{isLast?'🏆':'🚪'}</div>
      <div style={{fontSize:'clamp(.48rem,1.8vw,.72rem)',color:'#00ff88',textShadow:'0 0 30px #00ff88',marginBottom:8,letterSpacing:2}}>{isLast?'ALL CLEAR!':'ESCAPED!'}</div>
      <div style={{color:'rgba(170,255,195,.4)',fontSize:'.3rem',marginBottom:8,lineHeight:2}}>{isLast?`${kid.name} conquered all 3 mazes!`:`${kid.name} escaped level ${level}.`}</div>
      <div style={{background:'rgba(0,0,0,0.6)',border:'2px solid #FFD700',borderRadius:10,padding:'8px 20px',marginBottom:10,display:'inline-block'}}>
        <div style={{color:'rgba(255,215,0,0.5)',fontSize:'.22rem',letterSpacing:2,marginBottom:3}}>SCORE</div>
        <div style={{color:'#FFD700',fontSize:'clamp(.9rem,3vw,1.3rem)',textShadow:'0 0 20px #FFD700aa',lineHeight:1}}>{score||0}</div>
      </div>
      <div style={{display:'flex',gap:5,justifyContent:'center',marginBottom:12}}>{[...Array(3)].map((_,i)=><span key={i} style={{fontSize:'1.1rem',opacity:i<lives?1:0.12}}>❤️</span>)}</div>
      {!isLast&&(
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:10}}>
          <button onClick={onNext} style={{background:'#005e1c',color:'#fff',border:'none',borderRadius:11,padding:'12px 22px',fontFamily:"'Press Start 2P'",fontSize:'.42rem',cursor:'pointer'}}>▶ LEVEL {level+1}</button>
          <button onClick={onMenu} style={{background:'transparent',color:'rgba(255,255,255,.32)',border:'1px solid rgba(255,255,255,.16)',borderRadius:11,padding:'12px 18px',fontFamily:"'Press Start 2P'",fontSize:'.36rem',cursor:'pointer'}}>MENU</button>
        </div>
      )}
      {isLast&&<ScoreSubmit score={score||0} kidId={kidId} onDone={onMenu}/>}
    </div>
  </div>);
}

/* ══ MAZE GAME ══════════════════════════════════════════════════ */
function MazeGame({kidId,onMenu}){
  const kid=KIDS[kidId];
  const cvs=useRef(null);
  const raf=useRef(null);
  const keys=useRef(new Set());
  const gs=useRef(null);
  const[ui,setUi]=useState({phase:'levelIntro',level:0,lives:3,wrongCount:0,dialog:null,shake:false,notif:null,score:0,mapMode:false});
  const uiRef=useRef(ui);uiRef.current=ui;

  // Draw next question from shuffled deck — reshuffle when exhausted
  function drawQuestion(difficulty){
    const s=gs.current; if(!s||!s.decks) return null;
    const deck=s.decks[difficulty]||s.decks.easy;
    let idx=s.deckIdx[difficulty]||0;
    if(idx>=deck.length){
      // Reshuffle deck
      for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
      idx=0;
    }
    s.deckIdx[difficulty]=idx+1;
    return deck[idx];
  }

  function buildLevel(levelIdx,lives){
    const cfg=LEVEL_CFG[levelIdx],theme=THEMES[levelIdx];
    const maze=generateMaze(cfg.mw,cfg.mh,cfg.doors,cfg.traps,cfg.shrines,cfg.chests);
    // Build shuffled decks for each difficulty tier — no repeats until deck exhausted
    function shuffleDeck(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
    const allQ=Q[kidId];
    const decks={
      easy:  shuffleDeck(allQ.filter(q=>q.d==='easy')),
      medium:shuffleDeck(allQ.filter(q=>q.d==='medium')),
      hard:  shuffleDeck(allQ.filter(q=>q.d==='hard')),
    };
    const deckIdx={easy:0,medium:0,hard:0};
    gs.current={maze,cfg,theme,levelIdx,px:maze.playerStart.x,py:maze.playerStart.y,angle:0,monX:maze.monsterStart.x,monY:maze.monsterStart.y,monPath:null,monTimer:0,openDoors:new Set(),clearedTraps:new Set(),visitedTraps:new Set(),openedChests:new Set(),score:0,wrongCount:0,lives,monHp:3,catching:false,mapMode:false,decks,deckIdx};
    setUi({phase:'levelIntro',level:levelIdx,lives,wrongCount:0,dialog:null,shake:false});
  }
  useEffect(()=>{buildLevel(0,3);},[]);

  useEffect(()=>{
    const dn=e=>{keys.current.add(e.key);if((e.key===' '||e.key==='Enter')&&uiRef.current.phase==='playing'&&!uiRef.current.dialog&&!uiRef.current.mapMode)tryInteract();if((e.key==='m'||e.key==='M')&&uiRef.current.phase==='playing')setUi(prev=>({...prev,mapMode:!prev.mapMode}));};
    const up=e=>keys.current.delete(e.key);
    window.addEventListener('keydown',dn);window.addEventListener('keyup',up);
    return()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up);};
  },[]);

  function canMove(nx,ny){
    const s=gs.current;if(!s)return false;
    const m=0.25;
    for(const[cx,cy]of[[nx-m,ny-m],[nx+m,ny-m],[nx-m,ny+m],[nx+m,ny+m]]){
      const tx=Math.floor(cx),ty=Math.floor(cy);
      if(tx<0||ty<0||tx>=s.maze.TW||ty>=s.maze.TH)return false;
      const t=s.maze.tiles[ty][tx];
      if(t===T_WALL)return false;
      if(t===T_DOOR&&!s.openDoors.has(`${tx},${ty}`))return false;
      if(t===T_TRAP&&!s.clearedTraps.has(`${tx},${ty}`))return true; // traps are walkable, trigger on entry
    }
    return true;
  }

  function tryInteract(){
    const s=gs.current;if(!s)return;
    const diffs=['easy','medium','hard'];
    const diff=diffs[Math.min(2,s.levelIdx)];
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const tx=Math.floor(s.px+dx*0.85),ty=Math.floor(s.py+dy*0.85);
      if(tx<0||ty<0||tx>=s.maze.TW||ty>=s.maze.TH)continue;
      const t=s.maze.tiles[ty][tx];
      const dist=Math.hypot(tx+0.5-s.px,ty+0.5-s.py);
      if(t===T_DOOR&&!s.openDoors.has(`${tx},${ty}`)&&dist<1.45){
        setUi(prev=>({...prev,dialog:{tx,ty,type:'door',difficulty:diff,question:drawQuestion(diff)}}));return;
      }
      if(t===T_SHRINE&&dist<1.45){
        setUi(prev=>({...prev,dialog:{tx,ty,type:'shrine',difficulty:diff,question:drawQuestion(diff)}}));return;
      }
      if(t===T_CHEST&&!s.openedChests.has(`${tx},${ty}`)&&dist<1.45){
        setUi(prev=>({...prev,dialog:{tx,ty,type:'chest',difficulty:diff,question:drawQuestion(diff)}}));return;
      }
    }
    if(Math.hypot(s.maze.exitPos.x-s.px,s.maze.exitPos.y-s.py)<1.4)handleExit();
  }

  function handleCorrect(){
    const s=gs.current; const {tx,ty,type}=uiRef.current.dialog;
    if(type==='catch'){
      // Player escaped! Knock monster back and reduce its HP
      s.catching=false;
      s.monHp=Math.max(0,s.monHp-1);
      // Push monster away hard
      const dx=s.monX-s.px, dy=s.monY-s.py;
      const dist=Math.hypot(dx,dy);
      if(dist>0.1){ s.monX+=dx/dist*6; s.monY+=dy/dist*6; }
      s.monPath=null; // force repath
      // If monster HP hits 0, stun it far away for a bit
      if(s.monHp<=0){
        s.monX=s.maze.monsterStart.x; s.monY=s.maze.monsterStart.y;
        s.monHp=3; s.monPath=null;
        setUi(prev=>({...prev,dialog:null,notif:'💥 MONSTER STUNNED! RUN!'}));
        setTimeout(()=>setUi(prev=>({...prev,notif:null})),2200);
      } else {
        setUi(prev=>({...prev,dialog:null,notif:'⚡ YOU ESCAPED! Monster HP: '+'❤'.repeat(s.monHp)}));
        setTimeout(()=>setUi(prev=>({...prev,notif:null})),1800);
      }
    } else if(type==='trap'){
      s.clearedTraps.add(`${tx},${ty}`);
      s.score=(s.score||0)+10;
      setUi(prev=>({...prev,dialog:null,notif:'🗡 TRAP DISARMED! +10pts',score:s.score}));
      setTimeout(()=>setUi(prev=>({...prev,notif:null})),1400); return;
    } else if(type==='shrine'){
      s.score=(s.score||0)+15;
      setUi(prev=>({...prev,dialog:null,notif:'🏛 SHRINE BLESSED! +15pts',score:s.score}));
      setTimeout(()=>setUi(prev=>({...prev,notif:null})),1400); return;
    } else if(type==='chest'){
      s.openedChests.add(`${tx},${ty}`);
      s.score=(s.score||0)+25;
      setUi(prev=>({...prev,dialog:null,notif:'📦 CHEST OPENED! +25pts',score:s.score}));
      setTimeout(()=>setUi(prev=>({...prev,notif:null})),1500); return;
    } else s.openDoors.add(`${tx},${ty}`);
    if(type!=='catch') setUi(prev=>({...prev,dialog:null}));
  }
  function handleWrong(){
    const s=gs.current;
    const {type}=uiRef.current.dialog||{};
    if(type==='catch'){
      // Failed to escape — lose a life
      s.catching=false;
      loseLife(); return;
    }
    s.wrongCount++;
    const dx=s.px-s.monX,dy=s.py-s.monY,dist=Math.hypot(dx,dy);
    if(dist>0.5){const l=Math.min(dist*0.42,4.2);const nx=s.monX+dx/dist*l,ny=s.monY+dy/dist*l;if(s.maze.tiles[Math.floor(ny)]?.[Math.floor(nx)]!==T_WALL){s.monX=nx;s.monY=ny;}}
    setUi(prev=>({...prev,dialog:null,wrongCount:s.wrongCount,shake:true}));
    setTimeout(()=>setUi(prev=>({...prev,shake:false})),560);
    if(s.wrongCount>=s.cfg.wrongsAllowed)loseLife();
  }
  function loseLife(){
    const s=gs.current;const newLives=uiRef.current.lives-1;
    s.wrongCount=0;s.catching=false;s.monHp=3;s.monX=s.maze.monsterStart.x;s.monY=s.maze.monsterStart.y;s.monPath=null;
    if(newLives<=0){cancelAnimationFrame(raf.current);setUi(prev=>({...prev,phase:'gameOver',lives:0,dialog:null,shake:false}));}
    else setUi(prev=>({...prev,phase:'death',lives:newLives,wrongCount:0,dialog:null,shake:false}));
  }
  function handleExit(){cancelAnimationFrame(raf.current);const s=gs.current;setUi(prev=>({...prev,phase:s.levelIdx>=THEMES.length-1?'allClear':'levelClear',dialog:null}));}

  useEffect(()=>{
    const canvas=cvs.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');
    function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
    resize();window.addEventListener('resize',resize);

    function loop(ts){
      const s=gs.current,u=uiRef.current;
      if(!s||u.phase!=='playing'){raf.current=requestAnimationFrame(loop);return;}
      const W=canvas.width,H=canvas.height;
      const MOVE=0.052,TURN=0.040,k=keys.current;
      if(!u.dialog){
        const cos=Math.cos(s.angle),sin=Math.sin(s.angle);
        if(k.has('ArrowUp')||k.has('w')||k.has('W')){if(canMove(s.px+cos*MOVE,s.py))s.px+=cos*MOVE;if(canMove(s.px,s.py+sin*MOVE))s.py+=sin*MOVE;}
        if(k.has('ArrowDown')||k.has('s')||k.has('S')){if(canMove(s.px-cos*MOVE,s.py))s.px-=cos*MOVE;if(canMove(s.px,s.py-sin*MOVE))s.py-=sin*MOVE;}
        if(k.has('ArrowLeft')||k.has('q')||k.has('Q'))s.angle-=TURN;
        if(k.has('ArrowRight')||k.has('e')||k.has('E'))s.angle+=TURN;
        if(k.has('a')||k.has('A')){if(canMove(s.px+sin*MOVE,s.py))s.px+=sin*MOVE;if(canMove(s.px,s.py-cos*MOVE))s.py-=cos*MOVE;}
        if(k.has('d')||k.has('D')){if(canMove(s.px-sin*MOVE,s.py))s.px-=sin*MOVE;if(canMove(s.px,s.py+cos*MOVE))s.py+=cos*MOVE;}
      }
      // Pause monster while map is open (map rendered as React overlay, not canvas)
      if(u.mapMode){raf.current=requestAnimationFrame(loop);return;}
      // Monster AI
      s.monTimer++;
      if(s.monTimer%18===0||!s.monPath||s.monPath.length===0)s.monPath=bfsPath(s.maze.tiles,s.maze.TW,s.maze.TH,s.monX,s.monY,s.px,s.py);
      if(s.monPath&&s.monPath.length>0){
        const[nx,ny]=s.monPath[0];const tx=nx+0.5,ty2=ny+0.5;
        const dx=tx-s.monX,dy=ty2-s.monY,dist=Math.hypot(dx,dy);
        const spd=s.cfg.monSpeed+Math.min(0.011,ts*0.0000032);
        if(dist<spd){s.monX=tx;s.monY=ty2;s.monPath.shift();}
        else{s.monX+=dx/dist*spd;s.monY+=dy/dist*spd;}
      }
      // Trap step detection — trigger question when player walks onto T_TRAP tile
      if(!u.dialog){
        const ptx=Math.floor(s.px),pty=Math.floor(s.py);
        const ptKey=`${ptx},${pty}`;
        if(s.maze.tiles[pty]&&s.maze.tiles[pty][ptx]===T_TRAP&&!s.clearedTraps.has(ptKey)&&!s.visitedTraps.has(ptKey)){
          s.visitedTraps.add(ptKey);
          const diffs=['easy','medium','hard'];
          const tDiff=diffs[Math.min(2,s.levelIdx)]; setUi(prev=>({...prev,dialog:{tx:ptx,ty:pty,type:'trap',difficulty:tDiff,question:drawQuestion(tDiff)}}));
        }
      }
      // Catch check — triggers escape question instead of instant death
      if(Math.hypot(s.px-s.monX,s.py-s.monY)<0.62&&!u.dialog&&!s.catching){
        s.catching=true;
        const diffs=['easy','medium','hard'];
        const cDiff=diffs[Math.min(2,s.levelIdx)]; setUi(prev=>({...prev,dialog:{tx:0,ty:0,type:'catch',difficulty:cDiff,question:drawQuestion(cDiff)}}));
      }
      if(Math.hypot(s.maze.exitPos.x-s.px,s.maze.exitPos.y-s.py)<0.82)handleExit();

      const zBuf=renderScene(ctx,W,H,s.px,s.py,s.angle,s.maze.tiles,s.maze.TW,s.maze.TH,s.theme,ts,s.openDoors,s.clearedTraps);

      // Red vignette
      const monDist=Math.hypot(s.px-s.monX,s.py-s.monY);
      const threat=Math.max(0,1-monDist/5);
      if(threat>0.04){
        const mr=parseInt(s.theme.monsterCol.slice(1,3),16),mg=parseInt(s.theme.monsterCol.slice(3,5),16),mb=parseInt(s.theme.monsterCol.slice(5,7),16);
        const vg=ctx.createRadialGradient(W/2,H/2,H*0.14,W/2,H/2,H*0.88);
        vg.addColorStop(0,'transparent');vg.addColorStop(1,`rgba(${mr},${mg},${mb},${threat*0.58})`);
        ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
      }

      drawMonster(ctx,W,H,s.px,s.py,s.angle,s.monX,s.monY,zBuf,s.theme,ts,s.monHp);
      // Draw trap, chest and shrine sprites in world space
      for(let ty=0;ty<s.maze.TH;ty++) for(let tx=0;tx<s.maze.TW;tx++){
        const t=s.maze.tiles[ty][tx];
        if(t===T_TRAP) drawTrapSprite(ctx,W,H,s.px,s.py,s.angle,tx,ty,zBuf,s.theme,ts,s.clearedTraps.has(`${tx},${ty}`));
        else if(t===T_CHEST) drawChestSprite(ctx,W,H,s.px,s.py,s.angle,tx,ty,zBuf,ts,s.openedChests.has(`${tx},${ty}`));
        else if(t===T_SHRINE) drawShrineSprite(ctx,W,H,s.px,s.py,s.angle,tx,ty,zBuf,s.theme,ts);
      }

      // Crosshair
      const cx=W/2,cy=H/2;
      ctx.strokeStyle='rgba(255,255,255,0.42)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(cx-9,cy);ctx.lineTo(cx-3,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx+3,cy);ctx.lineTo(cx+9,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy-9);ctx.lineTo(cx,cy-3);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy+3);ctx.lineTo(cx,cy+9);ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,2,0,Math.PI*2);ctx.stroke();

      drawMinimap(ctx,W,H,s.px,s.py,s.angle,s.maze.tiles,s.maze.TW,s.maze.TH,s.monX,s.monY,s.theme,s.openDoors,s.clearedTraps);

      // Interact prompt
      let prompt=null;
      if(Math.hypot(s.maze.exitPos.x-s.px,s.maze.exitPos.y-s.py)<1.7) prompt='🚪 EXIT  [SPACE]';
      else for(let dy2=-1;dy2<=1&&!prompt;dy2++) for(let dx2=-1;dx2<=1&&!prompt;dx2++){
        const tx2=Math.floor(s.px+dx2*0.82),ty3=Math.floor(s.py+dy2*0.82);
        if(tx2<0||ty3<0||tx2>=s.maze.TW||ty3>=s.maze.TH) continue;
        const t2=s.maze.tiles[ty3][tx2];
        const d2=Math.hypot(tx2+0.5-s.px,ty3+0.5-s.py);
        if(t2===T_DOOR&&!s.openDoors.has(`${tx2},${ty3}`)&&d2<1.45) prompt='🔒 LOCKED DOOR  [SPACE]';
        else if(t2===T_SHRINE&&d2<1.45) prompt='🏛 ANCIENT SHRINE  [SPACE]';
        else if(t2===T_CHEST&&!s.openedChests.has(`${tx2},${ty3}`)&&d2<1.45) prompt='📦 CHEST  [SPACE]';
      }
      // Trap underfoot warning
      const uTx=Math.floor(s.px),uTy=Math.floor(s.py);
      if(s.maze.tiles[uTy]&&s.maze.tiles[uTy][uTx]===T_TRAP&&!s.clearedTraps.has(`${uTx},${uTy}`)) prompt='⚠ TRAP UNDERFOOT — ANSWER TO DISARM!';
      if(prompt){
        ctx.font="bold 12px 'Press Start 2P',monospace";ctx.textAlign='center';ctx.textBaseline='middle';
        const tw=ctx.measureText(prompt).width;
        ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(W/2-tw/2-14,H*0.72-10,tw+28,28);
        ctx.fillStyle='#ffffff';ctx.fillText(prompt,W/2,H*0.72+4);
      }

      raf.current=requestAnimationFrame(loop);
    }
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize);};
  },[kidId]);

  const s=gs.current,theme=s?s.theme:THEMES[0];
  const monDist=s?Math.hypot(s.px-s.monX,s.py-s.monY):99;
  const monsterClose=monDist<4;

  return(
    <div style={{position:'relative',width:'100vw',height:'100vh',overflow:'hidden',background:'#000',animation:ui.shake?'shake .42s ease':'none'}}>
      <canvas ref={cvs} style={{display:'block'}}/>
      {ui.phase==='playing'&&(
        <div style={{position:'absolute',top:0,left:0,right:0,zIndex:200,fontFamily:"'Press Start 2P'",pointerEvents:'none'}}>
          <div style={{background:'linear-gradient(180deg,rgba(0,0,0,.88) 0%,transparent 100%)',padding:'10px 14px 16px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            {/* Menu button */}
            <button onClick={onMenu} style={{background:'rgba(0,0,0,.55)',border:`1px solid ${kid.color}44`,borderRadius:7,color:kid.color,padding:'5px 9px',cursor:'pointer',fontFamily:"'Press Start 2P'",fontSize:'.3rem',pointerEvents:'all'}}>◀ MENU</button>
            {/* Kid emoji */}
            <span style={{fontSize:'1.1rem'}}>{kid.emoji}</span>
            {/* Lives */}
            <div style={{display:'flex',gap:4}}>
              {[...Array(3)].map((_,i)=><span key={i} style={{fontSize:'1.1rem',opacity:i<ui.lives?1:0.14,filter:i<ui.lives?'drop-shadow(0 0 6px #ff4444)':'none',animation:i<ui.lives?'heartbeat 2s ease infinite':'none',animationDelay:(i*0.12)+'s'}}>❤️</span>)}
            </div>
            {/* Wrong answers */}
            <div style={{background:'rgba(0,0,0,.55)',border:`1px solid ${theme.monsterCol}40`,borderRadius:7,padding:'4px 10px',display:'flex',gap:4,alignItems:'center'}}>
              <span style={{color:'rgba(255,255,255,.3)',fontSize:'.24rem',marginRight:3}}>WRONG</span>
              {[...Array(s?.cfg?.wrongsAllowed||3)].map((_,i)=><span key={i} style={{fontSize:'.8rem',opacity:i<ui.wrongCount?1:0.12,filter:i<ui.wrongCount?`drop-shadow(0 0 5px ${theme.monsterCol})`:'none'}}>💀</span>)}
            </div>
            {/* SCORE — big and prominent */}
            <div style={{
              marginLeft:'auto',
              background:'rgba(0,0,0,0.7)',
              border:'2px solid #FFD700',
              borderRadius:10,
              padding:'6px 16px',
              display:'flex',flexDirection:'column',alignItems:'center',gap:1,
            }}>
              <span style={{color:'rgba(255,215,0,0.55)',fontSize:'.22rem',letterSpacing:2}}>SCORE</span>
              <span style={{
                color:'#FFD700',
                fontSize:'clamp(.7rem,2.2vw,.95rem)',
                textShadow:'0 0 16px #FFD700aa',
                lineHeight:1,
              }}>{ui.score||0}</span>
            </div>
            {/* Level label */}
            <div style={{color:theme.monsterCol,fontSize:'.28rem',textAlign:'right',lineHeight:1.8}}>
              <div>LVL {ui.level+1}</div>
              <div style={{color:'rgba(255,255,255,.3)',fontSize:'.22rem'}}>{theme.name}</div>
            </div>
            {/* Map button */}
            <button onClick={()=>setUi(prev=>({...prev,mapMode:!prev.mapMode}))} style={{background:'rgba(0,0,0,.6)',border:'1px solid rgba(255,255,100,.4)',borderRadius:7,color:'rgba(255,255,100,.9)',padding:'5px 10px',cursor:'pointer',fontFamily:"'Press Start 2P'",fontSize:'.28rem',pointerEvents:'all'}}>🗺 MAP</button>
            {/* Monster warning */}
            {monsterClose&&<div style={{color:theme.monsterCol,fontSize:'.28rem',animation:'pulse .48s ease infinite',background:`rgba(0,0,0,0.7)`,border:`1px solid ${theme.monsterCol}`,borderRadius:6,padding:'3px 8px'}}>⚠ {theme.monsterName}!</div>}
          </div>
        </div>
      )}
      {ui.phase==='playing'&&!ui.dialog&&(
        <>
          <div style={{position:'absolute',bottom:16,right:16,zIndex:350,display:'grid',gridTemplateColumns:'44px 44px 44px',gridTemplateRows:'44px 44px 44px',gap:4}}>
            {[['','up',''],['left','','right'],['','down','']].flat().map((dir,i)=>dir?(<button key={i}
              onPointerDown={()=>keys.current.add(dir==='up'?'w':dir==='down'?'s':dir==='left'?'q':'e')}
              onPointerUp={()=>keys.current.delete(dir==='up'?'w':dir==='down'?'s':dir==='left'?'q':'e')}
              style={{gridColumn:i%3+1,gridRow:Math.floor(i/3)+1,background:'rgba(0,0,0,.65)',border:`1px solid ${kid.color}44`,borderRadius:10,color:kid.color,fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {dir==='up'?'▲':dir==='down'?'▼':dir==='left'?'◀':'▶'}
            </button>):<div key={i}/>)}
          </div>
          <button onPointerDown={tryInteract} style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.7)',border:`1px solid ${kid.color}55`,borderRadius:11,color:kid.color,fontFamily:"'Press Start 2P'",fontSize:'.35rem',padding:'11px 18px',cursor:'pointer',zIndex:350}}>⚡ INTERACT</button>
          <button onClick={()=>setUi(prev=>({...prev,mapMode:true}))} style={{position:'absolute',bottom:16,left:16,background:'rgba(0,0,0,.7)',border:'1px solid rgba(255,255,100,.4)',borderRadius:11,color:'rgba(255,255,100,.85)',fontFamily:"'Press Start 2P'",fontSize:'.32rem',padding:'11px 14px',cursor:'pointer',zIndex:350}}>🗺 MAP</button>
        </>
      )}
      {ui.phase==='levelIntro'&&s&&<LevelIntro level={ui.level+1} theme={theme} onStart={()=>setUi(prev=>({...prev,phase:'playing'}))}/>}
      {ui.phase==='playing'&&ui.dialog&&<QuestionDialog kidId={kidId} difficulty={ui.dialog.difficulty} encType={ui.dialog.type} question={ui.dialog.question} onCorrect={handleCorrect} onWrong={handleWrong} monsterClose={monsterClose} theme={theme}/>}
      {ui.notif&&<div style={{position:'absolute',top:'22%',left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,0.9)',border:`2px solid ${theme.monsterCol}`,borderRadius:14,padding:'12px 24px',color:'#fff',fontFamily:"'Press Start 2P'",fontSize:'.46rem',zIndex:500,whiteSpace:'nowrap',animation:'slideUp .2s ease',textAlign:'center'}}>{ui.notif}</div>}
      {ui.mapMode&&ui.phase==='playing'&&<MapOverlay gs={gs} theme={theme} onClose={()=>setUi(prev=>({...prev,mapMode:false}))}/>}
      {ui.phase==='death'&&<DeathScreen kidId={kidId} lives={ui.lives} onRetry={()=>{const s2=gs.current;s2.monX=s2.maze.monsterStart.x;s2.monY=s2.maze.monsterStart.y;s2.monPath=null;s2.wrongCount=0;s2.catching=false;s2.monHp=3;setUi(prev=>({...prev,phase:'playing',dialog:null,shake:false,notif:null}));}} onMenu={onMenu}/>}
      {ui.phase==='gameOver'&&<GameOverScreen kidId={kidId} score={ui.score} onMenu={onMenu}/>}
      {(ui.phase==='levelClear'||ui.phase==='allClear')&&<LevelClearScreen kidId={kidId} level={ui.level+1} lives={ui.lives} score={ui.score} isLast={ui.phase==='allClear'} onNext={()=>buildLevel(ui.level+1,ui.lives)} onMenu={onMenu}/>}
    </div>
  );
}

export default function App(){
  const[screen,setScreen]=useState('select');
  const[kidId,setKidId]=useState(null);
  return(<><style dangerouslySetInnerHTML={{__html:CSS}}/>{screen==='game'&&kidId?<MazeGame kidId={kidId} onMenu={()=>{setScreen('select');setKidId(null);}}/>:<HeroSelect onSelect={id=>{setKidId(id);setScreen('game');}}/>}</>);
}
