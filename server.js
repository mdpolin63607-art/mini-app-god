const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DB = "./db.json";

function readDB(){
  return JSON.parse(fs.readFileSync(DB));
}

function saveDB(data){
  fs.writeFileSync(DB, JSON.stringify(data));
}

function init(db,id){
  if(!db[id]){
    db[id] = { balance:0,lastClaim:0,lastDaily:0,refCount:0,tasks:[] };
  }
}

app.post("/user",(req,res)=>{
  let { id } = req.body;
  let db = readDB();
  init(db,id);
  saveDB(db);
  res.json(db[id]);
});

app.post("/claim",(req,res)=>{
  let { id } = req.body;
  let db = readDB();
  init(db,id);

  let now = Date.now();

  if(now - db[id].lastClaim < 10000){
    return res.json({ error:"Cooldown active" });
  }

  db[id].balance += 100;
  db[id].lastClaim = now;

  saveDB(db);
  res.json(db[id]);
});

app.post("/daily",(req,res)=>{
  let { id } = req.body;
  let db = readDB();
  init(db,id);

  let now = Date.now();

  if(now - db[id].lastDaily < 86400000){
    return res.json({ error:"Already claimed" });
  }

  db[id].balance += 500;
  db[id].lastDaily = now;

  saveDB(db);
  res.json(db[id]);
});

app.get("/top",(req,res)=>{
  let db = readDB();

  let top = Object.entries(db)
    .map(([id,u])=>({ id, balance:u.balance }))
    .sort((a,b)=>b.balance-a.balance)
    .slice(0,10);

  res.json(top);
});

app.listen(3000,()=>console.log("Running"));
