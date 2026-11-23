/* 許津銓網站：Google 試算表後台串接（未設定時完全不動作，網站維持原本內建內容）
   設定在每個 index.html 最上方的 window.SITE_CONFIG。 */
(function(){
"use strict";
var C=window.SITE_CONFIG||{};
var API=(C.APPS_SCRIPT_URL||"").trim();
var CSV_L=(C.CSV_LISTINGS_URL||"").trim(), CSV_C=(C.CSV_COPY_URL||"").trim(), SID=(C.SHEET_ID||"").trim();
/* 後台即時預覽：只有被同網域的後台用 iframe 打開、網址帶 admin-preview=1 時才啟用；一般訪客永遠不會進入這個模式 */
var PREVIEW=false; try{PREVIEW=window.parent!==window&&/[?&]admin-preview=1(&|$)/.test(location.search)&&window.parent.location.origin===location.origin}catch(e){PREVIEW=false}
var FORM=PREVIEW?"":(C.FORM_ENDPOINT||API||"").trim();   // 預覽中不送出任何表單
var READ=!!(CSV_L||CSV_C||SID||API);
if(!READ&&!FORM&&!PREVIEW)return;             // 未設定：什麼都不做
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var CACHE_KEY="xjq-sheet-v1:"+(API||CSV_L||SID), TTL=(C.CACHE_MINUTES||10)*60000;

/* ---------- helpers ---------- */
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function clean(h){return String(h||"").replace(/^\uFEFF/,"").replace(/[（(].*$/,"").trim()}
function parseCSV(t){
  t=String(t||"").replace(/^\uFEFF/,""); var rows=[],row=[],f="",q=false;
  for(var i=0;i<t.length;i++){var c=t[i];
    if(q){ if(c==='"'){ if(t[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else if(c==='"')q=true; else if(c===","){row.push(f);f="";}
    else if(c==="\n"||c==="\r"){ if(c==="\r"&&t[i+1]==="\n")i++; row.push(f);rows.push(row);row=[];f=""; }
    else f+=c;
  }
  if(f!==""||row.length){row.push(f);rows.push(row);}
  return rows;
}
function toObjects(rows){
  if(!rows.length)return []; var h=rows[0].map(clean);
  return rows.slice(1).filter(function(r){return r.some(function(v){return String(v).trim()!==""})})
    .map(function(r){var o={};h.forEach(function(k,i){if(k)o[k]=String(r[i]==null?"":r[i]).trim()});return o;});
}
function yes(v){v=String(v||"").trim().toLowerCase();return v==="是"||v==="y"||v==="yes"||v==="true"||v==="1"||v==="v"||v==="✓"||v==="上架"}
/* Google 雲端硬碟分享連結 → 可直接顯示的圖片網址 */
function driveId(u){
  var m=String(u).match(/drive\.google\.com\/file\/d\/([\w-]{10,})/)||String(u).match(/drive\.google\.com\/(?:open|uc|thumbnail)\?(?:.*&)?id=([\w-]{10,})/)||String(u).match(/docs\.google\.com\/uc\?(?:.*&)?id=([\w-]{10,})/)||String(u).match(/lh3\.googleusercontent\.com\/d\/([\w-]{10,})/);
  return m?m[1]:"";
}
function imgURL(u,w){
  u=String(u||"").trim(); if(!u)return ""; var id=driveId(u);
  if(id)return "https://lh3.googleusercontent.com/d/"+id+"=w"+(w||1000);
  if(/^(https?:)?\/\//i.test(u)||/^data:image\//.test(u)||/^[\w./-]+\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(u))return u;
  return "";
}
function photos(v){return String(v||"").split(/\n|、|，|；|;(?!base64)|,(?=\s*(?:https?:|data:))/).map(function(s){return s.trim()}).filter(Boolean)}
function num(v){var n=parseFloat(String(v||"").replace(/[,，\s]/g,""));return isFinite(n)?n:NaN}
function fmt(n){return n.toLocaleString("en-US",{maximumFractionDigits:2})}

/* ---------- 讀取資料 ---------- */
function fetchText(u){return fetch(u,{cache:"no-store",credentials:"omit"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.text()})}
function gviz(name){return "https://docs.google.com/spreadsheets/d/"+encodeURIComponent(SID)+"/gviz/tq?tqx=out:csv&sheet="+encodeURIComponent(name)}
function load(){
  if(C.MOCK_STORE){ try{ var m=JSON.parse(localStorage.getItem(C.MOCK_STORE)||"null"); if(m&&m.listings){ var cm={}; (m.copy||[]).forEach(function(r){if(r.key&&r.value)cm[r.key]=r.value}); return Promise.resolve({listings:m.listings,copy:cm}); } }catch(e){} }
  if(CSV_L||CSV_C||SID){
    var lu=CSV_L||(SID?gviz("物件"):""), cu=CSV_C||(SID?gviz("網站文字"):"");
    return Promise.all([lu?fetchText(lu).then(function(t){return toObjects(parseCSV(t))}):null, cu?fetchText(cu).then(function(t){return toObjects(parseCSV(t))}):null])
      .then(function(r){return {listings:r[0],copy:r[1]?copyMap(r[1]):null}});
  }
  return fetchText(API+(API.indexOf("?")<0?"?":"&")+"action=public").then(function(t){
    var j=JSON.parse(t); if(!j||!j.ok)throw new Error((j&&j.error)||"bad"); return {listings:j.listings||null,copy:j.copy||null};
  });
}
function copyMap(rows){var m={};rows.forEach(function(r){var k=r["代碼"]||r.key, v=r["內容"]!=null?r["內容"]:r.value; if(k&&v)m[k]=v});return m}

/* ---------- 網站文字 ---------- */
function setText(sel,v){$$(sel).forEach(function(el){el.textContent=v})}
function setFirstText(sel,v){$$(sel).forEach(function(el){var n=el.firstChild; if(n&&n.nodeType===3)n.nodeValue=v; else el.insertBefore(document.createTextNode(v),el.firstChild);})}
function setList(sel,v){$$(sel).forEach(function(ul){var items=String(v).split(/\n+/).map(function(s){return s.trim()}).filter(Boolean); if(!items.length)return; ul.innerHTML=items.map(function(s){return "<li>"+esc(s)+"</li>"}).join("")})}
var MAP={
  "notice":[setText,".demo-flag"],
  "hero.greeting":[setFirstText,".hood__hello .bubble"],
  "hero.sub":[setText,".hood__sub"],
  "hero.slogan":[setText,".hood__slogan mark"],
  "hero.intro":[setText,".hood__intro"],
  "form.title":[setText,"#form-h"],
  "form.sub":[setText,"#form-h + .sec-sub"],
  "services.title":[setText,"#svc-h"],
  "services.sub":[setText,"#svc-h + .sec-sub"],
  "service1.title":[setText,".svc--match .svc__title"],"service1.en":[setText,".svc--match .svc__en"],"service1.points":[setList,".svc--match .dots"],
  "service2.title":[setText,".svc--sales .svc__title"],"service2.en":[setText,".svc--sales .svc__en"],"service2.points":[setList,".svc--sales .dots"],
  "service3.title":[setText,".svc--entrust .svc__title"],"service3.en":[setText,".svc--entrust .svc__en"],"service3.points":[setList,".svc--entrust .dots"],
  "listings.title":[setText,"#lst-h"],
  "listings.sub":[setText,"#lst-h + .sec-sub"],
  "faq.title":[setText,"#faq-h"],"faq.sub":[setText,"#faq-h + .sec-sub"],
  "footer.team":[setText,".foot__team"],
  "footer.fine":[setText,".foot__fine"],
  "legal.agent":[setText,".disclosure > div:nth-child(1) dd"],
  "legal.company1":[setText,".disclosure > div:nth-child(2) dt"],"legal.broker1":[setText,".disclosure > div:nth-child(2) dd"],
  "legal.company2":[setText,".disclosure > div:nth-child(3) dt"],"legal.broker2":[setText,".disclosure > div:nth-child(3) dd"]
};
function applyCopy(m){ if(!m)return; Object.keys(MAP).forEach(function(k){var v=m[k]; if(v==null||String(v).trim()==="")return; try{MAP[k][0](MAP[k][1],String(v).trim())}catch(e){}}); }

/* ---------- 物件 ---------- */
var CATS=["一房","兩房","三房","四房以上","店面・辦公","廠房","土地"];
var PIN='<svg class="i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/></svg>';
var ICONS=(C.ICON_BASE||"")+"icons/";
function normCat(o){
  var c=(o["分類"]||"").replace(/[·．.]/g,"・").trim(); if(c==="店面辦公"||c==="店面"||c==="辦公")c="店面・辦公"; if(c==="四房")c="四房以上";
  if(CATS.indexOf(c)>=0)return c;
  var t=(o["建物型態"]||"")+(o["標題"]||"");
  if(/廠/.test(t))return "廠房"; if(/地/.test(o["建物型態"]||""))return "土地"; if(/店|辦公/.test(t))return "店面・辦公";
  var r=parseInt((o["格局"]||"").match(/(\d+)\s*房/)?RegExp.$1:"",10); if(r>=4)return "四房以上"; if(r===3)return "三房"; if(r===2)return "兩房"; if(r===1)return "一房";
  return c||"其他";
}
function icon(o,cat){var t=o["建物型態"]||"";
  if(cat==="廠房")return "factory"; if(cat==="土地")return "land"; if(/辦公/.test(t))return "blueprint"; if(cat==="店面・辦公")return "shop"; if(/透天|別墅/.test(t))return "house"; return "apartment";}
function price(o,rent){
  var raw=o["價格"]||"", n=num(raw);
  if(!raw)return "價格請洽";
  if(isNaN(n)||/[^\d,.\s，]/.test(raw.replace(/萬|元|月租/g,"")))return raw;
  if(rent)return "月租 "+fmt(n)+" 元";
  return fmt(n)+"萬";
}
function card(o){
  var rent=/租/.test(o["類型"]||""), deal=rent?"出租":"出售", cat=normCat(o);
  var ph=photos(o["照片網址"]).map(function(u){return imgURL(u)}).filter(Boolean);
  var addr=(o["區域"]||"")+((o["地址或路段"]&&(o["區域"]||"").indexOf(o["地址或路段"])<0)?o["地址或路段"]:"");
  var ping=o["坪數"]?(isNaN(num(o["坪數"]))?o["坪數"]:fmt(num(o["坪數"]))+" 坪"):"";
  var spec=[o["建物型態"],o["格局"],ping,o["樓層"],o["屋齡"]?(/[年歲]/.test(o["屋齡"])?"屋齡 "+o["屋齡"]:"屋齡 "+o["屋齡"]+" 年"):""].filter(Boolean).join("　·　");
  var tags=String(o["特色"]||"").split(/[、,，\n]+/).map(function(s){return s.trim()}).filter(Boolean).slice(0,6);
  var sample=yes(o["範例"]);
  var art=ph.length
    ? '<img class="lst__photo" src="'+esc(ph[0])+'" alt="'+esc(o["標題"]||"物件照片")+'" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-fallback="'+esc(ICONS+icon(o,cat)+".webp")+'">'+(ph.length>1?'<span class="badge lst__more">共 '+ph.length+' 張</span>':"")
    : '<img class="lst__ico" src="'+ICONS+icon(o,cat)+'.webp" alt="" width="132" height="132" loading="lazy" decoding="async">';
  return '<li class="lst reveal in'+(ph.length?' lst--photo':'')+'"'+(PREVIEW&&o["編號"]?' data-id="'+esc(o["編號"])+'"':'')+' data-cat="'+esc(cat)+'" data-deal="'+deal+'">'+
   '<div class="lst__art">'+art+'<span class="badge badge--deal '+(rent?"badge--rent":"badge--sale")+'">'+deal+'</span>'+(sample?'<span class="badge badge--sample">範例物件</span>':'')+'</div>'+
   '<div class="lst__body"><h3 class="lst__title">'+esc(o["標題"]||"（未命名物件）")+'</h3>'+
   (addr?'<p class="lst__addr">'+PIN+'<span>'+esc(addr)+'</span></p>':'')+
   '<p class="lst__price">'+esc(price(o,rent))+'</p>'+
   (spec?'<p class="lst__spec">'+esc(spec)+'</p>':'')+
   (tags.length?'<ul class="lst__tags">'+tags.map(function(t){return "<li>"+esc(t)+"</li>"}).join("")+'</ul>':'')+
   (o["說明"]?'<p class="lst__note">'+esc(o["說明"])+'</p>':'')+'</div></li>';
}
var STYLE='.lst__photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.lst--photo .lst__art{overflow:hidden}.lst__more{position:absolute;bottom:10px;right:10px;background:rgb(30 43 43/.72);color:#fff}.lst__tags{list-style:none;margin:2px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:6px}.lst__tags li{font-size:12.5px;line-height:1.4;padding:3px 10px;border-radius:999px;background:var(--secondary);color:var(--secondary-foreground);font-weight:600}';
function renderListings(list){
  var grid=$("[data-grid]"); if(!grid||!list)return;
  var rows=list.filter(function(o){return yes(o["上架"])&&(o["標題"]||o["價格"])});
  rows.sort(function(a,b){var x=num(a["排序"]),y=num(b["排序"]);x=isNaN(x)?1e9:x;y=isNaN(y)?1e9:y;return x-y});
  if(!$("#xjq-sheet-css")){var st=document.createElement("style");st.id="xjq-sheet-css";st.textContent=STYLE;document.head.appendChild(st);}
  grid.innerHTML=rows.map(card).join("");
  $$("img[data-fallback]",grid).forEach(function(im){im.addEventListener("error",function(){var id=driveId(im.src); if(id&&im.src.indexOf("thumbnail")<0){im.src="https://drive.google.com/thumbnail?id="+id+"&sz=w1000";return;} im.className="lst__ico";im.src=im.dataset.fallback;im.removeAttribute("data-fallback");},{once:false})});
  // 篩選按鈕的數字
  var counts={}; rows.forEach(function(o){var c=normCat(o);counts[c]=(counts[c]||0)+1});
  $$(".fchip[data-cat]").forEach(function(b){var n=$(".fchip__n",b); if(n)n.textContent=counts[b.dataset.cat]||0;});
  var allSample=rows.length&&rows.every(function(o){return yes(o["範例"])});
  window.__lstNoun=allSample?"範例物件":"物件";
  var em=$("[data-empty]"); if(em&&!allSample)em.textContent="這個分類目前沒有物件，請試試其他條件，或直接 LINE 問我。";
  if(window.__lst){ $$(".lst[data-cat]",grid).forEach(window.__lst.bindCat); window.__lst.filt(); }
}
function apply(d){ if(!d)return; try{applyCopy(d.copy)}catch(e){} try{ if(d.listings&&d.listings.length)renderListings(d.listings)}catch(e){ if(window.console)console.warn("sheet render",e)} }

var gotDraft=false;
if(PREVIEW){
  var grid0=$("[data-grid]"), snap={grid:grid0?grid0.innerHTML:"",chips:$$(".fchip__n").map(function(n){return n.textContent}),copy:{}};
  Object.keys(MAP).forEach(function(k){snap.copy[k]=$$(MAP[k][1]).map(function(el){return el.innerHTML})});
  var restore=function(){
    Object.keys(snap.copy).forEach(function(k){$$(MAP[k][1]).forEach(function(el,i){if(snap.copy[k][i]!=null)el.innerHTML=snap.copy[k][i]})});
    var g=$("[data-grid]"); if(g){g.innerHTML=snap.grid; $$(".fchip__n").forEach(function(n,i){n.textContent=snap.chips[i]}); window.__lstNoun=""; if(window.__lst){$$(".lst[data-cat]",g).forEach(window.__lst.bindCat);window.__lst.filt();}}
  };
  var lastFocus="";
  var focusOn=function(f){
    if(!f||f===lastFocus)return; lastFocus=f; var el=null;
    if(f.indexOf("listing:")===0){ el=$('.lst[data-id="'+f.slice(8).replace(/["\\]/g,"")+'"]')||$("#listings"); }
    else if(f==="listings")el=$("#listings");
    else if(MAP[f])el=$(MAP[f][1]);
    if(!el)return;
    if(el.hidden&&window.__lst){ var all=$('.seg__b[data-deal="全部"]'),allc=$('.fchip[data-cat="全部"]'); all&&all.click(); allc&&allc.click(); }
    el.scrollIntoView({block:"center",behavior:"smooth"});
    el.style.transition="outline-color .6s"; el.style.outline="3px solid #FFC94A"; el.style.outlineOffset="4px";
    setTimeout(function(){el.style.outlineColor="transparent"},1400);
  };
  addEventListener("message",function(e){
    if(e.origin!==location.origin||e.source!==window.parent||!e.data||e.data.type!=="xjq-draft")return;
    gotDraft=true; restore();
    var d=e.data;
    try{ if(d.copy)applyCopy(d.copy) }catch(x){}
    try{ if(d.listings){ if(d.listings.length)renderListings(d.listings); else {var g=$("[data-grid]"); if(g){g.innerHTML="";window.__lst&&window.__lst.filt();}} } }catch(x){ console.warn("preview render",x) }
    if(d.force)lastFocus=""; setTimeout(function(){focusOn(d.focus||"")},d.force?250:0);
  });
  try{window.parent.postMessage({type:"xjq-preview-ready"},location.origin)}catch(e){}
}
if(READ){
  var cached=null; try{cached=JSON.parse(localStorage.getItem(CACHE_KEY)||"null")}catch(e){}
  if(cached&&cached.d&&!PREVIEW)apply(cached.d);
  if(!PREVIEW) load().then(function(d){
    var s=JSON.stringify(d); if(!cached||JSON.stringify(cached.d)!==s)apply(d);
    try{localStorage.setItem(CACHE_KEY,JSON.stringify({t:Date.now(),d:d}))}catch(e){}
  }).catch(function(e){ if(window.console)console.info("試算表讀取失敗，使用"+(cached?"暫存":"內建")+"內容：",e&&e.message); });
}

/* ---------- 表單送到試算表 ---------- */
if(FORM){
  $$("form.lead").forEach(function(f){
    var t=$(".result__title span",f), x=$(".result__text",f), fp=$(".fineprint",f);
    if(t)t.textContent="已收到您的需求！";
    if(x)x.innerHTML="資料已送給津銓，他會盡快用電話或 LINE 跟您聯絡。想更快一點，也可以按下面按鈕，用 LINE 把整理好的內容直接傳給他。";
    if(fp)fp.textContent="送出後資料會存到津銓的 Google 試算表，只用於聯繫與提供服務。";
    var hp=document.createElement("input"); hp.type="text";hp.name="_hp";hp.tabIndex=-1;hp.autocomplete="off";hp.setAttribute("aria-hidden","true");hp.style.cssText="position:absolute;left:-9999px;width:1px;height:1px;opacity:0";f.appendChild(hp);
    f.addEventListener("submit",function(){
      setTimeout(function(){
        var r=$(".result",f); if(!r||r.hidden)return;                    // 驗證沒過
        var a=$("[data-line-send]",r), href=a?a.getAttribute("href")||"":"", msg="";
        try{msg=decodeURIComponent(href.split("?text=")[1]||"")}catch(e){}
        if(f.dataset.sentMsg===msg)return; f.dataset.sentMsg=msg;     // 同內容不重送
        var g=function(n){var e=f.elements[n]; if(!e)return ""; if(e.length&&!e.value){return Array.prototype.filter.call(e,function(i){return i.checked}).map(function(i){return i.value}).join("、")} return (e.value||"").trim()};
        var budget=[g("priceMin"),g("priceMax")].filter(Boolean).join("–")||g("price")||g("downPayment");
        var body=new URLSearchParams({action:"lead",name:g("name"),phone:g("phone"),line:g("lineId"),kind:f.dataset.kind||"",area:g("district")||g("address"),budget:budget,message:msg,consent:(f.elements.consent&&f.elements.consent.checked)?"是":"否",page:location.href.split("#")[0],_hp:hp.value});
        fetch(FORM,{method:"POST",mode:"no-cors",body:body}).catch(function(){
          if(x)x.innerHTML="網路好像不太穩，資料<strong>可能沒有</strong>送出。請按下面按鈕，用 LINE 把內容傳給津銓。"; f.dataset.sentMsg="";
        });
      },0);
    });
  });
}
})();
