# Design System: 許津銓｜住商不動產RM團隊 — v5「暖白日常」
**Project ID:** realestate-agent-demo/v5（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：nature-distilled（UUPM：Wellness/artisan，暖色自然）＋ Japandi 留白；配對參考 Wellness Calm。Impeccable 模式：Persuade。
> Taste dials：Density 3 / Variance 5 / Motion 5。

## 1. Visual Theme & Atmosphere
像午後陽光照進的木質客廳：燕麥米白、陶土棕、一點苔綠。字細、字距寬，留白多，資訊一層一層慢慢出現。立體小鎮插圖浮在暖色光暈上，讓人感覺「找房子這件事可以不用焦慮」。

## 2. Color Palette & Roles
- **燕麥米白** (#F3EDE4) — 頁面底色
- **棉紙白** (#FBF8F3) — 卡片、表單、服務區卡
- **木炭灰褐** (#2B2622) — 主要文字
- **陶土棕** (#8A5236) — 唯一強調色：主按鈕、價格、口號、選中狀態
- **苔綠** (#5F6A4B) — 英文副標、出租標籤、小標裝飾
- **石灰褐** (#6E645A) — 次要文字
- **沙色線** (#E1D6C7) — 細線與分隔

## 3. Typography Rules
- 標題：Chiron Hei HK 300（極細黑體），名字 104px、字距 0.08em，安靜但有存在感
- 內文：Noto Sans TC 400，行高 1.95
- 英文副標與價格：Spectral（italic），像手寫標籤般柔和（Impeccable 判定 Instrument Serif 過度使用後替換）

## 4. Component Stylings
* 按鈕：膠囊形（pill），陶土棕實心為主；次要按鈕為棉紙白底＋沙色框
* 卡片：32px 大圓角、無框線，以帶暖色的柔和陰影浮起
* 服務區：圓形暖光底座承托 3D 圖示，左右交錯（zig-zag）排列
* 輸入框：12px 圓角、暖白底

## 5. Layout Principles
非對稱兩欄（文字 1：插圖 1.05），手機上插圖在上、文字在下；大量留白，段落間距 clamp(56px, 9vw, 112px)。服務三段以左右交錯呈現，避免三張等寬卡。

## 6. Motion & Interaction
唯一主動畫：小鎮插圖 7 秒緩慢上下漂浮，地面影子同步縮放；其餘為輕微淡入，reduced-motion 時全部停止。

## 7. Anti-Patterns (Banned)
- 不用純白 #FFFFFF 大面積底
- 不用冷灰色
- 不用硬邊陰影或霓虹光
- 不用 emoji
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：nature-distilled（UUPM：Wellness/artisan，暖色自然）＋ Japandi 留白；配對參考 Wellness Calm
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- Instrument Serif 判定過度使用 → 改 Spectral italic
- 苔綠英文副標 4.3:1 → 加深為 #5F6A4B（5.4:1）
- 頁尾次要文字 4.4:1 → #5E554C（5.6:1）
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
