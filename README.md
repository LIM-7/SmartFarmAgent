# SmartFarmAgent 智慧农业智能体系统——参赛作品说明书

以 ESP32 单芯片为感知执行端、Node.js/Vue 为平台、云端大模型智能体为决策大脑，实现「感知 → 决策 → 执行」全闭环的智慧农业系统。本仓库用于文档版本溯源。

## 文件说明

- `PROPOSAL.md`：参赛作品说明书（Markdown 源，v3.0，按作品说明书模板重构）
- `PROPOSAL.tex` / `PROPOSAL.pdf`：说明书 LaTeX 源与 PDF 成品（xelatex 编译）
- `PROPOSAL.docx`：说明书 Word 成品（三线表、黑体标题、五号表内文字，按 word-typesetting 规范）
- `TechDoc.md` / `TechDoc.tex` / `TechDoc.pdf` / `TechDoc.docx`：系统技术文档（按《知识问答系统技术文档》模板结构）
- `build_docx.js`：说明书 Word 生成脚本（docx-js）
- `build_techdoc.js`：技术文档 Word 生成脚本（docx-js）
- `VERSIONS.md`：各版本声明与备注
- `md2docx.py`：通用 Markdown → Word 转换工具（python-docx）
- `Proposal/Proposal.*`：导师提交版（v2.0，ESP32 + Node.js + Vue 整体重写版，未随 v3.0 重构）
- `Proposal/Meeting_Points.*`：导师汇报与参赛准备要点（2026-08-10 汇报用）
- 命名约定：根目录 `PROPOSAL.*`（全大写）= 参赛作品说明书（内部完整版）；`Proposal/` 目录内 `Proposal.*`（首字母大写）= 导师提交版（Windows 大小写不敏感，用目录区分大小写）

## v3.0 主要变化

- 主文档按「参赛作品说明书」模板重构：作品简介 → 设计原理 → 技术方案 → 创新点（含效果对比）→ 实用价值 → 总结。
- 新增系统技术文档 `TechDoc.*`：定位 / 技术栈 / 总体架构 / 架构关系 / 核心模块 / 决策链路 / 数据存储 / 接口 / 安全容错。
- 附录 A 收录全国 9 类相关赛事与获奖作品调研结论，定位为无特定参赛目标的通用竞赛项目书。
- 金丰上位机-移植版（LabVIEW 路线资产）已删除，不再维护。

## 版本历史

各版本声明与备注见 `VERSIONS.md`，逐版本改动见 git 提交记录。
