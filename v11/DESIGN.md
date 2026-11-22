# Design System: 許津銓｜住商不動產RM團隊 — v11「晨光玻璃」
**Project ID:** realestate-agent-demo/v11（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：glassmorphism（UUPM --design-system 對「real estate」查詢的首選；Primary #0F766E 直接採用其建議）＋ aurora-ui 背景。Impeccable 模式：Persuade。
> Taste dials：Density 4 / Variance 5 / Motion 6。

## 1. Visual Theme & Atmosphere
清晨的桃園天空：薄荷綠、海霧白、一點晨光杏色的光暈在背景慢慢流動，上面浮著一層層霧面玻璃卡。玻璃只用在真的疊在彩色光暈上的地方，讓畫面有空氣感與層次，又不失去可讀性。

## 2. Color Palette & Roles
- **晨霧薄荷** (#E9F3EF) — 頁面底色（漸層至晨光杏 #F6EEE2）
- **湖水青** (#0F766E) — 唯一主色：主按鈕、價格、選中（UUPM 推薦值）
- **深潭綠** (#0B2925) — 文字、頁尾、出租標籤
- **霧玻璃白** (rgba(255,255,255,.55–.66)) — 所有卡片表面，blur 18–22px
- **光暈薄荷／杏** (#7CC6B4 / #F4D3A1) — 背景流動光暈（純裝飾）
- **灰青** (#355650) — 次要文字

## 3. Typography Rules
- 標題：Noto Sans TC 900，名字 120px
- 內文：Noto Sans TC 400
- 英數：Manrope 700/800（電話、LINE ID、價格）

## 4. Component Stylings
* 玻璃卡：白色 55–66% 透明＋背景模糊＋1px 白邊＋內側高光
* 按鈕：16px 圓角，湖水青主按鈕；次要為玻璃按鈕
* 主視覺右側：一張玻璃名片，含小鎮插圖、頭像、電話與 LINE 快捷
* 輸入框：85% 白底，確保文字對比

## 5. Layout Principles
兩欄（1.05 : 0.95）；服務 2＋1（委託整列）；所有內容區都是玻璃面板浮在光暈背景上。手機單欄。

## 6. Motion & Interaction
唯一主動畫：背景三團光暈 18–26 秒緩慢漂移（只用 transform）；reduced-motion 時靜止。

## 7. Anti-Patterns (Banned)
- 玻璃不疊玻璃到看不清文字
- 不用紫藍霓虹（AI Purple）
- 不用漸層字
- 不用 emoji
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：glassmorphism（UUPM --design-system 對「real estate」查詢的首選；Primary #0F766E 直接採用其建議）＋ aurora-ui 背景
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- detector 僅提示 cramped-padding（玻璃面板內距已足），無對比問題；玻璃面板白度提高到 55–66% 確保字的對比
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
