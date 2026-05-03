import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

// ── PALETTE (Forest · Amber · Linen) ─────────────────────────────────────────
const T = {
  bg:"#F5F0E6", paper:"#FDFAF3", surface:"#EDE7D8", cream:"#F0E8D4",
  forest:"#1C3829", forestMid:"#265240", forestLight:"#3B7A5C",
  amber:"#C96B1A", amberMid:"#E8902A", amberPale:"#F5E3C8",
  mahogany:"#7A2E1A", sage:"#3D6E50", teal:"#2A6060", plum:"#5E3060",
  sky:"#2A5A8A", pink:"#8A3060",
  ink:"#160E04", text:"#2A1A0A", muted:"#6A5A3A", faint:"#9A8A68",
  border:"#D8CEBC", borderMid:"#C4B89A",
  error:"#AE2B2B", success:"#2E6040", gold:"#B8860B",
};
const ACCENTS = [T.amber,T.sage,T.teal,T.plum,T.mahogany,T.sky,T.pink,"#4A6E8A"];
const accentFor = n => ACCENTS[(n.charCodeAt(0)||0)%ACCENTS.length];
const initials  = n => n.trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
const ytId      = url => { if(!url)return null; const r=url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/); return r?r[1]:null; };
const uid       = () => Math.random().toString(36).slice(2,10);
const readFile  = f => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(f); });
const fmtDate   = d => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
const KEY = { USERS:"ft6_u", MEMBERS:"ft6_m", SESSION:"ft6_s", INVITES:"ft6_i", EVENTS:"ft6_e", CHAT:"ft6_c", LANG:"ft6_l" };

// ── LANGUAGE ──────────────────────────────────────────────────────────────────
const TR = {
  en:{ appName:"Our Family Story", home:"Home", tree:"Tree", timeline:"Timeline", channel:"Channel", search:"Search", calendar:"Calendar", chat:"Chat", admin:"Admin", addMember:"Add Member", invite:"Invite", signOut:"Sign out", members:"Members", videos:"Videos", births:"Births", couples:"Couples", roots:"Roots", social:"Social Profiles", education:"Education", scrapbook:"Personal Details", gallery:"Photo Gallery", googlePhotos:"Google Photos Album", chat_title:"Family Chat", cal_title:"Family Calendar", typeMsg:"Type a message…", send:"Send", addEvent:"Add Event", eventTitle:"Event Title", eventDate:"Date", eventType:"Type", eventDesc:"Description", birthday:"Birthday 🎂", anniversary:"Anniversary 💍", gathering:"Gathering 🏡", festival:"Festival 🪔", other:"Other 📌", noEvents:"No events this month", addToCalendar:"Add to Calendar", occupation:"Occupation", hometown:"Hometown", currentCity:"Current City", hobbies:"Hobbies", achievements:"Achievements", favQuote:"Favourite Quote", funFact:"Fun Fact", degree:"Degree / Course", institution:"School / College / University", fieldStudy:"Field of Study", gradYear:"Year", addEducation:"+ Add Education", school:"School", university:"University", born:"b.", died:"d.", living:"Living", inMemoriam:"In Memoriam", editProfile:"Edit Profile", saveToTree:"Save to Tree", cancel:"Cancel", back:"← Back", },
  hi:{ appName:"हमारी पारिवारिक कहानी", home:"होम", tree:"वंश वृक्ष", timeline:"समयरेखा", channel:"चैनल", search:"खोज", calendar:"कैलेंडर", chat:"बातचीत", admin:"प्रशासक", addMember:"सदस्य जोड़ें", invite:"आमंत्रण", signOut:"साइन आउट", members:"सदस्य", videos:"वीडियो", births:"जन्म", couples:"जोड़े", roots:"मूल", social:"सोशल प्रोफ़ाइल", education:"शिक्षा", scrapbook:"व्यक्तिगत विवरण", gallery:"फ़ोटो गैलरी", googlePhotos:"गूगल फ़ोटो एल्बम", chat_title:"पारिवारिक बातचीत", cal_title:"पारिवारिक कैलेंडर", typeMsg:"संदेश लिखें…", send:"भेजें", addEvent:"इवेंट जोड़ें", eventTitle:"इवेंट का नाम", eventDate:"तारीख", eventType:"प्रकार", eventDesc:"विवरण", birthday:"जन्मदिन 🎂", anniversary:"सालगिरह 💍", gathering:"मिलन 🏡", festival:"त्योहार 🪔", other:"अन्य 📌", noEvents:"इस महीने कोई इवेंट नहीं", addToCalendar:"कैलेंडर में जोड़ें", occupation:"पेशा", hometown:"गृहनगर", currentCity:"वर्तमान शहर", hobbies:"शौक", achievements:"उपलब्धियाँ", favQuote:"पसंदीदा उद्धरण", funFact:"रोचक तथ्य", degree:"डिग्री / कोर्स", institution:"स्कूल / कॉलेज / विश्वविद्यालय", fieldStudy:"अध्ययन का क्षेत्र", gradYear:"वर्ष", addEducation:"+ शिक्षा जोड़ें", school:"स्कूल", university:"विश्वविद्यालय", born:"जन्म", died:"निधन", living:"जीवित", inMemoriam:"स्मृति में", editProfile:"प्रोफ़ाइल संपादित करें", saveToTree:"वृक्ष में सहेजें", cancel:"रद्द करें", back:"← वापस", },
  mr:{ appName:"आमची कौटुंबिक कथा", home:"मुखपृष्ठ", tree:"वंशवृक्ष", timeline:"कालरेषा", channel:"चॅनेल", search:"शोध", calendar:"दिनदर्शिका", chat:"गप्पा", admin:"प्रशासक", addMember:"सदस्य जोडा", invite:"आमंत्रण", signOut:"साइन आउट", members:"सदस्य", videos:"व्हिडिओ", births:"जन्म", couples:"जोडपी", roots:"मुळे", social:"सोशल प्रोफाइल", education:"शिक्षण", scrapbook:"वैयक्तिक माहिती", gallery:"फोटो गॅलरी", googlePhotos:"गूगल फोटो अल्बम", chat_title:"कौटुंबिक गप्पा", cal_title:"कौटुंबिक दिनदर्शिका", typeMsg:"संदेश लिहा…", send:"पाठवा", addEvent:"कार्यक्रम जोडा", eventTitle:"कार्यक्रमाचे नाव", eventDate:"तारीख", eventType:"प्रकार", eventDesc:"वर्णन", birthday:"वाढदिवस 🎂", anniversary:"वर्धापनदिन 💍", gathering:"मेळावा 🏡", festival:"सण 🪔", other:"इतर 📌", noEvents:"या महिन्यात कोणताही कार्यक्रम नाही", addToCalendar:"दिनदर्शिकेत जोडा", occupation:"व्यवसाय", hometown:"मूळ गाव", currentCity:"सध्याचे शहर", hobbies:"छंद", achievements:"कामगिरी", favQuote:"आवडते सुवचन", funFact:"मजेशीर तथ्य", degree:"पदवी / अभ्यासक्रम", institution:"शाळा / महाविद्यालय / विद्यापीठ", fieldStudy:"अभ्यासाचे क्षेत्र", gradYear:"वर्ष", addEducation:"+ शिक्षण जोडा", school:"शाळा", university:"विद्यापीठ", born:"जन्म", died:"निधन", living:"जिवंत", inMemoriam:"स्मृतीत", editProfile:"प्रोफाइल संपादित करा", saveToTree:"वृक्षात जतन करा", cancel:"रद्द करा", back:"← मागे", },
};
const LangCtx = createContext({ lang:"en", t:k=>k, setLang:()=>{} });
const useLang  = () => useContext(LangCtx);

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED = [
  {id:"s1",name:"Ramchandra Sharma",birth:"1918",death:"1989",bio:"Patriarch of the Sharma family. A devoted schoolteacher who moved from Agra to Delhi in 1945.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s2",gender:"M",badge:"Patriarch",social:{},education:[{institution:"Agra University",degree:"B.A.",field:"History",year:"1940"}],scrapbook:{occupation:"Schoolteacher",hometown:"Agra",city:"Delhi",hobbies:"Reading, Chess",quote:"A good teacher can inspire hope.",fact:"Taught over 2000 students in his career.",achievements:""},gallery:[],googlePhotos:""},
  {id:"s2",name:"Savitri Devi Sharma",birth:"1922",death:"2001",bio:"The heart of the home. Known for boundless warmth and legendary cooking.",photo:"",youtube:"",parents:[],children:["s3","s4"],spouse:"s1",gender:"F",badge:"Matriarch",social:{},education:[],scrapbook:{occupation:"Homemaker",hometown:"Mathura",city:"Delhi",hobbies:"Cooking, Embroidery",quote:"A home is built with love.",fact:"Her kheer recipe was passed down three generations.",achievements:""},gallery:[],googlePhotos:""},
  {id:"s3",name:"Suresh Sharma",birth:"1948",death:"",bio:"Eldest son, retired civil engineer. Passionate about cricket and classical music.",photo:"",youtube:"https://www.youtube.com/watch?v=dQw4w9WgXcQ",parents:["s1","s2"],children:["s5","s6"],spouse:"s7",gender:"M",badge:"Engineer",social:{facebook:"",instagram:"",linkedin:"",twitter:""},education:[{institution:"IIT Delhi",degree:"B.Tech",field:"Civil Engineering",year:"1970"}],scrapbook:{occupation:"Civil Engineer (Retd.)",hometown:"Delhi",city:"Delhi",hobbies:"Cricket, Classical Music, Gardening",quote:"Build things that last.",fact:"Designed 12 bridges across Rajasthan.",achievements:""},gallery:[],googlePhotos:""},
  {id:"s4",name:"Meena Joshi",birth:"1952",death:"",bio:"Youngest child. Lives in Pune. A wonderful storyteller.",photo:"",youtube:"",parents:["s1","s2"],children:[],spouse:"",gender:"F",badge:"Storyteller",social:{},education:[],scrapbook:{occupation:"Schoolteacher (Retd.)",hometown:"Delhi",city:"Pune",hobbies:"Reading, Writing, Travelling",quote:"Every child is a story waiting to be told.",fact:"Published a collection of short stories in Marathi.",achievements:""},gallery:[],googlePhotos:""},
  {id:"s7",name:"Priya Sharma",birth:"1950",death:"",bio:"Former nurse, retired. Known for embroidery and quiet kindness.",photo:"",youtube:"",parents:[],children:["s5","s6"],spouse:"s3",gender:"F",badge:"Caregiver",social:{},education:[],scrapbook:{},gallery:[],googlePhotos:""},
  {id:"s5",name:"Arjun Sharma",birth:"1975",death:"",bio:"Software engineer in Bengaluru. Loves classical music and mountain treks.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"M",badge:"Techie",social:{facebook:"",instagram:"",linkedin:"",twitter:""},education:[{institution:"BITS Pilani",degree:"B.E.",field:"Computer Science",year:"1997"}],scrapbook:{occupation:"Software Engineer",hometown:"Delhi",city:"Bengaluru",hobbies:"Trekking, Classical Music, Photography",quote:"Code is poetry.",fact:"Trekked to Roopkund and Chandrashila.",achievements:""},gallery:[],googlePhotos:""},
  {id:"s6",name:"Nisha Sharma",birth:"1978",death:"",bio:"Graphic designer in Delhi. Paints in oils and keeps traditional recipes alive.",photo:"",youtube:"",parents:["s3","s7"],children:[],spouse:"",gender:"F",badge:"Artist",social:{facebook:"",instagram:"",linkedin:""},education:[{institution:"NID Ahmedabad",degree:"B.Des",field:"Graphic Design",year:"2000"}],scrapbook:{occupation:"Graphic Designer",hometown:"Delhi",city:"Delhi",hobbies:"Oil Painting, Cooking, Yoga",quote:"Colour is the keyboard, the eyes are the harmonies.",fact:"Her Warli paintings were exhibited in Mumbai and London.",achievements:""},gallery:[],googlePhotos:""},
];

// ── CONFETTI ──────────────────────────────────────────────────────────────────
function fireConfetti() {
  const cv=document.createElement("canvas"); cv.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%"; document.body.appendChild(cv);
  const ctx=cv.getContext("2d"); cv.width=window.innerWidth; cv.height=window.innerHeight;
  const cols=[T.amber,T.amberMid,"#E8D490",T.sage,T.teal,T.plum,"#E88050"];
  const pts=Array.from({length:100},()=>({x:Math.random()*cv.width,y:-10,vx:(Math.random()-.5)*5,vy:Math.random()*3+2,r:Math.random()*5+3,c:cols[Math.floor(Math.random()*cols.length)],rot:Math.random()*360,vr:(Math.random()-.5)*7,sq:Math.random()>.5}));
  let f=0; const loop=()=>{ctx.clearRect(0,0,cv.width,cv.height);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.vy+=.07;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.c;ctx.globalAlpha=Math.max(0,1-f/80);if(p.sq)ctx.fillRect(-p.r,-p.r*.5,p.r*2,p.r);else{ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}ctx.restore();});f++;if(f<90)requestAnimationFrame(loop);else cv.remove();}; requestAnimationFrame(loop);
}

