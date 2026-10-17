import { useState, useEffect, useRef } from 'react'

const BAD_WORDS = ['fuck','shit','bitch','asshole','bastard','idiot','stupid']
const AUDIENCES = ['Followers','Friends','Custom List','Everyone']

export default function App(){
  const [tab,setTab]=useState('feed')
  const [posts,setPosts]=useState(()=>JSON.parse(localStorage.getItem('circle_posts_v3')||'[]'))
  const [text,setText]=useState('')
  const [audience,setAudience]=useState('Followers')
  const [useCountdown,setUseCountdown]=useState(true)
  const [hrs,setHrs]=useState(24)
  const [media,setMedia]=useState({ image:null, video:null, audio:null, file:null })
  const [bookmarks,setBookmarks]=useState(()=>JSON.parse(localStorage.getItem('circle_bm_v3')||'[]'))
  const [now,setNow]=useState(Date.now())
  const [stories]=useState([{id:1,name:'You',img:'https://i.pravatar.cc/100?img=11'},{id:2,name:'Alex',img:'https://i.pravatar.cc/100?img=32'},{id:3,name:'Maya',img:'https://i.pravatar.cc/100?img=5'},{id:4,name:'Sam',img:'https://i.pravatar.cc/100?img=8'}])
  const [groups]=useState([{id:1,name:'Design Hub',members:1200},{id:2,name:'Lagos Creators',members:3400}])
  const [requests,setRequests]=useState([{id:1,name:'Alex Rivera',mutual:3,status:'pending'},{id:2,name:'Sam Kim',mutual:1,status:'pending'}])
  const [activeChats,setActiveChats]=useState([])
  const [chatInput,setChatInput]=useState('')
  const [appointment,setAppointment]=useState({active:false,left:272,date:'Fri, Oct 18, 2024',time:'6:30 PM'})
  const [callStatus,setCallStatus]=useState(null)
  const fileRef=useRef()

  useEffect(()=>localStorage.setItem('circle_posts_v3',JSON.stringify(posts)),[posts])
  useEffect(()=>localStorage.setItem('circle_bm_v3',JSON.stringify(bookmarks)),[bookmarks])
  useEffect(()=>{
    const t=setInterval(()=>{
      setNow(Date.now())
      setAppointment(a=>a.active&&a.left>0?{...a,left:a.left-1}:a)
      setActiveChats(cs=>cs.map(c=>!c.locked&&c.countdown>0?{...c,countdown:c.countdown-1}:c.countdown===0&&!c.locked&&!c.waiting?{...c,waiting:true}:c))
      setPosts(p=>p.filter(x=>!x.expiresAt||x.expiresAt>Date.now()))
    },1000);return()=>clearInterval(t)
  },[])

  const wordCount=text.trim().split(/\s+/).filter(Boolean).length
  const hasBadWord=BAD_WORDS.some(w=>text.toLowerCase().includes(w))
  const canPost=(text.trim()||media.image||media.video||media.audio)&&wordCount<=500&&!hasBadWord

  const createPost=()=>{
    if(!canPost) return
    setPosts([{id:Date.now(),text,media:{...media},audience,wordCount,likes:0,comments:0,reshares:0,reports:0,views:Math.floor(Math.random()*500)+10,liked:false,bookmarked:false,expiresAt:useCountdown?Date.now()+hrs*3600000:null,user:'CIRCLE User',handle:'@circle_user',time:'now'},...posts])
    setText('');setMedia({image:null,video:null,audio:null,file:null})
  }
  const handleMedia=(e,type)=>{
    const f=e.target.files[0]; if(!f) return
    const r=new FileReader(); r.onload=ev=>setMedia(m=>({...m,[type]:ev.target.result})); r.readAsDataURL(f)
  }
  const likePost=id=>setPosts(posts.map(p=>p.id===id?{...p,liked:!p.liked,likes:p.liked?p.likes-1:p.likes+1}:p))
  const repost=id=>setPosts(posts.map(p=>p.id===id?{...p,reshares:p.reshares+1}:p))
  const acceptReq=id=>{
    const r=requests.find(x=>x.id===id); setRequests(requests.map(x=>x.id===id?{...x,status:'accepted'}:x))
    setActiveChats([...activeChats,{id:Date.now(),name:r.name,countdown:600,waiting:false,locked:false,messages:[{from:'system',text:`Chat request accepted. Both set countdown. Appointment: ${appointment.date} ${appointment.time}`}],owner:true}])
  }

  return (
    <div style={{background:'#0a0a0f',color:'white',minHeight:'100vh',maxWidth:'1100px',margin:'0 auto',display:'flex',fontFamily:'system-ui'}}>
      {/* SIDEBAR */}
      <div style={{width:'200px',borderRight:'1px solid #1e1e2a',padding:'16px',position:'sticky',top:0,height:'100vh',display:window.innerWidth<900?'none':'block'}}>
        <b style={{letterSpacing:'2px'}}>○ CIRCLE</b>
        <div style={{fontSize:'11px',color:'#7c3aed',marginTop:'6px',lineHeight:'14px'}}>Post for followers or friends or a few selected list or for everyone.</div>
        {[
          {id:'feed',label:'Home'},{id:'explore',label:'Explore'},{id:'stories',label:'Stories'},{id:'camera',label:'Camera'},{id:'groups',label:'Groups'},{id:'messages',label:'Messages'},{id:'bookmarks',label:'Bookmarks'},{id:'profile',label:'Profile'},
        ].map(i=><button key={i.id} onClick={()=>setTab(i.id)} style={{display:'block',width:'100%',textAlign:'left',marginTop:'10px',background:tab===i.id?'#1f1f2a':'none',border:'none',color:tab===i.id?'white':'#888',padding:'10px',borderRadius:'8px'}}>{i.label}</button>)}
      </div>

      {/* CENTER */}
      <div style={{flex:1,maxWidth:'600px',borderRight:'1px solid #1e1e2a',paddingBottom:'90px'}}>
        <header style={{padding:'14px',borderBottom:'1px solid #1e1e2a',position:'sticky',top:0,background:'#0a0a0f',zIndex:10}}><b>○ CIRCLE</b><span style={{float:'right'}}>🔍</span></header>

        {tab==='feed'&&(
          <>
            {/* STORIES */}
            <div style={{display:'flex',gap:'12px',padding:'12px',overflowX:'auto',borderBottom:'1px solid #1e1e2a'}}>
              {stories.map(s=><div key={s.id} style={{textAlign:'center',minWidth:'60px'}}><img src={s.img} style={{width:'56px',height:'56px',borderRadius:'50%',border:'2px solid #7c3aed'}} /><div style={{fontSize:'11px',marginTop:'4px'}}>{s.name}</div></div>)}
              <div style={{minWidth:'60px',textAlign:'center'}}><div style={{width:'56px',height:'56px',borderRadius:'50%',background:'#1f1f2a',display:'grid',placeItems:'center'}}>＋</div><div style={{fontSize:'11px'}}>Add Story</div></div>
            </div>

            <div style={{display:'flex',gap:'6px',padding:'12px',overflowX:'auto'}}>{AUDIENCES.map(a=><button key={a} onClick={()=>setAudience(a)} style={{whiteSpace:'nowrap',padding:'8px 14px',borderRadius:'20px',border:'none',background:audience===a?'#7c3aed':'#1f1f2a',color:'white',fontSize:'12px'}}>{a}</button>)}</div>

            <div style={{margin:'0 12px',background:'#15151e',borderRadius:'16px',padding:'12px',border:'1px solid #2a2a35'}}>
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your circle? Audios, videos, texts, pictures — all at once. Max 500 words." style={{width:'100%',background:'transparent',border:'none',color:'white',outline:'none',minHeight:'70px'}} />
              {(media.image||media.video||media.audio)&&<div style={{background:'#0f0f14',padding:'8px',borderRadius:'8px',marginTop:'6px',fontSize:'12px'}}>{media.image&&'🖼️ Image attached '}{media.video&&'🎬 Video attached '}{media.audio&&'🎵 Audio attached '}{media.file&&'📄 File attached '}</div>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'8px',fontSize:'11px'}}>
                <div style={{color:hasBadWord?'#ff5a5a':wordCount>500?'#ff5a5a':'#888'}}>{hasBadWord?'⚠️ Offensive words not allowed':`${wordCount}/500 words`}</div>
                <label style={{display:'flex',gap:'6px',alignItems:'center'}}><input type="checkbox" checked={useCountdown} onChange={e=>setUseCountdown(e.target.checked)} />Countdown?</label>
              </div>
              {useCountdown&&<select value={hrs} onChange={e=>setHrs(Number(e.target.value))} style={{marginTop:'8px',background:'#1f1f2a',color:'white',border:'none',padding:'6px',borderRadius:'6px',width:'100%'}}><option value={1}>Disappear in 1 hour</option><option value={6}>Disappear in 6 hours</option><option value={24}>Disappear in 24 hours</option><option value={72}>Disappear in 3 days</option></select>}
              
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'6px',marginTop:'10px'}}>
                <label style={{background:'#1f1f2a',padding:'10px',borderRadius:'10px',textAlign:'center',fontSize:'12px'}}>📷 Photo<input type="file" accept="image/*" onChange={e=>handleMedia(e,'image')} style={{display:'none'}} /></label>
                <label style={{background:'#1f1f2a',padding:'10px',borderRadius:'10px',textAlign:'center',fontSize:'12px'}}>🎬 Video<input type="file" accept="video/*" onChange={e=>handleMedia(e,'video')} style={{display:'none'}} /></label>
                <label style={{background:'#1f1f2a',padding:'10px',borderRadius:'10px',textAlign:'center',fontSize:'12px'}}>🎵 Audio<input type="file" accept="audio/*" onChange={e=>handleMedia(e,'audio')} style={{display:'none'}} /></label>
                <label style={{background:'#1f1f2a',padding:'10px',borderRadius:'10px',textAlign:'center',fontSize:'12px'}}>📄 File<input type="file" onChange={e=>handleMedia(e,'file')} style={{display:'none'}} /></label>
              </div>
              <button disabled={!canPost} onClick={createPost} style={{width:'100%',marginTop:'10px',background:canPost?'#7c3aed':'#333',border:'none',color:'white',padding:'12px',borderRadius:'10px',fontWeight:700}}>Post for {audience}</button>
            </div>

            <div style={{padding:'12px'}}>
              {posts.map(p=>{
                const left=p.expiresAt?p.expiresAt-now:null
                return (
                  <div key={p.id} style={{background:'#15151e',borderRadius:'16px',padding:'14px',marginBottom:'12px',border:'1px solid #222'}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}><div style={{display:'flex',gap:'8px'}}><img src="https://i.pravatar.cc/40?img=11" style={{width:'36px',height:'36px',borderRadius:'50%'}} /><div><b style={{fontSize:'13px'}}>{p.user}</b><div style={{fontSize:'11px',color:'#888'}}>{p.audience} • {p.expiresAt?`🕒 Disappears in ${left?Math.floor(left/3600000)+'h '+Math.floor((left%3600000)/60000)+'m':'0m'}`:'∞ Forever'} • {p.wordCount} words</div></div></div><span style={{fontSize:'10px',border:'1px solid #7c3aed',padding:'4px 8px',borderRadius:'20px',height:'fit-content'}}>{p.expiresAt?'⏳ Countdown':'∞ Forever'}</span></div>
                    {p.text&&<p style={{fontSize:'14px',margin:'10px 0'}}>{p.text}</p>}
                    {p.media.image&&<img src={p.media.image} style={{width:'100%',borderRadius:'12px'}} />}
                    {p.media.video&&<video src={p.media.video} controls style={{width:'100%',borderRadius:'12px',marginTop:'8px'}} />}
                    {p.media.audio&&<audio src={p.media.audio} controls style={{width:'100%',marginTop:'8px'}} />}
                    <div style={{display:'flex',gap:'8px',marginTop:'10px',flexWrap:'wrap'}}>
                      <button onClick={()=>likePost(p.id)} style={{background:'#1f1f2a',border:'none',color:p.liked?'#ff5a5a':'white',padding:'6px 10px',borderRadius:'8px',fontSize:'12px'}}>{p.liked?'❤️':'♡'} {p.likes} Like</button>
                      <button style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'12px'}}>💬 {p.comments} Comment</button>
                      <button onClick={()=>repost(p.id)} style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'12px'}}>🔁 {p.reshares} Repost</button>
                      <button style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'12px'}}>📊 {p.views} Analytics</button>
                      <button style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'12px'}}>⚑ Report</button>
                      <button onClick={()=>setBookmarks(b=>b.includes(p.id)?b.filter(x=>x!==p.id):[...b,p.id])} style={{marginLeft:'auto',background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px'}}>{bookmarks.includes(p.id)?'🔖':'📑'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab==='camera'&&(
          <div style={{padding:'16px'}}>
            <h3>📷 Camera Hub (Replaces Map)</h3>
            <div style={{background:'#15151e',borderRadius:'16px',height:'300px',display:'grid',placeItems:'center',marginTop:'12px'}}>{media.image?<img src={media.image} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'16px'}} />:'Camera Preview'}</div>
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={e=>handleMedia(e,'image')} style={{display:'none'}} />
            <button onClick={()=>fileRef.current.click()} style={{width:'100%',marginTop:'12px',background:'#7c3aed',border:'none',color:'white',padding:'14px',borderRadius:'12px'}}>Open Camera / Gallery</button>
            <button onClick={()=>setTab('feed')} style={{width:'100%',marginTop:'8px',background:'#1f1f2a',border:'none',color:'white',padding:'12px',borderRadius:'12px'}}>Post Photo with Countdown</button>
          </div>
        )}

        {tab==='messages'&&(
          <div style={{padding:'16px'}}>
            <h3>Private Chats – Chat Request + Countdown</h3>
            <p style={{fontSize:'11px',color:'#888'}}>Time set by both. After elapsed, owner controls. Then DM locked.</p>
            <h4 style={{color:'#7c3aed',marginTop:'14px'}}>CHAT REQUESTS</h4>
            {requests.filter(r=>r.status==='pending').map(r=><div key={r.id} style={{background:'#15151e',padding:'12px',borderRadius:'12px',display:'flex',justifyContent:'space-between',marginTop:'8px'}}><div><b>{r.name}</b><div style={{fontSize:'11px',color:'#888'}}>Mutual {r.mutual}</div></div><div style={{display:'flex',gap:'6px'}}><button style={{background:'transparent',border:'1px solid #333',color:'#888',padding:'6px 10px',borderRadius:'20px'}}>Decline</button><button onClick={()=>acceptReq(r.id)} style={{background:'#7c3aed',border:'none',color:'white',padding:'6px 10px',borderRadius:'20px'}}>Accept</button></div></div>)}
            
            <div style={{background:'linear-gradient(135deg,#4c1d95,#7c3aed)',borderRadius:'16px',padding:'18px',textAlign:'center',marginTop:'16px'}}><div style={{fontSize:'11px'}}>COUNTDOWN ACTIVE (Both set)</div><div style={{fontSize:'42px',fontWeight:900}}>{String(Math.floor(appointment.left/60)).padStart(2,'0')}:{String(appointment.left%60).padStart(2,'0')}</div><div style={{fontSize:'11px'}}>Appointment: {appointment.date} {appointment.time}</div></div>
            <div style={{background:'#15151e',borderRadius:'12px',padding:'12px',marginTop:'12px'}}><div style={{fontSize:'11px',color:'#7c3aed'}}>APPOINTMENT DATE CHAT</div><div style={{background:'#0f0f14',padding:'8px',borderRadius:'8px',marginTop:'6px'}}>📅 {appointment.date}</div><div style={{background:'#0f0f14',padding:'8px',borderRadius:'8px',marginTop:'6px'}}>🕒 {appointment.time}</div><button onClick={()=>setAppointment({...appointment,active:true,left:600})} style={{width:'100%',background:'#7c3aed',border:'none',color:'white',padding:'10px',borderRadius:'8px',marginTop:'8px'}}>Save & Start Countdown</button></div>

            {activeChats.map(c=>(
              <div key={c.id} style={{background:'#15151e',borderRadius:'12px',padding:'12px',marginTop:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><b>{c.name}</b>{c.locked?<span style={{color:'#ff5a5a'}}>🔒 DM Locked</span>:c.waiting?<span style={{color:'#ffaa00'}}>⏳ Owner control</span>:<span>⏳ {Math.floor(c.countdown/60)}:{String(c.countdown%60).padStart(2,'0')}</span>}</div>
                <div style={{marginTop:'8px',maxHeight:'120px',overflowY:'auto'}}>{c.messages.map((m,i)=><div key={i} style={{fontSize:'12px',background:'#0f0f14',padding:'6px',borderRadius:'6px',marginTop:'4px'}}>{m.text}</div>)}</div>
                {c.waiting&&c.owner&&!c.locked&&<div style={{display:'flex',gap:'8px',marginTop:'8px'}}><button onClick={()=>setActiveChats(activeChats.map(x=>x.id===c.id?{...x,countdown:600,waiting:false}:x))} style={{flex:1,background:'#7c3aed',border:'none',color:'white',padding:'8px',borderRadius:'8px'}}>Extend Time</button><button onClick={()=>setActiveChats(activeChats.map(x=>x.id===c.id?{...x,locked:true}:x))} style={{flex:1,background:'#222',border:'none',color:'white',padding:'8px',borderRadius:'8px'}}>Leave & Lock DM</button></div>}
                {!c.locked&&!c.waiting&&(
                  <>
                    <div style={{display:'flex',gap:'6px',marginTop:'8px'}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Message..." style={{flex:1,background:'#0f0f14',border:'none',color:'white',padding:'8px',borderRadius:'8px'}} /><button onClick={()=>{if(chatInput){setActiveChats(activeChats.map(x=>x.id===c.id?{...x,messages:[...x.messages,{from:'me',text:chatInput}]}:x));setChatInput('')}}} style={{background:'#7c3aed',border:'none',color:'white',padding:'8px 12px',borderRadius:'8px'}}>Send</button></div>
                    <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
                      <button onClick={()=>setCallStatus('Voice call...')} style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>📞 Voice Call</button>
                      <button onClick={()=>setCallStatus('Video call...')} style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>🎥 Video Call</button>
                      <button style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>🎙️ Voice Note</button>
                      <label style={{background:'#1f1f2a',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>🖼️ Picture<input type="file" accept="image/*" style={{display:'none'}} /></label>
                      <label style={{background:'#1f1f2a',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>🎬 Video<input type="file" accept="video/*" style={{display:'none'}} /></label>
                      <label style={{background:'#1f1f2a',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>🎵 Audio<input type="file" accept="audio/*" style={{display:'none'}} /></label>
                      <label style={{background:'#1f1f2a',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>📄 Document<input type="file" style={{display:'none'}} /></label>
                      <label style={{background:'#1f1f2a',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>📁 File<input type="file" style={{display:'none'}} /></label>
                      <button style={{background:'#1f1f2a',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>👤 Contact</button>
                    </div>
                    {callStatus&&<div style={{marginTop:'8px',fontSize:'12px',color:'#7c3aed'}}>{callStatus} <button onClick={()=>setCallStatus(null)} style={{background:'none',border:'none',color:'#ff5a5a'}}>End</button></div>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {tab==='stories'&&<div style={{padding:'16px'}}><h3>Stories</h3>{stories.map(s=><div key={s.id} style={{display:'flex',gap:'10px',alignItems:'center',background:'#15151e',padding:'10px',borderRadius:'12px',marginTop:'8px'}}><img src={s.img} style={{width:'44px',height:'44px',borderRadius:'50%'}} /><div>{s.name} • Active now</div></div>)}</div>}
        {tab==='groups'&&<div style={{padding:'16px'}}><h3>Groups / Communities</h3>{groups.map(g=><div key={g.id} style={{background:'#15151e',padding:'12px',borderRadius:'12px',marginTop:'8px',display:'flex',justifyContent:'space-between'}}><div><b>{g.name}</b><div style={{fontSize:'11px',color:'#888'}}>{g.members} members</div></div><button style={{background:'#7c3aed',border:'none',color:'white',padding:'6px 12px',borderRadius:'20px'}}>Join</button></div>)}</div>}
        {tab==='profile'&&(
          <div><div style={{height:'90px',background:'linear-gradient(90deg,#7c3aed,#3b82f6)'}} /><div style={{padding:'0 16px'}}><div style={{display:'flex',justifyContent:'space-between',marginTop:'-36px'}}><img src="https://i.pravatar.cc/100?img=12" style={{width:'84px',height:'84px',borderRadius:'50%',border:'4px solid #0a0a0f'}} /><button style={{marginTop:'44px',background:'transparent',border:'1px solid #555',color:'white',padding:'6px 14px',borderRadius:'20px'}}>Edit profile</button></div><h2 style={{margin:'8px 0 0'}}>CIRCLE User</h2><div style={{color:'#888'}}>@circle_user</div><p style={{fontSize:'13px'}}>Building community for creators • Design, tech & ideas ✨</p><div><b>342</b> <span style={{color:'#888'}}>Following • </span><b>12.4k</b> <span style={{color:'#888'}}>Followers</span></div><div style={{display:'flex',gap:'6px',marginTop:'12px'}}>{['Posts','Replies','Media','Likes','Circles'].map(t=><span key={t} style={{padding:'6px 12px',borderRadius:'8px',fontSize:'12px',border:'1px solid #2a2a35'}}>{t}</span>)}</div></div></div>
        )}
        {tab==='bookmarks'&&<div style={{padding:'16px'}}><h3>Bookmarks • {bookmarks.length} saved</h3></div>}
        {tab==='explore'&&<div style={{padding:'16px'}}><input placeholder="Search CIRCLE..." style={{width:'100%',background:'#15151e',border:'1px solid #2a2a35',color:'white',padding:'12px',borderRadius:'10px'}} /></div>}
      </div>

      {/* RIGHT PANEL - Analytics */}
      <div style={{width:'300px',padding:'16px',display:window.innerWidth<1100?'none':'block'}}>
        <div style={{background:'#15151e',borderRadius:'16px',padding:'14px'}}><h4 style={{margin:0}}>📊 Analytics</h4><div style={{fontSize:'12px',color:'#888',marginTop:'6px'}}>Impressions: {posts.reduce((a,b)=>a+b.views,0)} total</div><div style={{fontSize:'12px',color:'#888'}}>Posts: {posts.length}</div><div style={{fontSize:'12px',color:'#888'}}>Stories: {stories.length}</div></div>
        <div style={{background:'#15151e',borderRadius:'16px',padding:'14px',marginTop:'16px'}}><h4 style={{margin:0}}>📷 Camera Hub</h4><p style={{fontSize:'11px',color:'#888'}}>Replaces Map</p><button onClick={()=>setTab('camera')} style={{width:'100%',marginTop:'8px',background:'#1f1f2a',border:'none',color:'white',padding:'8px',borderRadius:'8px'}}>Open Camera</button></div>
      </div>

      <div style={{position:'fixed',bottom:0,width:'100%',maxWidth:'600px',left:'50%',transform:'translateX(-50%)',background:'#0f0f14',borderTop:'1px solid #1e1e2a',display:window.innerWidth>900?'none':'flex',justifyContent:'space-around',padding:'8px 0'}}>
        {[{id:'feed',icon:'⌂'},{id:'stories',icon:'◐'},{id:'camera',icon:'📷'},{id:'messages',icon:'✉'},{id:'profile',icon:'☺'}].map(b=><button key={b.id} onClick={()=>setTab(b.id)} style={{background:'none',border:'none',color:tab===b.id?'#7c3aed':'#888',fontSize:'20px'}}>{b.icon}</button>)}
      </div>
    </div>
  )
    }
