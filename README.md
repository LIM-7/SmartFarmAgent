# SmartFarmAgent 智慧农业智能体系统——参赛作品说明书

以 ESP32 单芯片为感知执行端、Node.js/Vue 为平台、云端大模型智能体为决策大脑，实现「感知 → 决策 → 执行」全闭环的智慧农业系统。本仓库用于文档版本溯源。

## 文件说明

```
SmartFarmAgent/
├── README.md / VERSIONS.md          # 说明与版本记录
├── package.json / package-lock.json # docx-js 依赖
├── .gitignore
├── build/                           # 构建脚本
│   ├── build_docx.js                # 说明书 Word 生成脚本（docx-js）
│   ├── build_techdoc.js             # 技术文档 Word 生成脚本（docx-js）
│   ├── build_compdoc.js             # 赛事调研报告 Word 生成脚本（docx-js）
│   └── md2docx.py                   # 通用 Markdown → Word 转换工具（python-docx）
└── docs/                            # 交付物（md / tex / pdf / docx）
    ├── PROPOSAL.*                   # 参赛作品说明书（v3.4，开源资源已核验）
    ├── TechDoc.*                    # 系统技术文档（第 10 章：参考开源资源与实现路径）
    ├── Competition_Research.*       # 全国相关赛事调研报告（9 类赛事官网核验）
    └── Proposal/                    # 导师提交版（Proposal.* v2.0 + Meeting_Points.*）
```

- 命名约定：`docs/PROPOSAL.*`（全大写）= 参赛作品说明书（内部完整版）；`docs/Proposal/Proposal.*`（首字母大写）= 导师提交版（Windows 大小写不敏感，用目录区分大小写）。
- 构建：Word 用 `node build/build_*.js`（输出到 `docs/`），PDF 在 `docs/` 内用 `latexmk -xelatex` 编译。

## v3.0 主要变化

- 主文档按「参赛作品说明书」模板重构：作品简介 → 设计原理 → 技术方案 → 创新点（含效果对比）→ 实用价值 → 总结。
- 新增系统技术文档 `TechDoc.*`：定位 / 技术栈 / 总体架构 / 架构关系 / 核心模块 / 决策链路 / 数据存储 / 接口 / 安全容错。
- 附录 A 收录全国 9 类相关赛事与获奖作品调研结论，定位为无特定参赛目标的通用竞赛项目书。
- 金丰上位机-移植版（LabVIEW 路线资产）已删除，不再维护。

## v3.1 主要变化

- 赛事调研从附录 A 抽出为独立文档 `Competition_Research.*`：9 类赛事逐项官网核验（部委公告 / 学会官网 / 高校通知交叉确认），按含金量从高到低排序并附官方链接。
- 说明书附录 A 精简为结论摘要，指向独立调研文档。

## v3.2 主要变化

- 正文去 AI 味润色：智能体协同机制段落重写（消除「与 A 相比 / 与 B 相比」机械对比），行业趋势段语序调整。
- 全部 8 张表格增加表题并按章编号（表 2-1～表 D-1），正文先引用后出现，符合正式文档规范。
- LaTeX 排版升级：章节改为中文序号（一、/（一）），附录采用「附录 A：」格式，表计数器按章归零，修复 ≥ 符号缺字。
- Word 版按 word-typesetting 标准通过终检（DELIVERY GATE: PASS，FAIL=0 / WARN=0）：首行缩进按字符、一级标题前留白、三线表白底、页脚页码。

## v3.3 主要变化

- 删除「队员分工（占位）」附录。
- 新增「参考开源资源」附录（表 D-1）：10 项核心开源项目，附可点击 GitHub 链接。
- 附录 A 赛事总览中的竞赛名称全部改为可点击官网链接。

## v3.4 主要变化

- 技术文档新增第 10 章「参考开源资源与实现路径」：表 10-1 收录 16 项开源资源（2026-08-12 GitHub API 逐项核验：存在性 / star / 最近推送 / 归档 / 许可），表 10-2 给出分模块实现路径（对应 M0—M5 里程碑）。
- 核验发现原收录的 PlantDoc（pratikkayal/PlantDoc）已失效（404），提案附录 D 同步改用 PlantVillage-Dataset（spMohanty/PlantVillage-Dataset）。

## v3.4.1 主要变化

- 目录结构整理：交付物统一移入 `docs/`，构建脚本移入 `build/`，根目录仅保留说明、版本与依赖文件。
- 清除 LaTeX 中间产物（aux/log/out/xdv/fdb_latexmk/fls）与过时版本副本；`.gitignore` 补充对应模式。
- 三份 Word 成品从新结构重建，全部通过 word-typesetting 终检（FAIL=0 / WARN=0）。

## 版本历史

各版本声明与备注见 `VERSIONS.md`，逐版本改动见 git 提交记录。
