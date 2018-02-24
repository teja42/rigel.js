const fs = require("fs");
const express = require("express");
const app = express();
let PACKAGE;

app.use((req,res,next)=>{
   if(req.url!="/") return next();
   res.send(PACKAGE);
});

app.use(express.static("./Public"));

app.get("/backup",(req,res)=>{
   res.download("/home/teja/Documents/k3 Note/k3 Note.zip");
})

fs.readFile("Public/index.html",(err,data)=>{
   fs.readFile("./Public/package.json",(err1,data1)=>{
      data = data.toString();
      data1 = data1.toString();
      PACKAGE = data.replace("{{package}}",data1).replace(/(\r\n|\n|\r)/gm,"");
      app.listen(3001,()=>console.log("ok"));
   });
});