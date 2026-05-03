import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────── THEME ───────────────────────────────────────────
const W = {
  bg:"#FBF5E8", paper:"#FFFDF5", cream:"#F0E4C8", border:"#D9C4A0",
  brown:"#5C2E0E", mahogany:"#8B3A1C", gold:"#C9903A", goldLight:"#E8C97A",
  text:"#2C1810", muted:"#8B7355", error:"#9B2335", success:"#2E6E3A",
  ink:"#1A0E08",
};

const SEED = [
  { id:"s1",name:"Ramchandra Sharma",birth:"1918",death:"1989",bio:"Patriarch of the Sharma family. A devoted schoolteacher who moved from Agra to Delhi in 1945. His wisdom and stories filled every room.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s2",gender:"M",events:[] },
  { id:"s2",name:"Savitri Devi Sharma",birth:"1922",death:"2001",bio:"The heart of the home. Known for boundless warmth and legendary cooking. She held the family together through every storm.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s1",gender:"F",events:[] },
  { id:"s3",name:"Suresh Sharma",birth:"1948",death:"",bio:"Eldest son, retired civil engineer. Passionate about cricket, classical music and growing roses.",photo:"",youtube:"https://www.youtube.com/watch?v=dQw4w9WgXcQ",parents:["s1","s2"],children:["s5","s6"],spouse:"s7",gender:"M",events:[] },
  { id:"s4",name:"Meena Joshi",birth:"1952",death:"",bio:"Youngest child, retired schoolteacher like her father. Lives in Pune. A wonderful storyteller.",photo:"",youtube:"",parents:["s1","s2"],children:[],spouse:"",gender:"F",events:[] },
  { id:"s7",name:"Priya Sharma",birth:"1950",death:"",bio:"Suresh's wife. Former nurse, now retired. Known for her beautiful embroidery and quiet kindness.",photo:"",youtube:"",parents:[],children:["s5","s6"],spouse:"s3",gender:"F",events:[] },
  { id:"s5",name:"Arjun Sharma",birth:"1975",death:"",bio:"Software engineer in Bengaluru. Loves classical music and mountain treks.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"M",events:[] },
  { id:"s6",name:"Nisha Sharma",birth:"1978",death:"",bio:"Graphic designer in Delhi. Paints in oils and keeps traditional recipes alive.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"F",events:[] },
];

const KEY = { USERS:"ft_users", MEMBERS:"ft_members2", SESSION:"ft_session2", INVITES:"ft_invites" };

// ─────────────────────────── HELPERS ─────────────────────────────────────────
const initials = n => n.trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
const avatarBg = n => ["#7B3F1E","#3B6E5E","#2B4F8E","#6E2E5C","#4A5E2E","#7B2E3E"][(n.charCodeAt(0)||0)%6];
const ytId = url => { if(!url) return null; const r=url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/); return r?r[1]:null; };
const uid = () => Math.random().toString(36).slice(2,10);

function readFileAsBase64(file) {
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(file); });
}

// ─────────────────────────── PRIMITIVE UI ─────────────────────────────────────
function Avatar({ name, photo, size=48, style={} }) {
  return photo
    ? <img src={photo} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,...style}}/>
    : <div style={{width:size,height:size,borderRadius:"50%",background:avatarBg(name),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:size*0.33,flexShrink:0,fontFamily:"Georgia,serif",...style}}>{initials(name)}</div>;
}

function Inp({ label, help, ...p }) {
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</label>}
      <input {...p} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${W.border}`,borderRadius:8,background:W.paper,color:W.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",...(p.style||{})}}/>
      {help&&<p style={{margin:"4px 0 0",fontSize:11,color:W.muted}}>{help}</p>}
    </div>
  );
}

function Btn({ children, variant="primary", ...p }) {
  const vs = {
    primary:{background:W.brown,color:"#fff",border:"none"},
    gold:{background:W.gold,color:"#fff",border:"none"},
    outline:{background:"transparent",color:W.brown,border:`1.5px solid ${W.brown}`},
    ghost:{background:"transparent",color:W.muted,border:`1px solid ${W.border}`},
    danger:{background:W.error,color:"#fff",border:"none"},
  };
  return (
    <button {...p} style={{padding:"10px 20px",borderRadius:8,fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:700,letterSpacing:"0.05em",transition:"opacity 0.15s",...vs[variant],...(p.style||{})}} onMouseEnter={e=>e.currentTarget.style.opacity="0.88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, width=560 }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(28,10,2,0.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:W.paper,borderRadius:18,width:"100%",maxWidth:width,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.3)",border:`1px solid ${W.cream}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 28px 0"}}>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,color:W.brown,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:W.muted,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"18px 28px 28px"}}>{children}</div>
      </div>
    </div>
  );
}

function PhotoUploader({ value, onChange }) {
  const inp = useRef();
  const [drag, setDrag] = useState(false);
  const handle = async files => {
    const f = files[0];
    if (!f || !f.type.startsWith("image/")) return;
    const b64 = await readFileAsBase64(f);
    onChange(b64);
  };
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",marginBottom:6,fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase"}}>Photo</label>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files);}}
        style={{border:`2px dashed ${drag?W.gold:W.border}`,borderRadius:10,padding:"18px 14px",textAlign:"center",background:drag?"#FFF8EE":W.bg,cursor:"pointer",transition:"all 0.2s"}} onClick={()=>inp.current.click()}>
        {value
          ? <div style={{position:"relative",display:"inline-block"}}><img src={value} alt="preview" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover"}}/><button onClick={e=>{e.stopPropagation();onChange("");}} style={{position:"absolute",top:-4,right:-4,width:22,height:22,borderRadius:"50%",background:W.error,border:"none",color:"#fff",cursor:"pointer",fontSize:13,lineHeight:1}}>×</button></div>
          : <><div style={{fontSize:28,marginBottom:6}}>📷</div><p style={{margin:0,fontSize:12,color:W.muted}}>Click to upload or drag & drop<br/><span style={{color:W.gold,fontWeight:700}}>JPG, PNG, WEBP</span></p></>}
      </div>
      <input ref={inp} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files)}/>
      {!value&&<div style={{marginTop:8}}><input placeholder="Or paste image URL…" style={{width:"100%",padding:"8px 12px",border:`1px solid ${W.border}`,borderRadius:7,fontSize:12,fontFamily:"inherit",color:W.text,background:W.paper,outline:"none",boxSizing:"border-box"}} onChange={e=>e.target.value&&onChange(e.target.value)}/></div>}
    </div>
  );
}

