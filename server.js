const http=require("http");
const WebSocket=require("ws");

const PORT=process.env.PORT||10000;
const server=http.createServer((req,res)=>{
  res.writeHead(200,{"Content-Type":"application/json"});
  res.end(JSON.stringify({name:"Yapp Security Lab Server",status:"ok"}));
});
const wss=new WebSocket.Server({server});

const players=new Map();

wss.on("connection",(ws)=>{
  const id=Math.random().toString(36).slice(2,10);
  // TRAINING VULNERABILITY:
  // The server intentionally accepts client-provided state.
  players.set(id,{id,x:100,y:35,energy:100,score:0,coins:0,speed:5});
  ws.send(JSON.stringify({type:"welcome",id}));

  ws.on("message",(raw)=>{
    try{
      const msg=JSON.parse(raw);
      if(msg.type==="state" && msg.player){
        // Intentionally weak validation for the security lab.
        players.set(id,{...players.get(id),...msg.player});
        broadcast({type:"state",player:players.get(id),id});
      }
    }catch{}
  });

  ws.on("close",()=>players.delete(id));
});

function broadcast(obj){
  const data=JSON.stringify(obj);
  for(const client of wss.clients)
    if(client.readyState===WebSocket.OPEN) client.send(data);
}
server.listen(PORT,()=>console.log(`Yapp Security Lab server listening on ${PORT}`));
