import 'dotenv/config';
import express from 'express';
import cors from 'cors';
const app=express(); app.use(cors()); app.use(express.json());
const PORT=process.env.PORT||8787;
const upstream=process.env.REALTIME_API_URL;
const key=process.env.REALTIME_API_KEY;
async function getUpstream(path){
 if(!upstream) return null;
 const r=await fetch(upstream.replace(/\/$/,'')+path,{headers:key?{'Authorization':`Bearer ${key}`}:{},signal:AbortSignal.timeout(8000)});
 if(!r.ok) throw new Error(`Upstream ${r.status}`);
 return r.json();
}
app.get('/api/health',(req,res)=>res.json({ok:true,provider:upstream?'configured':'demo'}));
app.get('/api/stops',async(req,res)=>{try{const d=await getUpstream('/stops');if(d)return res.json(d)}catch(e){console.error(e.message)}res.json([])});
app.get('/api/arrivals',async(req,res)=>{try{const id=encodeURIComponent(req.query.stopId||'');const d=await getUpstream('/arrivals?stopId='+id);if(d)return res.json({...d,live:true})}catch(e){console.error(e.message)}res.json({live:false,arrivals:[]})});
app.get('/api/incidents',async(req,res)=>{try{const d=await getUpstream('/incidents');if(d)return res.json(d)}catch(e){console.error(e.message)}res.json([])});
app.post('/api/incidents/report',(req,res)=>res.status(501).json({error:'El envío de avisos comunitarios requiere configurar almacenamiento y moderación.'}));
app.listen(PORT,()=>console.log(`CantabriaBus API en http://localhost:${PORT}`));