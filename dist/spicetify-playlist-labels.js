!async function(){for(;!Spicetify.React||!Spicetify.ReactDOM;)await new Promise(t=>setTimeout(t,10));var o,n,c,p,m,u,t,i,e,r,s,a,l,y,f,d,v,g,h,b;o=Object.create,n=Object.defineProperty,c=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,m=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty,e=(t=(t,i)=>function(){return i||(0,t[p(t)[0]])((i={exports:{}}).exports,i),i.exports})({"external-global-plugin:react-dom"(t,i){i.exports=Spicetify.ReactDOM}}),r=(i=(t,i,e)=>{e=null!=t?o(m(t)):{};var a=!i&&t&&t.__esModule?e:n(e,"default",{value:t,enumerable:!0}),l=t,r=void 0,s=void 0;if(l&&"object"==typeof l||"function"==typeof l)for(let t of p(l))u.call(a,t)||t===r||n(a,t,{get:()=>l[t],enumerable:!(s=c(l,t))||s.enumerable});return a})(t({"external-global-plugin:react"(t,i){i.exports=Spicetify.React}})()),s=i(e()),v=d=!(f={}),h=g=y=l=a=null,b=async function(){for(;null==Spicetify||!Spicetify.showNotification;)await new Promise(t=>setTimeout(t,100));v=await JSON.parse(localStorage.getItem("spicetify-playlist-labels:show-all")||"false");const i=(t=null)=>{S(t).then(t=>{f=t,d=!0,k()})};await Spicetify.Platform.LibraryAPI.getEvents().addListener("update",t=>{i()}),await Spicetify.Platform.PlaylistAPI.getEvents().addListener("operation_complete",t=>{i(t.data.uri)});var t=`<svg data-encore-id="icon" role="img" viewBox="0 0 16 16" class="Svg-img-icon-small">${Spicetify.SVGIcons.spotify}</svg>`,t=(new Spicetify.Playbar.Button("Show All Saved Playlists",t,t=>{t.active=v=!t.active,localStorage.setItem("spicetify-playlist-labels:show-all",JSON.stringify(v)),d=!0,k()},!1,v),f=await S(),y=new MutationObserver(()=>{k()}),new MutationObserver(async()=>{await w()}));await w(),t.observe(document.body,{childList:!0,subtree:!0})},(async()=>{await b()})();async function S(e=null){const a=JSON.parse(localStorage.getItem("spicetify-playlist-labels:uri-to-playlist-items")||"{}"),l=JSON.parse(localStorage.getItem("spicetify-playlist-labels:uri-to-playlists")||"{}");var t=await async function(){let t=[];var i;for(url="https://api.spotify.com/v1/me/playlists";url;)i=await Spicetify.CosmosAsync.get(url),t=t.concat(i.items),url=i.next;return t}();uriToPlaylists={},t.forEach(t=>uriToPlaylists[t.uri]=t);const r=uriToPlaylists,s=[];Object.entries(r).forEach(([t,i])=>{a[t]&&l[t]&&i.snapshot_id==l[t].snapshot_id&&t!=e||s.push(t)});var i=await Promise.all(s.map(t=>async function(t){return(await Spicetify.Platform.PlaylistAPI.getContents(t)).items}(t)));const o={},n=(i.forEach((t,i)=>{i=s[i];o[i]=t}),{});t.forEach(t=>{t=t.uri;o[t]?n[t]=o[t]:n[t]=a[t]});let c=JSON.parse(localStorage.getItem("spicetify-playlist-labels:liked-tracks")||"{}");i=JSON.parse(localStorage.getItem("spicetify-playlist-labels:liked-tracks-count")||"0"),t=await(await Spicetify.Platform.LibraryAPI.getTracks()).totalLength;i!=t&&(c=await Spicetify.Platform.LibraryAPI.getTracks({limit:Number.MAX_SAFE_INTEGER}));const p={};return Object.entries(n).forEach(([e,t])=>{t.forEach(t=>{var i=t.uri;p[i]||(p[i]=[]),p[i].some(t=>t.uri===e)||p[i].push({uri:e,name:r[e].name,trackUid:t.uid,image:(null==(i=r[e].images[0])?void 0:i.url)||"",isOwnPlaylist:Spicetify.Platform.initialUser.uri==r[e].owner.uri,isLikedTracks:!1})})}),c.items.forEach(t=>{var i=t.uri;p[i]||(p[i]=[]),p[i].some(t=>t.isLikedTracks)||p[i].push({uri:null,name:"Liked Songs",trackUid:t.uid,image:"https://misc.scdn.co/liked-songs/liked-songs-300.png",isOwnPlaylist:!0,isLikedTracks:!0})}),localStorage.setItem("spicetify-playlist-labels:uri-to-playlists",JSON.stringify(r)),localStorage.setItem("spicetify-playlist-labels:uri-to-playlist-items",JSON.stringify(n)),localStorage.setItem("spicetify-playlist-labels:liked-tracks-count",JSON.stringify(t)),localStorage.setItem("spicetify-playlist-labels:liked-tracks",JSON.stringify(c)),p}function k(){var i,e;0;for(const t of Array.from(document.querySelectorAll(".main-trackList-indexable"))){for(const a of t.getElementsByClassName("main-trackList-trackListRow")){i=a,e=void 0;const l=(i=Object.values(i))?(null==(e=null==(i=null==(i=null==(i=null==(i=null==(i=i[0])?void 0:i.pendingProps)?void 0:i.children[0])?void 0:i.props)?void 0:i.children)?void 0:i.props)?void 0:e.uri)||(null==(e=null==(e=null==(e=null==i?void 0:i.props)?void 0:e.children)?void 0:e.props)?void 0:e.uri)||(null==(e=null==(e=null==(e=null==(e=null==(e=null==i?void 0:i.props)?void 0:e.children)?void 0:e.props)?void 0:e.children)?void 0:e.props)?void 0:e.uri)||(null==(i=null==(e=i[0])?void 0:e.props)?void 0:i.uri):null;g===l&&Spicetify.Platform.History.location.pathname===h&&(a.click(),g=null);let t=a.querySelector(".spicetify-playlist-labels");d&&t&&(t.remove(),t=null),t||(e=a.querySelector(".main-trackList-rowSectionEnd"),(t=document.createElement("div")).classList.add("spicetify-playlist-labels"),s.default.render(r.default.createElement("div",{className:"spicetify-playlist-labels-labels-container"},null==(i=f[l])?void 0:i.map(i=>{if(!v&&!i.isOwnPlaylist)return null;if(i.isLikedTracks){if("/collection/tracks"===Spicetify.Platform.History.location.pathname)return null}else{var t=i.uri.match(/spotify:playlist:(.*)/)[1];if(Spicetify.Platform.History.location.pathname==="/playlist/"+t)return null}return r.default.createElement(Spicetify.ReactComponent.TooltipWrapper,{label:i.name,placement:"top"},r.default.createElement("div",null,r.default.createElement(Spicetify.ReactComponent.RightClickMenu,{placement:"bottom-end",menu:i.isLikedTracks?null:r.default.createElement(Spicetify.ReactComponent.Menu,null,r.default.createElement(Spicetify.ReactComponent.MenuItem,{leadingIcon:r.default.createElement(Spicetify.ReactComponent.IconComponent,{semanticColor:"textBase",dangerouslySetInnerHTML:{__html:'<path d="M5.25 3v-.917C5.25.933 6.183 0 7.333 0h1.334c1.15 0 2.083.933 2.083 2.083V3h4.75v1.5h-.972l-1.257 9.544A2.25 2.25 0 0 1 11.041 16H4.96a2.25 2.25 0 0 1-2.23-1.956L1.472 4.5H.5V3h4.75zm1.5-.917V3h2.5v-.917a.583.583 0 0 0-.583-.583H7.333a.583.583 0 0 0-.583.583zM2.986 4.5l1.23 9.348a.75.75 0 0 0 .744.652h6.08a.75.75 0 0 0 .744-.652L13.015 4.5H2.985z"></path>'},iconSize:16}),onClick:t=>{t.stopPropagation(),async function(t,i){await Spicetify.Platform.PlaylistAPI.remove(t,[{uri:i,uid:""}])}(i.uri,l),f[l]=f[l].filter(t=>t.uri!==i.uri),d=!0,k()}},"Remove from ",i.name))},r.default.createElement("div",{className:"spicetify-playlist-labels-label-container",style:{cursor:"pointer"},onClick:t=>{t.stopPropagation();t=i.isLikedTracks?"/collection/tracks":null==(t=Spicetify.URI.fromString(i.uri))?void 0:t.toURLPath(!0);g=l,(h=t)&&Spicetify.Platform.History.push({pathname:t,search:"?uid="+i.trackUid})}},r.default.createElement("img",{src:i.image})))))})),t),e.insertBefore(t,e.firstChild))}d=!1}}async function w(){a=l,(l=document.querySelector("main"))&&!l.isEqualNode(a)&&(a&&y.disconnect(),k(),y.observe(l,{childList:!0,subtree:!0}))}(async()=>{var t;document.getElementById("spicetifyDplaylistDlabels")||((t=document.createElement("style")).id="spicetifyDplaylistDlabels",t.textContent=String.raw`
  :root{--spicetify-playlist-labels-size:28px;--spicetify-playlist-labels-gap:6px;--spicetify-playlist-labels-container-width:calc(var(--spicetify-playlist-labels-size) * 8 + var(--spicetify-playlist-labels-gap) * 7);--spicetify-playlist-labels-column-width:calc(var(--spicetify-playlist-labels-size) * 8 + var(--spicetify-playlist-labels-gap) * 7 + 12px + 120px)}.spicetify-playlist-labels-labels-container{width:var(--spicetify-playlist-labels-container-width);height:var(--row-height);align-items:center;display:flex;overflow:hidden;gap:var(--spicetify-playlist-labels-gap);justify-content:flex-end}.spicetify-playlist-labels-label-container{position:relative;height:calc(var(--row-height) * .5)}.spicetify-playlist-labels-label-container>img{width:calc(var(--row-height) * .5);height:100%;-o-object-fit:cover;object-fit:cover;border-radius:calc(var(--row-height) * .5 * .1)}.main-trackList-trackList.main-trackList-indexable[aria-colcount="4"] .main-trackList-trackListRowGrid{grid-template-columns:[index] var(--tracklist-index-column-width,16px) [first] minmax(120px,var(--col1,4fr)) [var1] minmax(120px,var(--col2,2fr)) [last] minmax(var(--spicetify-playlist-labels-column-width),var(--col2,1fr))!important}.main-trackList-trackList.main-trackList-indexable[aria-colcount="5"] .main-trackList-trackListRowGrid{grid-template-columns:[index] var(--tracklist-index-column-width,16px) [first] minmax(120px,var(--col1,6fr)) [var1] minmax(120px,var(--col2,4fr)) [var2] minmax(120px,var(--col3,3fr)) [last] minmax(var(--spicetify-playlist-labels-column-width),var(--col4,1fr))!important}.main-trackList-trackList.main-trackList-indexable[aria-colcount="6"] .main-trackList-trackListRowGrid{grid-template-columns:[index] var(--tracklist-index-column-width,16px) [first] minmax(120px,var(--col1,6fr)) [var1] minmax(120px,var(--col2,4fr)) [var2] minmax(120px,var(--col3,3fr)) [var3] minmax(120px,var(--col4,2fr)) [last] minmax(var(--spicetify-playlist-labels-column-width),var(--col5,1fr))!important}
      `.trim(),document.head.appendChild(t))})()}();