!async function(){for(;!Spicetify.React||!Spicetify.ReactDOM;)await new Promise(t=>setTimeout(t,10));var o,s,c,p,u,d,t,e,i,m,f,y,v,l,a,r,g,h,b,x,S,n;o=Object.create,s=Object.defineProperty,c=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,u=Object.getPrototypeOf,d=Object.prototype.hasOwnProperty,i=(t=(t,e)=>function(){return e||(0,t[p(t)[0]])((e={exports:{}}).exports,e),e.exports})({"external-global-plugin:react-dom"(t,e){e.exports=Spicetify.ReactDOM}}),m=(e=(t,e,i)=>{i=null!=t?o(u(t)):{};var l=!e&&t&&t.__esModule?i:s(i,"default",{value:t,enumerable:!0}),a=t,r=void 0,n=void 0;if(a&&"object"==typeof a||"function"==typeof a)for(let t of p(a))d.call(l,t)||t===r||s(l,t,{get:()=>a[t],enumerable:!(n=c(a,t))||n.enumerable});return l})(t({"external-global-plugin:react"(t,e){e.exports=Spicetify.React}})()),f=e(i()),g=[],h=[],x=!(b={}),S=r=a=l=v=y=null,n=async function(){for(;null==Spicetify||!Spicetify.showNotification;)await new Promise(t=>setTimeout(t,100));const e=webpackChunkopen.push([[Symbol()],{},t=>t]);var t=Object.keys(e.m).map(t=>e(t)).filter(t=>"object"==typeof t).map(t=>{try{return Object.values(t)}catch(t){}}).flat(),t=(S=t.find(t=>{return null==(t=null==t?void 0:t.render)?void 0:t.toString().includes("invertedDark")}),await Spicetify.Platform.RootlistAPI._events._emitter.addListener("update",()=>{w().then(t=>{b=t,x=!0,k()})}),b=await w(),r=new MutationObserver(()=>{k()}),new MutationObserver(async()=>{await C()}));await C(),t.observe(document.body,{childList:!0,subtree:!0})},(async()=>{await n()})();async function w(){const i=(await Spicetify.Platform.RootlistAPI.getContents()).items.filter(t=>"playlist"===t.type);var t=await Promise.all(i.map(t=>async function(t){return(await Spicetify.CosmosAsync.get("sp://core-playlist/v1/playlist/"+t)).items}(t.uri)));const l=await Promise.all(i.map(t=>async function(t){var e=Spicetify.GraphQL.Definitions["fetchExtractedColorForPlaylistEntity"];return 0===(e=(await Spicetify.GraphQL.Request(e,{uri:t})).data.playlistV2.images.items).length?null:null==(t=e[0].extractedColors)?void 0:t.colorDark.hex}(t.uri))),a={};return t.forEach((t,e)=>{t.forEach(t=>{a[t.link]||(a[t.link]=[]),a[t.link].push({name:i[e].name,uri:i[e].uri,color:l[e],canEdit:i[e].canAdd&&i[e].canRemove})})}),a}function k(){var e;h=g;let i=(g=Array.from(document.querySelectorAll(".main-trackList-indexable"))).length!==h.length;for(let t=0;t<g.length;t++)g[t].isEqualNode(h[t])||(i=!0);i&&(v=y=null);const l=[null,null,null,null,"[index] 16px [first] 4fr [var1] 1fr [var2] 2fr [last] minmax(120px,1fr)","[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 4fr [last] minmax(120px,1fr)","[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)"];let a=null;document.querySelectorAll(".main-trackList-trackListHeaderRow").forEach(t=>{var e=t.querySelector(".main-trackList-rowSectionEnd"),e=parseInt(e.getAttribute("aria-colindex"));(y=y||getComputedStyle(t).gridTemplateColumns)&&l[e]&&(t.style["grid-template-columns"]=l[e],a=l[e])});for(const t of g){for(const o of t.getElementsByClassName("main-trackList-trackListRow")){n=o,r=void 0;const s=(n=Object.values(n))?(null==(r=null==(n=null==(n=null==(n=null==(n=null==(n=n[0])?void 0:n.pendingProps)?void 0:n.children[0])?void 0:n.props)?void 0:n.children)?void 0:n.props)?void 0:r.uri)||(null==(r=null==(r=null==(r=null==n?void 0:n.props)?void 0:r.children)?void 0:r.props)?void 0:r.uri)||(null==(r=null==(r=null==(r=null==(r=null==(r=null==n?void 0:n.props)?void 0:r.children)?void 0:r.props)?void 0:r.children)?void 0:r.props)?void 0:r.uri)||(null==(n=null==(r=n[0])?void 0:r.props)?void 0:n.uri):null;let t=o.querySelector(".spicetify-playlist-labels");if(x&&t&&(t.remove(),t=null),!t){var r=o.querySelector(".main-trackList-rowSectionEnd"),n=parseInt(r.getAttribute("aria-colindex"));r.setAttribute("aria-colindex",(n+1).toString()),t=document.createElement("div");const c=Spicetify.React.memo(e=>m.default.createElement(Spicetify.ReactComponent.IconComponent,{semanticColor:"textSubdued",dangerouslySetInnerHTML:{__html:'<svg xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.151 17.943l-4.143-4.102-4.117 4.159-1.833-1.833 4.104-4.157-4.162-4.119 1.833-1.833 4.155 4.102 4.106-4.16 1.849 1.849-4.1 4.141 4.157 4.104-1.849 1.849z" /></svg>'},iconSize:12,viewBox:"0 0 24 24",className:"custom-svg",onClick:t=>{t.stopPropagation(),async function(t,e){t=t.match(/spotify:playlist:(.*)/)[1],await Spicetify.CosmosAsync.del(`https://api.spotify.com/v1/playlists/${t}/tracks`,{tracks:[{uri:e}]})}(e.playlistData.uri,e.trackUri),b[e.trackUri]=b[e.trackUri].filter(t=>t.name!==e.playlistData.name),x=!0,k()}}));f.default.render(m.default.createElement("div",{style:{lineHeight:"20px"}},null==(e=b[s])?void 0:e.map(e=>{var t=e.uri.match(/spotify:playlist:(.*)/)[1];return Spicetify.Platform.History.location.pathname==="/playlist/"+t?null:m.default.createElement(S,{className:"encore-dark-theme spicetify-playlist-labels-label",style:e.color?{backgroundColor:e.color}:{},isUsingKeyboard:!1,onClick:t=>{t.stopPropagation();t=null==(t=Spicetify.URI.fromString(e.uri))?void 0:t.toURLPath(!0);t&&Spicetify.Platform.History.push({pathname:t,search:"?highlight="+s})},size:!0,iconTrailing:e.canEdit?()=>m.default.createElement(c,{trackUri:s,playlistData:e}):null},e.name)})),t),t.setAttribute("aria-colindex",n.toString()),t.role="gridcell",t.style.display="flex",t.classList.add("main-trackList-rowSectionVariable"),t.classList.add("spicetify-playlist-labels"),o.insertBefore(t,r),v=v||getComputedStyle(o).gridTemplateColumns,l[n]&&(o.style["grid-template-columns"]=a||l[n])}}x=!1}}async function C(){l=a,(a=document.querySelector("main"))&&!a.isEqualNode(l)&&(l&&r.disconnect(),k(),r.observe(a,{childList:!0,subtree:!0}))}(async()=>{var t;document.getElementById("spicetifyDplaylistDlabels")||((t=document.createElement("style")).id="spicetifyDplaylistDlabels",t.textContent=String.raw`
  .spicetify-playlist-labels-label{font-size:12px!important;padding:3px 4px 3px 4px!important;white-space:nowrap}.custom-svg{transition:fill .1s}.ChipComponent-checkbox-chip-size{margin-bottom:0!important}.ChipInnerComponent-iconTrailing-size-isUsingKeyboard{grid-gap:10px!important}
      `.trim(),document.head.appendChild(t))})()}();