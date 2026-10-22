# 站点维护备忘

更新于 2026-10-19。

## 卡片数量与分页

- 首页（News）和 Research 页目前都是单页，各 16 张卡片。不再使用「第 1 页 / 第 2 页」的分页；`index-page-2.html` 和 `research-page-2.html` 只是跳转存根，保留给旧链接。
- **阈值：单页超过 24 张（6 整行）时再处理**，处理方式不是分页，而是：
  - **News**：首页只保留最新 12 条；新建 `news.html` 存档页放全部，首页网格下方加「All news →」。
  - **Research**：同一页按年份分组，每组一个小的年份标题，页面上方一排年份锚点（2026 · 2025 · 2024 …）。
- 到那个量级时，顺便把卡片改成由一个数据文件生成（JSON/YAML 加一个小脚本），加一篇论文只需填几行，不再手写 HTML。

## 新增一张卡片时

- 封面图按 4:5 裁切，生成 webp（质量 72–80），卡片用 `<picture>`；首页 hero 用的图另存全尺寸。
- Research 卡片的链接固定为 Paper / arXiv / Code / Project 四种，有才写，顺序不变；作者行加粗 Zhenyue Qin，`*` 共同一作、`†` 通讯，图例在网格下方。
- 改了 `css/styles.css` 或 `js/main.js` 后，把所有页面里的 `?v=` 版本号换成当天日期序号。

## 待确认

- `about-cn.html`：金东祐（Dongwoo Kim）的「祐」字、「视觉机器」（Seeing Machines）译名、InterfereX 的中文名，均未经本人核实。
- SoVTR（EMNLP Findings 2026）尚无公开链接，卡片显示 Coming Soon；有 arXiv 后替换。
- ANUBIS 与 LMOD+ 的卡片标题已改为发表版全称，若想用简称可改回。
