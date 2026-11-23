/**
 * 許津銓網站後台 — Google Apps Script（貼到試算表的「擴充功能 → Apps Script」）
 *
 * 部署：部署 → 新增部署作業 → 類型「網頁應用程式」
 *       執行身分：我　／　誰可以存取：所有人
 * 指令碼屬性（專案設定 → 指令碼屬性）：
 *   ADMIN_PASSWORD   必填。後台登入密碼（只存在這裡，網站程式碼裡沒有）
 *   NOTIFY_EMAIL     選填。有新留言時寄信到這個信箱；空白＝寄給試算表擁有者
 *   NOTIFY_OFF       選填。填 1 就不寄通知信
 *   PHOTO_FOLDER_ID  選填。照片存放的雲端硬碟資料夾 ID；空白會自動建立「許津銓網站照片」
 * API 說明見 backend/API.md。
 */
var SHEET_LISTINGS = '物件', SHEET_COPY = '網站文字', SHEET_LEADS = '客戶留言';
var L_COLS = ['編號','上架','類型','分類','標題','區域','地址或路段','價格','坪數','建物型態','格局','樓層','屋齡','特色','說明','照片網址','範例','排序','備註','更新時間'];
var LEAD_COLS = ['時間','姓名','電話','LINE','需求類型','區域','預算','留言','同意個資','處理狀態','來源頁面'];
var ALIAS = {id:'編號',published:'上架',type:'類型',category:'分類',title:'標題',district:'區域',address:'地址或路段',price:'價格',ping:'坪數',
  buildingType:'建物型態',layout:'格局',floor:'樓層',age:'屋齡',features:'特色',description:'說明',photos:'照片網址',sample:'範例',order:'排序',note:'備註'};
var TOKEN_HOURS = 6, MAX_FAILS = 8;