// ─────────────────────────── LANDING ─────────────────────────────────────────
function Landing({ onLogin, onSignup, inviteCode }) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1E0A04 0%,#4A1C08 40%,#7A3A18 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:0.04,backgroundImage:"radial-gradient(circle,#fff 1.5px,transparent 1.5px)",backgroundSize:"48px 48px"}}/>
      <div style={{position:"absolute",top:-120,right:-120,width:500,height:500,borderRadius:"50%",background:"rgba(201,144,58,0.08)"}}/>
      <div style={{textAlign:"center",maxWidth:580,position:"relative",zIndex:1}}>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:80,height:80,borderRadius:"50%",background:"rgba(201,144,58,0.15)",marginBottom:20,fontSize:42}}>🌳</div>
        <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(36px,6vw,56px)",color:W.goldLight,margin:"0 0 16px",lineHeight:1.1}}>Our Family Story</h1>
        {inviteCode&&<div style={{background:"rgba(201,144,58,0.18)",border:"1.5px solid rgba(232,201,122,0.35)",borderRadius:10,padding:"10px 20px",marginBottom:24,display:"inline-block"}}>
          <span style={{color:W.goldLight,fontSize:13}}>🎉 You've been invited! Sign up to join the family tree.</span>
        </div>}
        <p style={{color:"#C4B09A",fontSize:16,lineHeight:1.8,maxWidth:440,margin:"0 auto 40px",fontFamily:"Georgia,serif"}}>Preserve memories, connect generations and celebrate the stories that make your family unique.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:52}}>
          <Btn variant="gold" onClick={onSignup} style={{padding:"14px 38px",fontSize:15}}>{inviteCode?"Accept Invite & Join":"Begin Your Journey"}</Btn>
          <Btn onClick={onLogin} style={{padding:"14px 38px",fontSize:15,background:"rgba(255,255,255,0.08)",color:W.goldLight,border:"1.5px solid rgba(232,201,122,0.4)"}}>Sign In</Btn>
        </div>
        <div style={{display:"flex",gap:36,justifyContent:"center",color:"#9E8A72"}}>
          {[["🌿","Family Tree"],["📖","Stories"],["🎬","Channel"],["📅","Timeline"],["🔗","Invites"]].map(([ic,lb])=>(
            <div key={lb} style={{textAlign:"center"}}><div style={{fontSize:22,marginBottom:5}}>{ic}</div><div style={{fontSize:11,letterSpacing:"0.04em"}}>{lb}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── AUTH ─────────────────────────────────────────────
function AuthWrap({ title, sub, children }) {
  return (
    <div style={{minHeight:"100vh",background:W.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:W.paper,borderRadius:18,padding:"44px 40px",width:"100%",maxWidth:420,boxShadow:"0 24px 64px rgba(92,46,14,0.14)",border:`1px solid ${W.cream}`}}>
        <div style={{textAlign:"center",marginBottom:28}}><div style={{fontSize:38,marginBottom:10}}>🌳</div>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:24,color:W.brown,margin:"0 0 5px"}}>{title}</h2>
          <p style={{color:W.muted,fontSize:13,margin:0}}>{sub}</p>
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
      {err&&<div style={{background:"#FDE8EA",border:`1px solid ${W.error}`,borderRadius:7,padding:"8px 12px",fontSize:12,color:W.error,marginBottom:14}}>{err}</div>}
      <Inp label="Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/>
      <Inp label="Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="••••••••"/>
      <Btn onClick={()=>onLogin(e,p,sErr)} style={{width:"100%",padding:14,fontSize:14,marginTop:4}}>Sign In</Btn>
      <div style={{textAlign:"center",marginTop:16,fontSize:13,color:W.muted}}>New here? <button onClick={onSwitch} style={{background:"none",border:"none",color:W.gold,cursor:"pointer",fontSize:13,fontWeight:700}}>Create account</button></div>
      <button onClick={onBack} style={{background:"none",border:"none",color:W.muted,cursor:"pointer",fontSize:12,display:"block",margin:"10px auto 0"}}>← Back</button>
    </AuthWrap>
  );
}
function SignupPage({ onSignup, onSwitch, onBack, inviteCode }) {
  const [n,sN]=useState(""); const [e,sE]=useState(""); const [p,sP]=useState(""); const [inv,sInv]=useState(inviteCode||""); const [err,sErr]=useState("");
  return (
    <AuthWrap title="Join the Family Tree" sub="Create your account">
      {err&&<div style={{background:"#FDE8EA",border:`1px solid ${W.error}`,borderRadius:7,padding:"8px 12px",fontSize:12,color:W.error,marginBottom:14}}>{err}</div>}
      {inviteCode&&<div style={{background:"#EDF7EE",border:"1px solid #A8D4AB",borderRadius:7,padding:"8px 12px",fontSize:12,color:W.success,marginBottom:14}}>✓ Joining via family invite</div>}
      <Inp label="Full Name" value={n} onChange={ev=>sN(ev.target.value)} placeholder="Your full name"/>
      <Inp label="Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/>
      <Inp label="Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="Choose a password"/>
      <Inp label="Invite Code (optional)" value={inv} onChange={ev=>sInv(ev.target.value)} placeholder="e.g. fam-a1b2c3d4"/>
      <Btn onClick={()=>onSignup(n,e,p,inv,sErr)} style={{width:"100%",padding:14,fontSize:14,marginTop:4}}>Create Account</Btn>
      <div style={{textAlign:"center",marginTop:16,fontSize:13,color:W.muted}}>Have an account? <button onClick={onSwitch} style={{background:"none",border:"none",color:W.gold,cursor:"pointer",fontSize:13,fontWeight:700}}>Sign in</button></div>
      <button onClick={onBack} style={{background:"none",border:"none",color:W.muted,cursor:"pointer",fontSize:12,display:"block",margin:"10px auto 0"}}>← Back</button>
    </AuthWrap>
  );
}

// ─────────────────────────── SHELL / NAV ──────────────────────────────────────
function Shell({ user, view, setView, onLogout, children }) {
  const [search,setSearch]=useState("");
  const navItems = [
    {id:"tree",icon:"🌳",label:"Tree"},
    {id:"timeline",icon:"📅",label:"Timeline"},
    {id:"channel",icon:"🎬",label:"Channel"},
    {id:"search",icon:"🔍",label:"Search"},
  ];
  return (
    <div style={{minHeight:"100vh",background:W.bg}}>
      <nav style={{background:W.brown,height:58,padding:"0 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 3px 16px rgba(0,0,0,0.25)",position:"sticky",top:0,zIndex:200}}>
        <button onClick={()=>setView("tree")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginRight:8}}>
          <span style={{fontSize:22}}>🌳</span>
          <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:17,color:W.goldLight,fontWeight:700,whiteSpace:"nowrap"}}>Our Family Story</span>
        </button>
        <div style={{display:"flex",gap:2,flex:1}}>
          {navItems.map(it=>(
            <button key={it.id} onClick={()=>setView(it.id)} style={{background:view===it.id?"rgba(201,144,58,0.22)":"none",border:"none",color:view===it.id?W.goldLight:"#C4A882",cursor:"pointer",padding:"6px 12px",borderRadius:7,fontSize:12,fontFamily:"Georgia,serif",display:"flex",alignItems:"center",gap:5,fontWeight:view===it.id?700:400,transition:"all 0.15s"}}>
              <span style={{fontSize:14}}>{it.icon}</span><span style={{display:"none"}}>{it.label}</span>
              <style>{`@media(min-width:600px){.navlabel{display:inline!important}}`}</style>
              <span className="navlabel" style={{display:"none"}}>{it.label}</span>
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Btn variant="gold" onClick={()=>setView("addMember")} style={{padding:"6px 14px",fontSize:11}}>＋ Add Member</Btn>
          <button onClick={()=>setView("invite")} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#D4C4A8",cursor:"pointer",padding:"6px 12px",borderRadius:7,fontSize:11,fontFamily:"inherit",fontWeight:700}} title="Invite family">✉ Invite</button>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,0.06)"}}>
            <Avatar name={user.name} size={26}/>
            <span style={{color:"#C4A882",fontSize:11,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",color:"#9E8A72",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Out</button>
        </div>
      </nav>
      <div style={{padding:"24px 20px",maxWidth:1240,margin:"0 auto"}}>{children}</div>
    </div>
  );
}

// ─────────────────────────── TREE VIEW ───────────────────────────────────────
function TreeView({ members, computeLayout, onSelect, onExport }) {
  const { nodes, edges } = computeLayout();
  const [hov,setHov]=useState(null);
  const treeRef = useRef();
  if(!nodes.length) return (
    <div style={{textAlign:"center",padding:80,color:W.muted}}>
      <div style={{fontSize:56,marginBottom:14}}>🌱</div>
      <p style={{fontFamily:"Georgia,serif",fontSize:16}}>No members yet — add the first one!</p>
    </div>
  );
  const PAD=80,NW=154,NH=82;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
  const minX=Math.min(...xs)-NW/2, maxX=Math.max(...xs)+NW/2;
  const minY=Math.min(...ys), maxY=Math.max(...ys)+NH;
  const svgW=maxX-minX+PAD*2, svgH=maxY-minY+PAD*2;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,color:W.brown,margin:"0 0 3px"}}>Family Tree</h2>
          <p style={{margin:0,fontSize:13,color:W.muted}}>{members.length} members across {new Set(Object.values(computeLayout().nodes.reduce((a,n)=>{a[n.id]=n.y;return a},{}))).size} generations</p>
        </div>
        <Btn variant="outline" onClick={onExport} style={{padding:"8px 18px",fontSize:12}}>⬇ Export PDF</Btn>
      </div>
      <div ref={treeRef} style={{background:W.paper,borderRadius:16,border:`1px solid ${W.cream}`,overflow:"auto",boxShadow:"0 6px 32px rgba(92,46,14,0.09)"}}>
        <svg width={Math.max(svgW,700)} height={svgH} style={{display:"block"}}>
          <defs><filter id="cs"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(92,46,14,0.12)"/></filter></defs>
          {edges.map((e,i)=>{
            const fx=e.from.x-minX+PAD, fy=e.from.y-minY+PAD+NH;
            const tx=e.to.x-minX+PAD, ty=e.to.y-minY+PAD;
            const my=(fy+ty)/2;
            return <path key={i} d={`M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}`} stroke={W.goldLight} strokeWidth={1.8} fill="none" strokeDasharray="6,4" opacity="0.75"/>;
          })}
          {nodes.map(n=>{
            const nx=n.x-minX+PAD-NW/2, ny=n.y-minY+PAD;
            const isH=hov===n.id;
            const accent=n.gender==="F"?W.gold:W.mahogany;
            return (
              <g key={n.id} onClick={()=>onSelect(n)} onMouseEnter={()=>setHov(n.id)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
                <rect x={nx} y={ny} width={NW} height={NH} rx={10} fill={isH?"#FFF6E8":W.paper} stroke={isH?W.gold:W.border} strokeWidth={isH?2:1} filter="url(#cs)"/>
                <rect x={nx} y={ny} width={NW} height={4} rx={2} fill={accent}/>
                <circle cx={nx+28} cy={ny+46} r={17} fill={n.gender==="F"?"#FBE8D0":"#EAD8C8"} stroke={accent} strokeWidth={1}/>
                <text x={nx+28} y={ny+51} textAnchor="middle" fontSize={10} fontWeight={700} fill={accent} fontFamily="Georgia,serif">{initials(n.name)}</text>
                <text x={nx+52} y={ny+29} fontSize={11.5} fontWeight={700} fill={W.brown} fontFamily="Georgia,serif">{n.name.length>18?n.name.slice(0,17)+"…":n.name}</text>
                <text x={nx+52} y={ny+46} fontSize={10} fill={W.muted} fontFamily="Georgia,serif">{n.birth||"?"}{n.death?` – ${n.death}`:""}</text>
                {n.youtube&&<text x={nx+52} y={ny+61} fontSize={9} fill="#C44" fontFamily="Georgia,serif">▶ video</text>}
                {!n.youtube&&<text x={nx+52} y={ny+61} fontSize={9} fill={isH?W.gold:"transparent"} fontFamily="Georgia,serif">View →</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <p style={{textAlign:"center",fontSize:11,color:W.muted,marginTop:10}}>Scroll to explore · Click a member to view their full story · <span style={{color:"#C44"}}>▶</span> = has video</p>
    </div>
  );
}

// ─────────────────────────── SEARCH VIEW ──────────────────────────────────────
function SearchView({ members, onSelect }) {
  const [q,setQ]=useState("");
  const results = q.trim() ? members.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())||m.bio?.toLowerCase().includes(q.toLowerCase())) : members;
  return (
    <div>
      <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,color:W.brown,margin:"0 0 18px"}}>Search Members</h2>
      <div style={{position:"relative",marginBottom:24}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:0.5}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or story…" style={{width:"100%",padding:"13px 14px 13px 44px",border:`2px solid ${q?W.gold:W.border}`,borderRadius:10,fontSize:15,fontFamily:"Georgia,serif",color:W.text,background:W.paper,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:18,color:W.muted,cursor:"pointer"}}>×</button>}
      </div>
      <p style={{fontSize:13,color:W.muted,marginBottom:16}}>{results.length} {results.length===1?"member":"members"} found</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {results.map(m=>(
          <div key={m.id} onClick={()=>onSelect(m)} style={{background:W.paper,borderRadius:14,padding:"18px 20px",border:`1px solid ${W.cream}`,cursor:"pointer",display:"flex",gap:14,alignItems:"flex-start",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=W.gold;e.currentTarget.style.boxShadow=`0 4px 20px rgba(201,144,58,0.12)`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=W.cream;e.currentTarget.style.boxShadow="none";}}>
            <Avatar name={m.name} photo={m.photo} size={52}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:W.brown,marginBottom:2}}>{m.name}</div>
              <div style={{fontSize:12,color:W.muted,marginBottom:6}}>{m.birth}{m.death?` – ${m.death}`:m.birth?" – present":""}</div>
              {m.bio&&<div style={{fontSize:12,color:W.text,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{m.bio}</div>}
              <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                {m.youtube&&<span style={{background:"#FEE2E2",color:"#991B1B",fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700}}>▶ Video</span>}
                {m.photo&&<span style={{background:"#F0FDF4",color:"#166534",fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700}}>📷 Photo</span>}
                {m.parents?.length>0&&<span style={{background:W.cream,color:W.brown,fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700}}>{m.parents.length} parents</span>}
                {m.children?.length>0&&<span style={{background:W.cream,color:W.brown,fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700}}>{m.children.length} children</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── TIMELINE VIEW ───────────────────────────────────
function TimelineView({ members, onSelect }) {
  const events = [];
  members.forEach(m=>{
    if(m.birth) events.push({year:parseInt(m.birth)||0,type:"birth",label:`${m.name} was born`,member:m,icon:"🌱",color:"#2E6E3A"});
    if(m.death) events.push({year:parseInt(m.death)||0,type:"death",label:`${m.name} passed away`,member:m,icon:"🕊️",color:"#6B5C4A"});
    if(m.spouse){const sp=members.find(x=>x.id===m.spouse); if(sp&&m.birth&&sp.birth) events.push({year:Math.max(parseInt(m.birth)||0,parseInt(sp.birth)||0)+22,type:"marriage",label:`${m.name} & ${sp.name} married`,member:m,icon:"💍",color:W.gold});}
    (m.events||[]).forEach(ev=>events.push({year:parseInt(ev.year)||0,type:"custom",label:ev.text,member:m,icon:"📌",color:W.mahogany}));
  });
  const sorted = [...new Map(events.map(e=>[`${e.year}-${e.label}`,e])).values()].sort((a,b)=>a.year-b.year);
  const decades=[...new Set(sorted.map(e=>Math.floor(e.year/10)*10))];
  return (
    <div>
      <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,color:W.brown,margin:"0 0 6px"}}>Family Timeline</h2>
      <p style={{fontSize:13,color:W.muted,marginBottom:28}}>{sorted.length} events across {decades.length} decades</p>
      {sorted.length===0&&<div style={{textAlign:"center",padding:60,color:W.muted}}><div style={{fontSize:48,marginBottom:12}}>📅</div><p>No events yet — add members with birth years to see the timeline!</p></div>}
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:64,top:0,bottom:0,width:2,background:W.cream}}/>
        {sorted.map((ev,i)=>(
          <div key={i} style={{display:"flex",gap:20,marginBottom:20,alignItems:"flex-start",position:"relative"}}>
            <div style={{width:60,textAlign:"right",fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:W.muted,paddingTop:10,flexShrink:0}}>{ev.year||"?"}</div>
            <div style={{width:18,height:18,borderRadius:"50%",background:ev.color,border:`3px solid ${W.paper}`,boxShadow:`0 0 0 2px ${ev.color}`,flexShrink:0,marginTop:9,zIndex:1}}/>
            <div onClick={()=>onSelect(ev.member)} style={{flex:1,background:W.paper,borderRadius:12,padding:"12px 16px",border:`1px solid ${W.cream}`,cursor:"pointer",display:"flex",gap:12,alignItems:"center",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=ev.color;e.currentTarget.style.background="#FFFDF2";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=W.cream;e.currentTarget.style.background=W.paper;}}>
              <span style={{fontSize:20,flexShrink:0}}>{ev.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:W.brown,fontFamily:"Georgia,serif"}}>{ev.label}</div>
                {ev.member.bio&&<div style={{fontSize:11,color:W.muted,marginTop:2,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ev.member.bio}</div>}
              </div>
              <Avatar name={ev.member.name} photo={ev.member.photo} size={36} style={{marginLeft:"auto"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── YOUTUBE CHANNEL ─────────────────────────────────
function ChannelView({ members, onSelect }) {
  const withVid = members.filter(m=>ytId(m.youtube));
  const [active,setActive]=useState(withVid[0]||null);
  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,color:W.brown,margin:"0 0 4px"}}>Family Channel</h2>
          <p style={{margin:0,fontSize:13,color:W.muted}}>{withVid.length} videos from family members</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:8,background:"#FEE2E2",border:"1px solid #FECACA"}}>
          <span style={{fontSize:16}}>▶</span>
          <span style={{fontSize:12,color:"#991B1B",fontWeight:700}}>YouTube Connected</span>
        </div>
      </div>
      {withVid.length===0
        ? <div style={{textAlign:"center",padding:80,background:W.paper,borderRadius:16,border:`1px solid ${W.cream}`}}>
            <div style={{fontSize:52,marginBottom:14}}>🎬</div>
            <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",color:W.brown,marginBottom:8}}>No videos yet</h3>
            <p style={{color:W.muted,fontSize:14}}>Add YouTube video links to family members' profiles to build your channel!</p>
          </div>
        : <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>
            <div>
              {active&&<>
                <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:14,overflow:"hidden",background:"#000",marginBottom:16,boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
                  <iframe src={`https://www.youtube.com/embed/${ytId(active.youtube)}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/>
                </div>
                <div style={{background:W.paper,borderRadius:12,padding:"18px 20px",border:`1px solid ${W.cream}`}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <Avatar name={active.name} photo={active.photo} size={52}/>
                    <div>
                      <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:18,color:W.brown,margin:"0 0 4px"}}>{active.name}</h3>
                      <p style={{margin:0,fontSize:13,color:W.muted}}>{active.birth}{active.death?` – ${active.death}`:""}</p>
                    </div>
                    <Btn variant="outline" onClick={()=>onSelect(active)} style={{marginLeft:"auto",padding:"7px 14px",fontSize:12}}>View Profile</Btn>
                  </div>
                  {active.bio&&<blockquote style={{margin:"14px 0 0",padding:"10px 16px",borderLeft:`3px solid ${W.gold}`,background:W.cream,borderRadius:"0 8px 8px 0",fontStyle:"italic",fontSize:13,color:W.text,lineHeight:1.6}}>{active.bio}</blockquote>}
                </div>
              </>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <h3 style={{fontSize:12,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 4px"}}>All Videos</h3>
              {withVid.map(m=>{
                const vid=ytId(m.youtube);
                const isCur=active?.id===m.id;
                return (
                  <div key={m.id} onClick={()=>setActive(m)} style={{background:isCur?"#FFF6E3":W.paper,borderRadius:10,overflow:"hidden",border:`1.5px solid ${isCur?W.gold:W.cream}`,cursor:"pointer",display:"flex",gap:0,transition:"all 0.15s"}}
                    onMouseEnter={e=>{if(!isCur)e.currentTarget.style.borderColor=W.border;}} onMouseLeave={e=>{if(!isCur)e.currentTarget.style.borderColor=W.cream;}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={m.name} style={{width:110,height:70,objectFit:"cover",display:"block"}}/>
                      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:11,marginLeft:2}}>▶</span></div></div>
                    </div>
                    <div style={{padding:"8px 12px",flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:W.brown,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                      <div style={{fontSize:11,color:W.muted}}>{m.birth}</div>
                      {isCur&&<div style={{fontSize:10,color:W.gold,fontWeight:700,marginTop:3}}>▶ Now playing</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      }
    </div>
  );
}

// ─────────────────────────── INVITE PAGE ──────────────────────────────────────
function InvitePage({ user }) {
  const [codes,setCodes]=useState(()=>{
    const stored=localStorage.getItem(KEY.INVITES);
    return stored?JSON.parse(stored):[];
  });
  const [copied,setCopied]=useState(null);

  const generate = () => {
    const code = "fam-"+uid();
    const inv = {code,createdBy:user.name,createdAt:new Date().toLocaleDateString(),used:false};
    const updated=[...codes,inv];
    setCodes(updated);
    localStorage.setItem(KEY.INVITES,JSON.stringify(updated));
  };

  const copyCode = code => {
    navigator.clipboard?.writeText(code).catch(()=>{});
    setCopied(code);
    setTimeout(()=>setCopied(null),2000);
  };

  const copyLink = code => {
    const url=`${window.location.href.split("?")[0]}?invite=${code}`;
    navigator.clipboard?.writeText(url).catch(()=>{});
    setCopied(code+"link");
    setTimeout(()=>setCopied(null),2000);
  };

  return (
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,color:W.brown,margin:"0 0 6px"}}>Invite Family Members</h2>
      <p style={{fontSize:13,color:W.muted,marginBottom:28}}>Generate invite codes to share with relatives. They use the code when signing up to join your family tree.</p>
      <div style={{background:W.paper,borderRadius:16,padding:"28px 32px",border:`1px solid ${W.cream}`,marginBottom:20,boxShadow:"0 4px 20px rgba(92,46,14,0.07)"}}>
        <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:24,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200}}>
            <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:17,color:W.brown,margin:"0 0 5px"}}>Generate a New Invite</h3>
            <p style={{margin:0,fontSize:13,color:W.muted}}>Each code can be used once by one family member.</p>
          </div>
          <Btn variant="gold" onClick={generate} style={{padding:"11px 24px",fontSize:13}}>＋ Generate Code</Btn>
        </div>
        {codes.length===0
          ? <div style={{textAlign:"center",padding:"28px 0",color:W.muted,borderTop:`1px solid ${W.cream}`}}>
              <div style={{fontSize:36,marginBottom:8}}>✉</div>
              <p style={{fontSize:13}}>No invite codes yet. Generate one above!</p>
            </div>
          : <div style={{borderTop:`1px solid ${W.cream}`,paddingTop:18}}>
              <div style={{fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Your Invite Codes</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {codes.map((inv,i)=>(
                  <div key={i} style={{background:W.bg,borderRadius:10,padding:"12px 16px",border:`1px solid ${W.border}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    <div style={{fontFamily:"'Courier New',monospace",fontSize:14,fontWeight:700,color:W.brown,background:W.cream,padding:"5px 12px",borderRadius:6,letterSpacing:"0.06em"}}>{inv.code}</div>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontSize:11,color:W.muted}}>Created by {inv.createdBy} · {inv.createdAt}</div>
                      {inv.used&&<div style={{fontSize:11,color:W.success,fontWeight:700}}>✓ Used</div>}
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>copyCode(inv.code)} style={{background:copied===inv.code?"#EDF7EE":W.paper,border:`1px solid ${W.border}`,borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:W.brown,fontWeight:700,transition:"all 0.15s"}}>{copied===inv.code?"✓ Copied!":"Copy Code"}</button>
                      <button onClick={()=>copyLink(inv.code)} style={{background:copied===inv.code+"link"?"#EDF7EE":W.paper,border:`1px solid ${W.border}`,borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:W.brown,fontWeight:700,transition:"all 0.15s"}}>{copied===inv.code+"link"?"✓ Copied!":"Copy Link"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        }
      </div>
      <div style={{background:"#FFF8EE",borderRadius:12,padding:"16px 20px",border:`1px solid ${W.goldLight}`}}>
        <h4 style={{fontSize:12,fontWeight:700,color:W.brown,margin:"0 0 8px",letterSpacing:"0.06em",textTransform:"uppercase"}}>How invites work</h4>
        <ul style={{margin:0,padding:"0 0 0 16px",fontSize:13,color:W.text,lineHeight:1.9}}>
          <li>Generate a unique code or share a direct link</li>
          <li>Family member visits the site and creates an account</li>
          <li>They enter the invite code during sign-up</li>
          <li>They're immediately added to the shared family tree</li>
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────── PROFILE VIEW ────────────────────────────────────
function ProfileView({ member, members, onEdit, onSelectMember }) {
  if(!member) return null;
  const m=member;
  const parents=members.filter(x=>m.parents?.includes(x.id));
  const children=members.filter(x=>m.children?.includes(x.id));
  const spouse=members.find(x=>x.id===m.spouse);
  const vid=ytId(m.youtube);
  const RelCard=({title,items})=>items.length===0?null:(
    <div style={{background:W.paper,borderRadius:12,padding:"16px 20px",border:`1px solid ${W.cream}`}}>
      <h3 style={{margin:"0 0 12px",fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.09em",textTransform:"uppercase"}}>{title}</h3>
      {items.map(p=>(
        <div key={p.id} onClick={()=>onSelectMember(p)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"6px 8px",borderRadius:8,transition:"background 0.15s",marginBottom:4}}
          onMouseEnter={e=>e.currentTarget.style.background=W.cream} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <Avatar name={p.name} photo={p.photo} size={40}/>
          <div><div style={{fontSize:13,fontWeight:700,color:W.brown}}>{p.name}</div><div style={{fontSize:11,color:W.muted}}>{p.birth}{p.death?` – ${p.death}`:""}</div></div>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{maxWidth:840,margin:"0 auto"}}>
      <button onClick={()=>onSelectMember(null)} style={{background:"none",border:"none",color:W.muted,cursor:"pointer",fontSize:13,marginBottom:16,padding:0}}>← Back to tree</button>
      <div style={{background:W.paper,borderRadius:18,padding:"32px 36px",marginBottom:16,border:`1px solid ${W.cream}`,boxShadow:"0 8px 40px rgba(92,46,14,0.09)"}}>
        <div style={{display:"flex",gap:26,flexWrap:"wrap"}}>
          <div style={{position:"relative"}}>
            <Avatar name={m.name} photo={m.photo} size={108} style={{boxShadow:"0 6px 20px rgba(92,46,14,0.14)"}}/>
            <div style={{position:"absolute",bottom:-4,right:-4,width:26,height:26,borderRadius:"50%",background:m.gender==="F"?W.gold:W.mahogany,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:`2px solid ${W.paper}`}}>{m.gender==="F"?"♀":"♂"}</div>
          </div>
          <div style={{flex:1,minWidth:220}}>
            <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:30,color:W.brown,margin:"0 0 6px",lineHeight:1.2}}>{m.name}</h1>
            <p style={{margin:"0 0 12px",fontSize:13,color:W.muted}}>
              {m.birth&&`Born ${m.birth}`}{m.death?` · Passed ${m.death}`:m.birth?" · Living":""}
              {spouse&&<> · <span>Spouse of </span><button onClick={()=>onSelectMember(spouse)} style={{background:"none",border:"none",color:W.gold,cursor:"pointer",fontSize:13,fontWeight:700,padding:0}}>{spouse.name}</button></>}
            </p>
            {m.bio&&<blockquote style={{margin:"0 0 16px",padding:"12px 16px",borderLeft:`3px solid ${W.gold}`,background:W.cream,borderRadius:"0 8px 8px 0",fontStyle:"italic",color:W.text,fontSize:13,lineHeight:1.7}}>{m.bio}</blockquote>}
            <Btn variant="outline" onClick={()=>onEdit(m)} style={{fontSize:12,padding:"7px 16px"}}>✏ Edit Profile</Btn>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <RelCard title="Parents" items={parents}/>
        {spouse&&(
          <div style={{background:W.paper,borderRadius:12,padding:"16px 20px",border:`1px solid ${W.cream}`}}>
            <h3 style={{margin:"0 0 12px",fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.09em",textTransform:"uppercase"}}>Spouse</h3>
            <div onClick={()=>onSelectMember(spouse)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"6px 8px",borderRadius:8}}
              onMouseEnter={e=>e.currentTarget.style.background=W.cream} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={spouse.name} photo={spouse.photo} size={44}/>
              <div><div style={{fontSize:14,fontWeight:700,color:W.brown}}>{spouse.name}</div><div style={{fontSize:12,color:W.muted}}>{spouse.birth}</div></div>
            </div>
          </div>
        )}
        {children.length>0&&(
          <div style={{background:W.paper,borderRadius:12,padding:"16px 20px",border:`1px solid ${W.cream}`,gridColumn:!parents.length&&!spouse?"1/-1":"auto"}}>
            <h3 style={{margin:"0 0 12px",fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.09em",textTransform:"uppercase"}}>Children ({children.length})</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {children.map(c=>(
                <div key={c.id} onClick={()=>onSelectMember(c)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,border:`1px solid ${W.border}`,cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=W.gold;e.currentTarget.style.background=W.cream;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=W.border;e.currentTarget.style.background="transparent";}}>
                  <Avatar name={c.name} photo={c.photo} size={32}/><div><div style={{fontSize:12,fontWeight:700,color:W.brown}}>{c.name}</div><div style={{fontSize:10,color:W.muted}}>{c.birth}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {vid&&(
        <div style={{background:W.paper,borderRadius:12,padding:"16px 20px",border:`1px solid ${W.cream}`,marginBottom:16}}>
          <h3 style={{margin:"0 0 12px",fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.09em",textTransform:"uppercase"}}>🎬 Family Video</h3>
          <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:10,overflow:"hidden"}}>
            <iframe src={`https://www.youtube.com/embed/${vid}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/>
          </div>
        </div>
      )}
      {m.photo&&(
        <div style={{background:W.paper,borderRadius:12,padding:"16px 20px",border:`1px solid ${W.cream}`}}>
          <h3 style={{margin:"0 0 12px",fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.09em",textTransform:"uppercase"}}>📷 Photo</h3>
          <img src={m.photo} alt={m.name} style={{width:"100%",maxHeight:420,objectFit:"cover",borderRadius:8}} onError={e=>e.target.style.display="none"}/>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── MEMBER FORM ─────────────────────────────────────
function MemberForm({ initial, members, onSubmit, onCancel, title }) {
  const blank={name:"",birth:"",death:"",bio:"",photo:"",youtube:"",gender:"M",parents:[],children:[],spouse:"",events:[]};
  const [f,setF]=useState(initial||blank);
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));
  const togPar=id=>{const c=f.parents||[];upd("parents",c.includes(id)?c.filter(x=>x!==id):[...c,id]);};
  const others=members.filter(m=>m.id!==initial?.id);
  return (
    <div style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{background:W.paper,borderRadius:18,padding:"36px 40px",border:`1px solid ${W.cream}`,boxShadow:"0 8px 40px rgba(92,46,14,0.1)"}}>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:24,color:W.brown,margin:"0 0 26px"}}>{title}</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 22px"}}>
          <div style={{gridColumn:"1/-1"}}><Inp label="Full Name *" value={f.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Ramchandra Sharma"/></div>
          <Inp label="Birth Year" value={f.birth} onChange={e=>upd("birth",e.target.value)} placeholder="e.g. 1948"/>
          <Inp label="Death Year" value={f.death} onChange={e=>upd("death",e.target.value)} placeholder="Leave blank if living"/>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",marginBottom:6,fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase"}}>Gender</label>
            <div style={{display:"flex",gap:18}}>
              {[["M","Male"],["F","Female"],["O","Other"]].map(([v,l])=>(
                <label key={v} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,color:W.text}}>
                  <input type="radio" name="gen" value={v} checked={f.gender===v} onChange={()=>upd("gender",v)}/>{l}
                </label>
              ))}
            </div>
          </div>
          <div style={{gridColumn:"1/-1",marginBottom:14}}>
            <label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase"}}>Story / Biography</label>
            <textarea value={f.bio} onChange={e=>upd("bio",e.target.value)} placeholder="Share their story, personality, achievements, memories…" style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${W.border}`,borderRadius:8,background:W.paper,color:W.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:88,lineHeight:1.6}}/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <PhotoUploader value={f.photo} onChange={v=>upd("photo",v)}/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <Inp label="YouTube Video URL" value={f.youtube} onChange={e=>upd("youtube",e.target.value)} placeholder="https://www.youtube.com/watch?v=…" help="Paste any YouTube video link to add to the family channel"/>
          </div>
          {others.length>0&&(
            <div style={{gridColumn:"1/-1",marginBottom:14}}>
              <label style={{display:"block",marginBottom:8,fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase"}}>Parents</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {others.map(m=>{const sel=(f.parents||[]).includes(m.id);return(
                  <div key={m.id} onClick={()=>togPar(m.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:7,border:`1.5px solid ${sel?W.gold:W.border}`,background:sel?"#FFF6E3":W.bg,cursor:"pointer",fontSize:12,color:W.text,fontWeight:sel?700:400,transition:"all 0.15s"}}>
                    <Avatar name={m.name} photo={m.photo} size={22}/>{sel&&<span style={{color:W.gold}}>✓ </span>}{m.name}
                  </div>
                );})}
              </div>
            </div>
          )}
          {others.length>0&&(
            <div style={{gridColumn:"1/-1",marginBottom:14}}>
              <label style={{display:"block",marginBottom:6,fontSize:11,fontWeight:700,color:W.brown,letterSpacing:"0.08em",textTransform:"uppercase"}}>Spouse</label>
              <select value={f.spouse} onChange={e=>upd("spouse",e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${W.border}`,borderRadius:8,background:W.paper,color:W.text,fontSize:13,fontFamily:"inherit",outline:"none"}}>
                <option value="">None / Not listed</option>
                {others.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:14,paddingTop:16,borderTop:`1px solid ${W.cream}`}}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn onClick={()=>{if(!f.name.trim())return;onSubmit(f);}}>Save to Family Tree</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── PDF EXPORT ───────────────────────────────────────
function exportPDF(members, computeLayout) {
  const { nodes, edges } = computeLayout();
  const PAD=80,NW=160,NH=90;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
  const minX=Math.min(...xs)-NW/2, maxX=Math.max(...xs)+NW/2;
  const minY=Math.min(...ys), maxY=Math.max(...ys)+NH;
  const svgW=maxX-minX+PAD*2, svgH=maxY-minY+PAD*2;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#FFFDF5">
    <style>text{font-family:Georgia,serif;}</style>
    ${edges.map((e,i)=>{
      const fx=e.from.x-minX+PAD, fy=e.from.y-minY+PAD+NH;
      const tx=e.to.x-minX+PAD, ty=e.to.y-minY+PAD;
      const my=(fy+ty)/2;
      return `<path d="M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}" stroke="#E8C97A" stroke-width="1.5" fill="none" stroke-dasharray="5,4"/>`;
    }).join("")}
    ${nodes.map(n=>{
      const nx=n.x-minX+PAD-NW/2, ny=n.y-minY+PAD;
      const accent=n.gender==="F"?"#C9903A":"#8B3A1C";
      const nm=n.name.length>20?n.name.slice(0,19)+"…":n.name;
      return `<rect x="${nx}" y="${ny}" width="${NW}" height="${NH}" rx="8" fill="white" stroke="#D9C4A0" stroke-width="1"/>
        <rect x="${nx}" y="${ny}" width="${NW}" height="4" rx="2" fill="${accent}"/>
        <circle cx="${nx+28}" cy="${ny+50}" r="16" fill="${n.gender==="F"?"#FBE8D0":"#EAD8C8"}" stroke="${accent}" stroke-width="1"/>
        <text x="${nx+28}" y="${ny+55}" text-anchor="middle" font-size="10" font-weight="bold" fill="${accent}">${initials(n.name)}</text>
        <text x="${nx+52}" y="${ny+32}" font-size="11" font-weight="bold" fill="#5C2E0E">${nm}</text>
        <text x="${nx+52}" y="${ny+50}" font-size="10" fill="#8B7355">${n.birth||""}${n.death?` – ${n.death}`:""}</text>`;
    }).join("")}
  </svg>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Family Tree</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
  body{margin:0;padding:32px;background:#FBF5E8;font-family:Georgia,serif;}
  h1{font-family:'Playfair Display',Georgia,serif;color:#5C2E0E;font-size:32px;margin:0 0 6px;}
  .sub{color:#8B7355;font-size:14px;margin:0 0 28px;}
  .tree{background:#FFFDF5;border-radius:12px;padding:20px;border:1px solid #D9C4A0;margin-bottom:32px;overflow:auto;}
  .members{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;}
  .card{background:#FFFDF5;border-radius:12px;padding:16px;border:1px solid #D9C4A0;}
  .name{font-size:15px;font-weight:700;color:#5C2E0E;margin:0 0 4px;}
  .years{font-size:12px;color:#8B7355;margin:0 0 6px;}
  .bio{font-size:12px;color:#2C1810;line-height:1.55;margin:0;font-style:italic;}
  @media print{body{padding:16px;}.tree{page-break-after:always;}}
</style>
</head><body>
<h1>🌳 Our Family Story</h1>
<p class="sub">Family Tree · ${members.length} members · Generated ${new Date().toLocaleDateString()}</p>
<div class="tree">${svgContent}</div>
<div class="members">
${members.map(m=>`<div class="card">
  <p class="name">${m.name}</p>
  <p class="years">${m.birth||""}${m.death?` – ${m.death}`:m.birth?" – present":""} · ${m.gender==="F"?"Female":m.gender==="M"?"Male":"Other"}</p>
  ${m.bio?`<p class="bio">${m.bio.slice(0,200)}${m.bio.length>200?"…":""}</p>`:""}
</div>`).join("")}
</div>
</body></html>`;

  const blob = new Blob([html], {type:"text/html"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "family-tree.html";
  a.click();
}

// ─────────────────────────── APP ROOT ────────────────────────────────────────
export default function App() {
  const [view,setViewRaw]=useState("landing");
  const [user,setUser]=useState(null);
  const [members,setMembers]=useState([]);
  const [selected,setSelected]=useState(null);
  const [editing,setEditing]=useState(null);
  const [toast,setToast]=useState(null);
  const [inviteCode]=useState(()=>new URLSearchParams(window.location.search).get("invite")||"");

  const setView = v => { setViewRaw(v); window.scrollTo(0,0); };

  useEffect(()=>{
    const s=localStorage.getItem(KEY.SESSION);
    if(s){setUser(JSON.parse(s));setViewRaw("tree");}
    const m=localStorage.getItem(KEY.MEMBERS);
    setMembers(m?JSON.parse(m):SEED);
  },[]);

  useEffect(()=>{
    if(toast){const t=setTimeout(()=>setToast(null),3200);return()=>clearTimeout(t);}
  },[toast]);

  const save=m=>{setMembers(m);localStorage.setItem(KEY.MEMBERS,JSON.stringify(m));};

  const signup=(name,email,pw,code,setErr)=>{
    if(!name||!email||!pw){setErr("Please fill all fields.");return;}
    const users=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");
    if(users.find(u=>u.email===email)){setErr("Email already registered.");return;}
    if(code){
      const invs=JSON.parse(localStorage.getItem(KEY.INVITES)||"[]");
      const inv=invs.find(i=>i.code===code&&!i.used);
      if(!inv){setErr("Invalid or already-used invite code.");return;}
      const updated=invs.map(i=>i.code===code?{...i,used:true,usedBy:name}:i);
      localStorage.setItem(KEY.INVITES,JSON.stringify(updated));
    }
    const u={id:Date.now().toString(),name,email,pw};
    users.push(u);
    localStorage.setItem(KEY.USERS,JSON.stringify(users));
    localStorage.setItem(KEY.SESSION,JSON.stringify(u));
    setUser(u);setView("tree");setToast(`Welcome to the family, ${name}! 🌳`);
  };

  const login=(email,pw,setErr)=>{
    const users=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");
    const u=users.find(x=>x.email===email&&x.pw===pw);
    if(!u){setErr("Incorrect email or password.");return;}
    localStorage.setItem(KEY.SESSION,JSON.stringify(u));
    setUser(u);setView("tree");setToast(`Welcome back, ${u.name}!`);
  };

  const logout=()=>{localStorage.removeItem(KEY.SESSION);setUser(null);setView("landing");};

  const addMember=data=>{
    const nm={...data,id:"m"+Date.now(),addedBy:user.id};
    let up=[...members,nm];
    if(data.parents?.length)up=up.map(m=>data.parents.includes(m.id)&&!m.children?.includes(nm.id)?{...m,children:[...(m.children||[]),nm.id]}:m);
    if(data.spouse)up=up.map(m=>m.id===data.spouse&&!m.spouse?{...m,spouse:nm.id}:m);
    save(up);setToast("Member added! 🌿");setView("tree");
  };

  const updateMember=(id,data)=>{
    const up=members.map(m=>m.id===id?{...m,...data}:m);
    save(up);setSelected(s=>({...s,...data}));setToast("Profile updated ✓");setView("profile");
  };

  const computeLayout=useCallback(()=>{
    if(!members.length)return{nodes:[],edges:[]};
    const gMap={};
    const getG=(id,vis=new Set())=>{
      if(gMap[id]!==undefined)return gMap[id];
      if(vis.has(id))return 0;
      vis.add(id);
      const m=members.find(x=>x.id===id);
      if(!m||!m.parents?.length)return 0;
      const vp=m.parents.filter(p=>members.find(x=>x.id===p));
      if(!vp.length)return 0;
      return Math.max(...vp.map(p=>getG(p,new Set(vis))))+1;
    };
    members.forEach(m=>{gMap[m.id]=getG(m.id);});
    const byG={};
    members.forEach(m=>{const g=gMap[m.id]||0;if(!byG[g])byG[g]=[];byG[g].push(m);});
    const NW=154,NH=82,HG=30,VG=120;
    const nodes=[];
    Object.entries(byG).forEach(([g,gm])=>{
      const total=gm.length*(NW+HG)-HG;
      gm.forEach((m,i)=>nodes.push({...m,x:i*(NW+HG)-total/2+total/2-total/2,y:Number(g)*(NH+VG)}));
    });
    // re-center properly
    const nodesFinal=[];
    Object.entries(byG).forEach(([g,gm])=>{
      const total=gm.length*(NW+HG)-HG;
      gm.forEach((m,i)=>nodesFinal.push({...m,x:i*(NW+HG)-total/2,y:Number(g)*(NH+VG)}));
    });
    const edges=[];
    members.forEach(m=>{
      (m.children||[]).forEach(cid=>{
        const p=nodesFinal.find(n=>n.id===m.id),c=nodesFinal.find(n=>n.id===cid);
        if(p&&c)edges.push({from:p,to:c});
      });
    });
    return{nodes:nodesFinal,edges};
  },[members]);

  const INNER=["tree","timeline","channel","search","profile","addMember","editMember","invite"];

  return (
    <div style={{fontFamily:"Georgia,'Times New Roman',serif",minHeight:"100vh",background:W.bg}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus,textarea:focus,select:focus{border-color:${W.gold}!important;box-shadow:0 0 0 3px rgba(201,144,58,0.15);}
        @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        ::-webkit-scrollbar{width:6px;height:6px;}::-webkit-scrollbar-track{background:${W.cream};}::-webkit-scrollbar-thumb{background:${W.border};border-radius:3px;}
      `}</style>

      {toast&&(
        <div style={{position:"fixed",top:18,right:18,zIndex:9999,background:W.brown,color:"#fff",padding:"12px 20px",borderRadius:10,fontSize:13,fontFamily:"Georgia,serif",boxShadow:"0 8px 32px rgba(0,0,0,0.22)",animation:"slideIn 0.3s ease",maxWidth:320,lineHeight:1.4}}>
          {toast}
        </div>
      )}

      {view==="landing"&&<Landing onLogin={()=>setView("login")} onSignup={()=>setView("signup")} inviteCode={inviteCode}/>}
      {view==="login"&&<LoginPage onLogin={login} onSwitch={()=>setView("signup")} onBack={()=>setView("landing")}/>}
      {view==="signup"&&<SignupPage onSignup={signup} onSwitch={()=>setView("login")} onBack={()=>setView("landing")} inviteCode={inviteCode}/>}

      {INNER.includes(view)&&user&&(
        <Shell user={user} view={view} setView={v=>{setView(v);}} onLogout={logout}>
          {view==="tree"&&<TreeView members={members} computeLayout={computeLayout} onSelect={m=>{setSelected(m);setView("profile");}} onExport={()=>exportPDF(members,computeLayout)}/>}
          {view==="timeline"&&<TimelineView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="channel"&&<ChannelView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="search"&&<SearchView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="profile"&&<ProfileView member={selected} members={members} onEdit={m=>{setEditing(m);setView("editMember");}} onSelectMember={m=>{if(m){setSelected(m);}else setView("tree");}}/>}
          {view==="addMember"&&<MemberForm members={members} onSubmit={addMember} onCancel={()=>setView("tree")} title="Add a Family Member"/>}
          {view==="editMember"&&<MemberForm initial={editing} members={members} onSubmit={d=>updateMember(editing.id,d)} onCancel={()=>setView("profile")} title="Edit Profile"/>}
          {view==="invite"&&<InvitePage user={user}/>}
        </Shell>
      )}
    </div>
  );
}
