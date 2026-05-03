import { useState, useEffect, useCallback, useRef } from "react";

// ── DESIGN TOKENS — Navy · Champagne · Ivory ──────────────────────────────────
const T = {
  // Backgrounds
  bg:       "#F4F1EB",   // warm ivory page
  paper:    "#FDFCF9",   // card surface
  surface:  "#EDE9E0",   // subtle tray
  navyDark: "#0B1929",   // nav bar
  navyMid:  "#152539",   // dark card bg
  navyDeep: "#08111E",   // deepest

  // Accents
  gold:     "#C4922A",   // primary action gold
  goldLight:"#E8C97A",   // soft gold
  goldPale: "#F5EDD0",   // pale gold tint

  // Semantic
  wine:     "#6D2B45",
  sage:     "#3D6B58",
  sky:      "#2E5F8A",
  rose:     "#A64060",
  error:    "#B22C2C",

  // Text
  ink:      "#0F1A26",
  text:     "#1E2D3D",
  muted:    "#5A6A7A",
  faint:    "#94A0AD",

  // Borders
  border:   "#DAD4C8",
  borderMid:"#C8C0B0",
};

const ACCENTS = [T.gold, T.sage, T.sky, T.wine, T.rose, "#4A6E8A", "#5A4A8A", "#3D6B4A"];
const accentFor = n => ACCENTS[(n.charCodeAt(0)||0) % ACCENTS.length];
const initials = n => n.trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
const ytId = url => { if(!url) return null; const r = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/); return r?r[1]:null; };
const uid = () => Math.random().toString(36).slice(2,10);
const readFile = f => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(f); });

const KEY = { USERS:"ft4_users", MEMBERS:"ft4_members", SESSION:"ft4_session", INVITES:"ft4_invites" };

const SEED = [
  {id:"s1",name:"Ramchandra Sharma",birth:"1918",death:"1989",bio:"Patriarch of the Sharma family. A devoted schoolteacher who moved from Agra to Delhi in 1945. His wisdom and stories filled every room.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s2",gender:"M",badge:"Patriarch"},
  {id:"s2",name:"Savitri Devi Sharma",birth:"1922",death:"2001",bio:"The heart of the home. Known for boundless warmth and legendary cooking. She held the family together through every storm.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s1",gender:"F",badge:"Matriarch"},
  {id:"s3",name:"Suresh Sharma",birth:"1948",death:"",bio:"Eldest son, retired civil engineer. Passionate about cricket, classical music and growing roses.",photo:"",youtube:"https://www.youtube.com/watch?v=dQw4w9WgXcQ",parents:["s1","s2"],children:["s5","s6"],spouse:"s7",gender:"M",badge:"Engineer"},
  {id:"s4",name:"Meena Joshi",birth:"1952",death:"",bio:"Youngest child, retired schoolteacher. Lives in Pune. A wonderful storyteller and keeper of traditions.",photo:"",youtube:"",parents:["s1","s2"],children:[],spouse:"",gender:"F",badge:"Storyteller"},
  {id:"s7",name:"Priya Sharma",birth:"1950",death:"",bio:"Suresh's wife. Former nurse, now retired. Known for beautiful embroidery and quiet kindness.",photo:"",youtube:"",parents:[],children:["s5","s6"],spouse:"s3",gender:"F",badge:"Caregiver"},
  {id:"s5",name:"Arjun Sharma",birth:"1975",death:"",bio:"Software engineer in Bengaluru. Loves classical music and mountain treks.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"M",badge:"Techie"},
  {id:"s6",name:"Nisha Sharma",birth:"1978",death:"",bio:"Graphic designer in Delhi. Paints in oils and keeps traditional recipes alive.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"F",badge:"Artist"},
];

// ── CONFETTI ──────────────────────────────────────────────────────────────────
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const colors = [T.gold, T.goldLight, T.sage, T.sky, "#E8C97A","#A64060","#3D8A5A"];
  const pts = Array.from({length:100},()=>({
    x:Math.random()*canvas.width, y:-10,
    vx:(Math.random()-.5)*5, vy:Math.random()*3+2,
    r:Math.random()*5+3, c:colors[Math.floor(Math.random()*colors.length)],
    rot:Math.random()*360, vr:(Math.random()-.5)*7,
    sq:Math.random()>.5
  }));
  let f=0; const loop=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.vy+=.07;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.c;ctx.globalAlpha=Math.max(0,1-f/80);
      if(p.sq)ctx.fillRect(-p.r,-p.r*.5,p.r*2,p.r); else{ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}
      ctx.restore();});
    f++; if(f<90)requestAnimationFrame(loop); else canvas.remove();
  }; requestAnimationFrame(loop);
}

// ── PRIMITIVES ────────────────────────────────────────────────────────────────
function Avatar({ name, photo, size=44, accent, style={} }) {
  const bg = accent || accentFor(name);
  return photo
    ? <img src={photo} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${bg}44`,...style}}/>
    : <div style={{width:size,height:size,borderRadius:"50%",background:`${bg}18`,border:`1.5px solid ${bg}60`,display:"flex",alignItems:"center",justifyContent:"center",color:bg,fontWeight:700,fontSize:size*.36,flexShrink:0,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"0.02em",...style}}>{initials(name)}</div>;
}

function Btn({ children, variant="primary", size="md", ...p }) {
  const vs = {
    primary: { background:T.navyDark, color:"#fff", border:"none" },
    gold:    { background:T.gold, color:"#fff", border:"none" },
    outline: { background:"transparent", color:T.navyDark, border:`1.5px solid ${T.navyDark}` },
    ghost:   { background:"transparent", color:T.muted, border:`1px solid ${T.border}` },
    danger:  { background:T.error, color:"#fff", border:"none" },
    wine:    { background:T.wine, color:"#fff", border:"none" },
  };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"10px 22px",fontSize:13}, lg:{padding:"13px 32px",fontSize:15} };
  return (
    <button {...p} style={{...sz[size],borderRadius:8,fontFamily:"'Cormorant Garamond',Georgia,serif",cursor:"pointer",fontWeight:700,letterSpacing:"0.07em",transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:6,...vs[variant],...(p.style||{})}}
      onMouseEnter={e=>e.currentTarget.style.opacity=".86"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      {children}
    </button>
  );
}

function Chip({ children, color=T.navyDark }) {
  return <span style={{background:`${color}14`,color,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:"0.07em",border:`1px solid ${color}30`,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>{children}</span>;
}

function Divider({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
      <div style={{flex:1,height:1,background:T.border}}/>
      {label&&<span style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{label}</span>}
      <div style={{flex:1,height:1,background:T.border}}/>
    </div>
  );
}

function Card({ children, style={}, hover=true, onClick }) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>hover&&setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.paper,borderRadius:14,border:`1px solid ${hov?T.borderMid:T.border}`,boxShadow:hov?"0 8px 32px rgba(11,25,41,0.1)":"0 2px 12px rgba(11,25,41,0.06)",transition:"all 0.2s",cursor:onClick?"pointer":"default",...style}}>
      {children}
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel="Delete", danger=true }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(11,25,41,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)onCancel();}}>
      <div style={{background:T.paper,borderRadius:18,padding:"36px 40px",maxWidth:420,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.3)",border:`1px solid ${T.border}`,animation:"popIn .2s ease"}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:danger?"#FDEAEA":"#EAF0FD",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:22}}>{danger?"⚠️":"❓"}</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,color:T.ink,textAlign:"center",margin:"0 0 10px",fontWeight:700}}>{title}</h3>
        <p style={{fontSize:14,color:T.muted,textAlign:"center",lineHeight:1.6,margin:"0 0 28px",fontFamily:"Georgia,serif"}}>{message}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant={danger?"danger":"primary"} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, hint, ...p }) {
  const [foc,setFoc]=useState(false);
  return (
    <div style={{marginBottom:16}}>
      {label&&<label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{label}</label>}
      <input {...p} onFocus={e=>{setFoc(true);p.onFocus&&p.onFocus(e);}} onBlur={e=>{setFoc(false);p.onBlur&&p.onBlur(e);}}
        style={{width:"100%",padding:"11px 15px",border:`1.5px solid ${foc?T.gold:T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:14,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box",transition:"border-color .2s",boxShadow:foc?`0 0 0 3px ${T.gold}18`:"none",...(p.style||{})}}/>
      {hint&&<p style={{margin:"4px 0 0",fontSize:11,color:T.faint,fontFamily:"Georgia,serif"}}>{hint}</p>}
    </div>
  );
}

