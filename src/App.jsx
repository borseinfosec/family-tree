import { useState, useEffect, useCallback, useRef } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  cream:"#FDF6E3", paper:"#FFFEF9", tan:"#F0E4C4", border:"#DDC99A",
  brown:"#4A2008", rust:"#C2431A", gold:"#E8A020", goldsoft:"#F5D080",
  coral:"#F26B4E", sage:"#5A8A5E", teal:"#2E8B8A", sky:"#4A90C4",
  lavender:"#8B6FBF", pink:"#D45E8A",
  text:"#2C1505", muted:"#7A5C3A", light:"#B09070",
};

const SEED = [
  {id:"s1",name:"Ramchandra Sharma",birth:"1918",death:"1989",bio:"Patriarch of the Sharma family. A devoted schoolteacher who moved from Agra to Delhi in 1945.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s2",gender:"M",badge:"🌳 Patriarch"},
  {id:"s2",name:"Savitri Devi Sharma",birth:"1922",death:"2001",bio:"The heart of the home. Known for warmth, legendary cooking and holding the family together.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s1",gender:"F",badge:"👑 Matriarch"},
  {id:"s3",name:"Suresh Sharma",birth:"1948",death:"",bio:"Eldest son, retired civil engineer. Passionate about cricket, classical music and roses.",photo:"",youtube:"https://www.youtube.com/watch?v=dQw4w9WgXcQ",parents:["s1","s2"],children:["s5","s6"],spouse:"s7",gender:"M",badge:"🏗️ Engineer"},
  {id:"s4",name:"Meena Joshi",birth:"1952",death:"",bio:"Youngest child, retired schoolteacher like her father. Lives in Pune. A wonderful storyteller.",photo:"",youtube:"",parents:["s1","s2"],children:[],spouse:"",gender:"F",badge:"📚 Storyteller"},
  {id:"s7",name:"Priya Sharma",birth:"1950",death:"",bio:"Suresh's wife. Former nurse, now retired. Known for embroidery and quiet kindness.",photo:"",youtube:"",parents:[],children:["s5","s6"],spouse:"s3",gender:"F",badge:"💉 Caregiver"},
  {id:"s5",name:"Arjun Sharma",birth:"1975",death:"",bio:"Software engineer in Bengaluru. Loves classical music and mountain treks.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"M",badge:"💻 Techie"},
  {id:"s6",name:"Nisha Sharma",birth:"1978",death:"",bio:"Graphic designer in Delhi. Paints in oils and keeps traditional recipes alive.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"F",badge:"🎨 Artist"},
];

const KEY = {USERS:"ft3_users",MEMBERS:"ft3_members",SESSION:"ft3_session",INVITES:"ft3_invites"};
const ACCENT_POOL = [C.coral,C.sage,C.teal,C.sky,C.lavender,C.pink,C.rust,C.gold];
const TILTS = [-2.5,-1.5,-1,0,1,1.5,2,2.5];

const uid = () => Math.random().toString(36).slice(2,10);
const initials = n => n.trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
const accentFor = n => ACCENT_POOL[(n.charCodeAt(0)||0)%ACCENT_POOL.length];
const tiltFor = n => TILTS[(n.charCodeAt(0)||0)%TILTS.length];
const ytId = url => { if(!url)return null; const r=url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/); return r?r[1]:null; };
const readFile = f => new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsDataURL(f);});

// ── CONFETTI ──────────────────────────────────────────────────────────────────
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const colors = ["#E8A020","#F26B4E","#5A8A5E","#4A90C4","#D45E8A","#8B6FBF","#F5D080","#C2431A"];
  const particles = Array.from({length:120},()=>({
    x:Math.random()*canvas.width, y:-20,
    vx:(Math.random()-0.5)*6, vy:Math.random()*4+2,
    r:Math.random()*6+3, color:colors[Math.floor(Math.random()*colors.length)],
    rot:Math.random()*360, vr:(Math.random()-0.5)*8,
    shape:Math.random()>0.5?"rect":"circle"
  }));
  let frame=0;
  const loop=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.vy+=0.08;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,1-frame/90);
      if(p.shape==="circle"){ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}
      else{ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);}
      ctx.restore();
    });
    frame++;
    if(frame<100) requestAnimationFrame(loop);
    else canvas.remove();
  };
  requestAnimationFrame(loop);
}

// ── PRIMITIVE UI ──────────────────────────────────────────────────────────────
function Avatar({name,photo,size=48,accent,style={}}) {
  const bg = accent||accentFor(name);
  return photo
    ? <img src={photo} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`3px solid ${bg}`,...style}}/>
    : <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:size*0.35,flexShrink:0,fontFamily:"'Caveat',cursive",border:`3px solid rgba(255,255,255,0.5)`,...style}}>{initials(name)}</div>;
}

function Btn({children,variant="primary",icon,...p}) {
  const vs = {
    primary:{background:C.brown,color:"#fff",border:"none",boxShadow:`0 4px 0 #2A0E04`},
    coral:{background:C.coral,color:"#fff",border:"none",boxShadow:`0 4px 0 #A03010`},
    gold:{background:C.gold,color:"#fff",border:"none",boxShadow:`0 4px 0 #B06010`},
    sage:{background:C.sage,color:"#fff",border:"none",boxShadow:`0 4px 0 #2A5A2E`},
    outline:{background:"transparent",color:C.brown,border:`2px solid ${C.brown}`,boxShadow:"none"},
    ghost:{background:"rgba(255,255,255,0.6)",color:C.muted,border:`1.5px solid ${C.border}`,boxShadow:"none"},
  };
  return (
    <button {...p} style={{padding:"10px 22px",borderRadius:12,fontSize:13,fontFamily:"'Lora',Georgia,serif",cursor:"pointer",fontWeight:700,transition:"all 0.12s",display:"inline-flex",alignItems:"center",gap:6,...vs[variant],...(p.style||{})}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=vs[variant].boxShadow?.replace("0 4px","0 6px")||"";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=vs[variant].boxShadow||"";}}
      onMouseDown={e=>e.currentTarget.style.transform="translateY(2px)"}
      onMouseUp={e=>e.currentTarget.style.transform="translateY(-2px)"}>
      {icon&&<span>{icon}</span>}{children}
    </button>
  );
}

