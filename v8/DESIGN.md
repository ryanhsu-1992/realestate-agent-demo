# Design System: 許津銓｜住商不動產RM團隊 — v8「藍圖筆記」
**Project ID:** realestate-agent-demo/v8（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：minimalism-and-swiss-style（UUPM）× 建築藍圖世界觀；資料欄位用 IBM Plex Mono（UUPM Developer Mono 配對，僅用於量測數字）。Impeccable 模式：Persuade。
> Taste dials：Density 6 / Variance 6 / Motion 4。

## 1. Visual Theme & Atmosphere
像建築師的施工圖與現場筆記：藏青藍圖紙、淺藍線稿平面圖、橘色校正記號。給人「每一坪都量過、每個細節都核對過」的專業與精準感。網格只出現在真的是圖紙的地方（主視覺、物件圖框）。

## 2. Color Palette & Roles
- **藍圖藏青** (#0F2742) — 主視覺、行情與頁尾底色
- **製圖淺藍** (#8EC3E6) — 線稿、表頭、圖紙網格
- **工程藍** (#174A85) — 淺色區唯一主色：按鈕、價格、選中
- **校正橘** (#E0702E) — 僅用於角標、條列點等小記號
- **製圖紙灰白** (#F4F6F8) — 頁面底色
- **墨藍黑** (#0E1A26) — 文字

## 3. Typography Rules
- 標題：Noto Sans TC 900，名字 124px，硬朗
- 內文：Noto Sans TC 400/500
- 量測與編號：IBM Plex Mono（坪數、價格、電話、圖框代號），只用在真正的數據上

## 4. Component Stylings
* 按鈕：6px 小圓角；在藏青底上主按鈕反白
* 表單卡：像圖紙圖框，左上角黑色標籤「FORM / 需求表」
* 人像資料：建築圖的「圖說欄」表格（營業員／團隊／區域／電話）
* 服務：圖紙式橫列（Impeccable 稽核後移除 S-01～S-03 區段編號）

## 5. Layout Principles
兩欄：左文字、右圖紙（手繪平面圖 SVG＋圖說欄）。服務以橫向表格列排，物件卡片底圖為細方格。手機單欄、圖紙在文字之後。

## 6. Motion & Interaction
唯一主動畫：進場時平面圖牆線以描線動畫畫出（2.6 秒，只播一次）；reduced-motion 時直接顯示完成圖。

## 7. Anti-Patterns (Banned)
- 網格只用在圖紙語境，不當一般裝飾
- Mono 字只給數據，不當「科技感」裝飾
- 不用 emoji
- 不用漸層字
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：minimalism-and-swiss-style（UUPM）× 建築藍圖世界觀；資料欄位用 IBM Plex Mono（UUPM Developer Mono 配對，僅用於量測數字）
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- 表單區與服務圖框的方格背景（codex-grid）→ 移除，方格只留在主視覺藍圖與物件圖框
- 移除 TEAM 標籤與 S-01～S-03 區段編號（eyebrow／section number 禁用）
- theme-color 改為頁面底色
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
