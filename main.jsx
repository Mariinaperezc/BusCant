import React, {useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MapPin,Search,Bus,AlertTriangle,Heart,Clock3,LocateFixed,RefreshCw,Info,ArrowUpRight, Wifi, WifiOff} from 'lucide-react';
import './style.css';

const API = import.meta.env.VITE_API_URL || '';
const fallbackStops = [
 {id:'S001',name:'Estación de Autobuses',town:'Santander',lat:43.4609,lon:-3.809},
 {id:'S002',name:'Ayuntamiento',town:'Santander',lat:43.4628,lon:-3.8095},
 {id:'S003',name:'Valdecilla',town:'Santander',lat:43.4548,lon:-3.8312},
 {id:'T001',name:'Estación',town:'Torrelavega',lat:43.3494,lon:-4.0478},
 {id:'C001',name:'Centro',town:'Castro-Urdiales',lat:43.3828,lon:-3.2194},
 {id:'L001',name:'Estación',town:'Laredo',lat:43.4105,lon:-3.4122},
 {id:'R001',name:'Estación',town:'Reinosa',lat:43.0011,lon:-4.1392}
];
const demoArrivals = (id) => [
 {line:'1',destination:'Sardinero',minutes:4,operator:'TUS',realtime:true},
 {line:'2',destination:'Corbán',minutes:12,operator:'TUS',realtime:false},
 {line:'7',destination:'Valdecilla',minutes:19,operator:'TUS',realtime:false}
];
function App(){
 const [tab,setTab]=useState('paradas'),[stops,setStops]=useState(fallbackStops),[selected,setSelected]=useState(fallbackStops[0]);
 const [arrivals,setArrivals]=useState([]),[incidents,setIncidents]=useState([]),[query,setQuery]=useState(''),[favorites,setFavorites]=useState(()=>JSON.parse(localStorage.getItem('fav')||'[]'));
 const [loading,setLoading]=useState(false),[live,setLive]=useState(false),[now,setNow]=useState(Date.now()),[geo,setGeo]=useState(null);
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{loadBase()},[]);
 useEffect(()=>{if(selected)loadArrivals(selected.id)},[selected]);
 async function loadBase(){try{const [s,i]=await Promise.all([fetch(API+'/api/stops'),fetch(API+'/api/incidents')]);if(s.ok){const d=await s.json();if(d.length)setStops(d)}if(i.ok)setIncidents(await i.json())}catch(e){setLive(false)}}
 async function loadArrivals(id){setLoading(true);try{const r=await fetch(API+'/api/arrivals?stopId='+encodeURIComponent(id));if(!r.ok)throw Error();const d=await r.json();setArrivals(d.arrivals||[]);setLive(!!d.live)}catch(e){setArrivals(demoArrivals(id));setLive(false)}finally{setLoading(false)}}
 const filtered=useMemo(()=>stops.filter(s=>(s.name+' '+s.town+' '+s.id).toLowerCase().includes(query.toLowerCase())),[stops,query]);
 function toggleFav(id){const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];setFavorites(next);localStorage.setItem('fav',JSON.stringify(next))}
 function locate(){if(!navigator.geolocation)return alert('Tu navegador no permite geolocalización');navigator.geolocation.getCurrentPosition(p=>{setGeo({lat:p.coords.latitude,lon:p.coords.longitude});const near=[...stops].sort((a,b)=>dist(a,p.coords)-dist(b,p.coords))[0];if(near)setSelected(near)},()=>alert('No se pudo obtener tu ubicación. Revisa los permisos.'))}
 function dist(s,p){return Math.hypot(s.lat-p.latitude,s.lon-p.longitude)}
 return <div className="app">
  <header><div className="brand"><div className="logo"><Bus size={23}/></div><div><b>CantabriaBus</b><small>Tu transporte, al minuto</small></div></div><button className="iconbtn" onClick={()=>{loadBase();loadArrivals(selected.id)}} aria-label="Actualizar"><RefreshCw size={19}/></button></header>
  <section className="hero"><div className="eyebrow">MOVILIDAD EN CANTABRIA</div><h1>Tu próximo bus,<br/><em>sin incertidumbre.</em></h1><p>Consulta paradas, llegadas e incidencias desde un solo sitio.</p><div className="status"><span className={live?'dot green':'dot amber'}></span>{live?'Conectado a datos en tiempo real':'Modo demostración / horarios no verificados'}</div></section>
  <nav><button className={tab==='paradas'?'active':''} onClick={()=>setTab('paradas')}><MapPin size={17}/> Paradas</button><button className={tab==='incidencias'?'active':''} onClick={()=>setTab('incidencias')}><AlertTriangle size={17}/> Incidencias <span className="badge">{incidents.length}</span></button></nav>
  {tab==='paradas'?<main className="layout">
   <section className="panel stops"><div className="sectionhead"><div><h2>Buscar parada</h2><p>Encuentra tu parada o la más cercana.</p></div><button className="round" onClick={locate} title="Parada más cercana"><LocateFixed size={18}/></button></div>
    <label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre, localidad o código…"/></label>
    {geo&&<div className="geo-note">Ubicación obtenida. Mostrando la parada más cercana.</div>}
    <div className="stoplist">{filtered.map(s=><button key={s.id} className={'stop '+(selected.id===s.id?'chosen':'')} onClick={()=>setSelected(s)}><span className="pin"><MapPin size={17}/></span><span className="stoptext"><b>{s.name}</b><small>{s.town} · {s.id}</small></span><button className="fav" onClick={e=>{e.stopPropagation();toggleFav(s.id)}} aria-label="Favorito"><Heart size={17} fill={favorites.includes(s.id)?'currentColor':'none'}/></button></button>)}
     {!filtered.length&&<p className="empty">No se han encontrado paradas.</p>}</div>
   </section>
   <section className="panel arrivals"><div className="sectionhead"><div><div className="eyebrow dark">PARADA SELECCIONADA</div><h2>{selected.name}</h2><p>{selected.town} · {selected.id}</p></div><span className="livepill"><span className={live?'dot green':'dot amber'}></span>{live?'EN VIVO':'HORARIO'}</span></div>
    <div className="arrivalhead"><span>PRÓXIMAS LLEGADAS</span><span>ACTUALIZACIÓN {loading?'…':'· '+new Date(now).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span></div>
    {arrivals.length?arrivals.map((a,i)=><div className="arrival" key={i}><div className="line">{a.line}</div><div className="destination"><b>{a.destination}</b><small>{a.operator||'Operador'} · {a.realtime?'Estimación en tiempo real':'Hora programada'}</small></div><div className="eta"><b>{a.minutes===0?'Ahora':a.minutes+'′'}</b><small>{a.realtime?'estimado':'previsto'}</small></div></div>):<div className="empty">No hay llegadas disponibles para esta parada.</div>}
    <div className="notice"><Info size={17}/><span>Las estimaciones solo son realmente en vivo cuando el operador publica datos GPS o SIRI/GTFS-RT. Los horarios programados se identifican por separado.</span></div>
   </section>
  </main>:<main className="panel incidents"><div className="sectionhead"><div><h2>Incidencias del servicio</h2><p>Avisos que pueden afectar a tu viaje.</p></div><AlertTriangle size={23}/></div>
   {incidents.length?incidents.map((x,i)=><article className="incident" key={i}><div className="incidenticon"><AlertTriangle size={19}/></div><div><b>{x.title}</b><p>{x.description}</p><small>{x.operator||'Red de transporte'} · {x.updatedAt||'Fecha no disponible'}</small></div></article>):<div className="empty">No hay incidencias publicadas en la fuente conectada. Esto no garantiza que no existan alteraciones.</div>}
   <div className="notice"><Info size={17}/><span>Las incidencias oficiales dependen de que cada operador publique avisos accesibles. No se inventan alertas cuando no hay datos.</span></div>
  </main>}
  <footer><span>© CantabriaBus · Proyecto independiente</span><span><Wifi size={14}/> {live?'Datos conectados':'Datos de prueba'}</span></footer>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);