// ── PRIMITIVES ────────────────────────────────────────────────────────────────
function Avatar({name,photo,size=44,accent,style={}}) {
  const bg=accent||accentFor(name);
  return photo?<img src={photo} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${bg}50`,...style}}/> :<div style={{width:size,height:size,borderRadius:"50%",background:`${bg}18`,border:`1.5px solid ${bg}70`,display:"flex",alignItems:"center",justifyContent:"center",color:bg,fontWeight:700,fontSize:size*.35,flexShrink:0,...style}}>{initials(name)}</div>;
}
function Btn({children,variant="primary",size="md",...p}) {
  const vs={primary:{background:T.forest,color:"#fff",border:"none"},amber:{background:T.amber,color:"#fff",border:"none"},outline:{background:"transparent",color:T.forest,border:`1.5px solid ${T.forest}`},ghost:{background:"transparent",color:T.muted,border:`1px solid ${T.border}`},danger:{background:T.error,color:"#fff",border:"none"}};
  const sz={sm:{padding:"6px 13px",fontSize:12},md:{padding:"10px 20px",fontSize:13},lg:{padding:"13px 32px",fontSize:15}};
  return <button {...p} style={{...sz[size],borderRadius:8,fontFamily:"inherit",cursor:"pointer",fontWeight:700,letterSpacing:"0.05em",transition:"all .14s",display:"inline-flex",alignItems:"center",gap:6,...vs[variant],...(p.style||{})}} onMouseEnter={e=>e.currentTarget.style.opacity=".84"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
}
function Chip({children,color=T.forest,small=false}) {
  return <span style={{background:`${color}14`,color,fontSize:small?10:11,fontWeight:700,padding:small?"2px 7px":"3px 10px",borderRadius:20,border:`1px solid ${color}28`,letterSpacing:"0.05em"}}>{children}</span>;
}
function Card({children,style={},onClick,hover=true}) {
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>hover&&setH(true)} onMouseLeave={()=>hover&&setH(false)} style={{background:T.paper,borderRadius:14,border:`1px solid ${h&&onClick?T.borderMid:T.border}`,boxShadow:h&&onClick?"0 8px 30px rgba(28,56,41,.1)":"0 2px 10px rgba(28,56,41,.05)",transition:"all .18s",cursor:onClick?"pointer":"default",...style}}>{children}</div>;
}
function SecHead({children,sub,action}) {
  return <div style={{marginBottom:18,display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:sub?3:0}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:26,color:T.ink,margin:0,fontWeight:700}}>{children}</h2></div>{sub&&<p style={{margin:"0 0 0 12px",fontSize:12,color:T.muted,fontStyle:"italic"}}>{sub}</p>}</div>{action&&<div>{action}</div>}</div>;
}
function Inp({label,hint,...p}) {
  const [f,setF]=useState(false);
  return <div style={{marginBottom:14}}>{label&&<label style={{display:"block",marginBottom:4,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>{label}</label>}<input {...p} onFocus={e=>{setF(true);p.onFocus&&p.onFocus(e);}} onBlur={e=>{setF(false);p.onBlur&&p.onBlur(e);}} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${f?T.amber:T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border-color .18s",boxShadow:f?`0 0 0 3px ${T.amber}18`:"none",...(p.style||{})}}/>{hint&&<p style={{margin:"4px 0 0",fontSize:11,color:T.faint}}>{hint}</p>}</div>;
}
function TA({label,...p}) {
  const [f,setF]=useState(false);
  return <div style={{marginBottom:14}}>{label&&<label style={{display:"block",marginBottom:4,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>{label}</label>}<textarea {...p} onFocus={e=>{setF(true);}} onBlur={e=>{setF(false);}} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${f?T.amber:T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:80,lineHeight:1.65,transition:"border-color .18s",...(p.style||{})}}/></div>;
}
function PhotoUploader({value,onChange}) {
  const inp=useRef(); const [drag,setDrag]=useState(false);
  const handle=async files=>{const f=files[0];if(!f||!f.type.startsWith("image/"))return;onChange(await readFile(f));};
  return <div style={{marginBottom:14}}><label style={{display:"block",marginBottom:4,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>Photo</label><div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files);}} onClick={()=>inp.current.click()} style={{border:`1.5px dashed ${drag?T.amber:T.border}`,borderRadius:10,padding:18,textAlign:"center",background:drag?T.amberPale:T.surface,cursor:"pointer",transition:"all .2s"}}>{value?<div style={{position:"relative",display:"inline-block"}}><img src={value} alt="preview" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.amber}`}}/><button onClick={e=>{e.stopPropagation();onChange("");}} style={{position:"absolute",top:-4,right:-4,width:22,height:22,borderRadius:"50%",background:T.error,border:"none",color:"#fff",cursor:"pointer",fontSize:13,lineHeight:1}}>×</button></div>:<><div style={{fontSize:26,opacity:.35,marginBottom:5}}>↑</div><p style={{margin:0,fontSize:12,color:T.muted}}>Drop photo or click to upload</p></>}</div><input ref={inp} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files)}/>{!value&&<input placeholder="Or paste image URL…" style={{width:"100%",marginTop:7,padding:"8px 12px",border:`1px solid ${T.border}`,borderRadius:7,fontSize:12,fontFamily:"inherit",color:T.ink,background:T.paper,outline:"none",boxSizing:"border-box"}} onChange={e=>e.target.value&&onChange(e.target.value)}/>}</div>;
}
function LangSwitcher() {
  const {lang,setLang}=useLang();
  return <div style={{display:"flex",gap:2,background:"rgba(255,255,255,.08)",borderRadius:8,padding:3,border:"1px solid rgba(255,255,255,.1)"}}>{["en","hi","mr"].map(c=><button key={c} onClick={()=>setLang(c)} style={{padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",transition:"all .14s",background:lang===c?T.amber:"transparent",color:lang===c?"#fff":"#8A7A5A"}}>{c.toUpperCase()}</button>)}</div>;
}
function ConfirmModal({title,msg,onConfirm,onCancel,yesLabel="Delete"}) {
  return <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(22,14,4,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)onCancel();}}><div style={{background:T.paper,borderRadius:18,padding:"34px 38px",maxWidth:420,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.3)",border:`1px solid ${T.border}`,animation:"popIn .2s ease"}}><div style={{width:50,height:50,borderRadius:"50%",background:"#FDEAEA",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:20}}>⚠️</div><h3 style={{fontSize:19,color:T.ink,textAlign:"center",margin:"0 0 10px",fontWeight:700}}>{title}</h3><p style={{fontSize:14,color:T.muted,textAlign:"center",lineHeight:1.65,margin:"0 0 26px"}}>{msg}</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><Btn variant="ghost" onClick={onCancel}>Cancel</Btn><Btn variant="danger" onClick={onConfirm}>{yesLabel}</Btn></div></div></div>;
}

// ── SOCIAL ICONS ──────────────────────────────────────────────────────────────
const SOCIAL_META = {
  facebook:  { label:"Facebook",   color:"#1877F2", bg:"#E7F0FD", icon:"f",  urlPrefix:"https://facebook.com/" },
  instagram: { label:"Instagram",  color:"#E1306C", bg:"#FCE8F0", icon:"📷", urlPrefix:"https://instagram.com/" },
  linkedin:  { label:"LinkedIn",   color:"#0A66C2", bg:"#E8F0FC", icon:"in", urlPrefix:"https://linkedin.com/in/" },
  twitter:   { label:"X / Twitter",color:"#000000", bg:"#F0F0F0", icon:"𝕏",  urlPrefix:"https://twitter.com/" },
  whatsapp:  { label:"WhatsApp",   color:"#25D366", bg:"#E8FDF0", icon:"💬", urlPrefix:"https://wa.me/" },
};
function SocialLinks({social={}}) {
  const filled=Object.entries(social).filter(([,v])=>v);
  if(!filled.length)return null;
  return <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{filled.map(([k,v])=>{const m=SOCIAL_META[k];if(!m)return null;const url=v.startsWith("http")?v:m.urlPrefix+v;return(<a key={k} href={url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,background:m.bg,color:m.color,textDecoration:"none",fontSize:12,fontWeight:700,border:`1px solid ${m.color}25`,transition:"all .14s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}><span style={{fontSize:12,fontWeight:900}}>{m.icon}</span>{m.label}</a>);})}</div>;
}

// ── PHOTO LIGHTBOX ────────────────────────────────────────────────────────────
function PhotoGallery({photos=[],onAddPhoto,onRemovePhoto,editable=false}) {
  const [light,setLight]=useState(null);
  const inp=useRef();
  const handleAdd=async files=>{const f=files[0];if(!f||!f.type.startsWith("image/"))return;const b64=await readFile(f);onAddPhoto(b64);};
  return(
    <div>
      {photos.length===0&&!editable&&<p style={{fontSize:13,color:T.faint,fontStyle:"italic"}}>No photos yet.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8}}>
        {photos.map((p,i)=><div key={i} style={{position:"relative",aspectRatio:"1",borderRadius:10,overflow:"hidden",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.1)"}} onClick={()=>setLight(i)}><img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>{editable&&<button onClick={e=>{e.stopPropagation();onRemovePhoto(i);}} style={{position:"absolute",top:4,right:4,width:20,height:20,borderRadius:"50%",background:"rgba(0,0,0,.6)",border:"none",color:"#fff",cursor:"pointer",fontSize:12,lineHeight:1}}>×</button>}</div>)}
        {editable&&<div onClick={()=>inp.current.click()} style={{aspectRatio:"1",borderRadius:10,border:`2px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:T.surface,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.amberPale} onMouseLeave={e=>e.currentTarget.style.background=T.surface}><div style={{fontSize:22,opacity:.4}}>+</div><p style={{fontSize:10,color:T.faint,margin:0}}>Add Photo</p></div>}
      </div>
      <input ref={inp} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleAdd(e.target.files)}/>
      {light!==null&&<div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setLight(null)}>
        <button style={{position:"absolute",top:20,right:24,background:"none",border:"none",color:"#fff",fontSize:32,cursor:"pointer",lineHeight:1}} onClick={()=>setLight(null)}>×</button>
        {light>0&&<button style={{position:"absolute",left:20,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:28,cursor:"pointer",borderRadius:"50%",width:48,height:48}} onClick={e=>{e.stopPropagation();setLight(l=>l-1);}}>‹</button>}
        <img src={photos[light]} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:10}}/>
        {light<photos.length-1&&<button style={{position:"absolute",right:20,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:28,cursor:"pointer",borderRadius:"50%",width:48,height:48}} onClick={e=>{e.stopPropagation();setLight(l=>l+1);}}>›</button>}
        <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,.5)",fontSize:12}}>{light+1} / {photos.length}</div>
      </div>}
    </div>
  );
}

// ── EDUCATION TIMELINE ────────────────────────────────────────────────────────
function EducationSection({education=[],editable=false,onChange}) {
  const {t}=useLang();
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({institution:"",degree:"",field:"",year:""});
  const add=()=>{if(!form.institution&&!form.degree)return;onChange([...education,{...form,id:uid()}]);setForm({institution:"",degree:"",field:"",year:""});setAdding(false);};
  const remove=id=>onChange(education.filter(e=>e.id!==id));
  if(!education.length&&!editable)return null;
  return(
    <div>
      {education.map((e,i)=>(
        <div key={e.id||i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12,paddingBottom:12,borderBottom:i<education.length-1?`1px solid ${T.border}`:"none"}}>
          <div style={{width:36,height:36,borderRadius:8,background:`${T.teal}15`,border:`1px solid ${T.teal}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>🎓</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{e.degree}{e.field?` in ${e.field}`:""}</div>
            <div style={{fontSize:12,color:T.muted}}>{e.institution}</div>
            {e.year&&<div style={{fontSize:11,color:T.faint,marginTop:2}}>Class of {e.year}</div>}
          </div>
          {editable&&<button onClick={()=>remove(e.id||i)} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:16,lineHeight:1,padding:4}}>×</button>}
        </div>
      ))}
      {editable&&!adding&&<button onClick={()=>setAdding(true)} style={{background:"none",border:`1.5px dashed ${T.border}`,borderRadius:8,padding:"8px 14px",fontSize:12,color:T.muted,cursor:"pointer",fontFamily:"inherit",width:"100%",marginTop:4,transition:"all .14s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.amber} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>{t("addEducation")}</button>}
      {editable&&adding&&<div style={{background:T.surface,borderRadius:10,padding:"14px 16px",marginTop:8}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <div style={{gridColumn:"1/-1"}}><Inp label={t("institution")} value={form.institution} onChange={e=>setForm(x=>({...x,institution:e.target.value}))} placeholder="e.g. IIT Delhi"/></div>
          <Inp label={t("degree")} value={form.degree} onChange={e=>setForm(x=>({...x,degree:e.target.value}))} placeholder="e.g. B.Tech"/>
          <Inp label={t("fieldStudy")} value={form.field} onChange={e=>setForm(x=>({...x,field:e.target.value}))} placeholder="e.g. Computer Science"/>
          <Inp label={t("gradYear")} value={form.year} onChange={e=>setForm(x=>({...x,year:e.target.value}))} placeholder="e.g. 2002" style={{maxWidth:120}}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:4}}><Btn variant="amber" size="sm" onClick={add}>Add</Btn><Btn variant="ghost" size="sm" onClick={()=>setAdding(false)}>Cancel</Btn></div>
      </div>}
    </div>
  );
}

// ── LANDING ───────────────────────────────────────────────────────────────────
function Landing({onLogin,onSignup}) {
  const {t}=useLang();
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(155deg,#0E2018 0%,${T.forest} 50%,#2A5040 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:.03,backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",backgroundSize:"36px 36px"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,borderRadius:"50%",border:`1px solid ${T.amber}15`,pointerEvents:"none"}}/>
      <div style={{textAlign:"center",maxWidth:580,position:"relative",zIndex:1}}>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:86,height:86,borderRadius:"50%",border:`2px solid ${T.amber}45`,background:`${T.amber}12`,marginBottom:20,fontSize:42,animation:"treeSway 4s ease-in-out infinite"}}>🌳</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:14}}><div style={{width:44,height:1,background:`${T.amber}45`}}/><span style={{fontSize:9,letterSpacing:"0.2em",color:`${T.amberMid}70`,textTransform:"uppercase"}}>Family Legacy</span><div style={{width:44,height:1,background:`${T.amber}45`}}/></div>
        <h1 style={{fontSize:"clamp(34px,5vw,58px)",color:T.amberMid,margin:"0 0 12px",fontWeight:700,lineHeight:1.1}}>{t("appName")}</h1>
        <p style={{color:"#7AAA8A",fontSize:15,lineHeight:1.9,maxWidth:420,margin:"0 auto 10px",fontStyle:"italic"}}>Profiles · Photos · Stories · Chat · Calendar</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
          {["📱 Social Profiles","🎓 Education","📸 Galleries","📅 Calendar","💬 Family Chat"].map(f=><span key={f} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#7AAA8A",fontSize:11,padding:"4px 11px",borderRadius:20}}>{f}</span>)}
        </div>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
          <Btn variant="amber" onClick={onSignup} size="lg" style={{letterSpacing:"0.08em"}}>Begin Your Journey</Btn>
          <Btn onClick={onLogin} size="lg" style={{background:"rgba(255,255,255,.07)",color:T.amberMid,border:`1.5px solid ${T.amber}35`,boxShadow:"none"}}>Sign In</Btn>
        </div>
        <LangSwitcher/>
      </div>
      <style>{`@keyframes treeSway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}`}</style>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthWrap({children,title,sub}) {
  return <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{background:T.paper,borderRadius:20,padding:"44px 40px",width:"100%",maxWidth:430,boxShadow:"0 28px 70px rgba(28,56,41,.14)",border:`1px solid ${T.border}`}}><div style={{textAlign:"center",marginBottom:28}}><div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:52,height:52,borderRadius:"50%",border:`1.5px solid ${T.amber}50`,background:T.amberPale,marginBottom:12,fontSize:24}}>🌳</div><h2 style={{fontSize:24,color:T.ink,margin:"0 0 4px",fontWeight:700}}>{title}</h2><p style={{color:T.muted,fontSize:13,margin:0,fontStyle:"italic"}}>{sub}</p></div>{children}<div style={{marginTop:18,display:"flex",justifyContent:"center"}}><LangSwitcher/></div></div></div>;
}
function LoginPage({onLogin,onSwitch,onBack}) {
  const {t}=useLang(); const [e,sE]=useState(""); const [p,sP]=useState(""); const [err,sErr]=useState("");
  return <AuthWrap title="Welcome Back" sub="Sign in to your family tree">{err&&<div style={{background:"#FDE8E8",border:`1px solid ${T.error}40`,borderRadius:8,padding:"9px 13px",fontSize:13,color:T.error,marginBottom:14}}>{err}</div>}<Inp label="Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/><Inp label="Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="••••••••"/><Btn variant="amber" onClick={()=>onLogin(e,p,sErr)} style={{width:"100%",padding:13,fontSize:14,marginTop:4,justifyContent:"center",letterSpacing:"0.07em"}}>SIGN IN</Btn><div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted}}>New here? <button onClick={onSwitch} style={{background:"none",border:"none",color:T.forestLight,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>Create account →</button></div><button onClick={onBack} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:12,display:"block",margin:"10px auto 0",fontFamily:"inherit"}}>← Back to home</button></AuthWrap>;
}
function SignupPage({onSignup,onSwitch,onBack}) {
  const {t}=useLang(); const [n,sN]=useState(""); const [e,sE]=useState(""); const [p,sP]=useState(""); const [inv,sInv]=useState(""); const [err,sErr]=useState("");
  return <AuthWrap title="Join the Family" sub="Create your account">{err&&<div style={{background:"#FDE8E8",border:`1px solid ${T.error}40`,borderRadius:8,padding:"9px 13px",fontSize:13,color:T.error,marginBottom:14}}>{err}</div>}<Inp label="Full Name" value={n} onChange={ev=>sN(ev.target.value)} placeholder="Your name"/><Inp label="Email" type="email" value={e} onChange={ev=>sE(ev.target.value)} placeholder="your@email.com"/><Inp label="Password" type="password" value={p} onChange={ev=>sP(ev.target.value)} placeholder="Choose a password"/><Inp label="Invite Code (optional)" value={inv} onChange={ev=>sInv(ev.target.value)} placeholder="fam-xxxxxxxx"/><Btn variant="amber" onClick={()=>onSignup(n,e,p,inv,sErr)} style={{width:"100%",padding:13,fontSize:14,marginTop:4,justifyContent:"center",letterSpacing:"0.07em"}}>CREATE ACCOUNT</Btn><div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted}}>Already a member? <button onClick={onSwitch} style={{background:"none",border:"none",color:T.forestLight,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>Sign in →</button></div><button onClick={onBack} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:12,display:"block",margin:"10px auto 0",fontFamily:"inherit"}}>← Back</button></AuthWrap>;
}

// ── SHELL ─────────────────────────────────────────────────────────────────────
function Shell({user,view,setView,onLogout,isAdmin,children}) {
  const {t}=useLang();
  const nav=[{id:"home",label:t("home")},{id:"tree",label:t("tree")},{id:"timeline",label:t("timeline")},{id:"channel",label:t("channel")},{id:"search",label:t("search")},{id:"calendar",label:t("calendar")},{id:"chat",label:t("chat")}];
  return(
    <div style={{minHeight:"100vh",background:T.bg}}>
      <nav style={{background:T.forest,height:58,padding:"0 18px",display:"flex",alignItems:"center",gap:4,boxShadow:"0 2px 0 rgba(200,160,60,.18),0 4px 20px rgba(0,0,0,.2)",position:"sticky",top:0,zIndex:200}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginRight:10,padding:0,flexShrink:0}}>
          <span style={{fontSize:20}}>🌳</span>
          <span style={{fontSize:16,color:T.amberMid,fontWeight:700,whiteSpace:"nowrap"}}>{t("appName")}</span>
        </button>
        <div style={{display:"flex",gap:1,flex:1,overflow:"auto"}}>
          {nav.map(it=><button key={it.id} onClick={()=>setView(it.id)} style={{background:view===it.id?`${T.amber}20`:"none",border:view===it.id?`1px solid ${T.amber}40`:"1px solid transparent",color:view===it.id?T.amberMid:"#7AAA8A",cursor:"pointer",padding:"5px 10px",borderRadius:7,fontSize:11,fontFamily:"inherit",letterSpacing:"0.04em",transition:"all .14s",whiteSpace:"nowrap"}}>{it.label}</button>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          <LangSwitcher/>
          <Btn variant="amber" onClick={()=>setView("addMember")} size="sm" style={{padding:"5px 12px",fontSize:11}}>+ Add</Btn>
          <button onClick={()=>setView("invite")} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#7AAA8A",cursor:"pointer",padding:"5px 9px",borderRadius:7,fontSize:11,fontFamily:"inherit"}}>Invite</button>
          {isAdmin&&<button onClick={()=>setView("admin")} style={{background:`${T.amber}18`,border:`1px solid ${T.amber}35`,color:T.amberMid,cursor:"pointer",padding:"5px 9px",borderRadius:7,fontSize:11,fontFamily:"inherit",fontWeight:700}}>🔒</button>}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:7,background:"rgba(255,255,255,.05)",cursor:"pointer"}} onClick={()=>setView("home")}><Avatar name={user.name} size={24}/><span style={{color:"#7AAA8A",fontSize:11,maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name.split(" ")[0]}</span></div>
          <button onClick={onLogout} style={{background:"none",border:"none",color:"#4A6A5A",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{t("signOut")}</button>
        </div>
      </nav>
      <div style={{padding:"24px 20px",maxWidth:1260,margin:"0 auto",animation:"fadeUp .3s ease"}}>{children}</div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomePage({members,user,setView,setSelected,isAdmin,events}) {
  const {t}=useLang();
  const today=new Date(); const todayStr=today.toISOString().slice(0,10);
  const upcomingEvents=events.filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  const oldest=[...members].filter(m=>m.birth).sort((a,b)=>parseInt(a.birth)-parseInt(b.birth))[0];
  const youngest=[...members].filter(m=>m.birth).sort((a,b)=>parseInt(b.birth)-parseInt(a.birth))[0];
  return(
    <div>
      <div style={{marginBottom:22}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h1 style={{fontSize:30,color:T.ink,margin:0,fontWeight:700}}>Welcome, {user.name.split(" ")[0]} 👋</h1></div><p style={{margin:"0 0 0 12px",fontSize:13,color:T.muted,fontStyle:"italic"}}>Your family story, all in one place</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:22}}>
        {[{ic:"👨‍👩‍👧‍👦",v:members.length,l:t("members"),c:T.forest},{ic:"🎓",v:members.filter(m=>m.education?.length).length,l:"Educated",c:T.teal},{ic:"🎬",v:members.filter(m=>ytId(m.youtube)).length,l:t("videos"),c:T.sage},{ic:"📅",v:upcomingEvents.length,l:"Upcoming",c:T.amber},{ic:"💬",v:(JSON.parse(localStorage.getItem(KEY.CHAT)||"[]")).length,l:"Messages",c:T.plum}].map(s=><div key={s.l} style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 14px",textAlign:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",bottom:-12,right:-8,fontSize:40,opacity:.04}}>{s.ic}</div><div style={{fontSize:20,marginBottom:4}}>{s.ic}</div><div style={{fontSize:28,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:10,color:T.muted,marginTop:3,letterSpacing:"0.06em",textTransform:"uppercase"}}>{s.l}</div></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <Card style={{padding:"20px 22px"}}>
          <h3 style={{fontSize:13,color:T.ink,margin:"0 0 14px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>🏆 Highlights</h3>
          {[oldest&&{label:"Oldest Root",m:oldest,ic:"🌳"},youngest&&{label:"Newest Branch",m:youngest,ic:"🌱"}].filter(Boolean).map(({label,m,ic})=><div key={label} onClick={()=>{setSelected(m);setView("profile");}} style={{display:"flex",gap:11,alignItems:"center",padding:"8px 9px",borderRadius:9,cursor:"pointer",marginBottom:6,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Avatar name={m.name} photo={m.photo} size={38} accent={accentFor(m.name)}/><div><div style={{fontSize:10,color:T.faint,textTransform:"uppercase",letterSpacing:"0.07em"}}>{ic} {label}</div><div style={{fontSize:14,fontWeight:700,color:T.ink}}>{m.name}</div><div style={{fontSize:11,color:T.muted}}>b. {m.birth}</div></div></div>)}
        </Card>
        <Card style={{padding:"20px 22px"}}>
          <h3 style={{fontSize:13,color:T.ink,margin:"0 0 14px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>📅 Coming Up</h3>
          {upcomingEvents.length===0?<p style={{fontSize:13,color:T.faint,fontStyle:"italic"}}>No upcoming events.</p>
          :upcomingEvents.map(ev=><div key={ev.id} style={{display:"flex",gap:10,alignItems:"center",marginBottom:9,padding:"7px 9px",borderRadius:8,background:T.surface}}><div style={{textAlign:"center",minWidth:36,background:T.amberPale,borderRadius:7,padding:"4px 6px"}}><div style={{fontSize:14,fontWeight:700,color:T.amber,lineHeight:1}}>{new Date(ev.date).getDate()}</div><div style={{fontSize:9,color:T.amber,textTransform:"uppercase"}}>{new Date(ev.date).toLocaleDateString("en",{month:"short"})}</div></div><div><div style={{fontSize:13,fontWeight:700,color:T.ink}}>{ev.title}</div><div style={{fontSize:10,color:T.muted}}>{ev.type}</div></div></div>)}
          <button onClick={()=>setView("calendar")} style={{background:"none",border:"none",color:T.forestLight,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,padding:0,marginTop:4}}>View calendar →</button>
        </Card>
      </div>
      <div style={{background:T.forest,borderRadius:14,padding:"22px 26px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",boxShadow:"0 8px 32px rgba(28,56,41,.22)"}}>
        <div style={{width:2,height:36,background:T.amber,borderRadius:1,flexShrink:0}}/>
        <div style={{flex:1,minWidth:180}}><p style={{fontSize:16,color:T.amberMid,margin:"0 0 3px",fontWeight:700}}>Grow Your Tree</p><p style={{color:"#4A7A5A",fontSize:12,margin:0,fontStyle:"italic"}}>Add members, share stories and connect generations</p></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn variant="amber" onClick={()=>setView("addMember")} size="sm">+ Member</Btn>
          <Btn size="sm" onClick={()=>setView("chat")} style={{background:`${T.amber}18`,color:T.amberMid,border:`1px solid ${T.amber}35`}}>💬 Chat</Btn>
          <Btn size="sm" onClick={()=>setView("calendar")} style={{background:`${T.amber}18`,color:T.amberMid,border:`1px solid ${T.amber}35`}}>📅 Calendar</Btn>
          {isAdmin&&<Btn size="sm" onClick={()=>setView("admin")} style={{background:`${T.amber}18`,color:T.amberMid,border:`1px solid ${T.amber}35`}}>🔒 Admin</Btn>}
        </div>
      </div>
    </div>
  );
}

// ── FAMILY CALENDAR ───────────────────────────────────────────────────────────
const EVENT_COLORS={birthday:T.amber,anniversary:T.plum,gathering:T.sage,festival:T.teal,other:T.muted};
function CalendarView({events,onAddEvent,onDeleteEvent,user}) {
  const {t}=useLang();
  const now=new Date(); const [year,setYear]=useState(now.getFullYear()); const [month,setMonth]=useState(now.getMonth());
  const [showForm,setShowForm]=useState(false); const [selDate,setSelDate]=useState(null);
  const [form,setForm]=useState({title:"",date:"",type:"birthday",desc:""});
  const [confirm,setConfirm]=useState(null);
  const monthName=new Date(year,month).toLocaleDateString("en",{month:"long",year:"numeric"});
  const firstDay=new Date(year,month,1).getDay(); const daysInMonth=new Date(year,month+1,0).getDate();
  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);};
  const eventsThisMonth=events.filter(e=>{const d=new Date(e.date);return d.getFullYear()===year&&d.getMonth()===month;});
  const eventsOnDay=d=>eventsThisMonth.filter(e=>new Date(e.date).getDate()===d);
  const todayStr=now.toISOString().slice(0,10);
  const addEvent=()=>{if(!form.title||!form.date)return;onAddEvent({...form,id:uid(),addedBy:user.name});setShowForm(false);setForm({title:"",date:"",type:"birthday",desc:""});};
  const selectedEvents=selDate?eventsOnDay(selDate):[];
  return(
    <div>
      <SecHead action={<Btn variant="amber" size="sm" onClick={()=>{setShowForm(true);setForm(f=>({...f,date:selDate?`${year}-${String(month+1).padStart(2,"0")}-${String(selDate).padStart(2,"0")}`:todayStr}));}}>{t("addEvent")}</SecHead>}>{t("cal_title")}</SecHead>
      {showForm&&<Card style={{padding:"22px 24px",marginBottom:18}} hover={false}>
        <h3 style={{fontSize:15,color:T.ink,margin:"0 0 16px",fontWeight:700}}>New Event</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
          <div style={{gridColumn:"1/-1"}}><Inp label={t("eventTitle")} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Grandpa's birthday"/></div>
          <Inp label={t("eventDate")} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          <div style={{marginBottom:14}}><label style={{display:"block",marginBottom:4,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>{t("eventType")}</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:13,fontFamily:"inherit",outline:"none"}}>{Object.keys(EVENT_COLORS).map(k=><option key={k} value={k}>{t(k)}</option>)}</select></div>
          <div style={{gridColumn:"1/-1"}}><TA label={t("eventDesc")} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Optional description…" style={{minHeight:60}}/></div>
        </div>
        <div style={{display:"flex",gap:8}}><Btn variant="amber" size="sm" onClick={addEvent}>Save Event</Btn><Btn variant="ghost" size="sm" onClick={()=>setShowForm(false)}>{t("cancel")}</Btn></div>
      </Card>}
      {confirm&&<ConfirmModal title="Delete Event?" msg={`Remove "${confirm.title}"?`} onConfirm={()=>{onDeleteEvent(confirm.id);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:18,alignItems:"start"}}>
        {/* Calendar Grid */}
        <Card hover={false} style={{padding:"22px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <button onClick={prevMonth} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:14,color:T.ink,fontFamily:"inherit"}}>‹</button>
            <span style={{fontSize:16,fontWeight:700,color:T.ink}}>{monthName}</span>
            <button onClick={nextMonth} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:14,color:T.ink,fontFamily:"inherit"}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.06em",padding:"4px 0"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {Array.from({length:firstDay},(_,i)=><div key={"e"+i}/>)}
            {Array.from({length:daysInMonth},(_,i)=>{
              const day=i+1; const dayStr=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const dayEvs=eventsOnDay(day); const isToday=dayStr===todayStr; const isSel=selDate===day;
              return<div key={day} onClick={()=>setSelDate(isSel?null:day)} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"5px 2px",borderRadius:8,cursor:"pointer",background:isSel?T.forest:isToday?T.amberPale:"transparent",border:isSel?`1px solid ${T.amber}`:isToday?`1px solid ${T.amber}50`:`1px solid transparent`,transition:"all .14s"}} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=T.surface;}} onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background=isToday?T.amberPale:"transparent";}}>
                <span style={{fontSize:13,fontWeight:isToday||isSel?700:400,color:isSel?"#fff":isToday?T.amber:T.ink}}>{day}</span>
                <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center",marginTop:2}}>{dayEvs.slice(0,3).map((ev,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:EVENT_COLORS[ev.type]||T.amber}}/>)}</div>
              </div>;
            })}
          </div>
        </Card>
        {/* Side panel */}
        <div>
          {selDate&&<div style={{marginBottom:16}}>
            <h3 style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:10}}>{new Date(year,month,selDate).toLocaleDateString("en",{weekday:"long",day:"numeric",month:"long"})}</h3>
            {selectedEvents.length===0?<p style={{fontSize:13,color:T.faint,fontStyle:"italic"}}>{t("noEvents")}</p>
            :selectedEvents.map(ev=><Card key={ev.id} style={{padding:"12px 16px",marginBottom:8,borderLeft:`3px solid ${EVENT_COLORS[ev.type]||T.amber}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontSize:14,fontWeight:700,color:T.ink}}>{ev.title}</div>{ev.desc&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>{ev.desc}</div>}<div style={{fontSize:10,color:T.faint,marginTop:4}}>Added by {ev.addedBy}</div></div>
                <button onClick={()=>setConfirm(ev)} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:16,lineHeight:1,padding:2}}>×</button>
              </div>
            </Card>)}
            <button onClick={()=>{setShowForm(true);setForm(f=>({...f,date:`${year}-${String(month+1).padStart(2,"0")}-${String(selDate).padStart(2,"0")}`}));}} style={{background:"none",border:`1.5px dashed ${T.border}`,borderRadius:8,padding:"8px 14px",fontSize:12,color:T.muted,cursor:"pointer",fontFamily:"inherit",width:"100%",marginTop:4}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.amber} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>+ Add event on this day</button>
          </div>}
          <h3 style={{fontSize:13,fontWeight:700,color:T.ink,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:"0.07em"}}>This Month</h3>
          {eventsThisMonth.length===0?<p style={{fontSize:13,color:T.faint,fontStyle:"italic"}}>{t("noEvents")}</p>
          :eventsThisMonth.sort((a,b)=>a.date.localeCompare(b.date)).map(ev=><div key={ev.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 10px",borderRadius:9,marginBottom:6,background:T.paper,border:`1px solid ${T.border}`,cursor:"pointer"}} onClick={()=>setSelDate(new Date(ev.date).getDate())}>
            <div style={{width:8,height:8,borderRadius:"50%",background:EVENT_COLORS[ev.type]||T.amber,flexShrink:0}}/>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.ink}}>{ev.title}</div><div style={{fontSize:10,color:T.muted}}>{fmtDate(ev.date)}</div></div>
          </div>)}
        </div>
      </div>
    </div>
  );
}

// ── FAMILY CHAT ───────────────────────────────────────────────────────────────
function ChatView({user,members}) {
  const {t}=useLang();
  const [msgs,setMsgs]=useState(()=>JSON.parse(localStorage.getItem(KEY.CHAT)||"[]"));
  const [input,setInput]=useState(""); const [replyTo,setReplyTo]=useState(null);
  const endRef=useRef(); const channelRef=useRef(null);

  useEffect(()=>{
    try { channelRef.current=new BroadcastChannel("ft6_chat"); channelRef.current.onmessage=e=>{setMsgs(e.data);}; } catch(e){}
    return()=>{try{channelRef.current?.close();}catch(e){}};
  },[]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send=()=>{
    if(!input.trim())return;
    const msg={id:uid(),text:input.trim(),sender:user.name,senderId:user.id,time:new Date().toISOString(),replyTo:replyTo?{id:replyTo.id,text:replyTo.text,sender:replyTo.sender}:null};
    const updated=[...msgs,msg];
    setMsgs(updated); localStorage.setItem(KEY.CHAT,JSON.stringify(updated));
    try{channelRef.current?.postMessage(updated);}catch(e){}
    setInput(""); setReplyTo(null);
  };

  const addReaction=(msgId,emoji)=>{
    const updated=msgs.map(m=>{
      if(m.id!==msgId)return m;
      const reactions={...(m.reactions||{})};
      const existing=(reactions[emoji]||[]);
      if(existing.includes(user.id)) reactions[emoji]=existing.filter(x=>x!==user.id);
      else reactions[emoji]=[...existing,user.id];
      if(!reactions[emoji].length)delete reactions[emoji];
      return{...m,reactions};
    });
    setMsgs(updated); localStorage.setItem(KEY.CHAT,JSON.stringify(updated));
    try{channelRef.current?.postMessage(updated);}catch(e){}
  };

  const deleteMsg=id=>{
    const updated=msgs.filter(m=>m.id!==id);
    setMsgs(updated); localStorage.setItem(KEY.CHAT,JSON.stringify(updated));
    try{channelRef.current?.postMessage(updated);}catch(e){}
  };

  const groupByDate=msgs.reduce((acc,m)=>{const d=m.time.slice(0,10);if(!acc[d])acc[d]=[];acc[d].push(m);return acc;},{});
  const EMOJIS=["❤️","😂","👍","🙏","😢","🎉"];

  return(
    <div style={{maxWidth:760,margin:"0 auto"}}>
      <SecHead sub={`${members.length} family members · Messages stored on your device`}>{t("chat_title")}</SecHead>
      <div style={{background:T.paper,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden",boxShadow:"0 4px 20px rgba(28,56,41,.08)"}}>
        {/* Messages */}
        <div style={{height:480,overflowY:"auto",padding:"16px 18px"}}>
          {msgs.length===0&&<div style={{textAlign:"center",paddingTop:80,color:T.faint}}><div style={{fontSize:48,marginBottom:12,opacity:.3}}>💬</div><p style={{fontStyle:"italic"}}>Start the family conversation!</p></div>}
          {Object.entries(groupByDate).map(([date,dayMsgs])=>(
            <div key={date}>
              <div style={{display:"flex",alignItems:"center",gap:10,margin:"12px 0 10px"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontSize:10,color:T.faint,padding:"2px 10px",background:T.surface,borderRadius:20,whiteSpace:"nowrap"}}>{fmtDate(date)}</span><div style={{flex:1,height:1,background:T.border}}/></div>
              {dayMsgs.map(m=>{
                const isMe=m.senderId===user.id;
                return(
                  <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",marginBottom:10,gap:8,alignItems:"flex-end"}}>
                    {!isMe&&<Avatar name={m.sender} size={28} style={{flexShrink:0,marginBottom:4}}/>}
                    <div style={{maxWidth:"70%"}}>
                      {!isMe&&<div style={{fontSize:10,fontWeight:700,color:accentFor(m.sender),marginBottom:3,marginLeft:4}}>{m.sender}</div>}
                      {m.replyTo&&<div style={{background:isMe?`${T.forestLight}30`:T.surface,borderRadius:"8px 8px 0 0",padding:"5px 10px",fontSize:11,color:T.muted,borderLeft:`2px solid ${T.amber}`,marginBottom:-2}}><span style={{fontWeight:700}}>{m.replyTo.sender}: </span>{m.replyTo.text.slice(0,60)}{m.replyTo.text.length>60?"…":""}</div>}
                      <div style={{background:isMe?T.forest:T.surface,color:isMe?"#E8F5E0":T.ink,borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"10px 14px",fontSize:14,lineHeight:1.5,position:"relative",wordBreak:"break-word"}}>
                        {m.text}
                        <div style={{fontSize:9,color:isMe?"rgba(255,255,255,.4)":T.faint,marginTop:4,textAlign:"right"}}>{new Date(m.time).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}</div>
                      </div>
                      {/* Reactions */}
                      {m.reactions&&Object.keys(m.reactions).length>0&&<div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap",justifyContent:isMe?"flex-end":"flex-start"}}>
                        {Object.entries(m.reactions).map(([emoji,users])=>users.length>0&&<button key={emoji} onClick={()=>addReaction(m.id,emoji)} style={{background:users.includes(user.id)?T.amberPale:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"2px 7px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{emoji} {users.length}</button>)}
                      </div>}
                      {/* Quick reactions + reply */}
                      <div style={{display:"flex",gap:3,marginTop:3,justifyContent:isMe?"flex-end":"flex-start",opacity:.5}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity=".5"} style={{transition:"opacity .15s",display:"flex",gap:3,marginTop:3,justifyContent:isMe?"flex-end":"flex-start"}}>
                        {EMOJIS.map(em=><button key={em} onClick={()=>addReaction(m.id,em)} style={{background:"none",border:"none",fontSize:13,cursor:"pointer",padding:"1px 3px",borderRadius:6,transition:"transform .1s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.3)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{em}</button>)}
                        <button onClick={()=>setReplyTo(m)} style={{background:"none",border:"none",fontSize:11,cursor:"pointer",color:T.muted,padding:"1px 4px",fontFamily:"inherit"}}>↩</button>
                        {isMe&&<button onClick={()=>deleteMsg(m.id)} style={{background:"none",border:"none",fontSize:11,cursor:"pointer",color:T.faint,padding:"1px 4px",fontFamily:"inherit"}}>🗑</button>}
                      </div>
                    </div>
                    {isMe&&<Avatar name={m.sender} size={28} style={{flexShrink:0,marginBottom:4}}/>}
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={endRef}/>
        </div>
        {/* Reply preview */}
        {replyTo&&<div style={{background:T.amberPale,padding:"8px 16px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,fontSize:12,color:T.muted}}><span style={{fontWeight:700,color:T.amber}}>{replyTo.sender}:</span> {replyTo.text.slice(0,60)}</div>
          <button onClick={()=>setReplyTo(null)} style={{background:"none",border:"none",fontSize:16,color:T.muted,cursor:"pointer",lineHeight:1}}>×</button>
        </div>}
        {/* Input */}
        <div style={{padding:"12px 14px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"flex-end"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={t("typeMsg")} style={{flex:1,padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,fontFamily:"inherit",outline:"none",resize:"none",maxHeight:100,minHeight:40,lineHeight:1.5}} onFocus={e=>e.target.style.borderColor=T.amber} onBlur={e=>e.target.style.borderColor=T.border}/>
          <Btn variant="amber" onClick={send} style={{padding:"10px 16px",flexShrink:0,alignSelf:"flex-end"}}>{t("send")} ↑</Btn>
        </div>
        <div style={{padding:"6px 16px 10px",fontSize:10,color:T.faint,fontStyle:"italic"}}>💡 Chat is stored locally on this device. For real-time sync across devices, connect Firebase.</div>
      </div>
    </div>
  );
}

// ── PROFILE VIEW (enhanced) ───────────────────────────────────────────────────
function ProfileView({member,members,onEdit,onSelectMember,onUpdateMember}) {
  const {t}=useLang(); if(!member)return null;
  const m=member; const acc=accentFor(m.name);
  const parents=members.filter(x=>m.parents?.includes(x.id));
  const children=members.filter(x=>m.children?.includes(x.id));
  const spouse=members.find(x=>x.id===m.spouse);
  const vid=ytId(m.youtube); const sb=m.scrapbook||{};
  const educ=m.education||[]; const gallery=m.gallery||[];
  const social=m.social||{};

  const addPhoto=async(b64)=>{onUpdateMember(m.id,{gallery:[...(m.gallery||[]),b64]});};
  const removePhoto=i=>{const g=[...(m.gallery||[])];g.splice(i,1);onUpdateMember(m.id,{gallery:g});};

  const Section=({title,children:ch,style={}})=><Card style={{padding:"18px 22px",marginBottom:12,...style}} hover={false}><h3 style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.12em",textTransform:"uppercase",margin:"0 0 14px"}}>{title}</h3>{ch}</Card>;

  return(
    <div style={{maxWidth:880,margin:"0 auto"}}>
      <button onClick={()=>onSelectMember(null)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,marginBottom:14,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>{t("back")}</button>
      {/* Hero */}
      <Card style={{padding:"28px 32px",marginBottom:12,borderLeft:`3px solid ${acc}`}} hover={false}>
        <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>
          <Avatar name={m.name} photo={m.photo} size={106} accent={acc} style={{boxShadow:`0 6px 22px ${acc}30`}}/>
          <div style={{flex:1,minWidth:220}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{m.badge&&<Chip color={acc}>{m.badge}</Chip>}{m.youtube&&<Chip color={T.sage}>▶ Video</Chip>}{m.death&&<Chip color={T.muted}>{t("inMemoriam")}</Chip>}</div>
            <h1 style={{fontSize:30,color:T.ink,margin:"0 0 5px",fontWeight:700,lineHeight:1.15}}>{m.name}</h1>
            <p style={{margin:"0 0 8px",fontSize:13,color:T.muted}}>{m.birth&&`${t("born")} ${m.birth}`}{m.death?` · ${t("died")} ${m.death}`:m.birth?` · ${t("living")}`:""}{sb.occupation?` · ${sb.occupation}`:""}{sb.city?` · ${sb.city}`:""}</p>
            {m.bio&&<blockquote style={{margin:"0 0 12px",padding:"10px 14px",borderLeft:`2px solid ${acc}`,background:`${acc}08`,borderRadius:"0 8px 8px 0",fontStyle:"italic",color:T.text,fontSize:13,lineHeight:1.7}}>{m.bio}</blockquote>}
            <SocialLinks social={social}/>
            <div style={{marginTop:12}}><Btn variant="outline" onClick={()=>onEdit(m)} size="sm" style={{letterSpacing:"0.07em"}}>{t("editProfile")}</Btn></div>
          </div>
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {/* Relations */}
        {parents.length>0&&<Section title={t("parentsSection")}>{parents.map(p=><div key={p.id} onClick={()=>onSelectMember(p)} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 8px",borderRadius:8,cursor:"pointer",marginBottom:4,transition:"background .14s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Avatar name={p.name} photo={p.photo} size={34} accent={accentFor(p.name)}/><div><div style={{fontSize:14,fontWeight:700,color:T.ink}}>{p.name}</div><div style={{fontSize:11,color:T.muted}}>{p.birth}</div></div></div>)}</Section>}
        {spouse&&<Section title={t("spouseSection")}><div onClick={()=>onSelectMember(spouse)} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 8px",borderRadius:8,cursor:"pointer",transition:"background .14s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Avatar name={spouse.name} photo={spouse.photo} size={42} accent={accentFor(spouse.name)}/><div><div style={{fontSize:15,fontWeight:700,color:T.ink}}>{spouse.name}</div><div style={{fontSize:11,color:T.muted}}>{spouse.birth}</div></div></div></Section>}
        {children.length>0&&<Section title={`${t("childrenSection")} (${children.length})`} style={{gridColumn:!parents.length&&!spouse?"1/-1":"auto"}}><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{children.map(c=><div key={c.id} onClick={()=>onSelectMember(c)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 11px",borderRadius:8,border:`1px solid ${T.border}`,cursor:"pointer",transition:"all .14s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=accentFor(c.name);e.currentTarget.style.background=T.surface;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="transparent";}}><Avatar name={c.name} photo={c.photo} size={28} accent={accentFor(c.name)}/><div><div style={{fontSize:12,fontWeight:700,color:T.ink}}>{c.name}</div><div style={{fontSize:10,color:T.muted}}>{c.birth}</div></div></div>)}</div></Section>}
      </div>

      {/* Scrapbook */}
      {(sb.occupation||sb.hometown||sb.city||sb.hobbies||sb.quote||sb.fact||sb.achievements)&&(
        <Section title={`📖 ${t("scrapbook")}`}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 20px"}}>
            {sb.occupation&&<div><span style={{fontSize:10,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.07em"}}>Occupation </span><span style={{fontSize:13,color:T.ink}}>{sb.occupation}</span></div>}
            {sb.hometown&&<div><span style={{fontSize:10,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.07em"}}>Hometown </span><span style={{fontSize:13,color:T.ink}}>{sb.hometown}</span></div>}
            {sb.city&&<div><span style={{fontSize:10,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.07em"}}>Lives In </span><span style={{fontSize:13,color:T.ink}}>{sb.city}</span></div>}
            {sb.hobbies&&<div style={{gridColumn:"1/-1"}}><span style={{fontSize:10,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.07em"}}>Hobbies </span><span style={{fontSize:13,color:T.ink}}>{sb.hobbies}</span></div>}
            {sb.achievements&&<div style={{gridColumn:"1/-1"}}><span style={{fontSize:10,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:"0.07em"}}>Achievements </span><span style={{fontSize:13,color:T.ink}}>{sb.achievements}</span></div>}
          </div>
          {sb.quote&&<blockquote style={{margin:"12px 0 0",padding:"10px 14px",borderLeft:`2px solid ${T.gold}`,background:`${T.gold}10`,borderRadius:"0 8px 8px 0",fontStyle:"italic",color:T.text,fontSize:13}}>"{sb.quote}"</blockquote>}
          {sb.fact&&<div style={{marginTop:8,padding:"8px 12px",background:T.surface,borderRadius:8,fontSize:12,color:T.muted}}>💡 {sb.fact}</div>}
        </Section>
      )}

      {/* Education */}
      {educ.length>0&&<Section title={`🎓 ${t("education")}`}><EducationSection education={educ}/></Section>}

      {/* Gallery */}
      {gallery.length>0&&<Section title={`📸 ${t("gallery")}`}><PhotoGallery photos={gallery} onAddPhoto={addPhoto} onRemovePhoto={removePhoto} editable={true}/></Section>}

      {/* Google Photos */}
      {m.googlePhotos&&<Section title={`🌐 ${t("googlePhotos")}`}><a href={m.googlePhotos} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:8,background:"#E8F0FE",color:"#1967D2",textDecoration:"none",fontSize:13,fontWeight:700,border:"1px solid #C5D4F5"}}><span>📷</span> Open Google Photos Album →</a></Section>}

      {/* Video */}
      {vid&&<Section title={`🎬 ${t("videoSection")}`}><div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:10,overflow:"hidden"}}><iframe src={`https://www.youtube.com/embed/${vid}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/></div></Section>}
    </div>
  );
}

// ── MEMBER FORM (enhanced) ────────────────────────────────────────────────────
function MemberForm({initial,members,onSubmit,onCancel,title}) {
  const {t}=useLang();
  const blank={name:"",birth:"",death:"",bio:"",photo:"",youtube:"",gender:"M",parents:[],children:[],spouse:"",badge:"",social:{facebook:"",instagram:"",linkedin:"",twitter:"",whatsapp:""},education:[],scrapbook:{occupation:"",hometown:"",city:"",hobbies:"",quote:"",fact:"",achievements:""},gallery:[],googlePhotos:""};
  const [f,setF]=useState(()=>({...blank,...initial,social:{...blank.social,...(initial?.social||{})},scrapbook:{...blank.scrapbook,...(initial?.scrapbook||{})},education:initial?.education||[],gallery:initial?.gallery||[]}));
  const [tab,setTab]=useState("basic");
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));
  const updS=(k,v)=>setF(x=>({...x,social:{...x.social,[k]:v}}));
  const updSB=(k,v)=>setF(x=>({...x,scrapbook:{...x.scrapbook,[k]:v}}));
  const togPar=id=>{const c=f.parents||[];upd("parents",c.includes(id)?c.filter(x=>x!==id):[...c,id]);};
  const others=members.filter(m=>m.id!==initial?.id);
  const BADGES=["","Patriarch","Matriarch","Engineer","Artist","Storyteller","Caregiver","Techie","Chef","Musician","Traveller","Teacher","Doctor","Farmer","Entrepreneur"];
  const TABS=["basic","social","education","scrapbook","gallery"];
  return(
    <div style={{maxWidth:740,margin:"0 auto"}}>
      <Card style={{padding:"32px 38px"}} hover={false}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:22}}><div style={{width:3,height:24,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:23,color:T.ink,margin:0,fontWeight:700}}>{title}</h2></div>
        {/* Tab bar */}
        <div style={{display:"flex",gap:0,marginBottom:24,background:T.surface,borderRadius:9,padding:3,border:`1px solid ${T.border}`,overflowX:"auto"}}>
          {TABS.map(tb=><button key={tb} onClick={()=>setTab(tb)} style={{padding:"7px 14px",borderRadius:7,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .14s",background:tab===tb?T.forest:"transparent",color:tab===tb?"#fff":T.muted,fontFamily:"inherit",whiteSpace:"nowrap"}}>{tb.charAt(0).toUpperCase()+tb.slice(1)}</button>)}
        </div>

        {tab==="basic"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
            <div style={{gridColumn:"1/-1"}}><Inp label="Full Name *" value={f.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Ramchandra Sharma"/></div>
            <Inp label="Birth Year" value={f.birth} onChange={e=>upd("birth",e.target.value)} placeholder="e.g. 1948"/>
            <Inp label="Death Year" value={f.death} onChange={e=>upd("death",e.target.value)} placeholder="Leave blank if living"/>
            <div style={{marginBottom:14}}><label style={{display:"block",marginBottom:4,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>Gender</label><div style={{display:"flex",gap:16}}>{[["M","Male"],["F","Female"],["O","Other"]].map(([v,l])=><label key={v} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,color:T.text}}><input type="radio" name="gen" value={v} checked={f.gender===v} onChange={()=>upd("gender",v)}/>{l}</label>)}</div></div>
            <div style={{marginBottom:14}}><label style={{display:"block",marginBottom:4,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>Badge</label><select value={f.badge||""} onChange={e=>upd("badge",e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:13,fontFamily:"inherit",outline:"none"}}>{BADGES.map(b=><option key={b} value={b}>{b||"No badge"}</option>)}</select></div>
            <div style={{gridColumn:"1/-1"}}><TA label="Biography / Story" value={f.bio} onChange={e=>upd("bio",e.target.value)} placeholder="Share their story…"/></div>
            <div style={{gridColumn:"1/-1"}}><PhotoUploader value={f.photo} onChange={v=>upd("photo",v)}/></div>
            <div style={{gridColumn:"1/-1"}}><Inp label="YouTube Video URL" value={f.youtube} onChange={e=>upd("youtube",e.target.value)} placeholder="https://www.youtube.com/watch?v=…"/></div>
          </div>
          {others.length>0&&<><div style={{marginBottom:14}}><label style={{display:"block",marginBottom:7,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>Parents</label><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{others.map(m=>{const sel=(f.parents||[]).includes(m.id);return<div key={m.id} onClick={()=>togPar(m.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:`1.5px solid ${sel?T.amber:T.border}`,background:sel?T.amberPale:T.surface,cursor:"pointer",fontSize:12,transition:"all .14s"}}><Avatar name={m.name} photo={m.photo} size={20} accent={accentFor(m.name)}/>{sel&&"✓ "}{m.name}</div>;})}        </div></div>
          <div style={{marginBottom:14}}><label style={{display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.09em",textTransform:"uppercase"}}>Spouse</label><select value={f.spouse} onChange={e=>upd("spouse",e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:8,background:T.paper,color:T.ink,fontSize:13,fontFamily:"inherit",outline:"none"}}><option value="">None</option>{others.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div></>}
        </div>}

        {tab==="social"&&<div>
          <p style={{fontSize:13,color:T.muted,fontStyle:"italic",marginBottom:18}}>Add social profile usernames or full URLs. These will appear as clickable links on the profile.</p>
          {Object.entries(SOCIAL_META).map(([k,meta])=><Inp key={k} label={`${meta.icon} ${meta.label}`} value={f.social[k]||""} onChange={e=>updS(k,e.target.value)} placeholder={`username or full URL`}/>)}
        </div>}

        {tab==="education"&&<div>
          <p style={{fontSize:13,color:T.muted,fontStyle:"italic",marginBottom:18}}>Add schools, colleges and degrees. Shows as an education timeline on the profile.</p>
          <EducationSection education={f.education||[]} editable={true} onChange={v=>upd("education",v)}/>
        </div>}

        {tab==="scrapbook"&&<div>
          <p style={{fontSize:13,color:T.muted,fontStyle:"italic",marginBottom:18}}>Personal details that make this person unique — shown in their scrapbook section.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>
            <Inp label={t("occupation")} value={f.scrapbook.occupation} onChange={e=>updSB("occupation",e.target.value)} placeholder="e.g. Schoolteacher"/>
            <Inp label={t("hometown")} value={f.scrapbook.hometown} onChange={e=>updSB("hometown",e.target.value)} placeholder="e.g. Agra"/>
            <Inp label={t("currentCity")} value={f.scrapbook.city} onChange={e=>updSB("city",e.target.value)} placeholder="e.g. Delhi"/>
            <Inp label={t("hobbies")} value={f.scrapbook.hobbies} onChange={e=>updSB("hobbies",e.target.value)} placeholder="e.g. Cricket, Reading"/>
            <div style={{gridColumn:"1/-1"}}><TA label={t("achievements")} value={f.scrapbook.achievements} onChange={e=>updSB("achievements",e.target.value)} placeholder="Notable achievements…" style={{minHeight:60}}/></div>
            <div style={{gridColumn:"1/-1"}}><TA label={t("favQuote")} value={f.scrapbook.quote} onChange={e=>updSB("quote",e.target.value)} placeholder="Their favourite quote or saying…" style={{minHeight:60}}/></div>
            <div style={{gridColumn:"1/-1"}}><Inp label={t("funFact")} value={f.scrapbook.fact} onChange={e=>updSB("fact",e.target.value)} placeholder="A fun or interesting fact about them"/></div>
            <div style={{gridColumn:"1/-1"}}><Inp label={t("googlePhotos")} value={f.googlePhotos||""} onChange={e=>upd("googlePhotos",e.target.value)} placeholder="https://photos.google.com/share/…" hint="Paste a shared Google Photos album link"/></div>
          </div>
        </div>}

        {tab==="gallery"&&<div>
          <p style={{fontSize:13,color:T.muted,fontStyle:"italic",marginBottom:18}}>Upload multiple photos to build this member's personal gallery. Visitors can browse them in a lightbox.</p>
          <PhotoGallery photos={f.gallery||[]} onAddPhoto={p=>upd("gallery",[...(f.gallery||[]),p])} onRemovePhoto={i=>{const g=[...(f.gallery||[])];g.splice(i,1);upd("gallery",g);}} editable={true}/>
        </div>}

        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
          <Btn variant="ghost" onClick={onCancel}>{t("cancel")}</Btn>
          <Btn variant="amber" onClick={()=>{if(!f.name.trim())return;onSubmit(f);}} style={{letterSpacing:"0.07em"}}>{t("saveToTree")}</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── TREE, SEARCH, TIMELINE, CHANNEL — compact versions ───────────────────────
function TreeView({members,computeLayout,onSelect,onExport}) {
  const {nodes,edges}=computeLayout(); const [hov,setHov]=useState(null);
  if(!nodes.length)return <div style={{textAlign:"center",padding:80,color:T.faint}}><div style={{fontSize:52,opacity:.2,marginBottom:12}}>🌳</div><p>Add the first family member to see the tree.</p></div>;
  const PAD=80,NW=162,NH=88;
  const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
  const minX=Math.min(...xs)-NW/2,maxX=Math.max(...xs)+NW/2;
  const minY=Math.min(...ys),maxY=Math.max(...ys)+NH;
  const svgW=maxX-minX+PAD*2,svgH=maxY-minY+PAD*2;
  return(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}><div><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:26,color:T.ink,margin:0,fontWeight:700}}>Family Tree</h2></div><p style={{margin:"3px 0 0 12px",fontSize:12,color:T.muted,fontStyle:"italic"}}>{members.length} members · Click to view profile</p></div><Btn variant="outline" onClick={onExport} size="sm">⬇ Export</Btn></div>
  <Card hover={false} style={{overflow:"auto",padding:4}}><svg width={Math.max(svgW,720)} height={svgH} style={{display:"block"}}><defs><pattern id="tg" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r=".8" fill={T.border} opacity=".5"/></pattern><filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(28,56,41,.13)"/></filter><filter id="hsh"><feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="rgba(201,107,26,.22)"/></filter></defs><rect width={Math.max(svgW,720)} height={svgH} fill="url(#tg)" opacity=".5"/>
  {edges.map((e,i)=>{const fx=e.from.x-minX+PAD,fy=e.from.y-minY+PAD+NH,tx=e.to.x-minX+PAD,ty=e.to.y-minY+PAD,my=(fy+ty)/2;return<path key={i} d={`M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}`} stroke={T.amber} strokeWidth={1.5} fill="none" strokeDasharray="6,5" opacity=".45"/>;})}{nodes.map(n=>{const nx=n.x-minX+PAD-NW/2,ny=n.y-minY+PAD;const isH=hov===n.id;const acc=accentFor(n.name);return(<g key={n.id} onClick={()=>onSelect(n)} onMouseEnter={()=>setHov(n.id)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}><rect x={nx} y={ny} width={NW} height={NH} rx={11} fill={isH?T.forest:T.paper} stroke={isH?T.amber:T.border} strokeWidth={isH?1.5:1} filter={isH?"url(#hsh)":"url(#sh)"}/><rect x={nx} y={ny} width={NW} height={3} rx={2} fill={acc}/><circle cx={nx+29} cy={ny+49} r={16} fill={`${acc}18`} stroke={acc} strokeWidth={isH?2:1}/><text x={nx+29} y={ny+54} textAnchor="middle" fontSize={10} fontWeight={700} fill={acc}>{initials(n.name)}</text><text x={nx+52} y={ny+28} fontSize={12} fontWeight={700} fill={isH?T.amberMid:T.ink}>{n.name.length>18?n.name.slice(0,17)+"…":n.name}</text><text x={nx+52} y={ny+46} fontSize={10} fill={isH?"#5A8A6A":T.muted}>{n.birth||"?"}{n.death?` – ${n.death}`:""}</text>{n.badge&&<text x={nx+52} y={ny+63} fontSize={9} fill={isH?`${acc}CC`:T.faint}>{n.badge}</text>}</g>);})}
  </svg></Card></div>);
}
function SearchView({members,onSelect}) {
  const [q,setQ]=useState("");
  const res=q.trim()?members.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())||m.bio?.toLowerCase().includes(q.toLowerCase())||m.scrapbook?.occupation?.toLowerCase().includes(q.toLowerCase())):members;
  return(<div><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:26,color:T.ink,margin:0,fontWeight:700}}>Search Members</h2></div><div style={{position:"relative",marginBottom:20}}><span style={{position:"absolute",left:15,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:.3}}>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, bio, occupation…" style={{width:"100%",padding:"13px 15px 13px 42px",border:`1.5px solid ${q?T.amber:T.border}`,borderRadius:11,fontSize:15,fontFamily:"inherit",color:T.ink,background:T.paper,outline:"none",boxSizing:"border-box",transition:"all .2s",boxShadow:q?`0 0 0 3px ${T.amber}14`:"none"}}/>{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:18,color:T.muted,cursor:"pointer"}}>×</button>}</div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>{res.map(m=>{const acc=accentFor(m.name);return(<Card key={m.id} onClick={()=>onSelect(m)} style={{padding:"18px 20px",borderLeft:`3px solid ${acc}`}}><div style={{display:"flex",gap:12}}><Avatar name={m.name} photo={m.photo} size={50} accent={acc}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:2}}>{m.name}</div><div style={{fontSize:11,color:T.muted,marginBottom:6}}>{m.birth}{m.death?` – ${m.death}`:""}{m.scrapbook?.occupation?` · ${m.scrapbook.occupation}`:""}</div>{m.bio&&<div style={{fontSize:12,color:T.text,fontStyle:"italic",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{m.bio}</div>}<div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>{m.badge&&<Chip color={acc} small>{m.badge}</Chip>}{m.youtube&&<Chip color={T.sage} small>▶</Chip>}{m.education?.length>0&&<Chip color={T.teal} small>🎓</Chip>}{m.gallery?.length>0&&<Chip color={T.plum} small>📸 {m.gallery.length}</Chip>}</div></div></div></Card>);})}</div></div>);
}
function TimelineView({members,onSelect}) {
  const {t}=useLang();
  const events=[];
  members.forEach(m=>{if(m.birth)events.push({year:parseInt(m.birth)||0,label:`${m.name}`,sub:t("born"),member:m,color:T.sage});if(m.death)events.push({year:parseInt(m.death)||0,label:`${m.name}`,sub:t("died"),member:m,color:T.muted});if(m.spouse){const sp=members.find(x=>x.id===m.spouse);if(sp&&m.id<m.spouse)events.push({year:Math.max(parseInt(m.birth)||1900,parseInt(sp.birth)||1900)+22,label:`${m.name} & ${sp.name}`,sub:"married",member:m,color:T.plum});}});
  const sorted=[...new Map(events.map(e=>[`${e.year}-${e.label}`,e])).values()].sort((a,b)=>a.year-b.year);
  const groups={};sorted.forEach(e=>{const d=Math.floor(e.year/10)*10;if(!groups[d])groups[d]=[];groups[d].push(e);});
  return(<div><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:26,color:T.ink,margin:0,fontWeight:700}}>Family Timeline</h2></div><p style={{fontSize:12,color:T.muted,margin:"0 0 22px 12px",fontStyle:"italic"}}>{sorted.length} events</p>
  {Object.entries(groups).map(([decade,evs])=><div key={decade} style={{marginBottom:24}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><span style={{fontSize:20,fontWeight:700,color:T.amber}}>{decade}s</span><div style={{flex:1,height:1,background:T.border}}/></div><div style={{display:"flex",flexDirection:"column",gap:7,paddingLeft:12,borderLeft:`2px solid ${T.border}`}}>{evs.map((ev,i)=><Card key={i} onClick={()=>onSelect(ev.member)} style={{padding:"11px 16px",display:"flex",gap:14,alignItems:"center",cursor:"pointer",borderLeft:`3px solid ${ev.color}`}}><div style={{fontSize:16,fontWeight:700,color:ev.color,width:40,flexShrink:0}}>{ev.year}</div><div style={{flex:1}}><span style={{fontSize:10,color:ev.color,fontWeight:700,marginRight:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{ev.sub}</span><span style={{fontSize:14,fontWeight:700,color:T.ink}}>{ev.label}</span></div><Avatar name={ev.member.name} photo={ev.member.photo} size={32} accent={ev.color} style={{flexShrink:0}}/></Card>)}</div></div>)}
  </div>);
}
function ChannelView({members,onSelect}) {
  const withVid=members.filter(m=>ytId(m.youtube));const [active,setActive]=useState(withVid[0]||null);
  return(<div><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:18}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:26,color:T.ink,margin:0,fontWeight:700}}>Family Channel</h2></div>
  {withVid.length===0?<Card style={{padding:80,textAlign:"center"}} hover={false}><div style={{fontSize:44,opacity:.2,marginBottom:12}}>▷</div><h3 style={{fontSize:18,color:T.ink,marginBottom:8}}>No videos yet</h3><p style={{color:T.muted,fontStyle:"italic"}}>Add YouTube links to member profiles.</p></Card>
  :<div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:18,alignItems:"start"}}><div>{active&&<><div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:14,overflow:"hidden",background:"#000",marginBottom:14,boxShadow:"0 10px 36px rgba(28,56,41,.2)"}}><iframe src={`https://www.youtube.com/embed/${ytId(active.youtube)}?rel=0`} title="video" allowFullScreen style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}/></div><Card style={{padding:"18px 22px"}} hover={false}><div style={{display:"flex",gap:14,alignItems:"center"}}><Avatar name={active.name} photo={active.photo} size={48} accent={accentFor(active.name)}/><div style={{flex:1}}><div style={{fontSize:17,fontWeight:700,color:T.ink}}>{active.name}</div><div style={{fontSize:12,color:T.muted}}>{active.birth}{active.badge?` · ${active.badge}`:""}</div></div><Btn variant="outline" onClick={()=>onSelect(active)} size="sm">Profile →</Btn></div>{active.bio&&<p style={{margin:"12px 0 0",fontStyle:"italic",fontSize:13,color:T.muted,lineHeight:1.65,borderTop:`1px solid ${T.border}`,paddingTop:12}}>{active.bio}</p>}</Card></>}</div>
  <div><h3 style={{fontSize:11,color:T.muted,margin:"0 0 10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>All Videos</h3><div style={{display:"flex",flexDirection:"column",gap:8}}>{withVid.map(m=>{const vid=ytId(m.youtube);const isCur=active?.id===m.id;return(<div key={m.id} onClick={()=>setActive(m)} style={{background:isCur?T.forest:T.paper,borderRadius:10,overflow:"hidden",border:`1.5px solid ${isCur?T.amber:T.border}`,cursor:"pointer",display:"flex",transition:"all .14s"}}><div style={{position:"relative",flexShrink:0}}><img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={m.name} style={{width:90,height:60,objectFit:"cover",display:"block"}}/><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:24,height:24,borderRadius:"50%",background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:9,marginLeft:2}}>▶</span></div></div></div><div style={{padding:"8px 11px",flex:1}}><div style={{fontSize:13,fontWeight:700,color:isCur?T.amberMid:T.ink}}>{m.name}</div><div style={{fontSize:10,color:isCur?"#5A8A6A":T.muted}}>{m.birth}</div>{isCur&&<div style={{fontSize:9,color:T.amber,fontWeight:700,marginTop:2,letterSpacing:"0.06em"}}>NOW PLAYING</div>}</div></div>);})}</div></div></div>}</div>);
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({members,users,onDeleteMember,onDeleteUser}) {
  const {t}=useLang(); const [tab,setTab]=useState("members"); const [q,setQ]=useState(""); const [sort,setSort]=useState("name"); const [confirm,setConfirm]=useState(null);
  const fm=members.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):parseInt(a.birth||9999)-parseInt(b.birth||9999));
  const fu=users.filter(u=>(u.name||"").toLowerCase().includes(q.toLowerCase())||(u.email||"").toLowerCase().includes(q.toLowerCase()));
  return(<div>
    {confirm&&<ConfirmModal title={`Delete ${confirm.type}?`} msg={`Remove "${confirm.name}" permanently?`} onConfirm={()=>{confirm.type==="member"?onDeleteMember(confirm.id):onDeleteUser(confirm.id);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:10}}><div><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:26,color:T.ink,margin:0,fontWeight:700}}>Admin Panel</h2></div><p style={{margin:"3px 0 0 12px",fontSize:12,color:T.muted,fontStyle:"italic"}}>Manage members and accounts</p></div><div style={{padding:"7px 14px",borderRadius:9,background:T.amberPale,border:`1px solid ${T.amber}30`,fontSize:11,color:T.amber,fontWeight:700}}>🔒 ADMIN</div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:20}}>{[{l:"Total Members",v:members.length,ic:"👨‍👩‍👧‍👦",c:T.forest},{l:"Users",v:users.length,ic:"👤",c:T.teal},{l:"With Videos",v:members.filter(m=>ytId(m.youtube)).length,ic:"🎬",c:T.sage},{l:"With Photos",v:members.filter(m=>m.photo||m.gallery?.length).length,ic:"📷",c:T.plum}].map(s=><div key={s.l} style={{background:T.paper,borderRadius:12,padding:"13px 15px",border:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"center"}}><div style={{fontSize:20}}>{s.ic}</div><div><div style={{fontSize:24,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:10,color:T.muted,letterSpacing:"0.05em"}}>{s.l}</div></div></div>)}</div>
    <div style={{display:"flex",gap:0,marginBottom:16,background:T.surface,borderRadius:9,padding:3,width:"fit-content",border:`1px solid ${T.border}`}}>{[["members",`Members (${members.length})`],["users",`Accounts (${users.length})`]].map(([id,lbl])=><button key={id} onClick={()=>{setTab(id);setQ("");}} style={{padding:"7px 16px",borderRadius:7,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .14s",background:tab===id?T.forest:"transparent",color:tab===id?"#fff":T.muted,fontFamily:"inherit"}}>{lbl}</button>)}</div>
    <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}><div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:12,opacity:.3}}>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{width:"100%",padding:"9px 12px 9px 30px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:12,fontFamily:"inherit",color:T.ink,background:T.paper,outline:"none",boxSizing:"border-box"}}/>{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:15,color:T.muted,cursor:"pointer"}}>×</button>}</div>{tab==="members"&&<select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:12,fontFamily:"inherit",color:T.ink,background:T.paper,outline:"none",cursor:"pointer"}}><option value="name">Name A–Z</option><option value="birth">Birth Year</option></select>}</div>
    {tab==="members"&&<Card hover={false} style={{overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 100px 72px",gap:10,padding:"10px 16px",background:T.forest,borderRadius:"13px 13px 0 0"}}>{["Member","Born","Died","Badge",""].map(h=><div key={h} style={{fontSize:9,fontWeight:700,color:"#5A8A6A",letterSpacing:"0.12em",textTransform:"uppercase"}}>{h}</div>)}</div>
    {fm.length===0?<div style={{padding:"40px 16px",textAlign:"center",color:T.muted,fontStyle:"italic"}}>No members found</div>:fm.map((m,i)=>{const acc=accentFor(m.name);return(<div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 100px 72px",gap:10,padding:"11px 16px",borderBottom:i<fm.length-1?`1px solid ${T.border}`:"none",transition:"background .14s",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{display:"flex",gap:9,alignItems:"center"}}><Avatar name={m.name} photo={m.photo} size={32} accent={acc}/><div><div style={{fontSize:13,fontWeight:700,color:T.ink}}>{m.name}</div><div style={{fontSize:10,color:T.muted}}>{m.gender==="F"?"Female":m.gender==="M"?"Male":"Other"}</div></div></div><div style={{fontSize:12,color:T.muted}}>{m.birth||"—"}</div><div style={{fontSize:12}}>{m.death?<span style={{color:T.muted}}>{m.death}</span>:<span style={{color:T.sage,fontSize:11}}>Living</span>}</div><div>{m.badge?<Chip color={acc} small>{m.badge}</Chip>:<span style={{color:T.faint,fontSize:11}}>—</span>}</div><div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setConfirm({type:"member",id:m.id,name:m.name})} style={{background:"#FDE8E8",border:`1px solid ${T.error}30`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:T.error,fontSize:11,fontFamily:"inherit",fontWeight:700,transition:"all .14s"}} onMouseEnter={e=>{e.currentTarget.style.background=T.error;e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#FDE8E8";e.currentTarget.style.color=T.error;}}>Delete</button></div></div>);})}
    </Card>}
    {tab==="users"&&<Card hover={false} style={{overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 90px 72px",gap:10,padding:"10px 16px",background:T.forest,borderRadius:"13px 13px 0 0"}}>{["Name","Email","Role",""].map(h=><div key={h} style={{fontSize:9,fontWeight:700,color:"#5A8A6A",letterSpacing:"0.12em",textTransform:"uppercase"}}>{h}</div>)}</div>
    {fu.length===0?<div style={{padding:"40px 16px",textAlign:"center",color:T.muted,fontStyle:"italic"}}>No accounts found</div>:fu.map((u,i)=><div key={u.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 90px 72px",gap:10,padding:"11px 16px",borderBottom:i<fu.length-1?`1px solid ${T.border}`:"none",transition:"background .14s",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{display:"flex",gap:9,alignItems:"center"}}><Avatar name={u.name||"?"} size={30}/><div style={{fontSize:13,fontWeight:700,color:T.ink}}>{u.name}</div></div><div style={{fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div><div>{u.isAdmin?<Chip color={T.amber} small>Admin</Chip>:<Chip color={T.muted} small>Member</Chip>}</div><div style={{display:"flex",justifyContent:"flex-end"}}>{!u.isAdmin&&<button onClick={()=>setConfirm({type:"user",id:u.id,name:u.name})} style={{background:"#FDE8E8",border:`1px solid ${T.error}30`,borderRadius:7,padding:"4px 9px",cursor:"pointer",color:T.error,fontSize:11,fontFamily:"inherit",fontWeight:700,transition:"all .14s"}} onMouseEnter={e=>{e.currentTarget.style.background=T.error;e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="#FDE8E8";e.currentTarget.style.color=T.error;}}>Remove</button>}</div></div>)}
    </Card>}
  </div>);
}

// ── INVITE ────────────────────────────────────────────────────────────────────
function InvitePage({user}) {
  const {t}=useLang(); const [codes,setCodes]=useState(()=>JSON.parse(localStorage.getItem(KEY.INVITES)||"[]")); const [copied,setCopied]=useState(null);
  const gen=()=>{const inv={code:"fam-"+uid(),createdBy:user.name,createdAt:new Date().toLocaleDateString(),used:false};const up=[...codes,inv];setCodes(up);localStorage.setItem(KEY.INVITES,JSON.stringify(up));fireConfetti();};
  const copy=(text,k)=>{navigator.clipboard?.writeText(text).catch(()=>{});setCopied(k);setTimeout(()=>setCopied(null),2000);};
  return(<div style={{maxWidth:600,margin:"0 auto"}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4}}><div style={{width:3,height:22,background:T.amber,borderRadius:2}}/><h2 style={{fontSize:26,color:T.ink,margin:0,fontWeight:700}}>Invite Family Members</h2></div><p style={{margin:"0 0 22px 12px",fontSize:12,color:T.muted,fontStyle:"italic"}}>Generate codes to bring relatives onto the tree.</p>
  <Card style={{padding:"24px 28px",marginBottom:14}} hover={false}><div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",marginBottom:codes.length?20:0}}><div style={{flex:1,minWidth:180}}><h3 style={{fontSize:15,color:T.ink,margin:"0 0 3px",fontWeight:700}}>New Invite Code</h3><p style={{margin:0,fontSize:12,color:T.muted,fontStyle:"italic"}}>Each code is single-use.</p></div><Btn variant="amber" onClick={gen} size="sm">GENERATE</Btn></div>
  {codes.length>0&&<div style={{borderTop:`1px solid ${T.border}`,paddingTop:16}}><div style={{fontSize:10,fontWeight:700,color:T.faint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Your Codes</div>{codes.map((inv,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,background:T.surface,border:`1px solid ${T.border}`,marginBottom:7,flexWrap:"wrap",opacity:inv.used?.7:1}}><code style={{fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:700,color:inv.used?T.muted:T.forest,background:inv.used?T.border:T.amberPale,padding:"4px 12px",borderRadius:7,letterSpacing:"0.05em"}}>{inv.code}</code><div style={{flex:1}}><div style={{fontSize:11,color:T.muted}}>{inv.createdAt}</div>{inv.used&&<div style={{fontSize:11,color:T.sage,fontWeight:700}}>Used by {inv.usedBy}</div>}</div>{!inv.used&&<div style={{display:"flex",gap:5}}><button onClick={()=>copy(inv.code,i+"c")} style={{background:copied===i+"c"?T.sage:T.paper,border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:copied===i+"c"?"#fff":T.muted,transition:"all .14s"}}>{copied===i+"c"?"✓":"Copy"}</button><button onClick={()=>copy(`${window.location.href.split("?")[0]}?invite=${inv.code}`,i+"l")} style={{background:copied===i+"l"?T.teal:T.paper,border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:copied===i+"l"?"#fff":T.muted,transition:"all .14s"}}>{copied===i+"l"?"✓":"Link"}</button></div>}</div>)}</div>}
  </Card></div>);
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLangState]=useState(()=>localStorage.getItem(KEY.LANG)||"en");
  const t=useCallback(k=>TR[lang]?.[k]??TR.en[k]??k,[lang]);
  const setLang=code=>{setLangState(code);localStorage.setItem(KEY.LANG,code);};
  const [view,setViewRaw]=useState("landing");
  const [user,setUser]=useState(null);
  const [members,setMembers]=useState([]);
  const [users,setUsers]=useState([]);
  const [events,setEvents]=useState(()=>JSON.parse(localStorage.getItem(KEY.EVENTS)||"[]"));
  const [selected,setSelected]=useState(null);
  const [editing,setEditing]=useState(null);
  const [toast,setToast]=useState(null);
  const fontFamily=lang==="en"?"'Libre Baskerville',Georgia,serif":"'Noto Sans Devanagari','Noto Serif Devanagari',sans-serif";
  const setView=v=>{setViewRaw(v);window.scrollTo({top:0,behavior:"smooth"});};
  const loadUsers=()=>{const u=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");setUsers(u);return u;};
  useEffect(()=>{const s=localStorage.getItem(KEY.SESSION);if(s){setUser(JSON.parse(s));setViewRaw("home");}const m=localStorage.getItem(KEY.MEMBERS);setMembers(m?JSON.parse(m):SEED);loadUsers();},[]);
  useEffect(()=>{if(toast){const tm=setTimeout(()=>setToast(null),3400);return()=>clearTimeout(tm);}},[toast]);
  const showToast=(msg,confetti=false)=>{setToast(msg);if(confetti)setTimeout(fireConfetti,100);};
  const saveMembers=m=>{setMembers(m);localStorage.setItem(KEY.MEMBERS,JSON.stringify(m));};
  const saveEvents=ev=>{setEvents(ev);localStorage.setItem(KEY.EVENTS,JSON.stringify(ev));};
  const signup=(name,email,pw,code,setErr)=>{
    if(!name||!email||!pw){setErr("Please fill all fields.");return;}
    const us=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");
    if(us.find(u=>u.email===email)){setErr("Email already registered.");return;}
    if(code){const invs=JSON.parse(localStorage.getItem(KEY.INVITES)||"[]");const inv=invs.find(i=>i.code===code&&!i.used);if(!inv){setErr("Invalid invite code.");return;}localStorage.setItem(KEY.INVITES,JSON.stringify(invs.map(i=>i.code===code?{...i,used:true,usedBy:name}:i)));}
    const isFirst=us.length===0;const u={id:Date.now().toString(),name,email,pw,isAdmin:isFirst};us.push(u);localStorage.setItem(KEY.USERS,JSON.stringify(us));localStorage.setItem(KEY.SESSION,JSON.stringify(u));setUser(u);setUsers(us);setView("home");showToast(`Welcome${isFirst?" (Admin)":""}, ${name}! 🌳`,true);
  };
  const login=(email,pw,setErr)=>{
    const us=JSON.parse(localStorage.getItem(KEY.USERS)||"[]");const u=us.find(x=>x.email===email&&x.pw===pw);
    if(!u){setErr("Incorrect email or password.");return;}
    localStorage.setItem(KEY.SESSION,JSON.stringify(u));setUser(u);loadUsers();setView("home");showToast(`Welcome back, ${u.name}.`);
  };
  const logout=()=>{localStorage.removeItem(KEY.SESSION);setUser(null);setView("landing");};
  const addMember=data=>{
    const nm={...data,id:"m"+Date.now(),addedBy:user.id};let up=[...members,nm];
    if(data.parents?.length)up=up.map(m=>data.parents.includes(m.id)&&!m.children?.includes(nm.id)?{...m,children:[...(m.children||[]),nm.id]}:m);
    if(data.spouse)up=up.map(m=>m.id===data.spouse&&!m.spouse?{...m,spouse:nm.id}:m);
    saveMembers(up);showToast(`${nm.name} added to the tree! 🌿`,true);setView("tree");
  };
  const updateMember=(id,data)=>{
    const up=members.map(m=>m.id===id?{...m,...data}:m);saveMembers(up);setSelected(s=>s&&s.id===id?{...s,...data}:s);showToast("Profile updated ✓");
  };
  const updateAndBack=(id,data)=>{updateMember(id,data);setView("profile");};
  const deleteMember=id=>{
    let up=members.filter(m=>m.id!==id);
    up=up.map(m=>({...m,children:(m.children||[]).filter(c=>c!==id),parents:(m.parents||[]).filter(p=>p!==id),spouse:m.spouse===id?"":m.spouse}));
    saveMembers(up);if(selected?.id===id){setSelected(null);setView("tree");}showToast("Member removed.");
  };
  const deleteUser=id=>{const up=users.filter(u=>u.id!==id);localStorage.setItem(KEY.USERS,JSON.stringify(up));setUsers(up);showToast("Account removed.");};
  const addEvent=ev=>{const up=[...events,ev];saveEvents(up);showToast(`"${ev.title}" added to calendar 📅`);};
  const deleteEvent=id=>{saveEvents(events.filter(e=>e.id!==id));};
  const computeLayout=useCallback(()=>{
    if(!members.length)return{nodes:[],edges:[]};
    const gMap={};const getG=(id,vis=new Set())=>{if(gMap[id]!==undefined)return gMap[id];if(vis.has(id))return 0;vis.add(id);const m=members.find(x=>x.id===id);if(!m||!m.parents?.length)return 0;const vp=m.parents.filter(p=>members.find(x=>x.id===p));if(!vp.length)return 0;return Math.max(...vp.map(p=>getG(p,new Set(vis))))+1;};
    members.forEach(m=>{gMap[m.id]=getG(m.id);});
    const byG={};members.forEach(m=>{const g=gMap[m.id]||0;if(!byG[g])byG[g]=[];byG[g].push(m);});
    const NW=162,NH=88,HG=30,VG=120;const nf=[];
    Object.entries(byG).forEach(([g,gm])=>{const total=gm.length*(NW+HG)-HG;gm.forEach((m,i)=>nf.push({...m,x:i*(NW+HG)-total/2,y:Number(g)*(NH+VG)}));});
    const edges=[];members.forEach(m=>{(m.children||[]).forEach(cid=>{const p=nf.find(n=>n.id===m.id),c=nf.find(n=>n.id===cid);if(p&&c)edges.push({from:p,to:c});});});
    return{nodes:nf,edges};
  },[members]);
  const exportPDF=()=>{
    const {nodes,edges}=computeLayout();if(!nodes.length)return;
    const PAD=80,NW=162,NH=88;const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);const minX=Math.min(...xs)-NW/2,maxX=Math.max(...xs)+NW/2;const minY=Math.min(...ys),maxY=Math.max(...ys)+NH;const sW=maxX-minX+PAD*2,sH=maxY-minY+PAD*2;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${sW}" height="${sH}" style="background:#FDFAF3">${edges.map(e=>{const fx=e.from.x-minX+PAD,fy=e.from.y-minY+PAD+NH,tx=e.to.x-minX+PAD,ty=e.to.y-minY+PAD,my=(fy+ty)/2;return`<path d="M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}" stroke="${T.amber}" stroke-width="1.5" fill="none" stroke-dasharray="6,5" opacity=".45"/>`;}).join("")}${nodes.map(n=>{const nx=n.x-minX+PAD-NW/2,ny=n.y-minY+PAD,nm=n.name.length>20?n.name.slice(0,19)+"…":n.name;const ac=ACCENTS[(n.name.charCodeAt(0)||0)%ACCENTS.length];return`<rect x="${nx}" y="${ny}" width="${NW}" height="${NH}" rx="10" fill="white" stroke="${T.border}" stroke-width="1"/><rect x="${nx}" y="${ny}" width="${NW}" height="3" rx="2" fill="${ac}"/><text x="${nx+50}" y="${ny+28}" font-size="11" font-weight="bold" fill="${T.ink}">${nm}</text><text x="${nx+50}" y="${ny+46}" font-size="10" fill="${T.muted}">${n.birth||""}${n.death?` – ${n.death}`:""}</text>${n.scrapbook?.occupation?`<text x="${nx+50}" y="${ny+62}" font-size="9" fill="${T.faint}">${n.scrapbook.occupation}</text>`:n.badge?`<text x="${nx+50}" y="${ny+62}" font-size="9" fill="${ac}">${n.badge}</text>`:""}`;}).join("")}</svg>`;
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t("appName")}</title><style>body{margin:0;padding:32px;background:${T.bg};font-family:Georgia,serif;}h1{font-size:38px;color:${T.ink};margin:0 0 4px;font-weight:700;}.sub{color:${T.muted};font-size:14px;margin:0 0 28px;font-style:italic;}.tree{background:${T.paper};border-radius:14px;padding:24px;border:1px solid ${T.border};margin-bottom:30px;overflow:auto;}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}.card{background:${T.paper};border-radius:12px;padding:16px 18px;border:1px solid ${T.border};border-left:3px solid ${T.amber};}.name{font-size:17px;color:${T.ink};margin:0 0 3px;font-weight:700;}.meta{font-size:11px;color:${T.muted};margin:0 0 5px;}.bio{font-size:12px;color:${T.text};line-height:1.65;margin:0;font-style:italic;}</style></head><body><h1>${t("appName")}</h1><p class="sub">${members.length} members · ${new Date().toLocaleDateString()}</p><div class="tree">${svg}</div><div class="grid">${members.map(m=>`<div class="card"><p class="name">${m.name}</p><p class="meta">${m.birth||""}${m.death?` – ${m.death}`:m.birth?" – present":""}${m.scrapbook?.occupation?` · ${m.scrapbook.occupation}`:""}</p>${m.bio?`<p class="bio">${m.bio.slice(0,160)}${m.bio.length>160?"…":""}</p>`:""}</div>`).join("")}</div></body></html>`;
    const b=new Blob([html],{type:"text/html"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="family-story.html";a.click();
  };
  const isAdmin=user?.isAdmin===true;
  const INNER=["home","tree","timeline","channel","search","calendar","chat","profile","addMember","editMember","invite","admin"];
  return(
    <LangCtx.Provider value={{lang,t,setLang}}>
      <div style={{fontFamily,minHeight:"100vh",background:T.bg}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input:focus,textarea:focus,select:focus{border-color:${T.amber}!important;box-shadow:0 0 0 3px ${T.amber}18!important;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}@keyframes slideR{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:${T.surface}}::-webkit-scrollbar-thumb{background:${T.borderMid};border-radius:3px}`}</style>
        {toast&&<div style={{position:"fixed",top:16,right:16,zIndex:9999,background:T.forest,color:"#C8E8C0",padding:"12px 20px",borderRadius:11,fontSize:13,fontFamily,boxShadow:"0 12px 40px rgba(0,0,0,.28)",animation:"slideR .3s ease",maxWidth:340,lineHeight:1.5,border:`1px solid ${T.amber}30`}}>{toast}</div>}
        {view==="landing"&&<Landing onLogin={()=>setView("login")} onSignup={()=>setView("signup")}/>}
        {view==="login"&&<LoginPage onLogin={login} onSwitch={()=>setView("signup")} onBack={()=>setView("landing")}/>}
        {view==="signup"&&<SignupPage onSignup={signup} onSwitch={()=>setView("login")} onBack={()=>setView("landing")}/>}
        {INNER.includes(view)&&user&&(
          <Shell user={user} view={view} setView={setView} onLogout={logout} isAdmin={isAdmin}>
            {view==="home"&&<HomePage members={members} user={user} setView={setView} setSelected={setSelected} isAdmin={isAdmin} events={events}/>}
            {view==="tree"&&<TreeView members={members} computeLayout={computeLayout} onSelect={m=>{setSelected(m);setView("profile");}} onExport={exportPDF}/>}
            {view==="timeline"&&<TimelineView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
            {view==="channel"&&<ChannelView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
            {view==="search"&&<SearchView members={members} onSelect={m=>{setSelected(m);setView("profile");}}/>}
            {view==="calendar"&&<CalendarView events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} user={user}/>}
            {view==="chat"&&<ChatView user={user} members={members}/>}
            {view==="profile"&&<ProfileView member={selected} members={members} onEdit={m=>{setEditing(m);setView("editMember");}} onSelectMember={m=>{if(m){setSelected(m);}else setView("tree");}} onUpdateMember={updateMember}/>}
            {view==="addMember"&&<MemberForm members={members} onSubmit={addMember} onCancel={()=>setView("tree")} title="Add a Family Member"/>}
            {view==="editMember"&&<MemberForm initial={editing} members={members} onSubmit={d=>updateAndBack(editing.id,d)} onCancel={()=>setView("profile")} title="Edit Profile"/>}
            {view==="invite"&&<InvitePage user={user}/>}
            {view==="admin"&&isAdmin&&<AdminPanel members={members} users={users} onDeleteMember={deleteMember} onDeleteUser={deleteUser}/>}
            {view==="admin"&&!isAdmin&&<div style={{textAlign:"center",padding:80}}><div style={{fontSize:48,opacity:.2,marginBottom:14}}>🔒</div><h3 style={{fontSize:22,color:T.ink}}>Admin access only</h3></div>}
          </Shell>
        )}
      </div>
    </LangCtx.Provider>
  );
}