function PhotoUploader({ value, onChange }) {
  const inp = useRef(); const [drag,setDrag]=useState(false);
  const handle = async files => { const f=files[0]; if(!f||!f.type.startsWith("image/"))return; onChange(await readFile(f)); };
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Photo</label>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files);}}
        onClick={()=>inp.current.click()} style={{border:`1.5px dashed ${drag?T.gold:T.border}`,borderRadius:10,padding:"20px",textAlign:"center",background:drag?T.goldPale:T.surface,cursor:"pointer",transition:"all .2s"}}>
        {value
          ? <div style={{position:"relative",display:"inline-block"}}><img src={value} alt="preview" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.gold}`}}/><button onClick={e=>{e.stopPropagation();onChange("");}} style={{position:"absolute",top:-4,right:-4,width:22,height:22,borderRadius:"50%",background:T.error,border:"none",color:"#fff",cursor:"pointer",fontSize:13,lineHeight:1}}>×</button></div>
          : <><div style={{fontSize:28,marginBottom:6,opacity:.5}}>↑</div><p style={{margin:0,fontSize:12,color:T.muted,fontFamily:"Georgia,serif"}}>Drop photo or click to upload</p><p style={{margin:"3px 0 0",fontSize:11,color:T.faint,fontFamily:"Georgia,serif"}}>JPG · PNG · WEBP</p></>}
      </div>
      <input ref={inp} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files)}/>
      {!value&&<input placeholder="Or paste image URL…" style={{width:"100%",marginTop:8,padding:"9px 12px",border:`1px solid ${T.border}`,borderRadius:7,fontSize:12,fontFamily:"Georgia,serif",color:T.ink,background:T.paper,outline:"none",boxSizing:"border-box"}} onChange={e=>e.target.value&&onChange(e.target.value)}/>}
    </div>
  );
}

// ── STAT COUNTER ──────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, color=T.gold, delay=0 }) {
  const [n,setN]=useState(0);
  useEffect(()=>{
    const t=setTimeout(()=>{let i=0;const iv=setInterval(()=>{i++;setN(Math.round(value*i/25));if(i>=25)clearInterval(iv);},28);return()=>clearInterval(iv);},delay);
    return()=>clearTimeout(t);
  },[value,delay]);
  return (
    <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:12,padding:"18px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",bottom:-16,right:-12,fontSize:52,opacity:0.04,fontFamily:"Georgia"}}>{icon}</div>
      <div style={{fontSize:24,marginBottom:5}}>{icon}</div>
      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:36,fontWeight:700,color,lineHeight:1}}>{n}</div>
      <div style={{fontSize:11,color:T.muted,marginTop:4,fontFamily:"Georgia,serif",letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}

// ── LANDING ───────────────────────────────────────────────────────────────────
function Landing({ onLogin, onSignup }) {
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${T.navyDeep} 0%,${T.navyMid} 50%,#1A3050 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
      {/* Gold ornament lines */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
        <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:0.04}}>
          <defs><pattern id="gr" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0L0 60M0 0L60 60" stroke={T.gold} strokeWidth=".5" fill="none"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#gr)"/>
        </svg>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,borderRadius:"50%",border:`1px solid ${T.gold}12`}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:800,borderRadius:"50%",border:`1px solid ${T.gold}08`}}/>
      </div>
      <div style={{textAlign:"center",maxWidth:560,position:"relative",zIndex:1}}>
        {/* Crest */}
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:84,height:84,borderRadius:"50%",border:`2px solid ${T.gold}40`,background:`${T.gold}10`,marginBottom:24,fontSize:38}}>🌳</div>
        {/* Thin rule */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,justifyContent:"center"}}>
          <div style={{width:60,height:1,background:`${T.gold}50`}}/>
          <span style={{fontSize:10,letterSpacing:"0.2em",color:`${T.goldLight}80`,fontFamily:"Georgia,serif",textTransform:"uppercase"}}>Est. Generations</span>
          <div style={{width:60,height:1,background:`${T.gold}50`}}/>
        </div>
        <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(38px,5.5vw,62px)",color:T.goldLight,margin:"0 0 14px",fontWeight:300,lineHeight:1.1,letterSpacing:"0.01em"}}>
          Our Family Story
        </h1>
        <p style={{color:"#7A9AB8",fontSize:15,lineHeight:1.85,maxWidth:400,margin:"0 auto 40px",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
          Preserve memories, honour ancestors and celebrate the stories that connect every generation.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:52}}>
          <Btn variant="gold" onClick={onSignup} size="lg" style={{letterSpacing:"0.12em"}}>BEGIN YOUR JOURNEY</Btn>
          <Btn onClick={onLogin} size="lg" style={{background:"rgba(255,255,255,0.06)",color:T.goldLight,border:`1px solid ${T.gold}35`,boxShadow:"none",letterSpacing:"0.12em"}}>SIGN IN</Btn>
        </div>
        <div style={{display:"flex",gap:40,justifyContent:"center"}}>
          {[["🌿","Family Tree"],["📖","Stories"],["🎬","Videos"],["📅","Timeline"],["🔒","Admin Panel"]].map(([ic,lb])=>(
            <div key={lb} style={{textAlign:"center"}}>
              <div style={{fontSize:18,marginBottom:5,opacity:.7}}>{ic}</div>
              <div style={{fontSize:10,color:"#4A6A8A",letterSpacing:"0.08em",fontFamily:"Georgia,serif",textTransform:"uppercase"}}>{lb}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthWrap({ children, title, sub }) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backgroundImage:"radial-gradient(ellipse at 20% 80%,rgba(196,146,42,0.06) 0%,transparent 60%)"}}>
      <div style={{background:T.paper,borderRadius:20,padding:"48px 44px",width:"100%",maxWidth:430,boxShadow:"0 32px 80px rgba(11,25,41,0.14)",border:`1px solid ${T.border}`}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,borderRadius:"50%",border:`1.5px solid ${T.gold}50`,background:T.goldPale,marginBottom:14,fontSize:24}}>🌳</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:28,color:T.ink,margin:"0 0 5px",fontWeight:700}}>{title}</h2>
          <p style={{color:T.muted,fontSize:13,margin:0,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onSwitch, onBack }) {
  const [e,sE]=useState(""); const [p,sP]=useState(""); const [err,sErr]=useState("");
  return (
    <AuthWrap title="Welcome Back" sub="Sign in to your family tree">
      {err&&<div style={{background:"#FDE8E8",border:`1px solid ${T.error}40`,borderRadius:8,padding:"10px 14px",fontSize:13,color:T.error,marginBottom:16,fontFamily:"Georgia,serif"}}>{err}</div>}
      <Inp label="Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/>
      <Inp label="Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="••••••••"/>
      <Btn onClick={()=>onLogin(e,p,sErr)} style={{width:"100%",padding:14,fontSize:14,marginTop:4,justifyContent:"center",letterSpacing:"0.1em"}}>SIGN IN</Btn>
      <Divider/>
      <div style={{textAlign:"center",fontSize:13,color:T.muted,fontFamily:"Georgia,serif"}}>New here? <button onClick={onSwitch} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Create account →</button></div>
      <button onClick={onBack} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:12,display:"block",margin:"12px auto 0",fontFamily:"Georgia,serif"}}>← Back to home</button>
    </AuthWrap>
  );
}

function SignupPage({ onSignup, onSwitch, onBack }) {
  const [n,sN]=useState(""); const [e,sE]=useState(""); const [p,sP]=useState(""); const [inv,sInv]=useState(""); const [err,sErr]=useState("");
  return (
    <AuthWrap title="Join the Family" sub="Create your account to get started">
      {err&&<div style={{background:"#FDE8E8",border:`1px solid ${T.error}40`,borderRadius:8,padding:"10px 14px",fontSize:13,color:T.error,marginBottom:16,fontFamily:"Georgia,serif"}}>{err}</div>}
      <Inp label="Full Name" value={n} onChange={ev=>sN(ev.target.value)} placeholder="Your full name"/>
      <Inp label="Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/>
      <Inp label="Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="Choose a password"/>
      <Inp label="Invite Code (optional)" value={inv} onChange={ev=>sInv(ev.target.value)} placeholder="fam-xxxxxxxx"/>
      <Btn onClick={()=>onSignup(n,e,p,inv,sErr)} style={{width:"100%",padding:14,fontSize:14,marginTop:4,justifyContent:"center",letterSpacing:"0.1em"}}>CREATE ACCOUNT</Btn>
      <Divider/>
      <div style={{textAlign:"center",fontSize:13,color:T.muted,fontFamily:"Georgia,serif"}}>Already a member? <button onClick={onSwitch} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>Sign in →</button></div>
      <button onClick={onBack} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:12,display:"block",margin:"12px auto 0",fontFamily:"Georgia,serif"}}>← Back to home</button>
    </AuthWrap>
  );
}

// ── SHELL ─────────────────────────────────────────────────────────────────────
function Shell({ user, view, setView, onLogout, isAdmin, children }) {
  const nav = [
    {id:"home",label:"Home",ic:"◈"},
    {id:"tree",label:"Tree",ic:"⬡"},
    {id:"timeline",label:"Timeline",ic:"◷"},
    {id:"channel",label:"Channel",ic:"▷"},
    {id:"search",label:"Search",ic:"◎"},
  ];
  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <nav style={{background:T.navyDark,height:60,padding:"0 24px",display:"flex",alignItems:"center",gap:4,boxShadow:"0 1px 0 rgba(196,146,42,0.2)",position:"sticky",top:0,zIndex:200}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginRight:16,padding:0}}>
          <span style={{fontSize:18,opacity:.8}}>🌳</span>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:18,color:T.goldLight,fontWeight:700,letterSpacing:"0.06em",whiteSpace:"nowrap"}}>Our Family Story</span>
        </button>
        <div style={{display:"flex",gap:1,flex:1}}>
          {nav.map(it=>(
            <button key={it.id} onClick={()=>setView(it.id)} style={{background:view===it.id?`${T.gold}18`:"none",border:view===it.id?`1px solid ${T.gold}30`:"1px solid transparent",color:view===it.id?T.goldLight:"#5A7A9A",cursor:"pointer",padding:"7px 13px",borderRadius:7,fontSize:12,fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"0.08em",textTransform:"uppercase",transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>
              <span style={{opacity:.7,fontSize:10}}>{it.ic}</span>{it.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Btn variant="gold" onClick={()=>setView("addMember")} size="sm" style={{letterSpacing:"0.08em"}}>+ ADD</Btn>
          <button onClick={()=>setView("invite")} style={{background:"rgba(255,255,255,0.04)",border:`1px solid rgba(255,255,255,0.1)`,color:"#6A8AAA",cursor:"pointer",padding:"6px 12px",borderRadius:7,fontSize:11,fontFamily:"Georgia,serif",letterSpacing:"0.06em"}}>INVITE</button>
          {isAdmin&&(
            <button onClick={()=>setView("admin")} style={{background:view==="admin"?`${T.gold}22`:"rgba(196,146,42,0.08)",border:`1px solid ${view==="admin"?T.gold+"50":"rgba(196,146,42,0.2)"}`,color:T.goldLight,cursor:"pointer",padding:"6px 12px",borderRadius:7,fontSize:11,fontFamily:"Georgia,serif",letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:5}}>
              🔒 ADMIN
            </button>
          )}
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,0.04)",cursor:"pointer"}} onClick={()=>setView("home")}>
            <Avatar name={user.name} size={26}/>
            <span style={{color:"#6A8AAA",fontSize:11,fontFamily:"Georgia,serif",maxWidth:72,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",color:"#405060",cursor:"pointer",fontSize:11,fontFamily:"Georgia,serif"}}>Sign out</button>
        </div>
      </nav>
      <div style={{padding:"28px 24px",maxWidth:1260,margin:"0 auto",animation:"fadeUp .3s ease"}}>
        {children}
      </div>
    </div>
  );
}

// ── HOME DASHBOARD ────────────────────────────────────────────────────────────
function HomePage({ members, user, setView, setSelected, isAdmin }) {
  const withVid = members.filter(m=>ytId(m.youtube));
  const oldest = [...members].filter(m=>m.birth).sort((a,b)=>parseInt(a.birth)-parseInt(b.birth))[0];
  const youngest = [...members].filter(m=>m.birth).sort((a,b)=>parseInt(b.birth)-parseInt(a.birth))[0];
  const recent = [...members].reverse().slice(0,4);
  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
          <div style={{width:3,height:22,background:T.gold,borderRadius:2}}/>
          <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:34,color:T.ink,margin:0,fontWeight:700}}>Welcome, {user.name.split(" ")[0]}</h1>
        </div>
        <p style={{color:T.muted,fontSize:13,fontFamily:"Georgia,serif",margin:"0 0 0 13px",fontStyle:"italic"}}>Your family legacy, preserved</p>
      </div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:28}}>
        <StatPill icon="👨‍👩‍👧‍👦" value={members.length} label="Members" color={T.navyDark} delay={0}/>
        <StatPill icon="🎬" value={withVid.length} label="Videos" color={T.sage} delay={80}/>
        <StatPill icon="📅" value={members.filter(m=>m.birth).length} label="Births Recorded" color={T.sky} delay={160}/>
        <StatPill icon="💑" value={members.filter(m=>m.spouse).length} label="Couples" color={T.wine} delay={240}/>
        <StatPill icon="🌱" value={members.filter(m=>!m.parents?.length).length} label="Root Members" color={T.gold} delay={320}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {/* Highlights */}
        <Card style={{padding:"22px 26px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:18,color:T.ink,margin:"0 0 18px",fontWeight:700,letterSpacing:"0.03em"}}>Family Highlights</h3>
          {[oldest&&{label:"Oldest Root",member:oldest,icon:"🌳"},youngest&&{label:"Youngest Branch",member:youngest,icon:"🌱"}].filter(Boolean).map(({label,member,icon})=>(
            <div key={label} onClick={()=>{setSelected(member);setView("profile");}} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 12px",borderRadius:9,cursor:"pointer",marginBottom:8,transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={member.name} photo={member.photo} size={42} accent={accentFor(member.name)}/>
              <div>
                <div style={{fontSize:10,color:T.faint,fontFamily:"Georgia,serif",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:1}}>{icon} {label}</div>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:16,color:T.ink,fontWeight:700}}>{member.name}</div>
                <div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif"}}>b. {member.birth}</div>
              </div>
            </div>
          ))}
        </Card>
        {/* Recent */}
        <Card style={{padding:"22px 26px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:18,color:T.ink,margin:"0 0 18px",fontWeight:700,letterSpacing:"0.03em"}}>Recently Added</h3>
          {recent.map(m=>(
            <div key={m.id} onClick={()=>{setSelected(m);setView("profile");}} style={{display:"flex",gap:12,alignItems:"center",padding:"9px 12px",borderRadius:9,cursor:"pointer",marginBottom:6,transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={m.name} photo={m.photo} size={36} accent={accentFor(m.name)}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:15,color:T.ink,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                <div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif"}}>{m.birth||"Year unknown"}{m.badge?` · ${m.badge}`:""}</div>
              </div>
              {m.youtube&&<Chip color={T.sage}>Video</Chip>}
            </div>
          ))}
        </Card>
      </div>
      {/* CTA Banner */}
      <div style={{background:T.navyDark,borderRadius:16,padding:"26px 32px",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap",boxShadow:"0 8px 32px rgba(11,25,41,0.2)"}}>
        <div style={{width:2,height:40,background:T.gold,borderRadius:1,flexShrink:0}}/>
        <div style={{flex:1,minWidth:200}}>
          <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,color:T.goldLight,margin:"0 0 4px",fontWeight:700}}>Grow Your Tree</p>
          <p style={{color:"#4A6A8A",fontSize:13,margin:0,fontFamily:"Georgia,serif"}}>Add members, share stories, and connect generations.</p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn variant="gold" onClick={()=>setView("addMember")} style={{letterSpacing:"0.08em"}}>+ ADD MEMBER</Btn>
          <Btn variant="outline" onClick={()=>setView("tree")} style={{color:T.goldLight,borderColor:`${T.gold}40`,letterSpacing:"0.08em"}}>VIEW TREE</Btn>
          {isAdmin&&<Btn onClick={()=>setView("admin")} style={{background:`${T.gold}18`,color:T.goldLight,border:`1px solid ${T.gold}35`,letterSpacing:"0.08em"}}>🔒 ADMIN</Btn>}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ members, users, onDeleteMember, onDeleteUser, toast }) {
  const [tab, setTab] = useState("members");
  const [search, setSearch] = useState("");
  const [confirmDel, setConfirmDel] = useState(null); // {type:"member"|"user", id, name}
  const [sortBy, setSortBy] = useState("name");

  const filteredMembers = members
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sortBy==="name" ? a.name.localeCompare(b.name) : parseInt(a.birth||9999)-parseInt(b.birth||9999));

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase())||u.email?.toLowerCase().includes(search.toLowerCase()));

  const handleDeleteMember = () => {
    onDeleteMember(confirmDel.id);
    setConfirmDel(null);
  };
  const handleDeleteUser = () => {
    onDeleteUser(confirmDel.id);
    setConfirmDel(null);
  };

  return (
    <div>
      {confirmDel&&(
        <ConfirmModal
          title={`Delete ${confirmDel.type==="member"?"Member":"Account"}?`}
          message={`Are you sure you want to permanently remove "${confirmDel.name}" from the family tree? This cannot be undone.`}
          onConfirm={confirmDel.type==="member"?handleDeleteMember:handleDeleteUser}
          onCancel={()=>setConfirmDel(null)}
          confirmLabel="Yes, Delete"
        />
      )}

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
            <div style={{width:3,height:22,background:T.gold,borderRadius:2}}/>
            <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,color:T.ink,margin:0,fontWeight:700}}>Admin Panel</h2>
          </div>
          <p style={{color:T.muted,fontSize:13,fontFamily:"Georgia,serif",margin:"0 0 0 13px",fontStyle:"italic"}}>Manage family tree members and accounts</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:10,background:T.goldPale,border:`1px solid ${T.gold}30`}}>
          <span style={{fontSize:14}}>🔒</span>
          <span style={{fontSize:12,color:T.gold,fontWeight:700,fontFamily:"Georgia,serif",letterSpacing:"0.06em"}}>ADMIN ACCESS</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"Total Members",value:members.length,icon:"👨‍👩‍👧‍👦",color:T.navyDark},
          {label:"Registered Users",value:users.length,icon:"👤",color:T.sky},
          {label:"With Videos",value:members.filter(m=>ytId(m.youtube)).length,icon:"🎬",color:T.sage},
          {label:"With Photos",value:members.filter(m=>m.photo).length,icon:"📷",color:T.wine},
        ].map(s=>(
          <div key={s.label} style={{background:T.paper,borderRadius:12,padding:"16px 18px",border:`1px solid ${T.border}`,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{fontSize:24}}>{s.icon}</div>
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:28,fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif",letterSpacing:"0.05em"}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,marginBottom:20,background:T.surface,borderRadius:10,padding:4,width:"fit-content",border:`1px solid ${T.border}`}}>
        {[["members",`Members (${members.length})`],["users",`Accounts (${users.length})`]].map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);setSearch("");}} style={{padding:"8px 20px",borderRadius:8,border:"none",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:14,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",transition:"all .15s",background:tab===id?T.navyDark:"transparent",color:tab===id?"#fff":T.muted}}>
            {label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:.4}}>⌕</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${tab}…`}
            style={{width:"100%",padding:"10px 12px 10px 34px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"Georgia,serif",color:T.ink,background:T.paper,outline:"none",boxSizing:"border-box"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:16,color:T.muted,cursor:"pointer"}}>×</button>}
        </div>
        {tab==="members"&&(
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"Georgia,serif",color:T.ink,background:T.paper,outline:"none",cursor:"pointer"}}>
            <option value="name">Sort: Name A–Z</option>
            <option value="birth">Sort: Birth Year</option>
          </select>
        )}
      </div>

      {/* Members Table */}
      {tab==="members"&&(
        <Card hover={false} style={{overflow:"hidden"}}>
          {/* Table Header */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 100px 80px 60px",gap:12,padding:"12px 20px",background:T.navyDark,borderRadius:"13px 13px 0 0"}}>
            {["Member","Born","Died","Badge","Relations",""].map(h=>(
              <div key={h} style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{h}</div>
            ))}
          </div>
          {filteredMembers.length===0
            ? <div style={{padding:"48px 20px",textAlign:"center",color:T.muted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>No members found</div>
            : filteredMembers.map((m,i)=>{
              const parents=members.filter(x=>m.parents?.includes(x.id));
              const kids=members.filter(x=>m.children?.includes(x.id));
              const accent=accentFor(m.name);
              return (
                <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 100px 80px 60px",gap:12,padding:"13px 20px",borderBottom:i<filteredMembers.length-1?`1px solid ${T.border}`:"none",transition:"background .15s",alignItems:"center"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {/* Name */}
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <Avatar name={m.name} photo={m.photo} size={36} accent={accent}/>
                    <div>
                      <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:15,fontWeight:700,color:T.ink}}>{m.name}</div>
                      <div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif"}}>{m.gender==="F"?"Female":m.gender==="M"?"Male":"Other"}</div>
                    </div>
                  </div>
                  <div style={{fontSize:13,color:T.muted,fontFamily:"Georgia,serif"}}>{m.birth||"—"}</div>
                  <div style={{fontSize:13,color:T.muted,fontFamily:"Georgia,serif"}}>{m.death||<span style={{color:T.sage,fontSize:12}}>Living</span>}</div>
                  <div>{m.badge?<Chip color={accent}>{m.badge}</Chip>:<span style={{color:T.faint,fontSize:12,fontFamily:"Georgia,serif"}}>—</span>}</div>
                  <div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif"}}>
                    {parents.length>0&&<div>{parents.length} parent{parents.length>1?"s":""}</div>}
                    {kids.length>0&&<div>{kids.length} child{kids.length>1?"ren":""}</div>}
                    {!parents.length&&!kids.length&&<span style={{color:T.faint}}>—</span>}
                  </div>
                  <div style={{display:"flex",justifyContent:"flex-end"}}>
                    <button onClick={()=>setConfirmDel({type:"member",id:m.id,name:m.name})}
                      style={{background:"#FDE8E8",border:`1px solid ${T.error}30`,borderRadius:7,padding:"5px 10px",cursor:"pointer",color:T.error,fontSize:12,fontFamily:"Georgia,serif",fontWeight:700,transition:"all .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=T.error;e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#FDE8E8";e.currentTarget.style.color=T.error;}}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          }
        </Card>
      )}

      {/* Users Table */}
      {tab==="users"&&(
        <Card hover={false} style={{overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px 60px",gap:12,padding:"12px 20px",background:T.navyDark,borderRadius:"13px 13px 0 0"}}>
            {["Name","Email","Role",""].map(h=>(
              <div key={h} style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{h}</div>
            ))}
          </div>
          {filteredUsers.length===0
            ? <div style={{padding:"48px 20px",textAlign:"center",color:T.muted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>No accounts found</div>
            : filteredUsers.map((u,i)=>(
              <div key={u.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px 60px",gap:12,padding:"13px 20px",borderBottom:i<filteredUsers.length-1?`1px solid ${T.border}`:"none",transition:"background .15s",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <Avatar name={u.name||"?"} size={34}/>
                  <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:15,fontWeight:700,color:T.ink}}>{u.name||"Unknown"}</div>
                </div>
                <div style={{fontSize:13,color:T.muted,fontFamily:"Georgia,serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                <div>{u.isAdmin?<Chip color={T.gold}>Admin</Chip>:<Chip color={T.muted}>Member</Chip>}</div>
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  {!u.isAdmin&&(
                    <button onClick={()=>setConfirmDel({type:"user",id:u.id,name:u.name})}
                      style={{background:"#FDE8E8",border:`1px solid ${T.error}30`,borderRadius:7,padding:"5px 10px",cursor:"pointer",color:T.error,fontSize:12,fontFamily:"Georgia,serif",fontWeight:700,transition:"all .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=T.error;e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#FDE8E8";e.currentTarget.style.color=T.error;}}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </Card>
      )}
      <p style={{textAlign:"center",fontSize:11,color:T.faint,marginTop:16,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
        {tab==="members"?`${filteredMembers.length} of ${members.length} members shown`:`${filteredUsers.length} of ${users.length} accounts shown`}
      </p>
    </div>
  );
}

// ── TREE VIEW ─────────────────────────────────────────────────────────────────
function TreeView({ members, computeLayout, onSelect, onExport }) {
  const { nodes, edges } = computeLayout();
  const [hov, setHov] = useState(null);
  if (!nodes.length) return (
    <div style={{textAlign:"center",padding:80}}>
      <div style={{fontSize:52,marginBottom:14,opacity:.4}}>🌳</div>
      <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,color:T.ink,marginBottom:8}}>No members yet</h3>
      <p style={{color:T.muted,fontFamily:"Georgia,serif"}}>Add the first family member to begin your tree.</p>
    </div>
  );
  const PAD=80,NW=160,NH=88;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
  const minX=Math.min(...xs)-NW/2,maxX=Math.max(...xs)+NW/2;
  const minY=Math.min(...ys),maxY=Math.max(...ys)+NH;
  const svgW=maxX-minX+PAD*2,svgH=maxY-minY+PAD*2;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}><div style={{width:3,height:22,background:T.gold,borderRadius:2}}/><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,color:T.ink,margin:0,fontWeight:700}}>Family Tree</h2></div>
          <p style={{margin:"0 0 0 13px",fontSize:13,color:T.muted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{members.length} members · Click any card to open profile</p>
        </div>
        <Btn variant="outline" onClick={onExport} size="sm" style={{letterSpacing:"0.08em"}}>⬇ EXPORT</Btn>
      </div>
      <Card hover={false} style={{overflow:"auto",padding:4}}>
        <svg width={Math.max(svgW,720)} height={svgH} style={{display:"block"}}>
          <defs>
            <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(11,25,41,0.14)"/></filter>
            <filter id="hsh"><feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(196,146,42,0.28)"/></filter>
          </defs>
          {/* Subtle grid */}
          <defs><pattern id="tg" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill={T.border} opacity=".4"/></pattern></defs>
          <rect width={Math.max(svgW,720)} height={svgH} fill="url(#tg)" opacity=".5"/>
          {/* Edges */}
          {edges.map((e,i)=>{
            const fx=e.from.x-minX+PAD,fy=e.from.y-minY+PAD+NH;
            const tx=e.to.x-minX+PAD,ty=e.to.y-minY+PAD;
            const my=(fy+ty)/2;
            return <path key={i} d={`M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}`} stroke={T.gold} strokeWidth={1.5} fill="none" strokeDasharray="6,5" opacity=".5"/>;
          })}
          {/* Nodes */}
          {nodes.map(n=>{
            const nx=n.x-minX+PAD-NW/2,ny=n.y-minY+PAD;
            const isH=hov===n.id;
            const accent=accentFor(n.name);
            return (
              <g key={n.id} onClick={()=>onSelect(n)} onMouseEnter={()=>setHov(n.id)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
                {/* Card */}
                <rect x={nx} y={ny} width={NW} height={NH} rx={11} fill={isH?T.navyDark:T.paper} stroke={isH?T.gold:T.border} strokeWidth={isH?1.5:1} filter={isH?"url(#hsh)":"url(#sh)"}/>
                {/* Top accent stripe */}
                <rect x={nx} y={ny} width={NW} height={3} rx={2} fill={accent}/>
                {/* Avatar circle */}
                <circle cx={nx+29} cy={ny+49} r={17} fill={`${accent}18`} stroke={accent} strokeWidth={isH?2:1}/>
                <text x={nx+29} y={ny+54} textAnchor="middle" fontSize={10} fontWeight={700} fill={accent} fontFamily="Georgia,serif">{initials(n.name)}</text>
                {/* Text */}
                <text x={nx+54} y={ny+30} fontSize={12} fontWeight={700} fill={isH?T.goldLight:T.ink} fontFamily="Georgia,serif">{n.name.length>18?n.name.slice(0,17)+"…":n.name}</text>
                <text x={nx+54} y={ny+48} fontSize={10} fill={isH?"#5A7A9A":T.muted} fontFamily="Georgia,serif">{n.birth||"?"}{n.death?` – ${n.death}`:""}</text>
                {n.badge&&<text x={nx+54} y={ny+65} fontSize={9} fill={isH?`${accent}cc`:T.faint} fontFamily="Georgia,serif">{n.badge}</text>}
                {!n.badge&&n.youtube&&<text x={nx+54} y={ny+65} fontSize={9} fill={isH?"#C05050":T.faint} fontFamily="Georgia,serif">▶ video</text>}
                {/* Gold dot if hovered */}
                {isH&&<circle cx={nx+NW-12} cy={ny+12} r={4} fill={T.gold} opacity=".8"/>}
              </g>
            );
          })}
        </svg>
      </Card>
      <p style={{textAlign:"center",fontSize:11,color:T.faint,marginTop:10,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Hover to highlight · Click to view full profile</p>
    </div>
  );
}

// ── SEARCH VIEW ───────────────────────────────────────────────────────────────
function SearchView({ members, onSelect }) {
  const [q,setQ]=useState("");
  const res = q.trim() ? members.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())||m.bio?.toLowerCase().includes(q.toLowerCase())) : members;
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}><div style={{width:3,height:22,background:T.gold,borderRadius:2}}/><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,color:T.ink,margin:0,fontWeight:700}}>Search Members</h2></div>
      <div style={{position:"relative",margin:"20px 0 24px"}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:.35,fontFamily:"Georgia"}}>⌕</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or biography…" style={{width:"100%",padding:"14px 16px 14px 44px",border:`1.5px solid ${q?T.gold:T.border}`,borderRadius:11,fontSize:15,fontFamily:"Georgia,serif",color:T.ink,background:T.paper,outline:"none",boxSizing:"border-box",boxShadow:q?`0 0 0 3px ${T.gold}14`:"none",transition:"all .2s"}}/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:18,color:T.muted,cursor:"pointer"}}>×</button>}
      </div>
      <p style={{fontSize:12,color:T.muted,marginBottom:16,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{res.length} result{res.length!==1?"s":""}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
        {res.map(m=>{
          const accent=accentFor(m.name);
          return (
            <Card key={m.id} onClick={()=>onSelect(m)} style={{padding:"20px 22px",borderLeft:`3px solid ${accent}`}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <Avatar name={m.name} photo={m.photo} size={52} accent={accent}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:17,fontWeight:700,color:T.ink,marginBottom:2}}>{m.name}</div>
                  <div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif",marginBottom:7}}>{m.birth}{m.death?` – ${m.death}`:m.birth?" – present":""}</div>
                  {m.bio&&<div style={{fontSize:12,color:T.text,lineHeight:1.55,fontStyle:"italic",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:"Georgia,serif"}}>{m.bio}</div>}
                  <div style={{display:"flex",gap:6,marginTop:9,flexWrap:"wrap"}}>
                    {m.badge&&<Chip color={accent}>{m.badge}</Chip>}
                    {m.youtube&&<Chip color={T.sage}>Video</Chip>}
                    {m.children?.length>0&&<Chip color={T.sky}>{m.children.length} children</Chip>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
function TimelineView({ members, onSelect }) {
  const events=[];
  members.forEach(m=>{
    if(m.birth) events.push({year:parseInt(m.birth)||0,label:`${m.name} was born`,member:m,icon:"◎",color:T.sage});
    if(m.death) events.push({year:parseInt(m.death)||0,label:`${m.name} passed away`,member:m,icon:"◇",color:T.muted});
    if(m.spouse){const sp=members.find(x=>x.id===m.spouse);if(sp&&m.id<m.spouse)events.push({year:Math.max(parseInt(m.birth)||1900,parseInt(sp.birth)||1900)+22,label:`${m.name} & ${sp.name} married`,member:m,icon:"◈",color:T.wine});}
  });
  const sorted=[...new Map(events.map(e=>[`${e.year}-${e.label}`,e])).values()].sort((a,b)=>a.year-b.year);
  const groups={};sorted.forEach(e=>{const d=Math.floor(e.year/10)*10;if(!groups[d])groups[d]=[];groups[d].push(e);});
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}><div style={{width:3,height:22,background:T.gold,borderRadius:2}}/><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,color:T.ink,margin:0,fontWeight:700}}>Family Timeline</h2></div>
      <p style={{color:T.muted,fontSize:13,fontFamily:"Georgia,serif",margin:"0 0 28px 13px",fontStyle:"italic"}}>{sorted.length} recorded events</p>
      {sorted.length===0&&<Card style={{padding:60,textAlign:"center"}}><p style={{color:T.muted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Add birth years to members to populate the timeline.</p></Card>}
      {Object.entries(groups).map(([decade,evs])=>(
        <div key={decade} style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,fontWeight:700,color:T.gold}}>{decade}s</span>
            <div style={{flex:1,height:1,background:T.border}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,paddingLeft:16,borderLeft:`2px solid ${T.border}`}}>
            {evs.map((ev,i)=>(
              <Card key={i} onClick={()=>onSelect(ev.member)} style={{padding:"13px 18px",display:"flex",gap:14,alignItems:"center",cursor:"pointer",borderLeft:`3px solid ${ev.color}`}}>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,fontWeight:700,color:ev.color,width:44,flexShrink:0}}>{ev.year}</div>
                <div style={{width:1,height:28,background:T.border,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:15,fontWeight:700,color:T.ink}}>{ev.label}</div>
                  {ev.member.bio&&<div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif",fontStyle:"italic",marginTop:2}}>{ev.member.bio.slice(0,80)}…</div>}
                </div>
                <Avatar name={ev.member.name} photo={ev.member.photo} size={36} accent={ev.color} style={{flexShrink:0}}/>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── YOUTUBE CHANNEL ───────────────────────────────────────────────────────────
function ChannelView({ members, onSelect }) {
  const withVid = members.filter(m=>ytId(m.youtube));
  const [active, setActive] = useState(withVid[0]||null);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}><div style={{width:3,height:22,background:T.gold,borderRadius:2}}/><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,color:T.ink,margin:0,fontWeight:700}}>Family Channel</h2></div>
      <p style={{color:T.muted,fontSize:13,fontFamily:"Georgia,serif",margin:"0 0 20px 13px",fontStyle:"italic"}}>{withVid.length} videos</p>
      {withVid.length===0
        ? <Card style={{padding:80,textAlign:"center"}}><div style={{fontSize:44,marginBottom:12,opacity:.3}}>▷</div><h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",color:T.ink,marginBottom:8}}>No videos yet</h3><p style={{color:T.muted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Add YouTube links to member profiles to build your channel.</p></Card>
        : <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20,alignItems:"start"}}>
            <div>
              {active&&<>
                <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:14,overflow:"hidden",background:"#000",marginBottom:16,boxShadow:"0 12px 40px rgba(11,25,41,0.22)"}}>
                  <iframe src={`https://www.youtube.com/embed/${ytId(active.youtube)}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/>
                </div>
                <Card style={{padding:"20px 24px"}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <Avatar name={active.name} photo={active.photo} size={52} accent={accentFor(active.name)}/>
                    <div style={{flex:1}}>
                      <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,color:T.ink,margin:"0 0 4px",fontWeight:700}}>{active.name}</h3>
                      <p style={{margin:0,fontSize:12,color:T.muted,fontFamily:"Georgia,serif"}}>{active.birth}{active.death?` – ${active.death}`:""}{active.badge?` · ${active.badge}`:""}</p>
                    </div>
                    <Btn variant="outline" onClick={()=>onSelect(active)} size="sm">Profile →</Btn>
                  </div>
                  {active.bio&&<p style={{margin:"14px 0 0",fontStyle:"italic",fontSize:13,color:T.muted,lineHeight:1.65,fontFamily:"Georgia,serif",borderTop:`1px solid ${T.border}`,paddingTop:12}}>{active.bio}</p>}
                </Card>
              </>}
            </div>
            <div>
              <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:16,color:T.ink,margin:"0 0 12px",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>All Videos</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {withVid.map(m=>{
                  const vid=ytId(m.youtube); const isCur=active?.id===m.id;
                  return (
                    <div key={m.id} onClick={()=>setActive(m)} style={{background:isCur?T.navyDark:T.paper,borderRadius:10,overflow:"hidden",border:`1.5px solid ${isCur?T.gold:T.border}`,cursor:"pointer",display:"flex",transition:"all .15s",boxShadow:isCur?"0 4px 16px rgba(196,146,42,0.2)":"none"}}>
                      <div style={{position:"relative",flexShrink:0}}>
                        <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={m.name} style={{width:96,height:64,objectFit:"cover",display:"block"}}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:26,height:26,borderRadius:"50%",background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:10,marginLeft:2}}>▶</span></div></div>
                      </div>
                      <div style={{padding:"9px 12px",flex:1}}>
                        <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:14,fontWeight:700,color:isCur?T.goldLight:T.ink}}>{m.name}</div>
                        <div style={{fontSize:11,color:isCur?"#5A7A9A":T.muted,fontFamily:"Georgia,serif"}}>{m.birth}</div>
                        {isCur&&<div style={{fontSize:10,color:T.gold,fontWeight:700,marginTop:3,fontFamily:"Georgia,serif",letterSpacing:"0.05em"}}>NOW PLAYING</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
      }
    </div>
  );
}

// ── PROFILE VIEW ──────────────────────────────────────────────────────────────
function ProfileView({ member, members, onEdit, onSelectMember }) {
  if(!member) return null;
  const m=member; const accent=accentFor(m.name);
  const parents=members.filter(x=>m.parents?.includes(x.id));
  const children=members.filter(x=>m.children?.includes(x.id));
  const spouse=members.find(x=>x.id===m.spouse);
  const vid=ytId(m.youtube);
  return (
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <button onClick={()=>onSelectMember(null)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,marginBottom:18,fontFamily:"Georgia,serif",display:"flex",alignItems:"center",gap:5}}>← Back to tree</button>
      {/* Hero */}
      <Card style={{padding:"32px 36px",marginBottom:16,borderLeft:`3px solid ${accent}`}}>
        <div style={{display:"flex",gap:28,flexWrap:"wrap",alignItems:"flex-start"}}>
          <Avatar name={m.name} photo={m.photo} size={112} accent={accent}/>
          <div style={{flex:1,minWidth:220}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              {m.badge&&<Chip color={accent}>{m.badge}</Chip>}
              {m.youtube&&<Chip color={T.sage}>▷ Video</Chip>}
              {m.death&&<Chip color={T.muted}>In Memoriam</Chip>}
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:34,color:T.ink,margin:"0 0 6px",lineHeight:1.1,fontWeight:700}}>{m.name}</h1>
            <p style={{margin:"0 0 14px",fontSize:13,color:T.muted,fontFamily:"Georgia,serif"}}>
              {m.birth&&`b. ${m.birth}`}{m.death?` · d. ${m.death}`:m.birth?" · Present":""}
              {" · "}{m.gender==="F"?"Female":m.gender==="M"?"Male":"Other"}
              {spouse&&<> · <span>Married to </span><button onClick={()=>onSelectMember(spouse)} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:13,fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:700,padding:0}}>{spouse.name}</button></>}
            </p>
            {m.bio&&<blockquote style={{margin:"0 0 18px",padding:"14px 18px",borderLeft:`2px solid ${accent}`,background:`${accent}08`,borderRadius:"0 10px 10px 0",fontStyle:"italic",color:T.text,fontSize:14,lineHeight:1.75,fontFamily:"Georgia,serif"}}>{m.bio}</blockquote>}
            <Btn variant="outline" onClick={()=>onEdit(m)} size="sm" style={{letterSpacing:"0.08em"}}>✎ EDIT PROFILE</Btn>
          </div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {parents.length>0&&(
          <Card style={{padding:"18px 20px"}}>
            <h3 style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif",margin:"0 0 14px"}}>Parents</h3>
            {parents.map(p=><div key={p.id} onClick={()=>onSelectMember(p)} style={{display:"flex",gap:10,alignItems:"center",padding:"8px",borderRadius:8,cursor:"pointer",marginBottom:4,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Avatar name={p.name} photo={p.photo} size={36} accent={accentFor(p.name)}/><div><div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:15,fontWeight:700,color:T.ink}}>{p.name}</div><div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif"}}>{p.birth}</div></div></div>)}
          </Card>
        )}
        {spouse&&(
          <Card style={{padding:"18px 20px"}}>
            <h3 style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif",margin:"0 0 14px"}}>Spouse</h3>
            <div onClick={()=>onSelectMember(spouse)} style={{display:"flex",gap:10,alignItems:"center",padding:"8px",borderRadius:8,cursor:"pointer",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Avatar name={spouse.name} photo={spouse.photo} size={44} accent={accentFor(spouse.name)}/><div><div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:16,fontWeight:700,color:T.ink}}>{spouse.name}</div><div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif"}}>{spouse.birth}</div></div></div>
          </Card>
        )}
        {children.length>0&&(
          <Card style={{padding:"18px 20px",gridColumn:!parents.length&&!spouse?"1/-1":"auto"}}>
            <h3 style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif",margin:"0 0 14px"}}>Children ({children.length})</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {children.map(c=><div key={c.id} onClick={()=>onSelectMember(c)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:9,border:`1px solid ${T.border}`,cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=accentFor(c.name);e.currentTarget.style.background=T.surface;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="transparent";}}><Avatar name={c.name} photo={c.photo} size={30} accent={accentFor(c.name)}/><div><div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:13,fontWeight:700,color:T.ink}}>{c.name}</div><div style={{fontSize:10,color:T.muted}}>{c.birth}</div></div></div>)}
            </div>
          </Card>
        )}
      </div>
      {vid&&<Card style={{padding:"18px 20px",marginBottom:12}}><h3 style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif",margin:"0 0 14px"}}>Family Video</h3><div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:10,overflow:"hidden"}}><iframe src={`https://www.youtube.com/embed/${vid}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/></div></Card>}
      {m.photo&&<Card style={{padding:"18px 20px"}}><h3 style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif",margin:"0 0 14px"}}>Photo</h3><img src={m.photo} alt={m.name} style={{width:"100%",maxHeight:420,objectFit:"cover",borderRadius:10}} onError={e=>e.target.style.display="none"}/></Card>}
    </div>
  );
}

// ── MEMBER FORM ───────────────────────────────────────────────────────────────
function MemberForm({ initial, members, onSubmit, onCancel, title }) {
  const blank={name:"",birth:"",death:"",bio:"",photo:"",youtube:"",gender:"M",parents:[],children:[],spouse:"",badge:""};
  const [f,setF]=useState(initial||blank);
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));
  const togPar=id=>{const c=f.parents||[];upd("parents",c.includes(id)?c.filter(x=>x!==id):[...c,id]);};
  const others=members.filter(m=>m.id!==initial?.id);
  const BADGES=["","Patriarch","Matriarch","Engineer","Artist","Storyteller","Caregiver","Techie","Chef","Musician","Traveller","Photographer","Writer","Gardener","Sportsperson"];
  return (
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <Card style={{padding:"38px 44px"}} hover={false}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}><div style={{width:3,height:24,background:T.gold,borderRadius:2}}/><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:26,color:T.ink,margin:0,fontWeight:700}}>{title}</h2></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px"}}>
          <div style={{gridColumn:"1/-1"}}><Inp label="Full Name *" value={f.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Ramchandra Sharma"/></div>
          <Inp label="Birth Year" value={f.birth} onChange={e=>upd("birth",e.target.value)} placeholder="e.g. 1948"/>
          <Inp label="Death Year" value={f.death} onChange={e=>upd("death",e.target.value)} placeholder="Leave blank if living"/>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Gender</label>
            <div style={{display:"flex",gap:18}}>{[["M","Male"],["F","Female"],["O","Other"]].map(([v,l])=><label key={v} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,color:T.text,fontFamily:"Georgia,serif"}}><input type="radio" name="gen" value={v} checked={f.gender===v} onChange={()=>upd("gender",v)}/>{l}</label>)}</div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Badge / Role</label>
            <select value={f.badge||""} onChange={e=>upd("badge",e.target.value)} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:13,fontFamily:"Georgia,serif",outline:"none"}}>
              {BADGES.map(b=><option key={b} value={b}>{b||"No badge"}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1",marginBottom:16}}>
            <label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Biography / Story</label>
            <textarea value={f.bio} onChange={e=>upd("bio",e.target.value)} placeholder="Share their story, personality and memories…" style={{width:"100%",padding:"11px 15px",border:`1.5px solid ${T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:13,fontFamily:"Georgia,serif",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:90,lineHeight:1.65}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>
          <div style={{gridColumn:"1/-1"}}><PhotoUploader value={f.photo} onChange={v=>upd("photo",v)}/></div>
          <div style={{gridColumn:"1/-1"}}><Inp label="YouTube Video URL" value={f.youtube} onChange={e=>upd("youtube",e.target.value)} placeholder="https://www.youtube.com/watch?v=…" hint="Paste any YouTube link to add to the family channel"/></div>
          {others.length>0&&<div style={{gridColumn:"1/-1",marginBottom:16}}>
            <label style={{display:"block",marginBottom:8,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Parents</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{others.map(m=>{const sel=(f.parents||[]).includes(m.id);return<div key={m.id} onClick={()=>togPar(m.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:8,border:`1.5px solid ${sel?T.gold:T.border}`,background:sel?T.goldPale:T.surface,cursor:"pointer",fontSize:12,color:T.text,fontFamily:"Georgia,serif",transition:"all .15s"}}><Avatar name={m.name} photo={m.photo} size={20} accent={accentFor(m.name)}/>{sel&&<span style={{color:T.gold}}>✓ </span>}{m.name}</div>;})}</div>
          </div>}
          {others.length>0&&<div style={{gridColumn:"1/-1",marginBottom:16}}>
            <label style={{display:"block",marginBottom:6,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Spouse</label>
            <select value={f.spouse} onChange={e=>upd("spouse",e.target.value)} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:13,fontFamily:"Georgia,serif",outline:"none"}}>
              <option value="">None / not listed</option>
              {others.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>}
        </div>
        <Divider/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="gold" onClick={()=>{if(!f.name.trim())return;onSubmit(f);}} style={{letterSpacing:"0.08em"}}>SAVE TO TREE</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── INVITE PAGE ───────────────────────────────────────────────────────────────
function InvitePage({ user }) {
  const [codes,setCodes]=useState(()=>JSON.parse(localStorage.getItem(KEY.INVITES)||"[]"));
  const [copied,setCopied]=useState(null);
  const generate=()=>{const inv={code:"fam-"+uid(),createdBy:user.name,createdAt:new Date().toLocaleDateString(),used:false};const updated=[...codes,inv];setCodes(updated);localStorage.setItem(KEY.INVITES,JSON.stringify(updated));fireConfetti();};
  const copy=(text,k)=>{navigator.clipboard?.writeText(text).catch(()=>{});setCopied(k);setTimeout(()=>setCopied(null),2000);};
  return (
    <div style={{maxWidth:640,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}><div style={{width:3,height:22,background:T.gold,borderRadius:2}}/><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,color:T.ink,margin:0,fontWeight:700}}>Invite Family</h2></div>
      <p style={{color:T.muted,fontSize:13,fontFamily:"Georgia,serif",margin:"0 0 26px 13px",fontStyle:"italic"}}>Generate unique codes to bring relatives onto the tree.</p>
      <Card style={{padding:"28px 32px",marginBottom:16}} hover={false}>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:codes.length?24:0,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:18,color:T.ink,margin:"0 0 4px",fontWeight:700}}>New Invite Code</h3>
            <p style={{margin:0,fontSize:13,color:T.muted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Each code can only be used once.</p>
          </div>
          <Btn variant="gold" onClick={generate} style={{letterSpacing:"0.08em"}}>GENERATE CODE</Btn>
        </div>
        {codes.length>0&&<>
          <Divider label="Your Codes"/>
          {codes.map((inv,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,marginBottom:8,flexWrap:"wrap",opacity:inv.used?.7:1}}>
              <code style={{fontFamily:"'Courier New',monospace",fontSize:14,fontWeight:700,color:inv.used?T.muted:T.navyDark,background:inv.used?T.border:T.goldPale,padding:"5px 13px",borderRadius:7,letterSpacing:"0.05em"}}>{inv.code}</code>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:T.muted,fontFamily:"Georgia,serif"}}>{inv.createdAt}</div>
                {inv.used&&<div style={{fontSize:11,color:T.sage,fontFamily:"Georgia,serif",fontWeight:700}}>Used by {inv.usedBy||"someone"}</div>}
              </div>
              {!inv.used&&<div style={{display:"flex",gap:6}}>
                <button onClick={()=>copy(inv.code,i+"c")} style={{background:copied===i+"c"?T.sage:T.paper,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif",color:copied===i+"c"?"#fff":T.muted,transition:"all .15s"}}>{copied===i+"c"?"✓ Copied":"Copy Code"}</button>
                <button onClick={()=>copy(`${window.location.href.split("?")[0]}?invite=${inv.code}`,i+"l")} style={{background:copied===i+"l"?T.sky:T.paper,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif",color:copied===i+"l"?"#fff":T.muted,transition:"all .15s"}}>{copied===i+"l"?"✓ Copied":"Copy Link"}</button>
              </div>}
            </div>
          ))}
        </>}
      </Card>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setViewRaw]=useState("landing");
  const [user,setUser]=useState(null);
  const [members,setMembers]=useState([]);
  const [users,setUsers]=useState([]);
  const [selected,setSelected]=useState(null);
  const [editing,setEditing]=useState(null);
  const [toast,setToast]=useState(null);

  const setView=v=>{setViewRaw(v);window.scrollTo({top:0,behavior:"smooth"});};

  const loadUsers=()=>{const u=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");setUsers(u);return u;};

  useEffect(()=>{
    const s=localStorage.getItem(KEY.SESSION);
    if(s){setUser(JSON.parse(s));setViewRaw("home");}
    const m=localStorage.getItem(KEY.MEMBERS);
    setMembers(m?JSON.parse(m):SEED);
    loadUsers();
  },[]);

  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(null),3400);return()=>clearTimeout(t);}}, [toast]);

  const showToast=(msg,confetti=false)=>{setToast(msg);if(confetti)setTimeout(fireConfetti,100);};
  const saveMembers=m=>{setMembers(m);localStorage.setItem(KEY.MEMBERS,JSON.stringify(m));};

  const signup=(name,email,pw,code,setErr)=>{
    if(!name||!email||!pw){setErr("Please fill in all fields.");return;}
    const us=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");
    if(us.find(u=>u.email===email)){setErr("Email already registered.");return;}
    if(code){const invs=JSON.parse(localStorage.getItem(KEY.INVITES)||"[]");const inv=invs.find(i=>i.code===code&&!i.used);if(!inv){setErr("Invalid or already used invite code.");return;}localStorage.setItem(KEY.INVITES,JSON.stringify(invs.map(i=>i.code===code?{...i,used:true,usedBy:name}:i)));}
    const isFirstUser=us.length===0;
    const u={id:Date.now().toString(),name,email,pw,isAdmin:isFirstUser};
    us.push(u); localStorage.setItem(KEY.USERS,JSON.stringify(us));
    localStorage.setItem(KEY.SESSION,JSON.stringify(u));
    setUser(u); setUsers(us); setView("home");
    showToast(isFirstUser?`Welcome, ${name}! You are the family admin 🔒`:`Welcome to the family, ${name}!`,true);
  };

  const login=(email,pw,setErr)=>{
    const us=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");
    const u=us.find(x=>x.email===email&&x.pw===pw);
    if(!u){setErr("Incorrect email or password.");return;}
    localStorage.setItem(KEY.SESSION,JSON.stringify(u));
    setUser(u); loadUsers(); setView("home"); showToast(`Welcome back, ${u.name}.`);
  };

  const logout=()=>{localStorage.removeItem(KEY.SESSION);setUser(null);setView("landing");};

  const addMember=data=>{
    const nm={...data,id:"m"+Date.now(),addedBy:user.id};
    let up=[...members,nm];
    if(data.parents?.length)up=up.map(m=>data.parents.includes(m.id)&&!m.children?.includes(nm.id)?{...m,children:[...(m.children||[]),nm.id]}:m);
    if(data.spouse)up=up.map(m=>m.id===data.spouse&&!m.spouse?{...m,spouse:nm.id}:m);
    saveMembers(up); showToast(`${nm.name} added to the family tree.`,true); setView("tree");
  };

  const updateMember=(id,data)=>{
    saveMembers(members.map(m=>m.id===id?{...m,...data}:m));
    setSelected(s=>({...s,...data})); showToast("Profile updated."); setView("profile");
  };

  // ── DELETE MEMBER — clean up all references ──────────────────────────────
  const deleteMember=id=>{
    let up=members.filter(m=>m.id!==id);
    // Remove from parents' children arrays
    up=up.map(m=>({...m,children:(m.children||[]).filter(c=>c!==id),parents:(m.parents||[]).filter(p=>p!==id),spouse:m.spouse===id?"":m.spouse}));
    saveMembers(up);
    if(selected?.id===id){setSelected(null);setView("tree");}
    showToast("Member removed from the family tree.");
  };

  // ── DELETE USER ──────────────────────────────────────────────────────────
  const deleteUser=id=>{
    const up=users.filter(u=>u.id!==id);
    localStorage.setItem(KEY.USERS,JSON.stringify(up));
    setUsers(up); showToast("Account removed.");
  };

  const computeLayout=useCallback(()=>{
    if(!members.length)return{nodes:[],edges:[]};
    const gMap={};
    const getG=(id,vis=new Set())=>{if(gMap[id]!==undefined)return gMap[id];if(vis.has(id))return 0;vis.add(id);const m=members.find(x=>x.id===id);if(!m||!m.parents?.length)return 0;const vp=m.parents.filter(p=>members.find(x=>x.id===p));if(!vp.length)return 0;return Math.max(...vp.map(p=>getG(p,new Set(vis))))+1;};
    members.forEach(m=>{gMap[m.id]=getG(m.id);});
    const byG={};members.forEach(m=>{const g=gMap[m.id]||0;if(!byG[g])byG[g]=[];byG[g].push(m);});
    const NW=160,NH=88,HG=30,VG=120;const nf=[];
    Object.entries(byG).forEach(([g,gm])=>{const total=gm.length*(NW+HG)-HG;gm.forEach((m,i)=>nf.push({...m,x:i*(NW+HG)-total/2,y:Number(g)*(NH+VG)}));});
    const edges=[];members.forEach(m=>{(m.children||[]).forEach(cid=>{const p=nf.find(n=>n.id===m.id),c=nf.find(n=>n.id===cid);if(p&&c)edges.push({from:p,to:c});});});
    return{nodes:nf,edges};
  },[members]);

  const exportPDF=()=>{
    const {nodes,edges}=computeLayout();
    const PAD=80,NW=160,NH=90;
    const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
    const minX=Math.min(...xs)-NW/2,maxX=Math.max(...xs)+NW/2;
    const minY=Math.min(...ys),maxY=Math.max(...ys)+NH;
    const sW=maxX-minX+PAD*2,sH=maxY-minY+PAD*2;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${sW}" height="${sH}" style="background:#FDFCF9">
      ${edges.map(e=>{const fx=e.from.x-minX+PAD,fy=e.from.y-minY+PAD+NH,tx=e.to.x-minX+PAD,ty=e.to.y-minY+PAD,my=(fy+ty)/2;return`<path d="M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}" stroke="#C4922A" stroke-width="1.5" fill="none" stroke-dasharray="6,5" opacity=".5"/>`;}).join("")}
      ${nodes.map(n=>{const nx=n.x-minX+PAD-NW/2,ny=n.y-minY+PAD,nm=n.name.length>20?n.name.slice(0,19)+"…":n.name;const ac=ACCENTS[(n.name.charCodeAt(0)||0)%ACCENTS.length];return`<rect x="${nx}" y="${ny}" width="${NW}" height="${NH}" rx="10" fill="white" stroke="#DAD4C8" stroke-width="1"/><rect x="${nx}" y="${ny}" width="${NW}" height="3" rx="2" fill="${ac}"/><circle cx="${nx+28}" cy="${ny+50}" r="15" fill="${ac}18" stroke="${ac}" stroke-width="1.5"/><text x="${nx+28}" y="${ny+55}" text-anchor="middle" font-size="9.5" font-weight="bold" fill="${ac}" font-family="Georgia">${initials(n.name)}</text><text x="${nx+50}" y="${ny+30}" font-size="11" font-weight="bold" fill="#0F1A26" font-family="Georgia">${nm}</text><text x="${nx+50}" y="${ny+48}" font-size="10" fill="#5A6A7A" font-family="Georgia">${n.birth||""}${n.death?` – ${n.death}`:""}</text>`;}).join("")}
    </svg>`;
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Our Family Story</title><style>@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&display=swap');body{margin:0;padding:32px;background:#F4F1EB;font-family:'Cormorant Garamond',Georgia,serif;}h1{font-size:44px;color:#0F1A26;margin:0 0 4px;font-weight:700;}.sub{color:#5A6A7A;font-size:14px;margin:0 0 28px;font-style:italic;}.tree{background:#FDFCF9;border-radius:14px;padding:24px;border:1px solid #DAD4C8;margin-bottom:32px;overflow:auto;}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}.card{background:#FDFCF9;border-radius:12px;padding:16px 18px;border:1px solid #DAD4C8;border-left:3px solid #C4922A;}.name{font-size:18px;color:#0F1A26;margin:0 0 3px;font-weight:700;}.years{font-size:12px;color:#5A6A7A;margin:0 0 6px;}.bio{font-size:12px;color:#1E2D3D;line-height:1.65;margin:0;font-style:italic;}</style></head><body><h1>Our Family Story</h1><p class="sub">${members.length} members · ${new Date().toLocaleDateString()}</p><div class="tree">${svg}</div><div class="grid">${members.map(m=>`<div class="card"><p class="name">${m.name}</p><p class="years">${m.birth||""}${m.death?` – ${m.death}`:m.birth?" – present":""}</p>${m.bio?`<p class="bio">${m.bio.slice(0,180)}${m.bio.length>180?"…":""}</p>`:""}</div>`).join("")}</div></body></html>`;
    const b=new Blob([html],{type:"text/html"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="our-family-story.html";a.click();
  };

  const isAdmin=user?.isAdmin===true;
  const INNER=["home","tree","timeline","channel","search","profile","addMember","editMember","invite","admin"];

  return (
    <div style={{fontFamily:"Georgia,serif",minHeight:"100vh",background:T.bg}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus,textarea:focus,select:focus{border-color:${T.gold}!important;box-shadow:0 0 0 3px ${T.gold}18!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes slideR{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:${T.surface}}
        ::-webkit-scrollbar-thumb{background:${T.borderMid};border-radius:3px}
      `}</style>

      {toast&&(
        <div style={{position:"fixed",top:18,right:18,zIndex:9999,background:T.navyDark,color:"#D4C4A0",padding:"13px 22px",borderRadius:11,fontSize:13,fontFamily:"'Cormorant Garamond',Georgia,serif",boxShadow:"0 12px 40px rgba(0,0,0,0.28)",animation:"slideR .3s ease",maxWidth:340,lineHeight:1.5,border:`1px solid ${T.gold}30`}}>
          {toast}
        </div>
      )}

      {view==="landing"&&<Landing onLogin={()=>setView("login")} onSignup={()=>setView("signup")}/>}
      {view==="login"&&<LoginPage onLogin={login} onSwitch={()=>setView("signup")} onBack={()=>setView("landing")}/>}
      {view==="signup"&&<SignupPage onSignup={signup} onSwitch={()=>setView("login")} onBack={()=>setView("landing")}/>}

      {INNER.includes(view)&&user&&(
        <Shell user={user} view={view} setView={setView} onLogout={logout} isAdmin={isAdmin}>
          {view==="home"&&<HomePage members={members} user={user} setView={setView} setSelected={setSelected} isAdmin={isAdmin}/>}
          {view==="tree"&&<TreeView members={members} computeLayout={computeLayout} onSelect={m=>{setSelected(m);setView("profile");}} onExport={exportPDF}/>}
          {view==="timeline"&&<TimelineView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="channel"&&<ChannelView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="search"&&<SearchView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="profile"&&<ProfileView member={selected} members={members} onEdit={m=>{setEditing(m);setView("editMember");}} onSelectMember={m=>{if(m){setSelected(m);}else setView("tree");}}/>}
          {view==="addMember"&&<MemberForm members={members} onSubmit={addMember} onCancel={()=>setView("tree")} title="Add a Family Member"/>}
          {view==="editMember"&&<MemberForm initial={editing} members={members} onSubmit={d=>updateMember(editing.id,d)} onCancel={()=>setView("profile")} title="Edit Profile"/>}
          {view==="invite"&&<InvitePage user={user}/>}
          {view==="admin"&&isAdmin&&<AdminPanel members={members} users={users} onDeleteMember={deleteMember} onDeleteUser={deleteUser} toast={showToast}/>}
          {view==="admin"&&!isAdmin&&<div style={{textAlign:"center",padding:80}}><div style={{fontSize:48,marginBottom:14,opacity:.4}}>🔒</div><h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,color:T.ink}}>Admin Access Only</h3><p style={{color:T.muted,fontFamily:"Georgia,serif",marginTop:8}}>You need admin privileges to view this page.</p></div>}
        </Shell>
      )}
    </div>
  );
}
