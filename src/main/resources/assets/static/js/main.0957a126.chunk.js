(this["webpackJsonpclient-react"]=this["webpackJsonpclient-react"]||[]).push([[0],{15:function(e,t,a){e.exports=a(243)},20:function(e,t,a){},21:function(e,t,a){},22:function(e,t,a){},23:function(e,t,a){},236:function(e,t,a){},237:function(e,t,a){},238:function(e,t,a){},239:function(e,t,a){},24:function(e,t,a){},242:function(e,t,a){},243:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),i=a(10),c=a.n(i),o=(a(20),a(3)),s=(a(21),a(22),a(23),a(6)),l=a.n(s);function u(e){var t={icon:e.icon?e.icon:"box",rounded:!!e.rounded&&e.rounded,foreground:e.foreground?e.foreground:"white",background:e.background,size:e.size?e.size:20,spacing:e.spacing?e.spacing:4},a={backgroundColor:t.background,color:t.foreground,height:t.size,width:t.size};t.rounded&&(a.marginLeft="".concat(t.spacing,"px"),a.marginRight="".concat(t.spacing,"px"));var n=l.a.icons[t.icon]?{__html:l.a.icons[t.icon].toSvg({color:t.foreground,height:t.size,width:t.size})}:void 0;return t.rounded?r.a.createElement("span",{className:"generic-icon",dangerouslySetInnerHTML:n,style:{backgroundColor:t.background,borderRadius:"100px",color:t.foreground,height:"".concat(t.size+8,"px"),marginLeft:"".concat(t.spacing,"px"),marginRight:"".concat(t.spacing,"px"),padding:"4px",width:"".concat(t.size+8,"px")}}):r.a.createElement("span",{className:"generic-icon",dangerouslySetInnerHTML:n})}a(24);function d(e){var t;return r.a.createElement("div",null,r.a.createElement("img",{src:null===(t=e.profile)||void 0===t?void 0:t.img,className:"ui tiny circular image"}))}function m(e){var t=e.internalLinks.concat(e.externalLinks).map((function(t,a){return r.a.createElement("a",{key:t.target,"data-tab":t.target,className:"ui item".concat(t.target===e.defaultItem?" active":""),onClick:function(){return e.callback(t.target)}},r.a.createElement(u,{icon:t.icon,size:0===a?32:16}),0!==a&&r.a.createElement("h3",null,t.name))})),a=r.a.useRef(null),n=e.internalLinks.concat(e.externalLinks).map((function(t){return r.a.createElement("a",{key:t.target,className:"ui item".concat(t.target===e.defaultItem?" active":""),"data-tab":t.target,onClick:function(){a.current.classList.remove("active"),e.callback(t.target)}},r.a.createElement(u,{icon:t.icon}),r.a.createElement("b",null,t.name))}));return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",{className:"ui inverted menu desktop navbar"},t,r.a.createElement("span",{style:{flexGrow:1}}),r.a.createElement(d,{profile:e.profile,login:e.login})),r.a.createElement("div",{className:"ui inverted menu mobile navbar vertcal fluid"},r.a.createElement("div",{ref:a},n)))}var p=a(1),f=a.n(p),h=a(2),v=function(e){if(e)return"nvidia"===(e=e.toLowerCase()).substr(0,6)?"nvidia":"qualcomm"===e.substr(0,8)?"qualcomm":"ati"===e.substr(0,3)||"amd"===e.substr(0,3)?"amd":"intel"===e.substr(0,5)?"intel":"google"===e.substr(0,6)?"google":"apple"===e.substr(0,5)||"macos"===e.substr(0,5)||"ios"===e.substr(0,3)||"mac os x"===e.substr(0,8)?"apple":"samsung"===e.substr(0,7)||"smdk"===e.substr(0,4)?"samsung":"linux"===e.substr(0,5)?"linux":"windows"===e.substr(0,7)?"windows":"android"===e.substr(0,7)?"android":-1!==e.indexOf("gamecube")?"nintendogamecube":-1!==e.indexOf("wii u")?"wiiu":-1!==e.indexOf("wii")?"wii":-1!==e.indexOf("emscripten")||-1!==e.indexOf("webasm")?"webassembly":-1!==e.indexOf("edge")?"microsoftedge":-1!==e.indexOf("chrom")?"googlechrome":-1!==e.indexOf("firefox")?"mozillafirefox":-1!==e.indexOf("safari")?"safari":-1!==e.indexOf("msie")||-1!==e.indexOf("trident")?(console.log("What? How did you do that?"),"internetexplorer"):e},g=function(e){return 15===e?"SIGTERM":11===e?"SIGSEGV":9===e?"SIGKILL":8===e?"SIGFPE":7===e?"SIGBUS":6===e?"SIGABRT":5===e?"SIGTRAP":4===e?"SIGILL":1===e?"SIGHUP":""+e},b=function(e,t,a){if(t.links){var n=function(e){return t.links.filter((function(t){return t.uri.endsWith("/"+e)}))[0]},r={delete:function(){var e=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",r.plain.fetch("","DELETE").then());case 1:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),expand:function(){var e=Object(h.a)(f.a.mark((function e(t){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("unloaded"===r.state){e.next=2;break}return e.abrupt("return");case 2:return r.state="loading",e.next=5,r.machineInfo.get();case 5:return e.next=7,r.stdout.get();case 7:return e.next=9,r.stderr.get();case 9:return e.next=11,r.stackRaw.get();case 11:t();case 12:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),stdout:{code:0},stderr:{code:0},stackRaw:{code:0},machineInfo:{code:0},endpoints:e.endpoints,links:t.links,state:"unloaded",data:t.data,type:"Crash",plain:e.plain.prefixedWith(t.links[0]),auth:e.auth.prefixedWith(t.links[0]),auths:e.auths,reportView:{submitTime:t.data.submitTime}};return r.stdout.get=c(r.stdout,"stdout"),r.stderr.get=c(r.stderr,"stderr"),r.stackRaw.get=Object(h.a)(f.a.mark((function e(){var t;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,c(r.stackRaw,"stacktrace")();case 2:if(200===r.stackRaw.code){e.next=4;break}return e.abrupt("return");case 4:t=[];try{t=JSON.parse(r.stackRaw.data)}catch(a){try{t=JSON.parse(r.stackRaw.data+"{}]")}catch(n){}}r.stack=t;case 7:case"end":return e.stop()}}),e)}))),r.machineInfo.get=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i(r.machineInfo,"machine")().then((function(e){r.reportView={machine:e,submitTime:r.reportView.submitTime}}));case 2:case"end":return e.stop()}}),e)}))),r}function i(t,a){return function(){return e.plain.activateJson(n(a)).then((function(e){if(t.code=200,200===t.code)return t.data=e,t.data}))}}function c(t,a){return function(){return e.plain.activateRaw(n(a)).then((function(e){t.code=200,200===t.code&&e&&(t.data=e)}))}}},E=function(e,t,a){if(t.links){var n={data:t.data,type:"Report",links:t.links,state:"unloaded",endpoints:e.endpoints,delete:function(){var e=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n.auth.fetch("","DELETE");case 2:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),expand:function(){var e=Object(h.a)(f.a.mark((function e(t){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n.machineInfo.get();case 2:t();case 3:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),machineInfo:{code:0},plain:e.plain.prefixedWith(t.links[0]),auth:e.auth.prefixedWith(t.links[0]),auths:e.auths,reportView:{submitTime:t.data.submitTime}};return n.machineInfo.get=Object(h.a)(f.a.mark((function e(){var t;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n.plain.fetch("");case 2:t=e.sent,n.machineInfo.code=200,200===n.machineInfo.code&&t.data&&(n.machineInfo.data=t.data,n.reportView.machine=t.data);case 5:case"end":return e.stop()}}),e)}))),n}},k=[{key:"system",filter:function(e,t){if("Report"!==e.type||!t)return!1;var a=t.toLowerCase();return-1!==e.data.system.toLowerCase().indexOf(a)}},{key:"id",filter:function(e,t){return!!t&&("Crash"===e.type?e.data.crashId+""===t:"Report"===e.type?e.data.reportId+""===t:void 0)}},{key:"code",filter:function(e,t){if("Crash"!==e.type||!t)return!1;var a=g(e.data.exitCode).toLowerCase(),n=t.toLowerCase();return e.data.exitCode+""===t||a===n}}],w=function(e){return function(t){return!e||0===e.length||(!("Report"!==t.type||!k[0].filter(t,e))||e.split(" ").map((function(a){if("Crash"===t.type){var n=e.split(":"),r=Object(o.a)(n,2),i=r[0],c=r[1];return k.map((function(e){return e.key==i&&e.filter(t,c)})).filter((function(e){return e})).length>0}if("Report"===t.type){var s=e.split(":"),l=Object(o.a)(s,2),u=l[0],d=l[1];return k.map((function(e){return e.key==u&&e.filter(t,d)})).filter((function(e){return e})).length>0}})).filter((function(e){return e})).length===e.split(" ").length)}},y=a(4),x=a(5);function O(e,t,a,n){return j.apply(this,arguments)}function j(){return(j=Object(h.a)(f.a.mark((function e(t,a,n,r){var i;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(i=JSON.parse(localStorage["Kafei-Api-Token"])){e.next=5;break}return"no authorization token available",401,e.abrupt("return",Promise.reject({message:"no authorization token available",code:401}));case 5:return e.next=7,fetch(t.data+a,{method:n||"GET",mode:"cors",cache:"no-cache",headers:{Accept:"application/json","Content-Type":"application/json",Authorization:"Bearer "+i.token},body:r?JSON.stringify(r):void 0});case 7:return e.abrupt("return",e.sent);case 8:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var N=function(){function e(t,a,n){Object(y.a)(this,e),this.authState=void 0,this.inLinks=void 0,this.outLinks=void 0,this.links=void 0,this.authState=t,this.inLinks=a,this.outLinks=n,this.links=n}return Object(x.a)(e,[{key:"loggedInCycle",value:function(e){e&&(localStorage["Kafei-Api-Token"]=JSON.stringify(e),this.authState.loggedIn=!0,this.authState.username=e.username,this.links=this.inLinks)}},{key:"loggedOutCycle",value:function(){localStorage.removeItem("Kafei-Api-Token"),this.authState.loggedIn=!1,this.authState.username=void 0,this.links=this.outLinks}},{key:"isLoggedIn",value:function(){var e=Object(h.a)(f.a.mark((function e(t){var a;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,!(a=JSON.parse(localStorage["Kafei-Api-Token"]))){e.next=9;break}return e.next=5,O(t,"/v2/users/checkAuthenticate");case 5:if(!e.sent){e.next=9;break}return this.loggedInCycle(a),e.abrupt("return",!0);case 9:e.next=13;break;case 11:e.prev=11,e.t0=e.catch(0);case 13:return e.abrupt("return",!1);case 14:case"end":return e.stop()}}),e,this,[[0,11]])})));return function(t){return e.apply(this,arguments)}}()}]),e}(),S=a(11),I=a.n(S),R=function(){function e(t){Object(y.a)(this,e),this.fetchFunc=void 0,this.fetchFunc=t}return Object(x.a)(e,[{key:"fetchJson",value:function(){var e=Object(h.a)(f.a.mark((function e(t,a,n){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.fetchFunc(t,a,n).then((function(e){return e.json()})).then((function(e){return e})));case 1:case"end":return e.stop()}}),e,this)})));return function(t,a,n){return e.apply(this,arguments)}}()},{key:"fetch",value:function(){var e=Object(h.a)(f.a.mark((function e(t,a,n){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.fetchJson(t,a,n).then((function(e){return e})).catch((function(e){return e})));case 1:case"end":return e.stop()}}),e,this)})));return function(t,a,n){return e.apply(this,arguments)}}()},{key:"raw",value:function(){var e=Object(h.a)(f.a.mark((function e(t){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.fetchFunc(t).then((function(e){return e.text()})).catch((function(e){return console.log(e)})));case 1:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"activate",value:function(){var e=Object(h.a)(f.a.mark((function e(t,a){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.fetch(t.uri,t.method,a));case 1:case"end":return e.stop()}}),e,this)})));return function(t,a){return e.apply(this,arguments)}}()},{key:"activateJson",value:function(){var e=Object(h.a)(f.a.mark((function e(t,a){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.fetchJson(t.uri,t.method,a));case 1:case"end":return e.stop()}}),e,this)})));return function(t,a){return e.apply(this,arguments)}}()},{key:"activateRaw",value:function(){var e=Object(h.a)(f.a.mark((function e(t,a){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.raw(t.uri));case 1:case"end":return e.stop()}}),e,this)})));return function(t,a){return e.apply(this,arguments)}}()},{key:"prefixedWith",value:function(t){var a=this;return new e((function(e,n,r){return a.fetchFunc(t.uri+"/"+e,n,r)}))}}]),e}();function L(){return(L=Object(h.a)(f.a.mark((function e(t,a,n,r){var i,c;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:try{c=new URL(a),console.log(a,c.hostname),i=a}catch(o){i=t.data+a}return e.abrupt("return",fetch(i,{method:n||"GET",cache:"no-cache",headers:{Accept:"application/json","Content-Type":"application/json"},body:r?JSON.stringify(r):void 0}));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var C=function(){function e(t){var a=this;Object(y.a)(this,e),this.listener=void 0,this.listeners=[],this.listener=new I.a.Client("wss://birchy.dev:8083/","kafei.dev"),this.listener.onMessageArrived=function(e){return a.listeners.forEach((function(t){return t(JSON.parse(e.payloadString))}))},this.listener.connect({timeout:3,onSuccess:function(){return t.forEach((function(e){return a.listener.subscribe(e)}))}})}return Object(x.a)(e,[{key:"addHandler",value:function(e){this.listeners.push(e)}},{key:"addJsonHandler",value:function(e){this.listeners.push((function(t){e(JSON.parse(t))}))}}]),e}(),T=function(e,t,a,n){var r=new N({loggedIn:!1,username:void 0,profileImg:void 0,fetch:function(e){function t(t,a,n){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}(function(){var t=Object(h.a)(f.a.mark((function t(a,n,r){var i;return f.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(i=JSON.parse(localStorage["Kafei-Api-Token"])){t.next=3;break}return t.abrupt("return");case 3:return t.next=5,fetch(e.data+a,{method:n||"GET",cache:"no-cache",headers:{Accept:"application/json",Authorization:"Bearer "+i.token,"Content-Type":"application/json"},body:r?JSON.stringify(r):void 0}).then((function(e){return e.json()})).then((function(e){return e.data?e.data:e})).catch((function(e){console.log(e)}));case 5:return t.abrupt("return",t.sent);case 6:case"end":return t.stop()}}),t)})));return function(e,a,n){return t.apply(this,arguments)}}())},[{text:"Sign in",icon:"log-in",color:"green",action:function(){var t=Object(h.a)(f.a.mark((function t(){var a;return f.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r.isLoggedIn(e);case 2:if(!t.sent){t.next=4;break}return t.abrupt("return");case 4:return t.next=6,r.authState.fetch("/v2/users/authenticate","POST",{username:prompt("Username"),password:prompt("Password")}).then((function(e){return e}));case 6:if(a=t.sent){t.next=9;break}return t.abrupt("return");case 9:r.loggedInCycle(a);case 10:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}()},{text:"Register",icon:"edit-2",color:"blue",action:function(){var e=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}],[{text:"Sign out",icon:"log-out",color:"red",action:function(){var e=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",r.loggedOutCycle());case 1:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()}]);r.links=r.outLinks;var i={plain:new R((function(t,a,n){return function(e,t,a,n){return L.apply(this,arguments)}(e,t,a,n)})),auth:new R(r.authState.fetch)},c={endpoints:e,auths:r.authState,auth:i.auth,plain:i.plain,mqtt:new C(["public/diagnostics/#"]),triggerUpdate:function(){var e=Object(h.a)(f.a.mark((function e(){var t,a,n,r;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.plain.fetch("/v2/crash");case 2:return(n=e.sent).data&&(t=n.data.reverse().map((function(e,t){return b(c,e)}))),e.next=6,i.plain.fetch("/v2/reports");case 6:(r=e.sent).data&&(a=r.data.reverse().map((function(e,t){return E(c,e)}))),c.propagateUpdate&&c.propagateUpdate({crashes:t||[],reports:a||[]});case 9:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()};return c.mqtt.addJsonHandler(Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("got MQTT message"),e.next=3,c.triggerUpdate();case 3:case"end":return e.stop()}}),e)})))),{endpoints:e,login:r,diagnostics:c,profile:t,menu:{links:[{name:"Home",target:"nav::home",icon:"home"},{name:"Examples",target:"nav::examples",icon:"package"},{name:"Diagnostics",target:"nav::diag",icon:"activity"}],externals:[]},releases:{releases:a,primaryRepo:n}}},F=(a(27),a(12));function z(e){var t=Object(n.useRef)(null);return Object(n.useEffect)((function(){return Object(F.highlightBlock)(t.current)}),[]),r.a.createElement("div",{className:"code-block"},r.a.createElement("pre",null,r.a.createElement("code",{ref:t,className:"".concat(e.language)},e.children)))}a(236);function A(e){return r.a.createElement("div",{className:"update-bubble"},r.a.createElement("div",{className:"image",onClick:e.action},e.image,e.imageSrc&&r.a.createElement("img",{src:e.imageSrc})),r.a.createElement("div",{className:"content"},r.a.createElement("div",{className:"title"},e.title),e.content))}function G(e){var t=e.yggdrasil.profile;return r.a.createElement("div",{"data-tab":"nav::home",className:"ui inverted text tab segment active"},r.a.createElement(A,{title:r.a.createElement("p",null,r.a.createElement("b",null,"username")," ",t.username),content:r.a.createElement("p",null,"All the code is on Github"),image:r.a.createElement("img",{src:t.img})}),r.a.createElement("h2",{className:"ui header"},"Getting started"),r.a.createElement("p",null,"Get started by cloning the source code"),r.a.createElement(z,{language:"bash"},"git clone https://github.com/hbirchtree/coffeecutie.git"),r.a.createElement("p",null,"If all your compilers and CMake are in order, you should be able to use the quick-build option as such"),r.a.createElement(z,{language:"bash"},"BUILD_MODE=bare ./cb quick-build [ubuntu.amd64, fedora.amd64, osx, ios.x86_64]"),r.a.createElement("p",null,"Additionally, if you don't want to set up compilers and etc., and you have Docker installed, you can go ahead with"),r.a.createElement(z,{language:"bash"},"./cb quick-build [ubuntu.amd64, fedora.amd64]"))}function J(e){var t,a=Object(n.useState)({state:"unloaded"}),i=Object(o.a)(a,2),c=i[0],s=i[1],l=Object(n.useState)({state:"unloaded"}),u=Object(o.a)(l,2),d=u[0],m=u[1];if("unloaded"===c.state){var p=e.releases.net.plain;Object(h.a)(f.a.mark((function t(){var a;return f.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:a=e.releases.info.releases.map((function(e){return p.fetch("/github/latestRelease/"+e.replace("/","_"))})),Promise.all(a).then((function(e){var t=e.map((function(e){return e.data?e.data:void 0})).filter((function(e){return e}));s({releases:t,state:"loaded"})}));case 2:case"end":return t.stop()}}),t)})))(),s({state:"loading"})}if("unloaded"==d.state){var v=e.releases.net.plain;Object(h.a)(f.a.mark((function t(){var a;return f.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,v.fetch("/github/updateInfo/"+e.releases.info.primaryRepo.replace("/","_"));case 2:(a=t.sent)&&a.data&&m({state:"loaded",commit:a.data});case 4:case"end":return t.stop()}}),t)})))()}var g="loaded"===d.state&&d.commit&&d.commit.head_commit?r.a.createElement(A,{title:e.releases.info.primaryRepo,content:r.a.createElement(r.a.Fragment,null,null===(t=d.commit.head_commit)||void 0===t?void 0:t.message.split("\n").map((function(e){return r.a.createElement("p",{key:e,style:{margin:"0"}},e)})))}):r.a.createElement("div",{className:"ui active loader",style:{height:"2em"}}),b="loaded"===c.state&&c.releases?c.releases.map((function(e,t){var a,n,i,c=r.a.createElement("a",{key:t,href:null===(a=e.release)||void 0===a?void 0:a.html_url},null===(n=e.release)||void 0===n?void 0:n.tag_name);return r.a.createElement("div",{key:t,className:"row"},r.a.createElement("div",{className:"column"},r.a.createElement("p",null,null===(i=e.repository)||void 0===i?void 0:i.name)),r.a.createElement("div",{className:"column"},c))})):r.a.createElement("div",{className:"ui active loader",style:{height:"2em"}});return r.a.createElement("div",{"data-tab":"nav::examples",className:"ui inverted text tab segment"},r.a.createElement("div",{style:{position:"relative"}},g),r.a.createElement("p",null,"Every release generates downloadable binaries for Linux and macOS platforms, found here:"),r.a.createElement("div",{className:"ui two column grid",style:{position:"relative"}},r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"column"},r.a.createElement("b",null,"Repository")),r.a.createElement("div",{className:"column"},r.a.createElement("b",null,"Release"))),b))}a(237);function U(e){return r.a.createElement("div",{className:"ui container inverted property-group",style:{flexDirection:"column"}},r.a.createElement("h4",{className:"ui horizontal divider header inverted"},r.a.createElement("span",{className:"flex-centered"},r.a.createElement(u,{icon:e.icon}),e.title)),r.a.createElement("div",{className:"ui divided internally called centered grid inverted"},e.children))}function _(e){return r.a.createElement("div",{className:"ui row inverted property-row"},r.a.createElement("div",{className:"ui right aligned four wide column header inverted"},r.a.createElement("h5",{className:"ui header inverted"},e.name)),r.a.createElement("div",{className:"ui ten wide column inverted flex-row"},e.children))}var M=a(13),W=a.n(M);function V(e){var t={icon:e.icon?e.icon:v(e.basedOn),size:e.size?e.size:24,color:e.color?e.color:"white"},a=t.icon?W.a.get(t.icon):void 0;return a?r.a.createElement("div",{className:"brand-icon",style:{backgroundColor:t.color,mask:"url(data:image/svg+xml,".concat(encodeURI(a.svg),")"),WebkitMask:"url(data:image/svg+xml,".concat(encodeURI(a.svg),")"),height:"".concat(t.size,"px"),width:"".concat(t.size,"px")}}):r.a.createElement(u,{size:t.size,icon:"box"})}a(238);function B(e){return r.a.createElement("button",{disabled:!e.action,onClick:e.action,className:"ui ".concat(e.color?e.color:"blue"," button flex-centered-important"),style:{margin:e.margin?e.margin:"1em"}},e.icon&&r.a.createElement(u,{icon:e.icon})," ",e.label)}var D=function(e){var t,a=["red","orange","green","teal","blue","violet","purple","pink"];return a[(t=e,Math.abs(t.split("").reduce((function(e,t){return(e=(e<<5)-e+t.charCodeAt(0))&e}),0)))%a.length]};function P(e){var t,a,n=e.data.machine,i={};if(n){var c=n.application,o=n.build,s=n.device,l=n.extra,u=n.processor,d=n.runtime,m=n.memory,p=function(e,t,a){return t[e]?r.a.createElement(_,{name:a||e},t[e]):r.a.createElement(r.a.Fragment,null)},f=d.arguments?d.arguments.map((function(e,t){return r.a.createElement(_,{key:t,name:"arg[".concat(t,"]")},e)})):[],h=l&&{manufacturer:l["gl:vendor"],model:l["gl:renderer"],driver:l["gl:driver"],api:l["graphics:library"],context:l["gl:version"],shadercontext:l["glsl:version"],sdl2ver:l["sdl2:version"],windowing:l["window:library"]},v=s&&{model:s.machineModel,manufacturer:s.machineManufacturer},g=d&&{kernel:d.kernel&&d.kernelVersion&&d.kernel+" "+d.kernelVersion,distro:d.distro&&d.distroVersion&&d.distro+" "+d.distroVersion};v.model||(v.manufacturer=s.name.split(" running ")[0]),g.distro||(g.distro=s.name.split(" running ")[1]);var b={};i={application:c&&r.a.createElement(U,{icon:"package",title:"Application"},p("name",c),p("organization",c,"source"),p("version",c)),build:o&&r.a.createElement(U,{key:"build",icon:"tool",title:"Engine build"},p("version",o,"engine version"),p("buildMode",o,"mode"),r.a.createElement(_,{name:"compiler"},o.compiler," "," ","0.0.0"!==o.compilerVersion?o.compilerVersion:""),o.target?r.a.createElement(_,{name:"target kernel"},r.a.createElement(r.a.Fragment,null,r.a.createElement(V,{basedOn:o.target}),o.target)):r.a.createElement(r.a.Fragment,null),p("architecture",o,"target architecture")),runtime:d&&r.a.createElement(U,{key:"runtime",icon:"terminal",title:"Runtime Info"},g.kernel?r.a.createElement(_,{name:"kernel"},r.a.createElement(r.a.Fragment,null,r.a.createElement(V,{basedOn:g.kernel}),g.kernel)):r.a.createElement(r.a.Fragment,null),g.distro?r.a.createElement(_,{name:"distro"},r.a.createElement(r.a.Fragment,null,r.a.createElement(V,{basedOn:g.distro}),g.distro)):r.a.createElement(r.a.Fragment,null),d.architecture?r.a.createElement(_,{name:"architecture"},(a=d.architecture,"aarch64"===(a=a.toLowerCase())?"ARMv8-64":a)):r.a.createElement(r.a.Fragment,null),p("cwd",d),r.a.createElement(r.a.Fragment,null,f)),device:s&&r.a.createElement(U,{icon:"server",title:"Device"},r.a.createElement(_,{name:"device"},r.a.createElement(r.a.Fragment,null,r.a.createElement(V,{basedOn:v.manufacturer}),v.manufacturer," ",v.model)),r.a.createElement(_,{name:"motherboard"},s.motherboard," ",s.motherboardVersion),r.a.createElement(_,{name:"dpi"},s.dpi.toFixed(2))),processor:u&&r.a.createElement(U,{icon:"cpu",title:"Processor"},r.a.createElement(_,{name:"model"},r.a.createElement(r.a.Fragment,null,r.a.createElement(V,{basedOn:u.model}),u.model," (",u.firmware,")")),r.a.createElement(_,{name:"layout"},u.cores+""," cores, ",u.threads+""," threads"),r.a.createElement(r.a.Fragment,null,m&&r.a.createElement(_,{name:"memory"},Math.ceil(m.bank/1048576)+"MB / "+Math.ceil(m.bank/1073741824)+"GB"))),graphics:h&&h.model&&r.a.createElement(U,{icon:"tv",title:"Graphics"},r.a.createElement(_,{name:"gpu"},r.a.createElement(V,{basedOn:h.model}),h.model.startsWith(h.manufacturer)?"":h.manufacturer,h.model),h.driver&&r.a.createElement(_,{name:"gpu driver"},h.driver),h.api&&r.a.createElement(_,{name:"gpu api"},r.a.createElement(V,{basedOn:h.api}),h.api),h.api&&h.api.startsWith("OpenGL")&&h.context&&h.shadercontext&&r.a.createElement(r.a.Fragment,null,r.a.createElement(_,{name:"OpenGL ver"},h.context),r.a.createElement(_,{name:"OpenGL SL ver"},h.shadercontext)),h.windowing&&r.a.createElement(_,{name:"windowing lib"},h.windowing)),tags:n.extra&&r.a.createElement(U,{icon:"",title:"Tags"},(n.extra["gl:extensions"]?n.extra["gl:extensions"].split(" "):[]).filter((function(e){return e.startsWith("GL_ARB")||e.startsWith("GL_KHR")||-1!==e.indexOf("texture_compression_")||!1})).map((function(e){return r.a.createElement("a",{key:e,className:"ui label "+D(e)},e)})),(t=n.extra["gl:limits"]?n.extra["gl:limits"].split(","):[],t.sort(),t).map((function(e){var t=e.split("=");return t.length<2||b[t[0]]?null:(b[t[0]]=1,r.a.createElement("div",{key:t[0],className:"ui label "+D(t[0])},t[0],r.a.createElement("div",{className:"detail"},t[1])))})))}}return r.a.createElement("div",null,r.a.createElement(U,{icon:"box",title:"Basic Information"},r.a.createElement(_,{name:"".concat(e.name," ID")},e.id+""),r.a.createElement(_,{name:"submission time"},e.data.submitTime.toString())),r.a.createElement(U,{icon:"edit",title:"Actions"},r.a.createElement(r.a.Fragment,null,e.delete&&r.a.createElement(B,{label:"Delete",color:"red"}),e.view&&r.a.createElement(B,{label:"View",icon:"cloud",action:e.view}),e.download&&r.a.createElement(B,{label:"Download",icon:"download",action:e.download}))),i.application,i.build,i.runtime,i.device,i.processor,i.graphics,i.tags)}a(239);function H(e){var t=e.data.filter((function(e){return void 0!==e.frame})).map((function(e){var t=e.frame.startsWith("void ")?"":"auto ",a=e.frame.indexOf("("),n=(-1!==a?e.frame.substr(0,a):e.frame)+"(...)";return"<unknown module> "+e.ip.replace("0x0x","0x")+" "+t+n+"\n"}));return r.a.createElement(U,{icon:"file-text",title:"Stacktrace"},t.length>0?r.a.createElement("div",{className:"ui segment left aligned inverted stack-segment",style:{flexDirection:"column"}},r.a.createElement(z,{language:"cpp"},t)):r.a.createElement("p",null,"No stacktrace available"))}function q(e){return r.a.createElement("div",{className:"ui segment left aligned inverted log-segment",style:{flexGrow:1,margin:0,padding:0}},r.a.createElement(z,{language:"none"},e.data))}function K(e){var t,a,i=Object(n.useState)(e.data),c=Object(o.a)(i,2),s=c[0],l=c[1],d=Object(n.useState)(e.data.state),m=Object(o.a)(d,2),p=m[0],v=m[1],b=Object(n.useState)("collapsed"),E=Object(o.a)(b,2),k=E[0],w=E[1],y=s.type,x=function(){var e=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(w("collapsed"===k?"shown":"collapsed"),"unloaded"===p){e.next=3;break}return e.abrupt("return");case 3:v("loading"),s.expand((function(){v("loaded"),l(s)}));case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),O=0;"Crash"===s.type?O=s.data.crashId:"Report"===s.type&&(O=s.data.reportId),"Report"===s.type&&(t=s.data.system.split(" running ")[0].split(" ")[0],a=s.data.system.split(" running ")[1]);var j=[t?r.a.createElement("a",{className:"ui label green"},t):null,a?r.a.createElement("a",{className:"ui label blue"},a):null];return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",{onClick:x,className:"report-header"},y," - ","Report"===s.type?s.data.system.split(" running")[0]:g(s.data.exitCode),j,r.a.createElement(u,{icon:"chevron-down"})),r.a.createElement("div",{className:"report-view ".concat(k),style:{position:"relative"}},"shown"===k?r.a.createElement(r.a.Fragment,null,r.a.createElement(P,{data:s.reportView,name:y,id:O,download:function(){return window.open(e.downloadUrl,"_blank")},view:function(){return window.open(e.tracerTemplate.replace("{src}",e.downloadUrl))}}),"loading"===p&&r.a.createElement("div",{className:"ui active loader",style:{position:"relative",height:"40px"}}),"Crash"===s.type&&s.stack?r.a.createElement(H,{data:s.stack}):r.a.createElement(r.a.Fragment,null),"Crash"===s.type&&(200===s.stdout.code||200===s.stderr.code)&&r.a.createElement(U,{icon:"",title:"Logs"},200===s.stdout.code?r.a.createElement(q,{data:s.stdout.data}):r.a.createElement(r.a.Fragment,null),200===s.stderr.code?r.a.createElement(q,{data:s.stderr.data}):r.a.createElement(r.a.Fragment,null))):r.a.createElement(r.a.Fragment,null)))}var $=a(14);function Q(e){var t=Object(n.useRef)(null),a=Object(n.useState)(),i=Object(o.a)(a,2),c=i[0],s=i[1],l=Object(n.useState)(),u=Object(o.a)(l,2),d=u[0],m=u[1],p=Object(n.useState)(),v=Object(o.a)(p,2),g=v[0],b=v[1];if(Object(n.useEffect)((function(){Object(h.a)(f.a.mark((function t(){var a,n,r,i,c;return f.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.net.fetch(e.source);case 2:if((a=t.sent).data){t.next=5;break}return t.abrupt("return");case 5:n=a.data.map((function(t){return t.architecture?t.architecture:t.system?t.system:t.item?e.selector?e.selector(t.item):t.item:"[unknown]"})),r=a.data.map((function(t,a){return{item:e.normalizer?e.normalizer(n[a]):n[a],count:t.count}})),i=new Map,r.forEach((function(e){return i.set(e.item,(i.get(e.item)?i.get(e.item):0)+e.count)})),r=[],i.forEach((function(e,t){return r.push({item:t,count:e})})),c=0,r.forEach((function(e){c+=e.count})),s({labels:r.map((function(e){return e.item})),datasets:[{data:r.map((function(e){return e.count})),label:"Count"}]}),b(c);case 15:case"end":return t.stop()}}),t)})))()}),[]),!d&&t.current){var E=t.current.getContext("2d");null!==E&&c&&m(new $.Chart(E,{data:c,type:e.chartType}))}return r.a.createElement("div",{className:"ui raised card"},r.a.createElement("div",{className:"image"},r.a.createElement("canvas",{style:{height:"40em"},ref:t})),r.a.createElement("div",{className:"content"},r.a.createElement("p",{className:"header"},e.title),r.a.createElement("div",{className:"meta"},r.a.createElement("span",null,g," unique values"))))}function X(e){var t=Object(n.useState)(""),a=Object(o.a)(t,2),i=a[0],c=a[1];return r.a.createElement("div",{className:"ui inverted icon input ".concat(e.tags&&"right labeled"),style:{fontSize:e.size?e.size+"px":"1.2em"}},r.a.createElement("input",{type:"text",placeholder:"Search...",onInput:function(t){i!=t.target.value&&(c(t.target.value),e.action(t.target.value,e.tags))}}),r.a.createElement("i",{className:"search icon"}))}function Y(e){var t,a=Object(n.useState)(),i=Object(o.a)(a,2),c=i[0],s=i[1],l=Object(n.useState)(),u=Object(o.a)(l,2),d=(u[0],u[1]);e.data.propagateUpdate=function(e){s(e)},Object(n.useEffect)((function(){e.data.triggerUpdate()}),[e.data]);var m=e.data.endpoints.trace+"?source={src}",p=(null===c||void 0===c?void 0:c.filteredCrashes)||(null===c||void 0===c?void 0:c.crashes),v=(null===c||void 0===c?void 0:c.filteredReports)||(null===c||void 0===c?void 0:c.reports),g=null===p||void 0===p?void 0:p.map((function(t){return r.a.createElement(K,{key:t.data.crashId,data:t,tracerTemplate:m,downloadUrl:e.data.endpoints.data+t.links.filter((function(e){return e.uri.endsWith("/profile")}))[0].uri})})),b=null===v||void 0===v?void 0:v.map((function(t){return r.a.createElement(K,{key:t.data.reportId,data:t,tracerTemplate:m,downloadUrl:e.data.endpoints.data+t.links.filter((function(e){return e.uri.endsWith("/raw")}))[0].uri})})),E=function(){var e=Object(h.a)(f.a.mark((function e(t){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:c.filteredReports=null===c||void 0===c?void 0:c.reports.filter(w(t)),c.filteredCrashes=null===c||void 0===c?void 0:c.crashes.filter(w(t)),d(t);case 3:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),k=(null===c||void 0===c||null===(t=c.crashes[0])||void 0===t?void 0:t.endpoints.profiler)||"https://coffee.birchy.dev",y=r.a.createElement("div",{className:"ui active loader",style:{height:"8em"}});return r.a.createElement("div",{"data-tab":"nav::diag",className:"ui inverted text tab segment"},"An embedded profiler in the application allows collecting some statistics as well as system information. For typical *nix operating systems this is done by:",r.a.createElement(z,{language:"bash"},"COFFEE_REPORT_URL=",k," <program>"),"On Android it is possible by adding an extra value to the launch process:",r.a.createElement(z,{language:"bash"},"adb shell am start -n <com.package/.Activity> --es COFFEE_REPORT_URL ",k),r.a.createElement("div",{className:"ui two cards",style:{marginBottom:"4em"}},r.a.createElement(Q,{net:e.data.plain,title:"Operating systems",source:"/v1/statistics/os",chartType:"doughnut",normalizer:function(e){return e.split(" (")[0]}}),r.a.createElement(Q,{net:e.data.plain,title:"Architectures",source:"/v1/statistics/arch",chartType:"doughnut"}),r.a.createElement(Q,{net:e.data.plain,title:"Devices",source:"/v2/stats/devices",chartType:"doughnut",selector:function(e){return e.name},normalizer:function(e){return e.split(" running")[0]}}),r.a.createElement(Q,{net:e.data.plain,title:"Applications",source:"/v2/stats/applications",chartType:"doughnut",selector:function(e){return e.name}})),r.a.createElement(X,{action:E}),r.a.createElement("div",{className:"ui inverted top attached tabular menu"},r.a.createElement("a",{className:"ui item active","data-tab":"diag::report"},"Reports"),r.a.createElement("a",{className:"ui item","data-tab":"diag::crash"},"Crashes")),r.a.createElement("div",{"data-tab":"diag::report",className:"ui inverted bottom attached tab segment active"},b?0===b.length?r.a.createElement("p",null,"No reports to display"):b:y),r.a.createElement("div",{"data-tab":"diag::crash",className:"ui inverted bottom attached tab segment"},g?0===g.length?r.a.createElement("p",null,"No crashes to display"):g:y))}a(242);function Z(e){return r.a.createElement("div",{className:"ui inverted vertical footer segment centered flex-centered"},r.a.createElement("span",null,"source can be found over at"),r.a.createElement("a",{href:e.source.link,className:"flex-centered"},r.a.createElement(u,{icon:"github",rounded:!0}),r.a.createElement("span",null,"github")))}var ee=function(){var e=Object(n.useState)(),t=Object(o.a)(e,2),a=t[0],i=t[1];a||i(T({data:"https://api.birchy.dev",profiler:"https://coffee.birchy.dev",crash:"https://crash.birchy.dev",trace:"https://trace.birchy.dev"},{username:"hbirchtree",link:"https://github.com/hbirchtree",img:"https://avatars3.githubusercontent.com/u/6828070?s=80&v=4"},["hbirchtree/coffeecutie","hbirchtree/coffeecutie-imgui","hbirchtree/native-library-bundle"],"hbirchtree/coffeecutie"));var c=Object(n.useState)("nav::home"),s=Object(o.a)(c,2),l=s[0],u=s[1],d=["semantic/semantic.min.css","semantic/components/accordion.min.css","semantic/components/container.min.css","semantic/components/grid.min.css","semantic/components/header.min.css","semantic/components/menu.min.css","semantic/components/modal.min.css","semantic/components/tab.min.css","highlight/dracula.css"].map((function(e){return r.a.createElement("link",{key:e,rel:"stylesheet",href:e})}));return Object(n.useEffect)((function(){return e=".ui.menu .item",void window.$(e).tab();var e})),Object(n.useEffect)((function(){return e=".ui.accordion",void window.$(e).accordion();var e})),r.a.createElement("div",{className:"kafei"},d,a?r.a.createElement(r.a.Fragment,null,r.a.createElement(m,{defaultItem:l,callback:u,internalLinks:a.menu.links,externalLinks:a.menu.externals,login:a.login,profile:a.profile}),r.a.createElement(G,{yggdrasil:a}),r.a.createElement(J,{releases:{info:a.releases,net:a.diagnostics}}),r.a.createElement(Y,{data:a.diagnostics}),r.a.createElement(Z,{source:{link:"https://github.com/hbirchtree/kafei-py"}})):r.a.createElement("div",{className:"ui active loader",style:{height:"40px"}}))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(ee,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},27:function(e,t,a){}},[[15,1,2]]]);
//# sourceMappingURL=main.0957a126.chunk.js.map