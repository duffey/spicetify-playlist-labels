!async function(){for(;!Spicetify.React||!Spicetify.ReactDOM;)await new Promise(e=>setTimeout(e,10));var r,s,c,u,p,m,e,t,i,d,f,y,b,l,a,n,v,g,h,x,w,S,E,o;r=Object.create,s=Object.defineProperty,c=Object.getOwnPropertyDescriptor,u=Object.getOwnPropertyNames,p=Object.getPrototypeOf,m=Object.prototype.hasOwnProperty,i=(e=(e,t)=>function(){return t||(0,e[u(e)[0]])((t={exports:{}}).exports,t),t.exports})({"external-global-plugin:react-dom"(e,t){t.exports=Spicetify.ReactDOM}}),d=(t=(e,t,i)=>{i=null!=e?r(p(e)):{};var l=!t&&e&&e.__esModule?i:s(i,"default",{value:e,enumerable:!0}),a=e,n=void 0,o=void 0;if(a&&"object"==typeof a||"function"==typeof a)for(let e of u(a))m.call(l,e)||e===n||s(l,e,{get:()=>a[e],enumerable:!(o=c(a,e))||o.enumerable});return l})(e({"external-global-plugin:react"(e,t){t.exports=Spicetify.React}})()),f=t(i()),v=[],g=[],S=w=n=a=l=b=y=null,E=x=!(h={}),o=async function(){for(;null==Spicetify||!Spicetify.showNotification;)await new Promise(e=>setTimeout(e,100));await Spicetify.Platform.RootlistAPI._events._emitter.addListener("update",()=>{L().then(e=>{h=e,x=!0,C()})});var e=document.querySelector(".main-nowPlayingBar-extraControls"),t=document.createElement("span"),i=d.default.memo(()=>{const[e,t]=(0,d.useState)(!1);var i="Button-sc-1dqy6lx-0 Button-small-small-buttonTertiary-iconOnly-isUsingKeyboard-useBrowserDefaultFocusStyle main-genericButton-button",i=e?"Button-sc-1dqy6lx-0 Button-small-small-buttonTertiary-iconOnly-isUsingKeyboard-useBrowserDefaultFocusStyle main-genericButton-button main-genericButton-buttonActive main-genericButton-buttonActiveDot ZMXGDTbwxKJhbmEDZlYy":i;return d.default.createElement(Spicetify.ReactComponent.TooltipWrapper,{label:e?"Show Editable Playlist Labels":"Show All Playlist Labels",placement:"top"},d.default.createElement("button",{className:i,onClick:()=>{t(!e),E=!E,x=!0,C()}},d.default.createElement(Spicetify.ReactComponent.IconComponent,{dangerouslySetInnerHTML:{__html:Spicetify.SVGIcons.spotify},iconSize:16})))}),i=(f.default.render(d.default.createElement(i,null),t),null!=e&&e.prepend(t),h=await L(),n=new MutationObserver(()=>{C()}),new MutationObserver(async()=>{await R()}));await R(),i.observe(document.body,{childList:!0,subtree:!0})},(async()=>{await o()})();function P(e){let i=[];return function t(e){"playlist"===e.type?i.push(e):"folder"===e.type&&e.items&&e.items.forEach(e=>t(e))}(e),i}async function L(){const l=P(await Spicetify.Platform.RootlistAPI.getContents());var e=await Promise.all(l.map(e=>async function(e){return(await Spicetify.Platform.PlaylistAPI.getContents(e)).items}(e.uri)));const a={};return e.forEach((e,i)=>{e.forEach(e=>{var t=e.uri;a[t]||(a[t]=[]),a[t].some(e=>e.uri===l[i].uri)||a[t].push({name:l[i].name,uri:l[i].uri,trackUid:e.uid,canEdit:l[i].canAdd&&l[i].canRemove,image:l[i].images[0].url})})}),a}function C(){var t;g=v;let i=(v=Array.from(document.querySelectorAll(".main-trackList-indexable"))).length!==g.length;for(let e=0;e<v.length;e++)v[e].isEqualNode(g[e])||(i=!0);i&&(b=y=null);const l=[null,null,null,null,"[index] 16px [first] 4fr [var1] 1fr [var2] 2fr [last] minmax(120px,1fr)","[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 4fr [last] minmax(120px,1fr)","[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)"];let a=null;document.querySelectorAll(".main-trackList-trackListHeaderRow").forEach(e=>{var t=e.querySelector(".main-trackList-rowSectionEnd"),t=parseInt(t.getAttribute("aria-colindex"));(y=y||getComputedStyle(e).gridTemplateColumns)&&l[t]&&(e.style["grid-template-columns"]=l[t],a=l[t])});for(const e of v){for(const r of e.getElementsByClassName("main-trackList-trackListRow")){o=r,n=void 0;const s=(o=Object.values(o))?(null==(n=null==(o=null==(o=null==(o=null==(o=null==(o=o[0])?void 0:o.pendingProps)?void 0:o.children[0])?void 0:o.props)?void 0:o.children)?void 0:o.props)?void 0:n.uri)||(null==(n=null==(n=null==(n=null==o?void 0:o.props)?void 0:n.children)?void 0:n.props)?void 0:n.uri)||(null==(n=null==(n=null==(n=null==(n=null==(n=null==o?void 0:o.props)?void 0:n.children)?void 0:n.props)?void 0:n.children)?void 0:n.props)?void 0:n.uri)||(null==(o=null==(n=o[0])?void 0:n.props)?void 0:o.uri):null;w===s&&Spicetify.Platform.History.location.pathname===S&&(r.click(),w=null);let e=r.querySelector(".spicetify-playlist-labels");if(x&&e&&(e.remove(),e=null),!e){var n=r.querySelector(".main-trackList-rowSectionEnd"),o=parseInt(n.getAttribute("aria-colindex"));n.setAttribute("aria-colindex",(o+1).toString()),e=document.createElement("div");const c=Spicetify.React.memo(()=>d.default.createElement(Spicetify.ReactComponent.IconComponent,{semanticColor:"textBase",dangerouslySetInnerHTML:{__html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">\x3c!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --\x3e<path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>'},width:"14px",height:"14px",viewBox:"0 0 14 14"}));f.default.render(d.default.createElement("div",{className:"spicetify-playlist-labels-labels-container"},null==(t=h[s])?void 0:t.map(t=>{var e;return!E&&!t.canEdit||(e=t.uri.match(/spotify:playlist:(.*)/)[1],Spicetify.Platform.History.location.pathname==="/playlist/"+e)?null:d.default.createElement(Spicetify.ReactComponent.TooltipWrapper,{label:t.name,placement:"top"},d.default.createElement("div",{className:"spicetify-playlist-labels-label-container"},d.default.createElement("img",{width:"40px",style:{borderRadius:"4px",cursor:"pointer"},src:t.image,onClick:e=>{e.stopPropagation();e=null==(e=Spicetify.URI.fromString(t.uri))?void 0:e.toURLPath(!0);w=s,(S=e)&&Spicetify.Platform.History.push({pathname:e,search:"?uid="+t.trackUid})}}),t.canEdit?d.default.createElement(Spicetify.ReactComponent.TooltipWrapper,{label:"Remove from "+t.name,placement:"top"},d.default.createElement("button",{onClick:e=>{e.stopPropagation(),async function(e,t){await Spicetify.Platform.PlaylistAPI.remove(e,[{uri:t,uid:""}])}(t.uri,s),h[s]=h[s].filter(e=>e.name!==t.name),x=!0,C()}},d.default.createElement(c,null))):null))})),e),e.setAttribute("aria-colindex",o.toString()),e.role="gridcell",e.style.display="flex",e.classList.add("main-trackList-rowSectionVariable"),e.classList.add("spicetify-playlist-labels"),r.insertBefore(e,n),b=b||getComputedStyle(r).gridTemplateColumns,l[o]&&(r.style["grid-template-columns"]=a||l[o])}}x=!1}}async function R(){l=a,(a=document.querySelector("main"))&&!a.isEqualNode(l)&&(l&&n.disconnect(),C(),n.observe(a,{childList:!0,subtree:!0}))}(async()=>{var e;document.getElementById("spicetifyDplaylistDlabels")||((e=document.createElement("style")).id="spicetifyDplaylistDlabels",e.textContent=String.raw`
  .spicetify-playlist-labels-labels-container{height:var(--row-height);align-items:center;display:flex;flex-wrap:wrap;overflow:hidden;gap:7px}.spicetify-playlist-labels-label-container{position:relative;height:40px}.spicetify-playlist-labels-label-container button{visibility:hidden;position:absolute;top:0;right:0;width:14px;height:14px;background:rgba(0,0,0,.5);cursor:pointer;border:0;border-top-right-radius:4px;border-bottom-left-radius:4px;vertical-align:top}.spicetify-playlist-labels-label-container:hover button{visibility:visible}.spicetify-playlist-labels-label-container button:hover{background-color:var(--text-negative)}.spicetify-playlist-labels-label-container button svg{padding:1px;vertical-align:top;fill:white}
      `.trim(),document.head.appendChild(e))})()}();