function PinCard({children,tilt=0,accent=C.gold,style={}}) {
  return (
    <div style={{position:"relative",transform:`rotate(${tilt}deg)`,transition:"transform 0.2s",background:C.paper,borderRadius:14,padding:"20px 22px",boxShadow:"0 8px 24px rgba(74,32,8,0.15),0 2px 6px rgba(0,0,0,0.08)",border:`1px solid ${C.border}`,...style}}
      onMouseEnter={e=>{e.currentTarget.style.transform="rotate(0deg) scale(1.02)";e.currentTarget.style.zIndex="10";}}
      onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${tilt}deg) scale(1)`;e.currentTarget.style.zIndex="1";}}>
      <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:18,height:18,borderRadius:"50%",background:accent,boxShadow:"0 2px 8px rgba(0,0,0,0.25)",border:"2px solid rgba(255,255,255,0.6)"}}/>
      {children}
    </div>
  );
}

function Badge({children,color=C.sage}) {
  return <span style={{background:color,color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:"0.04em",fontFamily:"'Caveat',cursive",fontSize:12}}>{children}</span>;
}

function StatCard({icon,number,label,color,delay=0}) {
  const [count,setCount]=useState(0);
  useEffect(()=>{
    const timer=setTimeout(()=>{
      let i=0;const steps=30;
      const interval=setInterval(()=>{i++;setCount(Math.round(number*i/steps));if(i>=steps)clearInterval(interval);},30);
    },delay);
    return()=>clearTimeout(timer);
  },[number,delay]);
  return (
    <div style={{background:C.paper,borderRadius:18,padding:"22px 20px",textAlign:"center",border:`2px solid ${color}20`,boxShadow:`0 6px 20px ${color}15`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`${color}10`}}/>
      <div style={{fontSize:36,marginBottom:8}}>{icon}</div>
      <div style={{fontFamily:"'Caveat',cursive",fontSize:42,fontWeight:700,color,lineHeight:1}}>{count}</div>
      <div style={{fontSize:12,color:C.muted,marginTop:5,fontFamily:"'Lora',Georgia,serif"}}>{label}</div>
    </div>
  );
}

function Inp({label,help,...p}) {
  return (
    <div style={{marginBottom:16}}>
      {label&&<label style={{display:"block",marginBottom:5,fontSize:12,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive",fontSize:15}}>{label}</label>}
      <input {...p} style={{width:"100%",padding:"11px 15px",border:`2px solid ${C.border}`,borderRadius:10,background:C.paper,color:C.text,fontSize:14,fontFamily:"'Lora',Georgia,serif",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s",...(p.style||{})}}
        onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
      {help&&<p style={{margin:"4px 0 0",fontSize:11,color:C.muted,fontFamily:"'Lora',Georgia,serif"}}>{help}</p>}
    </div>
  );
}

function PhotoUploader({value,onChange}) {
  const inp=useRef(); const [drag,setDrag]=useState(false);
  const handle=async files=>{const f=files[0];if(!f||!f.type.startsWith("image/"))return;onChange(await readFile(f));};
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",marginBottom:6,fontSize:15,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive"}}>📷 Photo</label>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files);}}
        onClick={()=>inp.current.click()} style={{border:`2.5px dashed ${drag?C.gold:C.border}`,borderRadius:14,padding:"20px",textAlign:"center",background:drag?"#FFF8E8":C.tan,cursor:"pointer",transition:"all 0.2s"}}>
        {value
          ? <div style={{position:"relative",display:"inline-block"}}><img src={value} alt="preview" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:`4px solid ${C.gold}`}}/><button onClick={e=>{e.stopPropagation();onChange("");}} style={{position:"absolute",top:-4,right:-4,width:24,height:24,borderRadius:"50%",background:C.coral,border:"none",color:"#fff",cursor:"pointer",fontSize:14,lineHeight:1}}>×</button></div>
          : <><div style={{fontSize:32,marginBottom:8}}>📸</div><p style={{margin:0,fontSize:13,color:C.muted,fontFamily:"'Lora',Georgia,serif"}}>Drop a photo here or click to browse</p></>}
      </div>
      <input ref={inp} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files)}/>
      {!value&&<input placeholder="Or paste an image URL…" style={{width:"100%",marginTop:8,padding:"8px 12px",border:`2px solid ${C.border}`,borderRadius:8,fontSize:12,fontFamily:"'Lora',Georgia,serif",color:C.text,background:C.paper,outline:"none",boxSizing:"border-box"}} onChange={e=>e.target.value&&onChange(e.target.value)}/>}
    </div>
  );
}

// ── FLOATING LEAVES BACKGROUND ─────────────────────────────────────────────
function FloatingLeaves() {
  const leaves = ["🍃","🌿","🍂","🌱","🍀","✨","🌸","⭐"];
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {Array.from({length:18},(_,i)=>(
        <div key={i} style={{position:"absolute",fontSize:Math.random()*16+12,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,opacity:0.15+Math.random()*0.2,animation:`float${i%3} ${4+Math.random()*6}s ease-in-out infinite`,animationDelay:`${Math.random()*5}s`}}>
          {leaves[i%leaves.length]}
        </div>
      ))}
    </div>
  );
}

// ── LANDING ───────────────────────────────────────────────────────────────────
function Landing({onLogin,onSignup}) {
  const [bobbing,setBobbing]=useState(false);
  useEffect(()=>{setBobbing(true);},[]);
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(145deg,#1A0800 0%,#3D1505 35%,#6B2E10 65%,#3D1505 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden",fontFamily:"'Lora',Georgia,serif"}}>
      <FloatingLeaves/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 20% 80%,rgba(232,160,32,0.15) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(242,107,78,0.12) 0%,transparent 50%)"}}/>
      <div style={{textAlign:"center",maxWidth:620,position:"relative",zIndex:1}}>
        <div style={{display:"inline-block",animation:bobbing?"treeBob 3s ease-in-out infinite":"none",fontSize:80,marginBottom:16,filter:"drop-shadow(0 8px 20px rgba(0,0,0,0.4))"}}>🌳</div>
        <h1 style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(42px,7vw,72px)",color:C.goldsoft,margin:"0 0 8px",lineHeight:1,letterSpacing:"-0.02em",textShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
          Our Family Story
        </h1>
        <p style={{color:"#D4B89A",fontSize:17,lineHeight:1.8,maxWidth:460,margin:"0 auto 16px",fontStyle:"italic"}}>
          Where every branch tells a story and every leaf holds a memory.
        </p>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:50}}>
          {["📸 Photo Albums","🎬 Family Videos","📅 Timeline","🔍 Search","✉️ Invite"].map(f=>(
            <span key={f} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#D4B89A",fontSize:12,padding:"5px 12px",borderRadius:20}}>{f}</span>
          ))}
        </div>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn variant="gold" onClick={onSignup} style={{padding:"15px 44px",fontSize:16,borderRadius:16}}>🌱 Start Your Tree</Btn>
          <Btn onClick={onLogin} style={{padding:"15px 44px",fontSize:16,borderRadius:16,background:"rgba(255,255,255,0.1)",color:C.goldsoft,border:"2px solid rgba(232,201,122,0.35)",boxShadow:"none"}}>Sign In</Btn>
        </div>
      </div>
      <style>{`
        @keyframes treeBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(2deg)}}
        @keyframes float0{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(10deg)}}
        @keyframes float1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-15px) rotate(-8deg)}}
        @keyframes float2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-25px) rotate(5deg)}}
      `}</style>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthWrap({title,sub,emoji,children}) {
  return (
    <div style={{minHeight:"100vh",background:C.cream,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backgroundImage:"radial-gradient(circle at 10% 90%,rgba(232,160,32,0.08) 0%,transparent 40%)"}}>
      <div style={{background:C.paper,borderRadius:24,padding:"48px 44px",width:"100%",maxWidth:440,boxShadow:"0 32px 80px rgba(74,32,8,0.18),0 8px 20px rgba(0,0,0,0.06)",border:`2px solid ${C.border}`,position:"relative"}}>
        <div style={{position:"absolute",top:-20,left:"50%",transform:"translateX(-50%)",width:56,height:56,borderRadius:"50%",background:C.brown,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>{emoji||"🌳"}</div>
        <div style={{textAlign:"center",marginBottom:28,marginTop:20}}>
          <h2 style={{fontFamily:"'Caveat',cursive",fontSize:30,color:C.brown,margin:"0 0 5px"}}>{title}</h2>
          <p style={{color:C.muted,fontSize:13,margin:0,fontFamily:"'Lora',Georgia,serif"}}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginPage({onLogin,onSwitch,onBack}) {
  const [e,sE]=useState(""); const [p,sP]=useState(""); const [err,sErr]=useState("");
  return (
    <AuthWrap title="Welcome Back! 👋" sub="Your family is waiting for you" emoji="🔑">
      {err&&<div style={{background:"#FEE8E8",border:"2px solid #F26B4E",borderRadius:10,padding:"10px 14px",fontSize:13,color:C.rust,marginBottom:16,fontFamily:"'Lora',Georgia,serif"}}>{err}</div>}
      <Inp label="📧 Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/>
      <Inp label="🔒 Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="••••••••"/>
      <Btn variant="coral" onClick={()=>onLogin(e,p,sErr)} style={{width:"100%",padding:14,fontSize:15,marginTop:6,borderRadius:12,justifyContent:"center"}}>Let me in! 🚪</Btn>
      <div style={{textAlign:"center",marginTop:18,fontSize:13,color:C.muted,fontFamily:"'Lora',Georgia,serif"}}>New here? <button onClick={onSwitch} style={{background:"none",border:"none",color:C.teal,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Caveat',cursive",fontSize:16}}>Join the family 🌿</button></div>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.light,cursor:"pointer",fontSize:12,display:"block",margin:"10px auto 0",fontFamily:"'Lora',Georgia,serif"}}>← Back to home</button>
    </AuthWrap>
  );
}

function SignupPage({onSignup,onSwitch,onBack}) {
  const [n,sN]=useState(""); const [e,sE]=useState(""); const [p,sP]=useState(""); const [inv,sInv]=useState(""); const [err,sErr]=useState("");
  return (
    <AuthWrap title="Join the Family! 🎉" sub="Create your account and start exploring" emoji="🌱">
      {err&&<div style={{background:"#FEE8E8",border:"2px solid #F26B4E",borderRadius:10,padding:"10px 14px",fontSize:13,color:C.rust,marginBottom:16,fontFamily:"'Lora',Georgia,serif"}}>{err}</div>}
      <Inp label="😊 Your Name" value={n} onChange={ev=>sN(ev.target.value)} placeholder="What should we call you?"/>
      <Inp label="📧 Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/>
      <Inp label="🔒 Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="Make it strong!"/>
      <Inp label="🎟️ Invite Code (optional)" value={inv} onChange={ev=>sInv(ev.target.value)} placeholder="fam-xxxxxxxx"/>
      <Btn variant="sage" onClick={()=>onSignup(n,e,p,inv,sErr)} style={{width:"100%",padding:14,fontSize:15,marginTop:6,borderRadius:12,justifyContent:"center"}}>Plant my seed! 🌱</Btn>
      <div style={{textAlign:"center",marginTop:18,fontSize:13,color:C.muted,fontFamily:"'Lora',Georgia,serif"}}>Already a member? <button onClick={onSwitch} style={{background:"none",border:"none",color:C.teal,cursor:"pointer",fontFamily:"'Caveat',cursive",fontSize:16}}>Sign in 👋</button></div>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.light,cursor:"pointer",fontSize:12,display:"block",margin:"10px auto 0",fontFamily:"'Lora',Georgia,serif"}}>← Back to home</button>
    </AuthWrap>
  );
}

// ── SHELL ─────────────────────────────────────────────────────────────────────
function Shell({user,view,setView,onLogout,children}) {
  const nav=[{id:"home",icon:"🏠",label:"Home"},{id:"tree",icon:"🌳",label:"Tree"},{id:"timeline",icon:"📅",label:"Timeline"},{id:"channel",icon:"🎬",label:"Videos"},{id:"search",icon:"🔍",label:"Search"}];
  return (
    <div style={{minHeight:"100vh",background:C.cream}}>
      <nav style={{background:C.brown,padding:"0 20px",height:62,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",position:"sticky",top:0,zIndex:200}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginRight:6}}>
          <span style={{fontSize:26,animation:"navBob 4s ease-in-out infinite"}}>🌳</span>
          <span style={{fontFamily:"'Caveat',cursive",fontSize:22,color:C.goldsoft,fontWeight:700,whiteSpace:"nowrap"}}>Our Family Story</span>
        </button>
        <div style={{display:"flex",gap:2,flex:1}}>
          {nav.map(it=>(
            <button key={it.id} onClick={()=>setView(it.id)} style={{background:view===it.id?`${C.gold}22`:"none",border:view===it.id?`1.5px solid ${C.gold}44`:"1.5px solid transparent",color:view===it.id?C.goldsoft:"#B09070",cursor:"pointer",padding:"6px 10px",borderRadius:10,fontSize:12,fontFamily:"'Caveat',cursive",fontSize:15,display:"flex",alignItems:"center",gap:4,fontWeight:view===it.id?700:400,transition:"all 0.15s"}}>
              <span>{it.icon}</span><span style={{display:"none"}} className="nl">{it.label}</span>
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Btn variant="coral" onClick={()=>setView("addMember")} style={{padding:"6px 12px",fontSize:12,borderRadius:8,boxShadow:"none"}}>＋ Add</Btn>
          <button onClick={()=>setView("invite")} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#C4A882",cursor:"pointer",padding:"6px 10px",borderRadius:8,fontSize:12,fontFamily:"'Caveat',cursive",fontSize:14,fontWeight:700}}>✉ Invite</button>
          <div onClick={()=>setView("home")} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,0.06)",cursor:"pointer"}}>
            <Avatar name={user.name} size={26}/>
            <span style={{color:"#C4A882",fontSize:11,fontFamily:"'Lora',serif",maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",color:"#7A6050",cursor:"pointer",fontSize:11,fontFamily:"'Lora',serif"}}>Out</button>
        </div>
      </nav>
      <div style={{padding:"24px 20px",maxWidth:1240,margin:"0 auto"}}>
        <div style={{animation:"pageIn 0.35s ease"}}>{children}</div>
      </div>
      <style>{`
        @keyframes navBob{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(min-width:600px){.nl{display:inline!important}}
      `}</style>
    </div>
  );
}

// ── HOME DASHBOARD ────────────────────────────────────────────────────────────
function HomePage({members,setView,onSelectMember}) {
  const withVid=members.filter(m=>ytId(m.youtube));
  const oldest=members.filter(m=>m.birth).sort((a,b)=>parseInt(a.birth)-parseInt(b.birth))[0];
  const youngest=members.filter(m=>m.birth).sort((a,b)=>parseInt(b.birth)-parseInt(a.birth))[0];
  const mostKids=members.filter(m=>m.children?.length).sort((a,b)=>(b.children?.length||0)-(a.children?.length||0))[0];
  const recent=[...members].reverse().slice(0,3);
  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Caveat',cursive",fontSize:38,color:C.brown,margin:"0 0 4px"}}>Good to see you! 👋</h1>
        <p style={{color:C.muted,fontSize:14,fontFamily:"'Lora',Georgia,serif",margin:0}}>Here's what's happening in your family tree</p>
      </div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:28}}>
        <StatCard icon="👨‍👩‍👧‍👦" number={members.length} label="Family Members" color={C.coral} delay={0}/>
        <StatCard icon="🎬" number={withVid.length} label="Videos Shared" color={C.teal} delay={100}/>
        <StatCard icon="📅" number={members.filter(m=>m.birth).length} label="Birth Records" color={C.sage} delay={200}/>
        <StatCard icon="💑" number={members.filter(m=>m.spouse).length} label="Couples" color={C.pink} delay={300}/>
        <StatCard icon="👶" number={members.filter(m=>m.children?.length).reduce((a,m)=>a+(m.children?.length||0),0)} label="Parent-Child Links" color={C.lavender} delay={400}/>
      </div>
      {/* Fun facts + recent */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        <div style={{background:C.paper,borderRadius:18,padding:"22px 24px",border:`2px solid ${C.border}`,boxShadow:"0 4px 16px rgba(74,32,8,0.08)"}}>
          <h3 style={{fontFamily:"'Caveat',cursive",fontSize:22,color:C.brown,margin:"0 0 16px"}}>🏆 Family Highlights</h3>
          {oldest&&<div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14,cursor:"pointer"}} onClick={()=>{onSelectMember(oldest);setView("profile");}}>
            <Avatar name={oldest.name} photo={oldest.photo} size={42} accent={C.gold}/>
            <div><div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>🌳 Oldest Root</div><div style={{fontSize:14,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive",fontSize:17}}>{oldest.name}</div><div style={{fontSize:11,color:C.muted}}>Born {oldest.birth}</div></div>
          </div>}
          {youngest&&<div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14,cursor:"pointer"}} onClick={()=>{onSelectMember(youngest);setView("profile");}}>
            <Avatar name={youngest.name} photo={youngest.photo} size={42} accent={C.sage}/>
            <div><div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>🌱 Newest Branch</div><div style={{fontSize:14,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive",fontSize:17}}>{youngest.name}</div><div style={{fontSize:11,color:C.muted}}>Born {youngest.birth}</div></div>
          </div>}
          {mostKids&&<div style={{display:"flex",gap:12,alignItems:"center",cursor:"pointer"}} onClick={()=>{onSelectMember(mostKids);setView("profile");}}>
            <Avatar name={mostKids.name} photo={mostKids.photo} size={42} accent={C.coral}/>
            <div><div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>👨‍👧‍👦 Most Children</div><div style={{fontSize:14,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive",fontSize:17}}>{mostKids.name}</div><div style={{fontSize:11,color:C.muted}}>{mostKids.children.length} children</div></div>
          </div>}
        </div>
        <div style={{background:C.paper,borderRadius:18,padding:"22px 24px",border:`2px solid ${C.border}`,boxShadow:"0 4px 16px rgba(74,32,8,0.08)"}}>
          <h3 style={{fontFamily:"'Caveat',cursive",fontSize:22,color:C.brown,margin:"0 0 16px"}}>✨ Recently Added</h3>
          {recent.map(m=>(
            <div key={m.id} onClick={()=>{onSelectMember(m);setView("profile");}} style={{display:"flex",gap:10,alignItems:"center",marginBottom:12,cursor:"pointer",padding:"8px 10px",borderRadius:10,transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.tan} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={m.name} photo={m.photo} size={38} accent={accentFor(m.name)}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:17,color:C.brown}}>{m.name}</div>
                <div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>{m.birth||"year unknown"} · {m.badge||""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick actions */}
      <div style={{background:`linear-gradient(135deg,${C.brown},#2A1005)`,borderRadius:18,padding:"24px 28px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",boxShadow:"0 8px 32px rgba(74,32,8,0.25)"}}>
        <div style={{flex:1,minWidth:200}}>
          <h3 style={{fontFamily:"'Caveat',cursive",fontSize:24,color:C.goldsoft,margin:"0 0 5px"}}>Ready to grow your tree? 🌿</h3>
          <p style={{color:"#A08060",fontSize:13,margin:0,fontFamily:"'Lora',serif"}}>Add family members, share stories and connect generations.</p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn variant="gold" onClick={()=>setView("addMember")} icon="＋">Add Member</Btn>
          <Btn variant="coral" onClick={()=>setView("tree")} icon="🌳">View Tree</Btn>
          <Btn onClick={()=>setView("invite")} style={{background:"rgba(255,255,255,0.1)",color:C.goldsoft,border:"1.5px solid rgba(255,255,255,0.2)",boxShadow:"none"}}>✉ Invite Family</Btn>
        </div>
      </div>
    </div>
  );
}

