# Design System: 許津銓｜住商不動產RM團隊 — v6「夜色黑金」
**Project ID:** realestate-agent-demo/v6（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：exaggerated-minimalism（UUPM：luxury brands）× dark mode；色票取 UUPM real-estate luxury 的 Stone/Gold 推論；字體參考 Luxury Minimalist（Bodoni Moda）。Impeccable 模式：Persuade。
> Taste dials：Density 3 / Variance 6 / Motion 4。

## 1. Visual Theme & Atmosphere
像高端建案接待中心的夜間燈光：深炭黑底、香檳金細線、拱形窗框裡的人像被暖光從背後打亮。字細、字距寬、留白多，奢華感來自克制，不靠金色堆砌。

## 2. Color Palette & Roles
- **夜炭黑** (#12100E) — 頁面底色（不用純黑）
- **炭褐表面** (#1B1815) — 卡片、表單
- **象牙白** (#F2EBDF) — 主要文字
- **香檳金** (#CDB083) — 唯一強調色：主按鈕、價格、細線、選中狀態
- **暖灰褐** (#B0A493) — 次要文字（對比 > 7:1）
- **深咖線** (#3A332C) — 分隔與框線

## 3. Typography Rules
- 標題：Noto Serif TC 300（細明體），名字 150px、字距 0.12em
- 內文：Noto Sans TC 300/400，行高 1.95
- 英文與價格：Bodoni Moda（italic 英文副標、400 價格），帶高對比襯線的精品感

## 4. Component Stylings
* 按鈕：近直角（2px），香檳金漸層實心＋內側高光為唯一主按鈕；次要為暗色細框
* 卡片：直角、1px 深咖線，服務區用 1px 金線網格拼接（不是三張浮動卡）
* 人像：拱形窗框＋雙層金線，背後暖光徑向漸層
* 輸入框：深底、聚焦時金色外框

## 5. Layout Principles
非對稱兩欄（1.1 : 0.9），右側拱窗人像；服務以 2+1 網格（前兩項並排、委託橫跨整列），物件卡片為深色畫廊。手機單欄、人像在文字之後。

## 6. Motion & Interaction
幾乎靜態：只有區塊進場淡入與物件卡 hover 微浮；不使用無限動畫，強調穩重。

## 7. Anti-Patterns (Banned)
- 不用純黑 #000
- 不用金色外發光（zero-offset glow）
- 不用漸層文字
- 不用 emoji
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：exaggerated-minimalism（UUPM：luxury brands）× dark mode；色票取 UUPM real-estate luxury 的 Stone/Gold 推論；字體參考 Luxury Minimalist（Bodoni Moda）
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- Detector 無對比與光暈問題；保留拱窗人像背後的徑向暖光（非 zero-offset glow）
- 服務區 1px 金線拼接網格的 cramped-padding 提示為刻意設計，內距在子格內
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