/* ---------------- 入口 ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'public' || !p.action) return out_(publicData_());
    if (p.action === 'ping') return out_({ok: true, time: new Date().toISOString()});
    return out_({ok: false, error: '未知的 action'});
  } catch (err) { return out_({ok: false, error: String(err && err.message || err)}); }
}

function doPost(e) {
  var body = {};
  try {
    var raw = e && e.postData && e.postData.contents;
    if (raw && /^\s*\{/.test(raw)) body = JSON.parse(raw); else body = (e && e.parameter) || {};
  } catch (err) { body = (e && e.parameter) || {}; }
  var a = body.action || 'lead';
  try {
    if (a === 'lead') return out_(addLead_(body));
    if (a === 'public') return out_(publicData_());
    if (a === 'login') return out_(login_(body.password));
    var auth = checkToken_(body.token);
    if (!auth) return out_({ok: false, error: '請重新登入', code: 'AUTH'});
    switch (a) {
      case 'logout': CacheService.getScriptCache().remove('tok:' + body.token); return out_({ok: true});
      case 'list': return out_({ok: true, listings: readListings_(true), copy: readCopyRows_()});
      case 'listListings': return out_({ok: true, listings: readListings_(true)});
      case 'getListing': return out_(getListing_(body.id));
      case 'saveListing': return out_(withLock_(function(){ return saveListing_(body.listing || {}); }));
      case 'setPublished': return out_(withLock_(function(){ return setPublished_(body.id, body.published); }));
      case 'deleteListing': return out_(withLock_(function(){ return deleteListing_(body.id); }));
      case 'getCopy': return out_({ok: true, copy: readCopyRows_()});
      case 'updateCopy': return out_(withLock_(function(){ return updateCopy_(body.copy || {}); }));
      case 'uploadPhoto': return out_(uploadPhoto_(body));
      case 'listLeads': return out_({ok: true, leads: readLeads_(body.limit, body.status)});
      case 'updateLead': return out_(withLock_(function(){ return updateLead_(body.row, body.status); }));
      default: return out_({ok: false, error: '未知的 action：' + a});
    }
  } catch (err) { return out_({ok: false, error: String(err && err.message || err)}); }
}

/* ---------------- 共用 ---------------- */
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name, cols) {
  var sh = ss_().getSheetByName(name);
  if (!sh) { sh = ss_().insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); }
  return sh;
}
function clean_(h) { return String(h || '').replace(/^\uFEFF/, '').replace(/[（(].*$/, '').trim(); }
function headerMap_(sh, cols) {
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(clean_), map = {};
  head.forEach(function(h, i){ if (h) map[h] = i + 1; });
  (cols || []).forEach(function(c){            // 缺的欄位自動補在最右邊
    if (!map[c]) { lastCol++; sh.getRange(1, lastCol).setValue(c); map[c] = lastCol; }
  });
  return map;
}
function cell_(v) { if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm'); return v == null ? '' : String(v).trim(); }
function yes_(v) { v = String(v == null ? '' : v).trim().toLowerCase(); return v === '是' || v === 'y' || v === 'yes' || v === 'true' || v === '1' || v === '上架' || v === '✓'; }
function withLock_(fn) { var l = LockService.getScriptLock(); l.waitLock(20000); try { return fn(); } finally { l.releaseLock(); } }
function now_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm'); }
function safe_(v, max) {   // 避免公式注入、限制長度
  var s = String(v == null ? '' : v).slice(0, max || 2000);
  return /^[=+\-@]/.test(s) && !/^-?\d/.test(s) ? "'" + s : s;
}

/* ---------------- 登入 ---------------- */
function login_(pw) {
  var cache = CacheService.getScriptCache(), fails = +(cache.get('fails') || 0);
  if (fails >= MAX_FAILS) return {ok: false, error: '密碼錯太多次，請 15 分鐘後再試', code: 'LOCKED'};
  var real = prop_('ADMIN_PASSWORD');
  if (!real) return {ok: false, error: '還沒設定後台密碼（指令碼屬性 ADMIN_PASSWORD）', code: 'NOPASS'};
  if (String(pw || '') !== real) { cache.put('fails', String(fails + 1), 900); Utilities.sleep(800); return {ok: false, error: '密碼不對', code: 'BADPASS'}; }
  cache.remove('fails');
  var t = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
  cache.put('tok:' + t, '1', TOKEN_HOURS * 3600);
  return {ok: true, token: t, expiresInHours: TOKEN_HOURS};
}
function checkToken_(t) { return !!(t && CacheService.getScriptCache().get('tok:' + t)); }

/* ---------------- 物件 ---------------- */
function readListings_(all) {
  var sh = sheet_(SHEET_LISTINGS, L_COLS), map = headerMap_(sh, L_COLS), n = sh.getLastRow();
  if (n < 2) return [];
  var vals = sh.getRange(2, 1, n - 1, sh.getLastColumn()).getValues(), rows = [];
  vals.forEach(function(r, i){
    var o = {_row: i + 2}; L_COLS.forEach(function(c){ o[c] = cell_(r[map[c] - 1]); });
    if (!o['標題'] && !o['編號'] && !o['價格']) return;
    if (!all) { if (!yes_(o['上架'])) return; delete o['備註']; delete o._row; }
    rows.push(o);
  });
  return rows;
}
function norm_(l) {   // 接受中文欄名或英文別名
  var o = {};
  Object.keys(l).forEach(function(k){ var c = ALIAS[k] || clean_(k); if (L_COLS.indexOf(c) >= 0) o[c] = l[k]; });
  if (typeof o['上架'] === 'boolean') o['上架'] = o['上架'] ? '是' : '否';
  if (typeof o['範例'] === 'boolean') o['範例'] = o['範例'] ? '是' : '否';
  if (Array.isArray(o['特色'])) o['特色'] = o['特色'].join('、');
  if (Array.isArray(o['照片網址'])) o['照片網址'] = o['照片網址'].join('\n');
  if (o['類型'] && !/^(買賣|出租)$/.test(o['類型'])) o['類型'] = /租/.test(o['類型']) ? '出租' : '買賣';
  return o;
}
function findRow_(sh, map, id) {
  if (!id) return 0; var n = sh.getLastRow(); if (n < 2) return 0;
  var ids = sh.getRange(2, map['編號'], n - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]).trim() === String(id).trim()) return i + 2;
  return 0;
}
function nextId_(sh, map) {
  var n = sh.getLastRow(), max = 0;
  if (n >= 2) sh.getRange(2, map['編號'], n - 1, 1).getValues().forEach(function(r){ var m = String(r[0]).match(/(\d+)/); if (m) max = Math.max(max, +m[1]); });
  return 'A' + ('00' + (max + 1)).slice(-3);
}
function getListing_(id) {
  var r = readListings_(true).filter(function(o){ return o['編號'] === String(id); })[0];
  return r ? {ok: true, listing: r} : {ok: false, error: '找不到編號 ' + id};
}
function saveListing_(l) {
  var o = norm_(l), sh = sheet_(SHEET_LISTINGS, L_COLS), map = headerMap_(sh, L_COLS);
  var row = findRow_(sh, map, o['編號']), isNew = !row;
  if (isNew ? !o['標題'] : ('標題' in o && !o['標題'])) return {ok: false, error: '標題不能空白'};
  if (isNew) { if (!o['編號']) o['編號'] = nextId_(sh, map); if (o['上架'] == null) o['上架'] = '是'; row = sh.getLastRow() + 1; }
  o['更新時間'] = now_();
  Object.keys(o).forEach(function(c){ sh.getRange(row, map[c]).setValue(safe_(o[c], c === '說明' || c === '照片網址' ? 5000 : 500)); });
  return {ok: true, created: isNew, id: o['編號'], listing: getListing_(o['編號']).listing};
}
function setPublished_(id, pub) {
  var sh = sheet_(SHEET_LISTINGS, L_COLS), map = headerMap_(sh, L_COLS), row = findRow_(sh, map, id);
  if (!row) return {ok: false, error: '找不到編號 ' + id};
  var v = (pub === true || yes_(pub)) ? '是' : '否';
  sh.getRange(row, map['上架']).setValue(v); sh.getRange(row, map['更新時間']).setValue(now_());
  return {ok: true, id: String(id), 上架: v};
}
function deleteListing_(id) {
  var sh = sheet_(SHEET_LISTINGS, L_COLS), map = headerMap_(sh, L_COLS), row = findRow_(sh, map, id);
  if (!row) return {ok: false, error: '找不到編號 ' + id};
  sh.deleteRow(row); return {ok: true, id: String(id), deleted: true};
}

