/*  
[ok] Package.json on the front-end 
[ok] Components that can be loaded via ajax
[ok] Components are stored locally and only updated on a version bump in the package.json
[N] Multi tabbed view support
[N] Implement remove component feature
[~] Data binding
[OK] Package.json without ajax
[~] < 1 sec load time
[N] Protected Components 
[N] ~15MB Memory Footprint
[N] .md file parser
[N] Test web workers with window & document args
-------------
*/
var Globe,Globe2;
var $Rigel = function(){

   // (function(){
   //    var x = " <div id='Rigel-load-anim' style='position: absolute;background-color: white;";
   //    x+="x-index:99999;opacity:0.5;width:100%;height:100vh'><p style='position: relative;"
   //    x+="margin-top: 45vh; margin-left: 45%;font-size:40px'>Loading...</p></div> ";
   //    var body = document.querySelector("body");
   //    body.insertAdjacentHTML("beforeend",x);
   // })();

   var __package;
   var __ComponentQ = [];
   var $ = function(x){ return document.querySelector(x); };

   var removeAnim = function(){
      $("body").removeChild($("#Rigel-load-anim"));
   };

   // setTimeout(removeAnim,1000);

   var ajax = function(method,url,asyn=true){
      return new Promise(function(resolve,reject){
         var xhttp = new XMLHttpRequest();
         xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               console.log(this.readyState,this.status);
               resolve(this.responseText);
            }
         };
         xhttp.onerror = function(){reject("Error")}
         xhttp.ontimeout = function(){reject("Timeout")}
         var x = method.toLowerCase();
         if(x!="get" && x!="post") throw new Error("Request type must be either GET or POST");
         if(x=="post") xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         xhttp.open(method.toUpperCase(),url,asyn);
         xhttp.send();
      });
   };

   try{
      __package = JSON.parse($("meta[name=Rigel-package]").attributes['content'].value);
   } catch(e){
      throw new Error("Unable to get package.json. Error :\n",e);
   } 

   (function(){ // Implement Promise
      if(!window.Promise){
         // window.stop();
         document.writeln("");
         document.writeln(`
            <h2>This browser doesn't support some features of javascript.
            Please use a latest browser</h2>
         `);
      }
   })();

   var getModule = function(module){
      if(!window.localStorage){
         return ajax("get","components/"+module,true);
      }
      var c=false;
      if(window.localStorage.getItem("Rigel["+module+"]")){
         var x = JSON.parse(window.localStorage.getItem("Rigel["+module+"]"));
         if(!__package.modules[module]) 
            throw new Error("You need to specify the module in Package.json");
         if(parseFloat(__package.modules[module]) == parseFloat(x.version)){
            return Promise.resolve(x.data);
         } else c=true;
      } else c = true;
      if(c){
         return new Promise(function(resolve,reject){
            ajax("get","components/"+module).then(function(res){
               window.localStorage.setItem("Rigel["+module+"]",JSON.stringify({
                  version: __package.modules[module],
                  data: res.trim()
               }));
               resolve(res);
            },function(e){ throw new Error("Connection Error while trying to load module")});
         });
      }
   };

   var getFromBetween = {
      results:[],
      string:"",
      getFromBetween:function (sub1,sub2) {
          if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
          var SP = this.string.indexOf(sub1)+sub1.length;
          var string1 = this.string.substr(0,SP);
          var string2 = this.string.substr(SP);
          var TP = string1.length + string2.indexOf(sub2);
          return this.string.substring(SP,TP);
      },
      removeFromBetween:function (sub1,sub2) {
          if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
          var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
          this.string = this.string.replace(removal,"");
      },
      getAllResults:function (sub1,sub2) {
          if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;
          var result = this.getFromBetween(sub1,sub2);
          this.results.push(result);
          this.removeFromBetween(sub1,sub2);
          if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
              this.getAllResults(sub1,sub2);
          }
          else return;
      },
      get:function (string,sub1,sub2) {
          this.results = [];
          this.string = string;
          this.getAllResults(sub1,sub2);
          return this.results;
      }
  };

   var Module = function(name,x,y="beforeend"){
      getModule(name+".html")
         .then(function(res){
            _load(res);
         },function(e){
            throw new Error("An error occured while trying to get module.");
         });
      var _load = function(html){
         if(!x) 
            throw new Error("Query for Module to load into is not specified. Can be any valid css selector");
         $(x).insertAdjacentHTML(y,html);
      }
   };

   var SuperObject = function(k,fn){
      var keys = {},values = {};
      for(var i=0;i<k.length;i++){ keys[k[i]] = null; }
      for(i in k){
         (function(x){
            Object.defineProperty(keys,x,{
               get: function(){ return values[x]; },
               set: function(v){ 
                  values[x] = v;
                  fn(x,values[x]);
               }
            });
         })(i);
      }
      return keys;
   };

   var splitIntoNodes = function(s,v){
      var i=0,j=0,t; var fNodes = [];
      if((typeof s)=="string") s= $(s).childNodes;
      for(i;i<s.length;i++){
         if(s[i].nodeName=="#text"){
            t = makeNodes(s[i],v,i);
            i = i + t.splitCount*3;
            fNodes = fNodes.concat(t.fNodes);
         }else if(s[i].nodeName == "INPUT"){
            if(s[i].value.indexOf(v)==0){
               fNodes = fNodes.concat([s[i]]);
            }
         }else {
            t = splitIntoNodes(s[i].childNodes,v);
            fNodes = fNodes.concat(t);
         }
      }
      return fNodes;
   };

   var makeNodes = function(s,v,_c){
      var p = s.nodeValue.search(v),q,r,t,_fNodes = [],c=_c;
      var ds = 0;
      while(p>-1){
         ds++;
         s.splitText(p==0?p:p-1);
         t = s.parentNode.childNodes[c+1];
         t.splitText(v.length+1);
         _fNodes.push(t);
         c = c+2;
         t = s.parentNode.childNodes[c];
         p = t.nodeValue.search(v);
         s = t;
      }
      return { splitCount:ds,fNodes:_fNodes}
   };

   var Parser = function(s){
      if(!s) throw new Error("$Module requires one argument to" +
         " a be a valid css selector of the element.");
      var original = $(s).innerHTML;
      var variables = getFromBetween.get(original,"{{","}}");
      var vars = [];
      for(var i in variables){ 
         vars.includes("$"+variables[i]) ? "Do nothing" : vars.push("$"+variables[i]);
      }
      var keys = {};
      for(var i=0;i<vars.length;i++){
         keys[vars[i]] = splitIntoNodes(s,"[["+vars[i].slice(1)+"]]");
      };
      var superVars = SuperObject(vars,updateModule.bind(this,keys));
      return superVars;
   };

   var updateModule = function(superNodes,k,v){
      console.log("UpdateCompoenet");
      var keys = superNodes,c;
      for(var i=0;i<keys[k].length;i++){
         c = keys[k][i]; // k is an object of keys. Each key is an array.
         c[c.nodeName=="#text"?"nodeValue":"value"] = v;
      }
   };

   Module.prototype.updateModule = updateModule;
   Parser.prototype.updateModule = updateModule;

   return {
      Module: Module,
      ajax: ajax,
      Parser: Parser
   }

};

/*
_p = (k,v)=>{
	let x = []; let p = k.search(v); let q="",r="";
	console.log(p);
	while(p>=0){
		r= k.slice(0,p); x.push(r);
		console.log(r);
		q = k.slice(p,p+v.length); x.push(q);
		r= k.slice(p+v.length+1,k.length);
		
		k = k.slice(p+v.length+1,k.length);
		p = k.search(v);
	}
	return x;
}
*/