# Design System: 許津銓｜住商不動產RM團隊 — v13「包浩斯幾何」
**Project ID:** realestate-agent-demo/v13（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：bauhaus（UUPM style：high personality、branding）；字體 Bauhaus Geometric 方向，中文改用 WDXL Lubrifont TC（粗幾何黑體）＋ Outfit。Impeccable 模式：Persuade。
> Taste dials：Density 5 / Variance 8 / Motion 5。

## 1. Visual Theme & Atmosphere
把房子拆成最基本的形狀：圓、方、三角、四分之一圓，配上紅、藍、黃三原色與厚黑線。大膽、有記憶點、像設計展海報，但資訊結構清楚、規則一致，傳達「專業又有個性」。

## 2. Color Palette & Roles
- **畫布灰白** (#F1EFEA) — 頁面底（Impeccable 稽核後由米色改為中性灰白）
- **包浩斯紅** (#C2352A) — 唯一主按鈕色、選中分頁、條列點
- **包浩斯藍** (#1D4E89) — 行情區底、選中篩選、出租標籤、表單錯位色塊、聚焦外框
- **包浩斯黃** (#F2B632) — 大色塊、口號底色（只配黑字）
- **墨黑** (#1A1918) — 3px 粗框線與文字（非純黑）
- **石墨灰** (#57514A) — 次要文字

## 3. Typography Rules
- 標題：WDXL Lubrifont TC（粗幾何中文黑體），名字 150px
- 內文：Noto Sans TC 400/500
- 英數：Outfit 700/800

## 4. Component Stylings
* 按鈕：直角＋2px 黑框；需求入口為黑框膠囊，hover 各自填入紅／黃／藍
* 卡片：3px 黑框、直角；表單卡右下錯位藍色方塊
* 服務：拼接網格（不是三張浮動卡），每項的圖示底座各是圓／方／四分之一圓
* 段落標題前有一個幾何形狀（圓、方、三角）

## 5. Layout Principles
兩欄；右側為幾何拼貼構圖：藍方塊、紅四分之一圓、黃三角、黑條，中央黃色圓框去背人像。手機單欄，構圖縮小。

## 6. Motion & Interaction
唯一主動畫：進場時幾何形狀依序滑入／旋入（只播一次），鑰匙圖示緩擺；reduced-motion 時直接顯示。

## 7. Anti-Patterns (Banned)
- 黃色上不放白字
- 不用漸層
- 不用陰影模糊（只用實色錯位塊，因為是包浩斯世界觀）
- 不用 emoji
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：bauhaus（UUPM style：high personality、branding）；字體 Bauhaus Geometric 方向，中文改用 WDXL Lubrifont TC（粗幾何黑體）＋ Outfit
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- 米色畫布 → 改中性灰白 #F1EFEA
- 手機上幾何構圖移到文字前面，首屏不再只有文字
- 藍色實色錯位塊屬於包浩斯世界觀，保留（advisory）
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
