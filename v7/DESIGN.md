# Design System: 許津銓｜住商不動產RM團隊 — v7「街坊好鄰居」
**Project ID:** realestate-agent-demo/v7（Stitch MCP 未連線，依 Stitch design-md 格式手動撰寫）

> Stage 1 決策來源（UI-UX-Pro-Max）：vibrant-and-block-based＋claymorphism 柔和版（UUPM：consumer、friendly）；字體參考 Soft Rounded／Kids-friendly 但改用台灣圓體 Huninn、Chiron GoRound TC。Impeccable 模式：Persuade。
> Taste dials：Density 5 / Variance 6 / Motion 6。

## 1. Visual Theme & Atmosphere
像巷口熟識的好鄰居：薄荷白底、向日葵黃、湖水綠，加上珊瑚紅小貼紙。圓體字、粗黑邊框與「壓得下去」的按鈕，親切、好親近，但資訊排列仍然清楚、可信。

## 2. Color Palette & Roles
- **薄荷白** (#F3FBF8) — 頁面底色（Impeccable 稽核後由奶油色改為薄荷白，避免米色預設）
- **湖水綠** (#0B6E6E) — 唯一主色：主按鈕、名字、價格、法定揭露帶
- **向日葵黃** (#FFC94A) — 插圖背景色塊、口號螢光筆底線（裝飾，不放小字）
- **磚珊瑚** (#C9472C) — 出租標籤、條列點、貼紙
- **墨綠黑** (#1E2B2B) — 文字與粗外框
- **石板灰綠** (#4F5D5C) — 次要文字

## 3. Typography Rules
- 標題：Huninn（粉圓體），名字 120px，圓潤友善
- 內文：Chiron GoRound TC 400/500/700，圓體但筆畫清楚
- 數字同字族，避免混入制式黑體

## 4. Component Stylings
* 按鈕：16px 圓角，主按鈕底下有實體厚度（5px 色塊陰影），按下會壓下去
* 卡片：3px 墨綠黑框＋底部色塊陰影，像貼在冰箱上的卡片
* 服務區：前兩項並排、委託橫跨整列，三種淡色底（薄荷／淡黃／淡珊瑚）
* 輸入框：2px 邊框、14px 圓角

## 5. Layout Principles
非對稱兩欄，右側黃色有機色塊＋小鎮插圖＋旋轉貼紙；手機上插圖在上。區塊之間用波浪分隔線轉場。

## 6. Motion & Interaction
唯一主動畫：黃色色塊 12 秒緩慢變形、鑰匙與對話圖示輕輕上下浮動；reduced-motion 時停止。

## 7. Anti-Patterns (Banned)
- 不用霓虹或紫色漸層
- 不用 emoji 當圖示
- 黃色不當文字底的小字背景（對比不足）
- 不用三張等寬卡
- 不得出現「代管」；服務只有房屋配對、房產買賣、歡迎委託
- 不捏造數據：行情數字、物件全部標示「範例」

## 8. Build & Review Log（5 階段流程）
1. **決策（UI-UX-Pro-Max）**：vibrant-and-block-based＋claymorphism 柔和版（UUPM：consumer、friendly）；字體參考 Soft Rounded／Kids-friendly 但改用台灣圓體 Huninn、Chiron GoRound TC
2. **設計語言**：本檔（Stitch design-md / taste-design 格式）
3. **建置（shadcn 模式）**：語意化 tokens（--background/--foreground/--card/--primary/--muted/--border/--input/--ring/--radius）；Button 變體 default/outline/ghost＋尺寸 sm/lg；Tabs（role=tablist，方向鍵切換）；Toggle chips；Accordion（details/summary）；Badge（範例／範本）。單一靜態 HTML，無建置步驟。
4. **Impeccable detect／critique／polish 修正**：
- 輸入框 placeholder 對比不足（3.6–4.4:1）→ 改用 muted-foreground 實色，全部 ≥ 4.5:1
- 占位卡標題 h4 跳級 → 改為 h3；法定揭露小標不再用 h2（改 aria-label 區塊）
- 移除標題上方 eyebrow 小標（Impeccable 絕對禁止項）
- 白字在珊瑚紅上 3.0:1 → 珊瑚加深為 #C9472C（4.75:1）
- 黃色小標在湖水綠上 3.9:1 → 改 #FFE9A8（5.0:1）
- 奶油底被判定米色預設 → 改薄荷白 #F3FBF8
- 粗黑邊＋實色底影屬於本版「積木」世界觀，保留（advisory）
5. **Web Interface Guidelines（Vercel）修正**：
- 非登入欄位補 autocomplete（off 或 address-level2），錯誤訊息 aria-live＋aria-invalid＋aria-describedby，送出時聚焦第一個錯誤
- 需求分頁同步網址（#/buy、#/sell、#/rent 可深連結）
- 有未送出的填寫內容時離開頁面會提醒（beforeunload）
- 裝飾性無限動畫 5 秒後自動收尾停止（WCAG 2.2.2），prefers-reduced-motion 時完全不動
- 所有可點元素 touch-action: manipulation、明確 :focus-visible 外框；手機底部快捷列不遮住聚焦欄位（scroll-padding-bottom）
- 品牌名與聯絡資訊加 translate="no"；theme-color 與頁面底色一致；長字串 overflow-wrap
