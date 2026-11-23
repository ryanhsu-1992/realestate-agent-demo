# 許津銓網站後台 API（Google Apps Script）

一個網址（Apps Script 網頁應用程式的 `…/exec`）提供網站讀資料、表單送出和後台管理。
這份文件也是給「AI 助理」用的：之後若要讓助理用一句話幫忙上架物件，助理呼叫的就是下面同一組 action。

## 呼叫方式

| 用途 | 方法 | 內容 |
|---|---|---|
| 公開讀取 | `GET  {URL}?action=public` | 無需登入 |
| 表單送出 | `POST {URL}` | `application/x-www-form-urlencoded`，`action=lead&…`（網站用 `mode:"no-cors"`） |
| 後台動作 | `POST {URL}` | body 是 JSON 字串，`Content-Type: text/plain`（避免 CORS 預檢），例如 `{"action":"list","token":"…"}` |

回應都是 JSON：成功 `{"ok":true,…}`，失敗 `{"ok":false,"error":"中文說明","code":"…"}`。
`code:"AUTH"` 代表 token 過期或錯誤，請重新 `login`。

## 認證

- 密碼存在 Apps Script「指令碼屬性」`ADMIN_PASSWORD`，只在伺服器端比對；網站與後台程式碼裡都沒有密碼。
- `login` 成功拿到 `token`（有效 6 小時，存在 CacheService）。之後每個後台 action 都帶 `token`。
- 15 分鐘內錯 8 次會暫時鎖住登入。

## 物件欄位（JSON key 可用中文欄名，或括號內的英文別名）

| 欄位 | 別名 | 說明 |
|---|---|---|
| 編號 | id | 唯一值；新增時留空會自動產生（A001、A002…） |
| 上架 | published | `"是"` / `"否"`（也接受 true/false） |
| 類型 | type | `"買賣"` 或 `"出租"` |
| 分類 | category | 一房／兩房／三房／四房以上／店面・辦公／廠房／土地（網站篩選按鈕） |
| 標題 | title | 必填 |
| 區域 | district | 例：桃園市中壢區 |
| 地址或路段 | address | 例：青埔高鐵站旁（不建議寫門牌） |
| 價格 | price | 只填數字。買賣＝萬（1388＝1,388 萬）；出租＝每月元（16800） |
| 坪數 | ping | 數字 |
| 建物型態 | buildingType | 電梯大樓、華廈、公寓、透天、套房、店面、辦公、廠房、建地… |
| 格局 | layout | 例：3房2廳2衛 |
| 樓層 | floor | 例：12F／15F |
| 屋齡 | age | 例：8 年 |
| 特色 | features | 字串用「、」分隔，或字串陣列 |
| 說明 | description | 一兩句介紹 |
| 照片網址 | photos | 換行分隔字串或陣列；第一張是封面。可放 Google 雲端硬碟分享連結 |
| 範例 | sample | `"是"` 會在網站顯示「範例物件」標籤 |
| 排序 | order | 數字小的在前 |
| 備註 | note | 內部用，公開讀取不會回傳 |
| 更新時間 | — | 伺服器自動填 |

## Actions

### 公開
- **public**（GET 或 POST）→ `{ok, listings:[上架中的物件，不含備註], copy:{代碼:內容}, time}`
- **lead**（POST，表單格式）欄位：`name, phone, line, kind（買房／賣房、出租／租房）, area, budget, message, consent（是/否）, page, _hp（機器人陷阱，需空白）`
  → 新增一列到「客戶留言」，處理狀態＝新留言，並寄通知信（`NOTIFY_EMAIL` 或試算表擁有者）。2 分鐘內同內容不重複寫入。
- **ping**（GET）→ `{ok:true,time}`

### 登入
- **login** `{password}` → `{ok, token, expiresInHours}`
- **logout** `{token}`

### 物件
- **list** `{token}` → `{ok, listings:[全部物件，含 _row、備註], copy:[{key,label,value}]}`
- **listListings** `{token}` → `{ok, listings}`
- **getListing** `{token, id}` → `{ok, listing}`
- **saveListing** `{token, listing:{…}}` → 有 `編號` 且存在＝修改（只改有給的欄位）；否則新增。→ `{ok, created, id, listing}`
- **setPublished** `{token, id, published:true|false}` → 上架／下架
- **deleteListing** `{token, id}` → 整列刪除（無法復原；一般建議用下架）

### 網站文字
- **getCopy** `{token}` → `{ok, copy:[{key,label,value}]}`
- **updateCopy** `{token, copy:{"hero.slogan":"新標語", …}}` → `{ok, changed:[…]}`；value 空白＝網站用原本內建文字

可用代碼：`notice, hero.greeting, hero.sub, hero.slogan, hero.intro, form.title, form.sub, services.title, services.sub, service1~3.title / .en / .points（一行一點）, listings.title, listings.sub, listings.limit, faq.title, faq.sub, footer.team, footer.fine, legal.agent, legal.company1, legal.broker1, legal.company2, legal.broker2`
（legal.* 是法定揭露，除非證號真的變更，否則不要改）

`listings.limit`：精選案件一開始顯示幾間。填 `4,6`＝手機 4 間、電腦 6 間；只填一個數字則兩種螢幕都用這個數量。空白或不填＝預設 4、6。超過的物件會收在「看更多物件（剩 N 間）」後面，點了可展開，再點「收合」會收起來。篩選分類改變後會重新套用這個上限。

### 照片
- **uploadPhoto** `{token, filename, mimeType:"image/jpeg", data:"<base64>"}` → 存到雲端硬碟資料夾（`PHOTO_FOLDER_ID`，沒有就自動建立「許津銓網站照片」），設成知道連結的人可檢視。
  → `{ok, id, url:"https://drive.google.com/file/d/ID/view", imageUrl:"https://lh3.googleusercontent.com/d/ID=w1200"}`
  後台會先把照片縮到最長邊 1600px 再上傳。把 `url` 放進物件的 `照片網址`。

### 客戶留言
- **listLeads** `{token, limit?, status?}` → 新的在前 `{ok, leads:[{_row,時間,姓名,電話,LINE,需求類型,區域,預算,留言,同意個資,處理狀態,來源頁面}]}`
- **updateLead** `{token, row, status}` status＝新留言／已聯絡／處理中／已結案

## 給 AI 助理的範例

「幫我上架一間中壢青埔三房，1568 萬，35 坪，含車位」→

```json
{"action":"saveListing","token":"…","listing":{"type":"買賣","category":"三房","title":"中壢青埔三房車位","district":"桃園市中壢區","address":"青埔","price":1568,"ping":35,"layout":"3房2廳2衛","features":["含車位"],"published":true}}
```

「把 A003 下架」→ `{"action":"setPublished","token":"…","id":"A003","published":false}`

「今天有誰留言？」→ `{"action":"listLeads","token":"…","status":"新留言"}`

助理應該：先 `login`（密碼由使用者提供，不要存起來）；修改或刪除前先用 `getListing` 讀出來跟使用者確認；刪除前一定要再問一次。
