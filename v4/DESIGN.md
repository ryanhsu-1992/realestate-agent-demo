# Design System: 許津銓｜住商不動產RM團隊 — v4「封面故事」
**Project ID:** realestate-agent-demo/v4（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：editorial-grid-magazine（UUPM style #49）＋ Magazine Style 字體配對。Impeccable 模式：Persuade。
> Taste dials：Density 5 / Variance 7 / Motion 4。

## 1. Visual Theme & Atmosphere
像一本在地生活雜誌的封面故事：米白道林紙、墨黑標題、朱紅點綴。大字號粗明體名字撐起整個版面，口號用引號做成拉頁引言（pull quote），介紹文字以首字放大開場。整體可信、有人味，像被雜誌專訪的在地專家。

## 2. Color Palette & Roles
- **道林紙米白** (#F4EFE6) — 頁面底色，帶極淡紙張雜訊
- **象牙卡紙** (#FBF8F2) — 表單、服務區塊底
- **油墨深褐黑** (#1D1A17) — 主要文字、粗分隔線、頁尾與行情區反白底
- **封面朱紅** (#A93C29) — 唯一強調色：主要按鈕、首字放大、價格、選中狀態
- **鉛灰褐** (#625950) — 次要文字、說明
- **牛皮線** (#D6CBBB) — 細框線與輸入框

## 3. Typography Rules
- 標題：Noto Serif TC 900（粗明體），名字放到 176px，字距略開，像雜誌刊頭
- 內文：Noto Sans TC 400/500，行高 1.85，長度控制在 36em 內
- 英文與數字：Newsreader（italic 用於英文副標，700 用於價格）；原本的 Fraunces 經 Impeccable 判定為過度使用字體而替換

## 4. Component Stylings
* 按鈕：近乎直角（4px），朱紅實心為唯一主按鈕；次要按鈕為墨黑細框
* 卡片：直角、墨黑 1px 框，不用陰影；表單卡以柔和長陰影浮起（Impeccable 稽核後移除硬邊錯位陰影）
* 輸入框：米白底、牛皮線框，聚焦時朱紅外框
* 分頁：底線式 tabs，像雜誌目錄

## 5. Layout Principles
封面式非對稱兩欄（1.15 : 0.85），左欄大字、右欄朱紅底去背人像＋圖說；各段落以 3px 粗黑線開頭，服務以橫向條目（圖示｜標題｜兩欄條列）排列，不用三張等寬卡。手機上單欄，人像縮為 420px 寬。

## 6. Motion & Interaction
唯一主動畫：封面鑰匙圖示緩慢擺動（6 秒）；其他區塊滑入淡出，皆遵守 prefers-reduced-motion。

## 7. Anti-Patterns (Banned)
- 不用漸層字、不用霓虹光暈
- 不用標題上方的小標（eyebrow）
- 不用 emoji 當圖示
- 不用三張等寬卡片當服務區
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：editorial-grid-magazine（UUPM style #49）＋ Magazine Style 字體配對
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- Fraunces 被判定為過度使用的 AI 字體 → 改 Newsreader
- 表單卡硬邊錯位陰影（hard-offset-shadow）→ 改柔和長陰影
- 引號裝飾壓到名字 → 改為行內定位
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
