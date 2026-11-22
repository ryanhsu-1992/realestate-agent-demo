# Design System: 許津銓｜住商不動產RM團隊 — v12「房產週報」
**Project ID:** realestate-agent-demo/v12（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：e-ink-paper ＋ editorial-grid-magazine 的報紙版（UUPM：digital newspapers），字體參考 News Editorial（Newsreader）改用中文的 UoqMunThenKhung 鉛字感標題。Impeccable 模式：Persuade。
> Taste dials：Density 7 / Variance 6 / Motion 2。

## 1. Visual Theme & Atmosphere
一份只寫桃園房子的社區報：再生新聞紙、油墨黑、報頭雙線、灰階網點人像，加上一抹印刷紅。可信的來源感、資訊密度高但有秩序，像打開每週固定會看的地方報。

## 2. Color Palette & Roles
- **新聞紙米** (#EFE9DC) — 頁面底，帶紙纖雜訊
- **油墨黑** (#1C1B19) — 文字、所有欄線、選中狀態（非純黑）
- **印刷紅** (#A8321F) — 唯一強調：名字上方小標、價格、出租標籤
- **舊報灰** (#58534A) — 圖說、次要文字
- **淡報紙** (#F6F2E8) — 表單與輸入框底

## 3. Typography Rules
- 報頭與名字：UoqMunThenKhung（鉛字感明體），報頭 128px
- 內文：Noto Serif TC，報紙內文用明體，行高 1.9、左右對齊
- 標籤、按鈕、圖說：Chocolate Classical Sans（古典黑體）

## 4. Component Stylings
* 全部直角（radius 0），以 1px 欄線與雙線分隔，不用陰影
* 人像：灰階＋網點（halftone）印刷效果
* 物件：像分類廣告欄，格線相連
* 分頁、篩選：黑底反白為選中

## 5. Layout Principles
三欄報紙版面（頭條 1.35｜照片 1｜側欄 0.62），欄間細黑線；平板時內文分兩欄；手機單欄。服務區 2＋1 欄位，委託內文分兩欄。

## 6. Motion & Interaction
幾乎沒有動畫（Motion 2）：只保留區塊淡入，像紙本一樣安定。

## 7. Anti-Patterns (Banned)
- 不用圓角與陰影
- 不用彩色照片（人像統一灰階網點）
- 報頭名稱只是版面設計，不宣稱是真實刊物
- 不用 emoji
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：e-ink-paper ＋ editorial-grid-magazine 的報紙版（UUPM：digital newspapers），字體參考 News Editorial（Newsreader）改用中文的 UoqMunThenKhung 鉛字感標題
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- 報紙欄線的 cramped-padding 提示屬於刻意的欄線拼接，保留
- 米色（新聞紙）為世界觀必要，保留
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