/* ---------------- 網站文字 ---------------- */
function copySheet_() { return sheet_(SHEET_COPY, ['代碼', '位置說明', '內容']); }
function readCopyRows_() {
  var sh = copySheet_(), n = sh.getLastRow(); if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 3).getValues().filter(function(r){ return r[0]; })
    .map(function(r){ return {key: cell_(r[0]), label: cell_(r[1]), value: cell_(r[2])}; });
}
function updateCopy_(m) {
  var sh = copySheet_(), n = sh.getLastRow(), keys = n >= 2 ? sh.getRange(2, 1, n - 1, 1).getValues().map(function(r){ return String(r[0]).trim(); }) : [], changed = [];
  Object.keys(m).forEach(function(k){
    var i = keys.indexOf(k), v = safe_(m[k], 3000);
    if (i < 0) { sh.appendRow([k, '', v]); keys.push(k); } else sh.getRange(i + 2, 3).setValue(v);
    changed.push(k);
  });
  return {ok: true, changed: changed};
}
function publicData_() {
  var copy = {}; readCopyRows_().forEach(function(r){ if (r.value) copy[r.key] = r.value; });
  return {ok: true, listings: readListings_(false), copy: copy, time: new Date().toISOString()};
}

/* ---------------- 照片 ---------------- */
function photoFolder_() {
  var id = prop_('PHOTO_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var f = DriveApp.createFolder('許津銓網站照片');
  PropertiesService.getScriptProperties().setProperty('PHOTO_FOLDER_ID', f.getId());
  return f;
}
function uploadPhoto_(b) {
  var mime = String(b.mimeType || 'image/jpeg');
  if (!/^image\/(jpeg|png|webp|gif)$/.test(mime)) return {ok: false, error: '只接受 JPG、PNG、WebP 圖片'};
  var data = String(b.data || '').replace(/^data:[^,]+,/, '');
  if (!data) return {ok: false, error: '沒有照片資料'};
  if (data.length > 14 * 1024 * 1024) return {ok: false, error: '照片太大（上限約 10MB）'};
  var name = safe_(b.filename || ('photo-' + Date.now() + '.jpg'), 120);
  var file = photoFolder_().createFile(Utilities.newBlob(Utilities.base64Decode(data), mime, name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var id = file.getId();
  return {ok: true, id: id, url: 'https://drive.google.com/file/d/' + id + '/view', imageUrl: 'https://lh3.googleusercontent.com/d/' + id + '=w1200'};
}

/* ---------------- 客戶留言 ---------------- */
function addLead_(b) {
  if (b._hp) return {ok: true};                                     // 機器人陷阱欄
  var name = String(b.name || '').trim(), phone = String(b.phone || '').trim();
  if (!name && !phone && !b.line) return {ok: false, error: '缺少聯絡資料'};
  var cache = CacheService.getScriptCache(), k = 'lead:' + Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, name + phone + (b.message || '')));
  if (cache.get(k)) return {ok: true, duplicate: true}; cache.put(k, '1', 120);
  var row = [now_(), name, phone, b.line, b.kind, b.area, b.budget, b.message, b.consent || '', '新留言', b.page].map(function(v, i){ return safe_(v, i === 7 ? 4000 : 300); });
  withLock_(function(){
    var sh = sheet_(SHEET_LEADS, LEAD_COLS), map = headerMap_(sh, LEAD_COLS), r = sh.getLastRow() + 1;
    LEAD_COLS.forEach(function(c, i){ sh.getRange(r, map[c]).setValue(row[i]); });
  });
  if (prop_('NOTIFY_OFF') !== '1') {
    try {
      var to = prop_('NOTIFY_EMAIL') || Session.getEffectiveUser().getEmail();
      if (to) MailApp.sendEmail(to, '【網站新留言】' + (b.kind || '') + '｜' + name,
        '網站有新的客戶留言：\n\n姓名：' + name + '\n電話：' + phone + '\nLINE：' + (b.line || '') + '\n需求：' + (b.kind || '') +
        '\n區域：' + (b.area || '') + '\n預算：' + (b.budget || '') + '\n同意個資：' + (b.consent || '') + '\n\n' + (b.message || '') +
        '\n\n（完整紀錄在試算表「客戶留言」分頁）');
    } catch (e) {}
  }
  return {ok: true};
}
function readLeads_(limit, status) {
  var sh = sheet_(SHEET_LEADS, LEAD_COLS), map = headerMap_(sh, LEAD_COLS), n = sh.getLastRow(); if (n < 2) return [];
  var vals = sh.getRange(2, 1, n - 1, sh.getLastColumn()).getValues(), rows = [];
  vals.forEach(function(r, i){ var o = {_row: i + 2}; LEAD_COLS.forEach(function(c){ o[c] = cell_(r[map[c] - 1]); }); if (o['姓名'] || o['電話']) rows.push(o); });
  rows.reverse(); if (status) rows = rows.filter(function(o){ return o['處理狀態'] === status; });
  return rows.slice(0, Math.min(+limit || 200, 1000));
}
function updateLead_(row, status) {
  row = +row; var ok = ['新留言', '已聯絡', '處理中', '已結案'];
  if (ok.indexOf(status) < 0) return {ok: false, error: '狀態只能是：' + ok.join('、')};
  var sh = sheet_(SHEET_LEADS, LEAD_COLS), map = headerMap_(sh, LEAD_COLS);
  if (!(row >= 2 && row <= sh.getLastRow())) return {ok: false, error: '找不到這筆留言'};
  sh.getRange(row, map['處理狀態']).setValue(status); return {ok: true, row: row, status: status};
}

/* 第一次可以手動執行一次，讓 Google 跳出授權畫面（試算表、雲端硬碟、寄信） */
function setupAuthorize() {   // 授權測試
  sheet_(SHEET_LISTINGS, L_COLS); copySheet_(); sheet_(SHEET_LEADS, LEAD_COLS); photoFolder_();
  Logger.log('OK。後台密碼已設定：' + (prop_('ADMIN_PASSWORD') ? '是' : '否（請到 專案設定 → 指令碼屬性 新增 ADMIN_PASSWORD）'));
  Logger.log('通知信會寄到：' + (prop_('NOTIFY_EMAIL') || Session.getEffectiveUser().getEmail()));
}
