# Design System: 許津銓｜住商不動產RM團隊 — v10「便當格」
**Project ID:** realestate-agent-demo/v10（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：bento-box-grid（UUPM style：Apple-style marketing、feature 展示）；字體配對 Startup Bold/Geometric Modern 的 Outfit 只給英數。Impeccable 模式：Persuade。
> Taste dials：Density 6 / Variance 7 / Motion 5。

## 1. Visual Theme & Atmosphere
像一個整理得很好的便當盒：每一格裝一件事（我是誰、怎麼聯絡、我服務什麼）。霧灰底、白色格子、深森林綠與萊姆黃兩塊強調格，一眼掃完全部重點，現代、有效率、好上手。

## 2. Color Palette & Roles
- **霧灰綠** (#EEF0EC) — 頁面底色
- **純淨白格** (#FFFFFF) — 大多數格子與卡片
- **森林綠** (#1F4D3A) — 唯一主色：主按鈕、撥打電話格、房產買賣格
- **萊姆黃** (#D7F171) — LINE 格、委託格、選中篩選（只配深色字）
- **墨綠黑** (#151A17) — 文字、頁尾
- **苔灰** (#59625B) — 次要文字

## 3. Typography Rules
- 標題：Noto Sans TC 900，名字 112px，字距略收
- 內文：Noto Sans TC 400/500
- 英數（電話、LINE ID、價格）：Outfit 600/800，等寬數字

## 4. Component Stylings
* 格子：28px 大圓角、無框線，只用極淡雙層陰影分層
* 按鈕：14px 圓角，深綠主按鈕
* 電話／LINE 本身就是可點的大格子（含 3D 圖示）
* 服務：12 欄網格不等寬（5＋7，委託整列），三格三種底色

## 5. Layout Principles
12 欄 bento 網格；主視覺 6 格（介紹、照片、電話、LINE、小鎮插圖、需求入口），手機收成 2 欄＋整列。所有區塊都維持同一套格子語言。

## 6. Motion & Interaction
小鎮插圖 14 秒緩慢漂移；格子 hover 微浮；其餘淡入。reduced-motion 時停止。

## 7. Anti-Patterns (Banned)
- 不放捏造的統計數字格（no fake metrics）
- 不用霓虹或紫色
- 萊姆黃上不放淺色字
- 不用 emoji
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：bento-box-grid（UUPM style：Apple-style marketing、feature 展示）；字體配對 Startup Bold/Geometric Modern 的 Outfit 只給英數
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- 房產買賣格在自身重設 --primary 導致底色變萊姆、白字 1.2:1 → 改寫死 #1F4D3A 底
- 電話號碼在窄格斷行 → 調整格寬並 nowrap
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