// ── TREE VIEW ──────────────────────────────────────────────────────────────────
function TreeView({members,computeLayout,onSelect,onExport}) {
  const {nodes,edges}=computeLayout();
  const [hov,setHov]=useState(null);
  if(!nodes.length) return (
    <div style={{textAlign:"center",padding:80}}>
      <div style={{fontSize:64,marginBottom:16,animation:"treeBob 3s ease-in-out infinite"}}>🌱</div>
      <h3 style={{fontFamily:"'Caveat',cursive",fontSize:28,color:C.brown,marginBottom:8}}>Your tree is empty!</h3>
      <p style={{color:C.muted,fontFamily:"'Lora',serif"}}>Add the first family member to get started.</p>
    </div>
  );
  const PAD=80,NW=160,NH=86;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
  const minX=Math.min(...xs)-NW/2,maxX=Math.max(...xs)+NW/2;
  const minY=Math.min(...ys),maxY=Math.max(...ys)+NH;
  const svgW=maxX-minX+PAD*2,svgH=maxY-minY+PAD*2;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{fontFamily:"'Caveat',cursive",fontSize:32,color:C.brown,margin:"0 0 3px"}}>🌳 Family Tree</h2>
        <p style={{margin:0,fontSize:13,color:C.muted,fontFamily:"'Lora',serif"}}>{members.length} members · hover for details · click to open</p></div>
        <Btn variant="outline" onClick={onExport} icon="⬇">Export PDF</Btn>
      </div>
      <div style={{background:C.paper,borderRadius:20,border:`2px solid ${C.border}`,overflow:"auto",boxShadow:"0 8px 40px rgba(74,32,8,0.12)"}}>
        <svg width={Math.max(svgW,720)} height={svgH}>
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(74,32,8,0.18)"/></filter>
          </defs>
          {/* Decorative background dots */}
          {Array.from({length:20},(_,i)=><circle key={i} cx={Math.random()*svgW} cy={Math.random()*svgH} r={2} fill={C.border} opacity="0.4"/>)}
          {edges.map((e,i)=>{
            const fx=e.from.x-minX+PAD,fy=e.from.y-minY+PAD+NH;
            const tx=e.to.x-minX+PAD,ty=e.to.y-minY+PAD;
            const my=(fy+ty)/2;
            return <path key={i} d={`M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}`} stroke={C.goldsoft} strokeWidth={2} fill="none" strokeDasharray="7,5" opacity="0.8"/>;
          })}
          {nodes.map(n=>{
            const nx=n.x-minX+PAD-NW/2,ny=n.y-minY+PAD;
            const isH=hov===n.id;
            const accent=accentFor(n.name);
            const tilt=tiltFor(n.name);
            return (
              <g key={n.id} onClick={()=>onSelect(n)} onMouseEnter={()=>setHov(n.id)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer",transform:`rotate(${isH?0:tilt}deg)`,transformOrigin:`${nx+NW/2}px ${ny+NH/2}px`,transition:"transform 0.2s"}}>
                <rect x={nx} y={ny} width={NW} height={NH} rx={12} fill={isH?"#FFF8EE":C.paper} stroke={isH?accent:C.border} strokeWidth={isH?2.5:1.5} filter={isH?"url(#glow)":"url(#shadow)"}/>
                <rect x={nx} y={ny} width={NW} height={5} rx={3} fill={accent}/>
                {/* Pin dot */}
                <circle cx={nx+NW/2} cy={ny-8} r={7} fill={accent} opacity={isH?1:0.7}/>
                <circle cx={nx+NW/2} cy={ny-8} r={4} fill="white" opacity="0.6"/>
                {/* Avatar circle */}
                <circle cx={nx+30} cy={ny+50} r={19} fill={`${accent}22`} stroke={accent} strokeWidth={1.5}/>
                <text x={nx+30} y={ny+55} textAnchor="middle" fontSize={11} fontWeight={700} fill={accent} fontFamily="Georgia,serif">{initials(n.name)}</text>
                <text x={nx+57} y={ny+30} fontSize={12} fontWeight={700} fill={C.brown} fontFamily="Georgia,serif">{n.name.length>17?n.name.slice(0,16)+"…":n.name}</text>
                <text x={nx+57} y={ny+48} fontSize={10} fill={C.muted} fontFamily="Georgia,serif">{n.birth||"?"}{n.death?` – ${n.death}`:""}</text>
                {n.badge&&<text x={nx+57} y={ny+65} fontSize={9.5} fill={isH?accent:C.light} fontFamily="Georgia,serif">{n.badge}</text>}
                {!n.badge&&n.youtube&&<text x={nx+57} y={ny+65} fontSize={9} fill="#C43030" fontFamily="Georgia,serif">▶ has video</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <p style={{textAlign:"center",fontSize:11,color:C.light,marginTop:10,fontFamily:"'Lora',serif"}}>🖱 Hover a card to highlight · Click to view full profile · 📌 Pin colour = personality</p>
    </div>
  );
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function SearchView({members,onSelect}) {
  const [q,setQ]=useState("");
  const results=q.trim()?members.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())||m.bio?.toLowerCase().includes(q.toLowerCase())):members;
  const highlight=(text,q)=>{
    if(!q||!text)return text;
    const idx=text.toLowerCase().indexOf(q.toLowerCase());
    if(idx<0)return text;
    return <>{text.slice(0,idx)}<mark style={{background:C.goldsoft,borderRadius:3,padding:"0 1px"}}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
  };
  return (
    <div>
      <h2 style={{fontFamily:"'Caveat',cursive",fontSize:32,color:C.brown,margin:"0 0 20px"}}>🔍 Find a Family Member</h2>
      <div style={{position:"relative",marginBottom:24}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:18}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or story…" style={{width:"100%",padding:"15px 16px 15px 50px",border:`2.5px solid ${q?C.gold:C.border}`,borderRadius:16,fontSize:16,fontFamily:"'Lora',Georgia,serif",color:C.text,background:C.paper,outline:"none",boxSizing:"border-box",boxShadow:q?`0 4px 20px ${C.gold}22`:"none",transition:"all 0.2s"}}/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:20,color:C.muted,cursor:"pointer"}}>×</button>}
      </div>
      <p style={{fontSize:13,color:C.muted,marginBottom:18,fontFamily:"'Lora',serif"}}>{results.length} {results.length===1?"person":"people"} found</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:16}}>
        {results.map((m,i)=>{
          const accent=accentFor(m.name);
          return (
            <PinCard key={m.id} tilt={tiltFor(m.name)} accent={accent} style={{cursor:"pointer"}} onClick={()=>onSelect(m)}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <Avatar name={m.name} photo={m.photo} size={54} accent={accent}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Caveat',cursive",fontSize:20,color:C.brown,marginBottom:2}}>{highlight(m.name,q)}</div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif",marginBottom:6}}>{m.birth}{m.death?` – ${m.death}`:m.birth?" – present":""}</div>
                  {m.bio&&<div style={{fontSize:12,color:C.text,lineHeight:1.5,fontStyle:"italic",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:"'Lora',serif"}}>{highlight(m.bio,q)}</div>}
                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                    {m.badge&&<Badge color={accent}>{m.badge}</Badge>}
                    {m.youtube&&<Badge color={C.rust}>▶ Video</Badge>}
                    {m.children?.length>0&&<Badge color={C.sage}>👶 {m.children.length} kids</Badge>}
                  </div>
                </div>
              </div>
            </PinCard>
          );
        })}
      </div>
    </div>
  );
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
function TimelineView({members,onSelect}) {
  const events=[];
  members.forEach(m=>{
    if(m.birth) events.push({year:parseInt(m.birth)||0,type:"birth",label:`${m.name} was born`,member:m,icon:"🌱",color:C.sage});
    if(m.death) events.push({year:parseInt(m.death)||0,type:"death",label:`${m.name} passed away`,member:m,icon:"🕊️",color:C.muted});
    if(m.spouse){const sp=members.find(x=>x.id===m.spouse);if(sp&&m.id<m.spouse) events.push({year:Math.max(parseInt(m.birth)||1900,parseInt(sp.birth)||1900)+22,type:"marriage",label:`${m.name} & ${sp.name}`,member:m,icon:"💍",color:C.pink});}
  });
  const sorted=[...new Map(events.map(e=>[`${e.year}-${e.label}`,e])).values()].sort((a,b)=>a.year-b.year);
  const decades=[...new Set(sorted.map(e=>Math.floor(e.year/10)*10))];
  return (
    <div>
      <h2 style={{fontFamily:"'Caveat',cursive",fontSize:32,color:C.brown,margin:"0 0 6px"}}>📅 Family Timeline</h2>
      <p style={{fontSize:13,color:C.muted,fontFamily:"'Lora',serif",marginBottom:28}}>{sorted.length} moments · {decades.length} decades of history</p>
      {sorted.length===0&&<div style={{textAlign:"center",padding:60,background:C.paper,borderRadius:18,border:`2px solid ${C.border}`}}><div style={{fontSize:52,marginBottom:12}}>📅</div><p style={{fontFamily:"'Caveat',cursive",fontSize:20,color:C.brown}}>Add birth years to see the timeline!</p></div>}
      <div style={{position:"relative",paddingLeft:20}}>
        <div style={{position:"absolute",left:80,top:0,bottom:0,width:3,background:`linear-gradient(to bottom,${C.gold},${C.coral},${C.sage})`,borderRadius:3,opacity:0.5}}/>
        {sorted.map((ev,i)=>(
          <div key={i} style={{display:"flex",gap:16,marginBottom:16,alignItems:"center",animation:`pageIn 0.4s ease ${i*0.04}s both`}}>
            <div style={{width:64,textAlign:"right",fontFamily:"'Caveat',cursive",fontSize:20,fontWeight:700,color:ev.color,flexShrink:0}}>{ev.year||"?"}</div>
            <div style={{width:22,height:22,borderRadius:"50%",background:ev.color,border:`3px solid ${C.paper}`,boxShadow:`0 0 0 2px ${ev.color}`,flexShrink:0,zIndex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{ev.icon}</div>
            <div onClick={()=>onSelect(ev.member)} style={{flex:1,background:C.paper,borderRadius:14,padding:"12px 18px",border:`2px solid ${C.border}`,cursor:"pointer",display:"flex",gap:12,alignItems:"center",transition:"all 0.18s",boxShadow:"0 3px 12px rgba(74,32,8,0.07)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=ev.color;e.currentTarget.style.transform="translateX(4px)";e.currentTarget.style.boxShadow=`0 6px 20px ${ev.color}22`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.boxShadow="0 3px 12px rgba(74,32,8,0.07)";}}>
              <span style={{fontSize:22,flexShrink:0}}>{ev.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.brown}}>{ev.label}</div>
                {ev.member.bio&&<div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.member.bio.slice(0,80)}…</div>}
              </div>
              <Avatar name={ev.member.name} photo={ev.member.photo} size={38} accent={ev.color} style={{marginLeft:"auto",flexShrink:0}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── YOUTUBE CHANNEL ───────────────────────────────────────────────────────────
function ChannelView({members,onSelect}) {
  const withVid=members.filter(m=>ytId(m.youtube));
  const [active,setActive]=useState(withVid[0]||null);
  return (
    <div>
      <h2 style={{fontFamily:"'Caveat',cursive",fontSize:32,color:C.brown,margin:"0 0 6px"}}>🎬 Family Channel</h2>
      <p style={{margin:"0 0 20px",fontSize:13,color:C.muted,fontFamily:"'Lora',serif"}}>{withVid.length} videos from your family</p>
      {withVid.length===0
        ? <div style={{textAlign:"center",padding:80,background:C.paper,borderRadius:20,border:`2px dashed ${C.border}`}}>
            <div style={{fontSize:60,marginBottom:16}}>🎬</div>
            <h3 style={{fontFamily:"'Caveat',cursive",fontSize:26,color:C.brown,marginBottom:8}}>No videos yet!</h3>
            <p style={{color:C.muted,fontFamily:"'Lora',serif"}}>Add YouTube links to family members to build your channel.</p>
          </div>
        : <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20,alignItems:"start"}}>
            <div>
              {active&&<>
                <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:18,overflow:"hidden",background:"#000",marginBottom:18,boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
                  <iframe src={`https://www.youtube.com/embed/${ytId(active.youtube)}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/>
                </div>
                <PinCard tilt={-1} accent={accentFor(active.name)}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <Avatar name={active.name} photo={active.photo} size={58} accent={accentFor(active.name)}/>
                    <div style={{flex:1}}>
                      <h3 style={{fontFamily:"'Caveat',cursive",fontSize:22,color:C.brown,margin:"0 0 3px"}}>{active.name}</h3>
                      <p style={{margin:"0 0 6px",fontSize:12,color:C.muted,fontFamily:"'Lora',serif"}}>{active.birth}{active.death?` – ${active.death}`:""}</p>
                      {active.badge&&<Badge color={accentFor(active.name)}>{active.badge}</Badge>}
                    </div>
                    <Btn variant="outline" onClick={()=>onSelect(active)} style={{fontSize:11,padding:"6px 12px"}}>Profile →</Btn>
                  </div>
                  {active.bio&&<p style={{margin:"14px 0 0",fontStyle:"italic",fontSize:13,color:C.text,lineHeight:1.65,fontFamily:"'Lora',serif",borderTop:`1px dashed ${C.border}`,paddingTop:12}}>{active.bio}</p>}
                </PinCard>
              </>}
            </div>
            <div>
              <h3 style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.brown,margin:"0 0 12px"}}>All Videos 📼</h3>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {withVid.map(m=>{
                  const vid=ytId(m.youtube);
                  const isCur=active?.id===m.id;
                  return (
                    <div key={m.id} onClick={()=>setActive(m)} style={{background:isCur?"#FFF8E8":C.paper,borderRadius:14,overflow:"hidden",border:`2px solid ${isCur?C.gold:C.border}`,cursor:"pointer",display:"flex",gap:0,transition:"all 0.18s",transform:isCur?"scale(1.02)":"scale(1)",boxShadow:isCur?`0 6px 20px ${C.gold}30`:"none"}}>
                      <div style={{position:"relative",flexShrink:0}}>
                        <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={m.name} style={{width:100,height:66,objectFit:"cover",display:"block"}}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:11,marginLeft:2}}>▶</span></div></div>
                      </div>
                      <div style={{padding:"8px 12px",flex:1}}>
                        <div style={{fontFamily:"'Caveat',cursive",fontSize:16,color:C.brown}}>{m.name}</div>
                        <div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>{m.birth}</div>
                        {isCur&&<div style={{fontSize:10,color:C.gold,fontWeight:700,marginTop:3,fontFamily:"'Caveat',cursive"}}>▶ Now playing</div>}
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

// ── PROFILE ───────────────────────────────────────────────────────────────────
function ProfileView({member,members,onEdit,onSelectMember}) {
  if(!member)return null;
  const m=member;
  const parents=members.filter(x=>m.parents?.includes(x.id));
  const children=members.filter(x=>m.children?.includes(x.id));
  const spouse=members.find(x=>x.id===m.spouse);
  const vid=ytId(m.youtube);
  const accent=accentFor(m.name);
  return (
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <button onClick={()=>onSelectMember(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,marginBottom:16,fontFamily:"'Lora',serif",display:"flex",alignItems:"center",gap:4}}>← Back to tree</button>
      {/* Hero */}
      <PinCard tilt={tiltFor(m.name)} accent={accent} style={{marginBottom:18,padding:"32px 36px"}}>
        <div style={{display:"flex",gap:28,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{position:"relative"}}>
            <Avatar name={m.name} photo={m.photo} size={110} accent={accent} style={{boxShadow:`0 8px 28px ${accent}44`}}/>
            <div style={{position:"absolute",bottom:-6,right:-6,fontSize:22}}>{m.gender==="F"?"👩":"👨"}</div>
          </div>
          <div style={{flex:1,minWidth:220}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              {m.badge&&<Badge color={accent}>{m.badge}</Badge>}
              {m.youtube&&<Badge color={C.rust}>▶ Has Video</Badge>}
              {m.death&&<Badge color={C.muted}>In Memoriam</Badge>}
            </div>
            <h1 style={{fontFamily:"'Caveat',cursive",fontSize:36,color:C.brown,margin:"0 0 6px",lineHeight:1.1}}>{m.name}</h1>
            <p style={{margin:"0 0 14px",fontSize:13,color:C.muted,fontFamily:"'Lora',serif"}}>
              {m.birth&&`Born ${m.birth}`}{m.death?` · Passed away ${m.death}`:m.birth?" · Still with us":""}
              {spouse&&<> · Married to <button onClick={()=>onSelectMember(spouse)} style={{background:"none",border:"none",color:C.teal,cursor:"pointer",fontSize:13,fontFamily:"'Caveat',cursive",fontSize:16}}>{spouse.name}</button></>}
            </p>
            {m.bio&&<blockquote style={{margin:"0 0 16px",padding:"14px 18px",borderLeft:`4px solid ${accent}`,background:`${accent}10`,borderRadius:"0 12px 12px 0",fontStyle:"italic",color:C.text,fontSize:14,lineHeight:1.7,fontFamily:"'Lora',serif"}}>{m.bio}</blockquote>}
            <Btn variant="outline" onClick={()=>onEdit(m)} icon="✏️" style={{fontSize:12}}>Edit Profile</Btn>
          </div>
        </div>
      </PinCard>
      {/* Relations */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        {parents.length>0&&(
          <PinCard tilt={-1} accent={C.sage} style={{padding:"16px 18px"}}>
            <h3 style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.brown,margin:"0 0 12px"}}>👴 Parents</h3>
            {parents.map(p=>(
              <div key={p.id} onClick={()=>onSelectMember(p)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"6px 8px",borderRadius:8,marginBottom:4,transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.tan} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Avatar name={p.name} photo={p.photo} size={38} accent={accentFor(p.name)}/><div><div style={{fontFamily:"'Caveat',cursive",fontSize:16,color:C.brown}}>{p.name}</div><div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>{p.birth}</div></div>
              </div>
            ))}
          </PinCard>
        )}
        {spouse&&(
          <PinCard tilt={1} accent={C.pink} style={{padding:"16px 18px"}}>
            <h3 style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.brown,margin:"0 0 12px"}}>💑 Spouse</h3>
            <div onClick={()=>onSelectMember(spouse)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"6px 8px",borderRadius:8,transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.tan} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={spouse.name} photo={spouse.photo} size={48} accent={accentFor(spouse.name)}/><div><div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.brown}}>{spouse.name}</div><div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>{spouse.birth}</div></div>
            </div>
          </PinCard>
        )}
        {children.length>0&&(
          <PinCard tilt={0.5} accent={C.coral} style={{gridColumn:!parents.length&&!spouse?"1/-1":"auto",padding:"16px 18px"}}>
            <h3 style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.brown,margin:"0 0 12px"}}>👶 Children ({children.length})</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {children.map(c=>(
                <div key={c.id} onClick={()=>onSelectMember(c)} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 12px",borderRadius:10,border:`2px solid ${C.border}`,cursor:"pointer",background:C.cream,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accentFor(c.name);e.currentTarget.style.transform="scale(1.04)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="scale(1)";}}>
                  <Avatar name={c.name} photo={c.photo} size={30} accent={accentFor(c.name)}/><div><div style={{fontFamily:"'Caveat',cursive",fontSize:14,color:C.brown}}>{c.name}</div><div style={{fontSize:10,color:C.muted}}>{c.birth}</div></div>
                </div>
              ))}
            </div>
          </PinCard>
        )}
      </div>
      {vid&&(
        <PinCard tilt={-0.5} accent={C.rust} style={{marginBottom:14,padding:"18px 22px"}}>
          <h3 style={{fontFamily:"'Caveat',cursive",fontSize:20,color:C.brown,margin:"0 0 14px"}}>🎬 Family Video</h3>
          <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:12,overflow:"hidden"}}>
            <iframe src={`https://www.youtube.com/embed/${vid}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/>
          </div>
        </PinCard>
      )}
      {m.photo&&(
        <PinCard tilt={1} accent={C.sky} style={{padding:"18px 22px"}}>
          <h3 style={{fontFamily:"'Caveat',cursive",fontSize:20,color:C.brown,margin:"0 0 14px"}}>📷 Photo</h3>
          <img src={m.photo} alt={m.name} style={{width:"100%",maxHeight:400,objectFit:"cover",borderRadius:12,border:`3px solid ${C.border}`}} onError={e=>e.target.style.display="none"}/>
        </PinCard>
      )}
    </div>
  );
}

// ── MEMBER FORM ───────────────────────────────────────────────────────────────
function MemberForm({initial,members,onSubmit,onCancel,title}) {
  const blank={name:"",birth:"",death:"",bio:"",photo:"",youtube:"",gender:"M",parents:[],children:[],spouse:"",badge:"",events:[]};
  const [f,setF]=useState(initial||blank);
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));
  const togPar=id=>{const c=f.parents||[];upd("parents",c.includes(id)?c.filter(x=>x!==id):[...c,id]);};
  const others=members.filter(m=>m.id!==initial?.id);
  const BADGES=["🌳 Patriarch","👑 Matriarch","💻 Techie","🎨 Artist","📚 Storyteller","🏗️ Engineer","💉 Caregiver","🌍 Traveller","🍳 Chef","🎵 Musician","⚽ Sportsperson","📸 Photographer","✍️ Writer","🌻 Gardener",""];
  return (
    <div style={{maxWidth:740,margin:"0 auto"}}>
      <div style={{background:C.paper,borderRadius:24,padding:"38px 42px",border:`2px solid ${C.border}`,boxShadow:"0 12px 50px rgba(74,32,8,0.14)"}}>
        <h2 style={{fontFamily:"'Caveat',cursive",fontSize:30,color:C.brown,margin:"0 0 26px"}}>{title}</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px"}}>
          <div style={{gridColumn:"1/-1"}}><Inp label="😊 Full Name *" value={f.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Ramchandra Sharma"/></div>
          <Inp label="🎂 Birth Year" value={f.birth} onChange={e=>upd("birth",e.target.value)} placeholder="e.g. 1948"/>
          <Inp label="🕊️ Death Year" value={f.death} onChange={e=>upd("death",e.target.value)} placeholder="Leave blank if living"/>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",marginBottom:6,fontSize:15,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive"}}>Gender</label>
            <div style={{display:"flex",gap:16}}>
              {[["M","👨 Male"],["F","👩 Female"],["O","🧑 Other"]].map(([v,l])=>(
                <label key={v} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,color:C.text,fontFamily:"'Lora',serif"}}>
                  <input type="radio" name="gen" value={v} checked={f.gender===v} onChange={()=>upd("gender",v)}/>{l}
                </label>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",marginBottom:6,fontSize:15,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive"}}>🏷️ Badge / Role</label>
            <select value={f.badge||""} onChange={e=>upd("badge",e.target.value)} style={{width:"100%",padding:"10px 14px",border:`2px solid ${C.border}`,borderRadius:10,background:C.paper,color:C.text,fontSize:13,fontFamily:"'Lora',serif",outline:"none"}}>
              {BADGES.map(b=><option key={b} value={b}>{b||"No badge"}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1",marginBottom:16}}>
            <label style={{display:"block",marginBottom:5,fontSize:15,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive"}}>📖 Story / Biography</label>
            <textarea value={f.bio} onChange={e=>upd("bio",e.target.value)} placeholder="Share their story, memories, personality, achievements — what made them unique…" style={{width:"100%",padding:"11px 15px",border:`2px solid ${C.border}`,borderRadius:10,background:C.paper,color:C.text,fontSize:13,fontFamily:"'Lora',serif",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:90,lineHeight:1.6}} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div style={{gridColumn:"1/-1"}}><PhotoUploader value={f.photo} onChange={v=>upd("photo",v)}/></div>
          <div style={{gridColumn:"1/-1"}}><Inp label="🎬 YouTube Video URL" value={f.youtube} onChange={e=>upd("youtube",e.target.value)} placeholder="https://www.youtube.com/watch?v=…" help="Paste a YouTube link to add their video to the family channel"/></div>
          {others.length>0&&(
            <div style={{gridColumn:"1/-1",marginBottom:16}}>
              <label style={{display:"block",marginBottom:8,fontSize:15,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive"}}>👴👵 Parents</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {others.map(m=>{const sel=(f.parents||[]).includes(m.id);return(
                  <div key={m.id} onClick={()=>togPar(m.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:10,border:`2px solid ${sel?accentFor(m.name):C.border}`,background:sel?`${accentFor(m.name)}15`:C.cream,cursor:"pointer",fontSize:12,color:C.text,fontFamily:"'Lora',serif",transition:"all 0.15s",transform:sel?"scale(1.04)":"scale(1)"}}>
                    <Avatar name={m.name} photo={m.photo} size={22} accent={accentFor(m.name)}/>{sel&&<span style={{color:accentFor(m.name),fontSize:14}}>✓ </span>}{m.name}
                  </div>
                );})}
              </div>
            </div>
          )}
          {others.length>0&&(
            <div style={{gridColumn:"1/-1",marginBottom:16}}>
              <label style={{display:"block",marginBottom:6,fontSize:15,fontWeight:700,color:C.brown,fontFamily:"'Caveat',cursive"}}>💑 Spouse</label>
              <select value={f.spouse} onChange={e=>upd("spouse",e.target.value)} style={{width:"100%",padding:"10px 14px",border:`2px solid ${C.border}`,borderRadius:10,background:C.paper,color:C.text,fontSize:13,fontFamily:"'Lora',serif",outline:"none"}}>
                <option value="">None / not listed</option>
                {others.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:14,paddingTop:16,borderTop:`2px dashed ${C.border}`}}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="sage" onClick={()=>{if(!f.name.trim())return;onSubmit(f);}} icon="🌿">Save to Family Tree</Btn>
        </div>
      </div>
    </div>
  );
}

// ── INVITE PAGE ───────────────────────────────────────────────────────────────
function InvitePage({user}) {
  const [codes,setCodes]=useState(()=>JSON.parse(localStorage.getItem(KEY.INVITES)||"[]"));
  const [copied,setCopied]=useState(null);
  const generate=()=>{
    const inv={code:"fam-"+uid(),createdBy:user.name,createdAt:new Date().toLocaleDateString(),used:false};
    const updated=[...codes,inv]; setCodes(updated); localStorage.setItem(KEY.INVITES,JSON.stringify(updated));
    fireConfetti();
  };
  const copy=(text,key)=>{navigator.clipboard?.writeText(text).catch(()=>{});setCopied(key);setTimeout(()=>setCopied(null),2000);};
  return (
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <h2 style={{fontFamily:"'Caveat',cursive",fontSize:32,color:C.brown,margin:"0 0 6px"}}>✉️ Invite Family Members</h2>
      <p style={{fontSize:13,color:C.muted,fontFamily:"'Lora',serif",marginBottom:28}}>Generate magical invite codes to bring your family onto the tree!</p>
      <PinCard tilt={-1} accent={C.gold} style={{marginBottom:20}}>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:codes.length?24:0,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}>
            <h3 style={{fontFamily:"'Caveat',cursive",fontSize:22,color:C.brown,margin:"0 0 4px"}}>🎟️ Generate New Invite</h3>
            <p style={{margin:0,fontSize:13,color:C.muted,fontFamily:"'Lora',serif"}}>Each code is single-use. Share freely with family!</p>
          </div>
          <Btn variant="gold" onClick={generate} icon="✨" style={{fontSize:14}}>Generate Code</Btn>
        </div>
        {codes.length>0&&<div style={{borderTop:`2px dashed ${C.border}`,paddingTop:18}}>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.brown,marginBottom:12}}>Your Invite Codes 🎫</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {codes.map((inv,i)=>(
              <div key={i} style={{background:C.cream,borderRadius:12,padding:"12px 16px",border:`2px solid ${inv.used?C.border:C.gold}30`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",opacity:inv.used?0.7:1}}>
                <div style={{fontFamily:"'Courier New',monospace",fontSize:15,fontWeight:700,color:C.brown,background:inv.used?C.border:C.goldsoft,padding:"5px 14px",borderRadius:8,letterSpacing:"0.08em"}}>{inv.code}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:C.muted,fontFamily:"'Lora',serif"}}>{inv.createdAt}</div>
                  {inv.used&&<div style={{fontSize:11,color:C.sage,fontWeight:700,fontFamily:"'Caveat',cursive",fontSize:14}}>✓ Used!</div>}
                </div>
                {!inv.used&&<div style={{display:"flex",gap:6}}>
                  <button onClick={()=>copy(inv.code,i+"c")} style={{background:copied===i+"c"?C.sage:C.paper,border:`2px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"'Caveat',cursive",fontSize:13,color:copied===i+"c"?"#fff":C.brown,transition:"all 0.15s"}}>{copied===i+"c"?"✓ Copied!":"Copy Code"}</button>
                  <button onClick={()=>copy(`${window.location.href.split("?")[0]}?invite=${inv.code}`,i+"l")} style={{background:copied===i+"l"?C.teal:C.paper,border:`2px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"'Caveat',cursive",fontSize:13,color:copied===i+"l"?"#fff":C.brown,transition:"all 0.15s"}}>{copied===i+"l"?"✓ Copied!":"Copy Link 🔗"}</button>
                </div>}
              </div>
            ))}
          </div>
        </div>}
      </PinCard>
      <div style={{background:"#EFF8F0",borderRadius:16,padding:"18px 22px",border:`2px solid #A8D4AB`}}>
        <h4 style={{fontFamily:"'Caveat',cursive",fontSize:18,color:C.sage,margin:"0 0 8px"}}>How it works 🌿</h4>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[["🎟️","Generate a unique invite code above"],["📤","Share the code or link with your family member"],["✍️","They sign up and enter the code"],["🌳","They join your family tree instantly!"]].map(([ic,tx])=>(
            <div key={tx} style={{display:"flex",gap:10,alignItems:"center",fontSize:13,color:C.text,fontFamily:"'Lora',serif"}}><span style={{fontSize:16}}>{ic}</span>{tx}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PDF EXPORT ────────────────────────────────────────────────────────────────
function exportPDF(members,computeLayout) {
  const {nodes,edges}=computeLayout();
  const PAD=80,NW=160,NH=90;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
  const minX=Math.min(...xs)-NW/2,maxX=Math.max(...xs)+NW/2;
  const minY=Math.min(...ys),maxY=Math.max(...ys)+NH;
  const svgW=maxX-minX+PAD*2,svgH=maxY-minY+PAD*2;
  const svgContent=`<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#FFFEF9">
    ${edges.map(e=>{const fx=e.from.x-minX+PAD,fy=e.from.y-minY+PAD+NH,tx=e.to.x-minX+PAD,ty=e.to.y-minY+PAD,my=(fy+ty)/2;return`<path d="M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}" stroke="#F5D080" stroke-width="2" fill="none" stroke-dasharray="6,4"/>`;}).join("")}
    ${nodes.map(n=>{const nx=n.x-minX+PAD-NW/2,ny=n.y-minY+PAD,nm=n.name.length>20?n.name.slice(0,19)+"…":n.name;const colors=["#F26B4E","#5A8A5E","#2E8B8A","#4A90C4","#8B6FBF","#D45E8A","#E8A020","#C2431A"];const ac=colors[(n.name.charCodeAt(0)||0)%colors.length];return`<rect x="${nx}" y="${ny}" width="${NW}" height="${NH}" rx="10" fill="white" stroke="#DDC99A" stroke-width="1.5"/><rect x="${nx}" y="${ny}" width="${NW}" height="5" rx="3" fill="${ac}"/><circle cx="${nx+28}" cy="${ny+52}" r="16" fill="${ac}22" stroke="${ac}" stroke-width="1.5"/><text x="${nx+28}" y="${ny+57}" text-anchor="middle" font-size="10" font-weight="bold" fill="${ac}" font-family="Georgia">${initials(n.name)}</text><text x="${nx+52}" y="${ny+32}" font-size="11.5" font-weight="bold" fill="#4A2008" font-family="Georgia">${nm}</text><text x="${nx+52}" y="${ny+50}" font-size="10" fill="#7A5C3A" font-family="Georgia">${n.birth||""}${n.death?` – ${n.death}`:""}</text>${n.badge?`<text x="${nx+52}" y="${ny+68}" font-size="9.5" fill="${ac}" font-family="Georgia">${n.badge}</text>`:""}`}).join("")}
  </svg>`;
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Our Family Story</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Lora:ital@0;1&display=swap');body{margin:0;padding:32px;background:#FDF6E3;font-family:'Lora',Georgia,serif;}h1{font-family:'Caveat',cursive;color:#4A2008;font-size:42px;margin:0 0 4px;}.sub{color:#7A5C3A;font-size:14px;margin:0 0 28px;font-style:italic;}.tree{background:#FFFEF9;border-radius:16px;padding:20px;border:2px solid #DDC99A;margin-bottom:32px;overflow:auto;}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;}.card{background:#FFFEF9;border-radius:14px;padding:16px 18px;border:2px solid #DDC99A;}.name{font-family:'Caveat',cursive;font-size:20px;color:#4A2008;margin:0 0 3px;}.years{font-size:12px;color:#7A5C3A;margin:0 0 6px;}.bio{font-size:12px;color:#2C1505;line-height:1.6;margin:0;font-style:italic;}@media print{body{padding:16px;}.tree{page-break-after:always;}}</style>
</head><body><h1>🌳 Our Family Story</h1><p class="sub">${members.length} family members · Exported ${new Date().toLocaleDateString()}</p>
<div class="tree">${svgContent}</div>
<div class="grid">${members.map(m=>`<div class="card"><p class="name">${m.name}</p>${m.badge?`<p style="font-size:12px;color:#7A5C3A;margin:0 0 4px;">${m.badge}</p>`:""}<p class="years">${m.birth||""}${m.death?` – ${m.death}`:m.birth?" – present":""}</p>${m.bio?`<p class="bio">${m.bio.slice(0,180)}${m.bio.length>180?"…":""}</p>`:""}</div>`).join("")}
</div></body></html>`;
  const blob=new Blob([html],{type:"text/html"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="our-family-story.html";a.click();
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setViewRaw]=useState("landing");
  const [user,setUser]=useState(null);
  const [members,setMembers]=useState([]);
  const [selected,setSelected]=useState(null);
  const [editing,setEditing]=useState(null);
  const [toast,setToast]=useState(null);
  const inviteCode=new URLSearchParams(typeof window!=="undefined"?window.location.search:"").get("invite")||"";

  const setView=v=>{setViewRaw(v);if(typeof window!=="undefined")window.scrollTo({top:0,behavior:"smooth"});};

  useEffect(()=>{
    const s=localStorage.getItem(KEY.SESSION);
    if(s){setUser(JSON.parse(s));setViewRaw("home");}
    const m=localStorage.getItem(KEY.MEMBERS);
    setMembers(m?JSON.parse(m):SEED);
  },[]);

  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(null),3500);return()=>clearTimeout(t);}}, [toast]);

  const showToast=(msg,confetti=false)=>{setToast(msg);if(confetti)setTimeout(fireConfetti,100);};
  const save=m=>{setMembers(m);localStorage.setItem(KEY.MEMBERS,JSON.stringify(m));};

  const signup=(name,email,pw,code,setErr)=>{
    if(!name||!email||!pw){setErr("Please fill all fields.");return;}
    const users=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");
    if(users.find(u=>u.email===email)){setErr("Email already registered.");return;}
    if(code){const invs=JSON.parse(localStorage.getItem(KEY.INVITES)||"[]");const inv=invs.find(i=>i.code===code&&!i.used);if(!inv){setErr("Invalid or used invite code.");return;}localStorage.setItem(KEY.INVITES,JSON.stringify(invs.map(i=>i.code===code?{...i,used:true,usedBy:name}:i)));}
    const u={id:Date.now().toString(),name,email,pw};users.push(u);
    localStorage.setItem(KEY.USERS,JSON.stringify(users));localStorage.setItem(KEY.SESSION,JSON.stringify(u));
    setUser(u);setView("home");showToast(`🎉 Welcome to the family, ${name}!`,true);
  };

  const login=(email,pw,setErr)=>{
    const users=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");
    const u=users.find(x=>x.email===email&&x.pw===pw);
    if(!u){setErr("Incorrect email or password.");return;}
    localStorage.setItem(KEY.SESSION,JSON.stringify(u));setUser(u);setView("home");showToast(`👋 Welcome back, ${u.name}!`);
  };

  const logout=()=>{localStorage.removeItem(KEY.SESSION);setUser(null);setView("landing");};

  const addMember=data=>{
    const nm={...data,id:"m"+Date.now(),addedBy:user.id};
    let up=[...members,nm];
    if(data.parents?.length)up=up.map(m=>data.parents.includes(m.id)&&!m.children?.includes(nm.id)?{...m,children:[...(m.children||[]),nm.id]}:m);
    if(data.spouse)up=up.map(m=>m.id===data.spouse&&!m.spouse?{...m,spouse:nm.id}:m);
    save(up);showToast(`🌿 ${nm.name} has been added to the family tree!`,true);setView("tree");
  };

  const updateMember=(id,data)=>{
    save(members.map(m=>m.id===id?{...m,...data}:m));
    setSelected(s=>({...s,...data}));showToast("✅ Profile updated!");setView("profile");
  };

  const computeLayout=useCallback(()=>{
    if(!members.length)return{nodes:[],edges:[]};
    const gMap={};
    const getG=(id,vis=new Set())=>{if(gMap[id]!==undefined)return gMap[id];if(vis.has(id))return 0;vis.add(id);const m=members.find(x=>x.id===id);if(!m||!m.parents?.length)return 0;const vp=m.parents.filter(p=>members.find(x=>x.id===p));if(!vp.length)return 0;return Math.max(...vp.map(p=>getG(p,new Set(vis))))+1;};
    members.forEach(m=>{gMap[m.id]=getG(m.id);});
    const byG={};members.forEach(m=>{const g=gMap[m.id]||0;if(!byG[g])byG[g]=[];byG[g].push(m);});
    const NW=160,NH=86,HG=30,VG=120;const nodesFinal=[];
    Object.entries(byG).forEach(([g,gm])=>{const total=gm.length*(NW+HG)-HG;gm.forEach((m,i)=>nodesFinal.push({...m,x:i*(NW+HG)-total/2,y:Number(g)*(NH+VG)}));});
    const edges=[];members.forEach(m=>{(m.children||[]).forEach(cid=>{const p=nodesFinal.find(n=>n.id===m.id),c=nodesFinal.find(n=>n.id===cid);if(p&&c)edges.push({from:p,to:c});});});
    return{nodes:nodesFinal,edges};
  },[members]);

  const INNER=["home","tree","timeline","channel","search","profile","addMember","editMember","invite"];

  return (
    <div style={{fontFamily:"'Lora',Georgia,serif",minHeight:"100vh",background:C.cream}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus,textarea:focus,select:focus{border-color:${C.gold}!important;box-shadow:0 0 0 4px ${C.gold}20!important;}
        @keyframes pageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes treeBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(3deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pop{0%{transform:scale(0.8)}60%{transform:scale(1.08)}100%{transform:scale(1)}}
        ::-webkit-scrollbar{width:7px;height:7px}
        ::-webkit-scrollbar-track{background:${C.tan}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
        mark{background:${C.goldsoft};padding:0 2px;border-radius:3px;}
      `}</style>

      {toast&&(
        <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:C.brown,color:"#fff",padding:"14px 22px",borderRadius:16,fontSize:14,fontFamily:"'Caveat',cursive",fontSize:17,boxShadow:"0 10px 40px rgba(0,0,0,0.28)",animation:"slideIn 0.3s ease",maxWidth:340,lineHeight:1.4,border:`2px solid ${C.gold}44`}}>
          {toast}
        </div>
      )}

      {view==="landing"&&<Landing onLogin={()=>setView("login")} onSignup={()=>setView("signup")}/>}
      {view==="login"&&<LoginPage onLogin={login} onSwitch={()=>setView("signup")} onBack={()=>setView("landing")}/>}
      {view==="signup"&&<SignupPage onSignup={signup} onSwitch={()=>setView("login")} onBack={()=>setView("landing")}/>}

      {INNER.includes(view)&&user&&(
        <Shell user={user} view={view} setView={setView} onLogout={logout}>
          {view==="home"&&<HomePage members={members} setView={setView} onSelectMember={setSelected}/>}
          {view==="tree"&&<TreeView members={members} computeLayout={computeLayout} onSelect={m=>{setSelected(m);setView("profile");}} onExport={()=>exportPDF(members,computeLayout)}/>}
          {view==="timeline"&&<TimelineView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="channel"&&<ChannelView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="search"&&<SearchView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
          {view==="profile"&&<ProfileView member={selected} members={members} onEdit={m=>{setEditing(m);setView("editMember");}} onSelectMember={m=>{if(m){setSelected(m);}else setView("tree");}}/>}
          {view==="addMember"&&<MemberForm members={members} onSubmit={addMember} onCancel={()=>setView("tree")} title="🌿 Add a Family Member"/>}
          {view==="editMember"&&<MemberForm initial={editing} members={members} onSubmit={d=>updateMember(editing.id,d)} onCancel={()=>setView("profile")} title="✏️ Edit Profile"/>}
          {view==="invite"&&<InvitePage user={user}/>}
        </Shell>
      )}
    </div>
  );
}
