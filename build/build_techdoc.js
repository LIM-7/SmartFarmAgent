const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, HeadingLevel,
  LevelFormat, PageNumber, Footer, VerticalAlign, ExternalHyperlink
} = require("docx");

const FONT = { ascii: "Times New Roman", eastAsia: "SimSun", hAnsi: "Times New Roman", cs: "Times New Roman" };
const FONT_HEAD = { ascii: "Times New Roman", eastAsia: "SimHei", hAnsi: "Times New Roman", cs: "Times New Roman" };
const FONT_MONO = { ascii: "Consolas", eastAsia: "SimSun", hAnsi: "Consolas", cs: "Consolas" };
const LINK = "0563C1";

function runs(text, base = {}) {
  const parts = text.split(/(\[[^\]\n]+?\]\(https?:\/\/[^)\s]+\)|\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.filter((s) => s).map((seg) => {
    if (seg.startsWith("[") && seg.includes("](")) {
      const m = seg.match(/^\[(.+?)\]\((https?:\/\/.+?)\)$/);
      if (m) {
        return new ExternalHyperlink({
          children: [new TextRun({ text: m[1], font: FONT, size: base.size || 24, color: LINK, underline: {} })],
          link: m[2],
        });
      }
    }
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return new TextRun({ text: seg.slice(2, -2), font: FONT, size: base.size || 24, bold: true, color: "000000" });
    }
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return new TextRun({ text: seg.slice(1, -1), font: FONT_MONO, size: base.size ? base.size - 2 : 20, color: "000000" });
    }
    return new TextRun({ text: seg, font: base.font || FONT, size: base.size || 24, color: "000000" });
  });
}

const body = (text, opts = {}) =>
  new Paragraph({
    children: runs(text, opts),
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, before: opts.before || 0, after: opts.after || 0 },
    indent: opts.indent || { firstLineChars: 200 },
  });

const bullet = (text) =>
  new Paragraph({
    children: runs(text),
    numbering: { reference: "bullets", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 0 },
  });

const caption = (text) =>
  new Paragraph({
    children: [new TextRun({ text, font: FONT, size: 21, bold: false })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80, line: 240 },
    keepNext: true,
  });

const numItem = (text) =>
  new Paragraph({
    children: runs(text),
    numbering: { reference: "nums", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 0 },
  });

function heading(text, level) {
  const map = {
    1: { style: "Heading1", size: 32, bold: false, font: FONT_HEAD },
    2: { style: "Heading2", size: 28, bold: false, font: FONT_HEAD },
    3: { style: "Heading3", size: 24, bold: true, font: FONT },
  };
  const m = map[level] || map[1];
  return new Paragraph({
    children: [new TextRun({ text, font: m.font, size: m.size, bold: m.bold })],
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 360 },
    keepNext: true,
  });
}

function table(headers, rows, widths, aligns) {
  const mkCell = (text, w, i, isHead) =>
    new TableCell({
      children: [new Paragraph({
        children: isHead
          ? [new TextRun({ text, font: FONT_HEAD, size: 21, bold: false })]
          : runs(text, { size: 21 }),
        spacing: { line: 240, after: 0 },
        alignment: isHead ? AlignmentType.CENTER : aligns[i],
      })],
      width: { size: w, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      borders: isHead ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 0 } } : undefined,
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
    });
  const bodyRows = rows.map(
    (r) => new TableRow({ children: r.map((c, i) => mkCell(c, widths[i], i, false)), tableHeader: false })
  );
  const headRow = new TableRow({
    children: headers.map((h, i) => mkCell(h, widths[i], i, true)),
    tableHeader: true,
  });
  return new Table({
    rows: [headRow, ...bodyRows],
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 0 },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 0 },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
  });
}

const spacer = () => new Paragraph({ children: [], spacing: { after: 60 } });
const children = [];

// ── 标题 ──
children.push(new Paragraph({
  children: [new TextRun({ text: "SmartFarmAgent 系统技术文档", font: FONT_HEAD, size: 36, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 120 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));

// ── 1 系统定位 ──
children.push(heading("1. 系统定位", 1));
children.push(body("SmartFarmAgent 是一套面向设施农业的软硬一体智能管理系统。系统将传感器采集、图像识别、大模型智能决策与设备执行集成到同一业务链路，为用户提供环境实时监测、设备自动调控、病虫害检测、农技知识问答与全周期生长档案等能力。"));
children.push(body("系统不是单纯的物联网监控工具，也不是独立的大模型问答应用，而是以「感知—决策—执行」闭环为核心：设备持续上报实测数据，云端综合多源信息生成决策，指令经安全校验后驱动执行器动作，执行结果回传形成下一次决策依据，使智能化从「看得见」延伸到「做得到」。"));

// ── 2 技术栈说明 ──
children.push(heading("2. 技术栈说明", 1));
children.push(table(
  ["技术层", "采用技术", "作用说明"],
  [
    ["前端界面", "Vue 3、ECharts、WebSocket", "提供大屏看板、设备控制、农技问答、视觉告警等交互界面"],
    ["后端服务", "Node.js、Express、MQTT.js", "承载业务逻辑、接口路由、MQTT 接入、智能体编排和权限校验"],
    ["通信协议", "MQTT（JSON）/ HTTP / WebSocket", "设备上行数据、下行指令、图片上传与前端实时推送"],
    ["数据存储", "MySQL / SQLite 时序存储", "保存传感器数据、设备状态、问答会话与系统配置"],
    ["视觉服务", "Python、OpenCV、YOLOv8", "病害检测与生长表型分析（独立 AI 服务，由 Node.js 编排调用）"],
    ["大模型与 RAG", "兼容 OpenAI API 的模型服务（如 DeepSeek）、RAGFlow/Dify 或自建向量检索", "农技问答、智能体决策与知识溯源"],
    ["边缘端", "ESP32（Arduino/ESP-IDF）、ESP32-CAM", "数据采集、拍照、本地规则控制与 microSD 日志"],
  ],
  [1600, 3600, 3872],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));

// ── 3 总体架构 ──
children.push(heading("3. 总体架构", 1));
children.push(body("系统整体采用分层架构，自上而下划分为展示层、智能决策层、云端平台层、边缘层、通信层和感知执行层。各层通过明确的数据结构与接口协作，前端不直接访问数据库与设备，云端与设备之间经 MQTT 协议单向可控通信。"));
children.push(table(
  ["架构层级", "核心职责", "关键组件"],
  [
    ["展示层", "承载用户交互与页面展示", "大屏看板、控制页、农技问答页、视觉告警页"],
    ["智能决策层", "组织问答与决策逻辑", "智能体编排器、RAG 检索器、视觉推理服务、指令生成器"],
    ["云端平台层", "提供统一 API 与数据接入", "认证接口、数据接口、控制接口、会话接口、MQTT 网关"],
    ["边缘层", "完成设备侧数据与规则处理", "ESP32-CAM、定时拍照任务、本地阈值规则、日志缓存"],
    ["通信层", "打通设备与云端通道", "MQTT 客户端、HTTP 图片上传、WebSocket 推送"],
    ["感知执行层", "完成采集与动作执行", "传感器组、继电器、水泵/泵、风扇/加热/补光灯、OLED"],
  ],
  [1700, 2600, 4772],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));

// ── 4 架构关系说明 ──
children.push(heading("4. 架构关系说明", 1));
children.push(body("用户通过浏览器访问系统前端，前端通过 REST/WebSocket 接口向后端提交查看、控制与提问请求。后端服务根据权限与业务规则组织流程：感知数据由 ESP32 经 MQTT 上行，后端订阅后写入时序存储并推送前端；决策场景中，智能体综合传感器、视觉与历史数据生成 JSON 指令，经白名单校验后经 MQTT 下行到设备执行，执行状态回传闭环。"));
children.push(bullet("前端只负责交互展示，不直接操作数据库与设备。"));
children.push(bullet("后端统一承担权限校验、业务编排、数据写入与异常处理。"));
children.push(bullet("边缘端保证断网时本地规则独立运行，数据落盘不丢失。"));
children.push(bullet("智能决策层负责把多源数据转换为可执行指令与可溯源回答。"));
children.push(bullet("模型适配层将不同大模型接口封装为统一调用方式，屏蔽服务差异。"));
children.push(bullet("数据持久层保证传感器、设备、会话与配置数据可追溯。"));

// ── 5 核心模块设计 ──
children.push(heading("5. 核心模块设计", 1));

children.push(heading("5.1 感知采集模块", 2));
children.push(body("感知采集模块负责设备端数据获取与本地落盘。ESP32 按配置周期读取 BH1750 光照、DHT11 温湿度与土壤湿度传感器，将数据打包为 JSON 上行，同时写入 microSD 日志。断网时数据仅在本地累积，联网后按序补传，保证数据完整性。"));
children.push(bullet("传感器驱动：I2C/ADC 驱动封装，支持新增传感器即插即用。"));
children.push(bullet("数据打包：统一 JSON 结构与时间戳，字段名固定便于解析。"));
children.push(bullet("本地日志：CSV/JSON 行式记录，按日期滚动，容量可配置。"));

children.push(heading("5.2 设备控制模块", 2));
children.push(body("设备控制模块负责执行器管理与指令安全。ESP32 维护继电器、水泵、蠕动泵、风扇、加热片与补光灯的控制状态，支持手动、本地规则与云端指令三种触发方式。"));
children.push(bullet("指令白名单：云端指令仅允许预设动作与合法参数，非法指令直接丢弃。"));
children.push(bullet("本地规则优先：本地阈值规则判断先于云端指令执行，冲突时以本地安全为准。"));
children.push(bullet("状态回传：每次动作执行后回传设备状态与结果，供平台记录与审计。"));

children.push(heading("5.3 通信模块", 2));
children.push(body("通信模块统一设备与云端、前端与后端的消息通道。"));
children.push(bullet("设备上行：MQTT 主题上报传感器 JSON，断网重连自动续传。"));
children.push(bullet("设备下行：MQTT 主题下发控制指令，带会话号与确认机制。"));
children.push(bullet("图片上传：HTTP 接口上传拍摄图片，附带时间、角度与设备号元信息。"));
children.push(bullet("前端推送：WebSocket 实时推送时序数据、告警与执行结果。"));

children.push(heading("5.4 视觉检测模块", 2));
children.push(body("视觉检测模块以独立 Python 服务运行，接收 Node.js 编排的检测请求，返回结构化结果。"));
children.push(bullet("病害检测：YOLOv8 在公开数据集预训练基础上用自采数据微调，输出类别与置信度。"));
children.push(bullet("生长分析：检测叶片、果实等目标，统计数量与面积等表型指标。"));
children.push(bullet("服务接口：HTTP/JSON 请求响应，支持批量图片与超时重试。"));
children.push(bullet("部署策略：初期云端推理，算力允许后再迁移边缘端轻量模型。"));

children.push(heading("5.5 智能体决策模块", 2));
children.push(body("智能体决策模块是系统智能化的核心，负责把多源数据转换为可执行动作。"));
children.push(bullet("输入组织：聚合传感器最新值、视觉检测结果、历史趋势与用户指令。"));
children.push(bullet("决策生成：大模型基于 RAG 检索的真实知识生成方案与 JSON 设备指令。"));
children.push(bullet("安全校验：指令经白名单、数值边界与本地规则复核后才允许下发。"));
children.push(bullet("解释记录：每次决策保存推理依据与指令解释，供审计与追溯。"));

children.push(heading("5.6 RAG 问答模块", 2));
children.push(body("RAG 问答模块面向农技知识查询，提供基于知识库的溯源问答能力。"));
children.push(bullet("知识入库：种植手册、病虫害图谱、用药规范等文档经解析、清洗、切分后向量化。"));
children.push(bullet("检索增强：问题向量化后在知识库召回相关片段，按相关性排序与截断。"));
children.push(bullet("生成约束：将召回片段作为上下文约束大模型生成，回答附来源标注。"));
children.push(bullet("会话管理：历史问答按会话持久化，支持连续提问与记录回查。"));

children.push(heading("5.7 数据中台与展示模块", 2));
children.push(body("数据中台负责数据汇聚、存储与可视化，是平台的数据底座。"));
children.push(bullet("数据接入：MQTT 订阅与 API 写入统一入时序存储。"));
children.push(bullet("统计查询：提供小时/日/周维度的聚合接口，供大屏与报表使用。"));
children.push(bullet("展示界面：Vue + ECharts 呈现实时曲线、设备状态、告警列表与问答记录。"));
children.push(bullet("数字档案：按批次汇总传感器与视觉数据，自动生成阶段性生长周报。"));

// ── 6 智能决策链路 ──
children.push(heading("6. 智能决策链路", 1));
children.push(heading("6.1 感知—决策—执行闭环", 2));
children.push(numItem("ESP32 采集传感器数据并定时拍照，经 MQTT/HTTP 上行。"));
children.push(numItem("后端订阅数据，写入时序存储并推送前端展示。"));
children.push(numItem("视觉服务对图片执行病害检测与生长分析，结果入事件队列。"));
children.push(numItem("智能体聚合传感器、视觉与历史数据，生成方案与 JSON 设备指令。"));
children.push(numItem("指令经白名单与本地规则复核后，经 MQTT 下发 ESP32。"));
children.push(numItem("ESP32 执行动作并回传状态，平台记录审计日志。"));
children.push(numItem("执行结果作为后续决策依据，形成持续闭环。"));

children.push(heading("6.2 RAG 问答链路", 2));
children.push(numItem("用户输入问题。"));
children.push(numItem("系统根据当前工作空间确定可检索知识范围。"));
children.push(numItem("系统将问题转换为向量表示。"));
children.push(numItem("系统在向量索引中召回相关知识片段。"));
children.push(numItem("系统对候选片段排序、截断并拼接上下文。"));
children.push(numItem("系统将上下文、问题与提示词发送给模型服务。"));
children.push(numItem("模型生成回答，系统整理引用依据并返回前端。"));
children.push(numItem("系统保存本次问题、回答、上下文与时间信息。"));

// ── 7 数据存储设计 ──
children.push(heading("7. 数据存储设计", 1));
children.push(table(
  ["数据类别", "存储方式", "主要内容"],
  [
    ["结构化业务数据", "MySQL / SQLite", "用户、设备、传感器数据、控制日志、问答会话、系统配置"],
    ["视觉与图片数据", "文件存储目录", "上传图片、检测结果 JSON、生长档案附件"],
    ["设备本地日志", "microSD 文件", "断网期间的传感器与事件记录，联网后补传"],
    ["知识库索引", "向量索引（RAGFlow/Dify 或自建）", "知识片段向量、元信息与检索数据"],
    ["运行配置数据", "配置文件", "模型接口、MQTT 主题、采集周期、规则阈值"],
  ],
  [2200, 2800, 4072],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT]
));
children.push(spacer());
children.push(body("关系型数据保存业务状态，文件目录保存图片与日志，向量索引支撑语义检索，三者共同构成系统数据底座。"));

// ── 8 接口设计 ──
children.push(heading("8. 接口设计", 1));
children.push(body("系统接口以 REST 风格组织，遵循统一响应结构、权限前置校验、错误信息可读、敏感字段不外泄的原则。"));
children.push(table(
  ["接口域", "典型接口能力", "说明"],
  [
    ["认证域", "登录、登出、登录态校验", "用户身份确认与会话管理"],
    ["设备域", "设备注册、状态查询、指令下发", "设备接入与控制"],
    ["数据域", "传感器数据查询、聚合统计", "实时与历史数据访问"],
    ["视觉域", "图片上传、检测请求、结果查询", "病害与生长分析服务"],
    ["问答域", "提交问题、获取回答、查看引用", "核心智能问答能力"],
    ["会话域", "会话列表、历史详情、删除记录", "问答与操作记录追溯"],
    ["配置域", "模型参数、采集周期、规则阈值", "系统运行管理"],
  ],
  [1600, 3300, 4172],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));

// ── 9 安全与容错设计 ──
children.push(heading("9. 安全与容错设计", 1));
children.push(bullet("本地优先：断网时本地阈值规则独立运行，平台不可达不中断基础控制。"));
children.push(bullet("指令白名单：云端指令仅允许预设动作与合法参数，非法指令丢弃并告警。"));
children.push(bullet("权限控制：按角色区分查看、控制与管理权限，关键动作可设人工确认。"));
children.push(bullet("数据容错：microSD 本地日志保证断网数据零丢失，联网后自动补传。"));
children.push(bullet("模型降级：模型服务不可用时回退到规则引擎与知识库检索，保证基本可用。"));
children.push(bullet("运行审计：指令、告警与问答均记录审计日志，可回查可追溯。"));

// ── 10 参考开源资源与实现路径 ──
children.push(heading("10. 参考开源资源与实现路径", 1));
children.push(heading("10.1 参考开源资源", 2));
children.push(body("系统核心链路所依赖的开源资源已完成逐项核验（2026-08-12，GitHub REST API 核验存在性、star 数、最近推送与归档状态），详见表 10-1。"));
children.push(caption("表 10-1　参考开源资源（2026-08-12 核验）"));
children.push(table(
  ["开源资源", "用途", "Star", "最近更新", "许可"],
  [
    ["[arduino-esp32](https://github.com/espressif/arduino-esp32)", "ESP32 Arduino 核心（固件开发）", "17,220", "2026-08-12", "LGPL-2.1"],
    ["[esp-idf](https://github.com/espressif/esp-idf)", "ESP32 官方 SDK（ESP-IDF 开发）", "18,754", "2026-08-11", "Apache-2.0"],
    ["[PubSubClient](https://github.com/knolleary/PubSubClient)", "ESP32 MQTT 客户端库", "4,014", "2026-06-10", "MIT"],
    ["[Express](https://github.com/expressjs/express)", "Node.js Web 框架", "69,350", "2026-08-01", "MIT"],
    ["[MQTT.js](https://github.com/mqttjs/MQTT.js)", "MQTT 客户端库", "9,103", "2026-07-20", "—"],
    ["[ws](https://github.com/websockets/ws)", "WebSocket 库", "22,791", "2026-08-06", "MIT"],
    ["[EMQX](https://github.com/emqx/emqx)", "MQTT 消息服务器", "16,607", "2026-08-11", "—"],
    ["[Vue 3](https://github.com/vuejs/core)", "前端框架", "54,205", "2026-08-12", "MIT"],
    ["[Apache ECharts](https://github.com/apache/echarts)", "数据可视化", "67,049", "2026-08-04", "Apache-2.0"],
    ["[Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)", "目标检测模型框架", "60,531", "2026-08-12", "AGPL-3.0"],
    ["[OpenCV](https://github.com/opencv/opencv)", "图像处理", "90,382", "2026-08-11", "Apache-2.0"],
    ["[PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset)", "植物病害数据集", "944", "2026-02-05", "—"],
    ["[RAGFlow](https://github.com/infiniflow/ragflow)", "RAG 引擎", "87,301", "2026-08-12", "Apache-2.0"],
    ["[Dify](https://github.com/langgenius/dify)", "RAG/Agent 应用平台", "152,137", "2026-08-12", "—"],
    ["[MySQL](https://github.com/mysql/mysql-server)", "关系型数据库", "12,376", "2026-07-31", "—"],
    ["[Node.js](https://github.com/nodejs/node)", "JavaScript 运行时", "118,876", "2026-08-12", "—"],
  ],
  [1900, 3100, 1100, 1500, 1472],
  [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER]
));
children.push(body("说明：许可列来自 GitHub API 的 SPDX 标识，标「—」表示未返回标准标识，实际以仓库 License 文件为准；star 数与推送时间为核验当日快照；Ultralytics YOLOv8 为 AGPL-3.0，商业化部署前需评估开源合规要求。", { before: 80 }));

children.push(heading("10.2 实现路径", 2));
children.push(body("按模块划分的实现路径如表 10-2 所示，推荐顺序与项目里程碑 M0—M5 对应。"));
children.push(caption("表 10-2　实现路径（推荐顺序）"));
children.push(table(
  ["阶段", "实现要点", "依赖开源资源", "验收标准"],
  [
    ["M1 感知执行端", "ESP32 工程搭建（Arduino 或 ESP-IDF）；I2C/ADC 接入 BH1750、DHT11、土壤湿度；继电器/PWM 控制；microSD 日志；本地阈值规则", "arduino-esp32、esp-idf", "传感器读数正确，OLED 显示，日志落盘，断网规则自持"],
    ["M2 通信与数据通道", "本地部署 EMQX；ESP32 经 PubSubClient 上报/订阅；Node.js + Express 建 REST API；MQTT.js 订阅入库；ws 实时推送", "EMQX、PubSubClient、Express、MQTT.js、ws、MySQL", "MQTT 上下行闭环，数据入库，WebSocket 实时刷新"],
    ["M3 前端展示", "Vue 3 工程搭建；ECharts 实时曲线与统计；控制页、问答页、告警页", "Vue 3、Apache ECharts", "大屏实时曲线正确，控制指令可达"],
    ["M4 视觉检测", "OpenCV 图像预处理；Ultralytics YOLOv8 用 PlantVillage 公开集预训练 + 自采数据微调；HTTP/JSON 检测服务", "OpenCV、Ultralytics YOLOv8、PlantVillage-Dataset", "检测准确率 ≥ 85%，喷药动作联动"],
    ["M5 RAG 与智能体", "RAGFlow 或 Dify 建知识库（种植手册/病虫害图谱/用药规范）；文档切分向量化；检索增强问答；智能体编排输出 JSON 指令", "RAGFlow、Dify", "问答附来源可溯源，指令闭环执行，白名单拦截有效"],
    ["M6 端到端联调", "全链路联调；断网自持与补传；安全白名单复核；演示材料与文档", "全部上述资源", "感知→决策→执行闭环稳定运行，演示完整"],
  ],
  [1300, 4100, 2400, 1272],
  [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
));

children.push(heading("10.3 核验说明", 2));
children.push(bullet("核验时间：2026-08-12；核验方式：GitHub REST API（repos/{owner}/{repo}），逐项确认仓库存在、非归档，并获取 star 数、最近推送与许可证标识。"));
children.push(bullet("原拟收录的 PlantDoc（pratikkayal/PlantDoc）经核验返回 404（仓库已失效），未收录，改用 PlantVillage-Dataset。"));
children.push(bullet("star 数与推送时间为核验当日快照；许可标识「—」表示 GitHub API 未返回标准 SPDX 标识，实际以各仓库 License 文件为准。"));

const doc = new Document({
  title: "SmartFarmAgent 系统技术文档",
  subject: "系统技术文档（v3.0 配套）",
  description: "系统定位、技术栈、总体架构、核心模块设计、智能决策链路、数据存储与接口设计。",
  creator: "SmartFarmAgent Team",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24 },
        paragraph: { spacing: { line: 360, after: 0 } },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT_HEAD, size: 32, bold: false },
        paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT_HEAD, size: 28, bold: false },
        paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 24, bold: true },
        paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } },
        }],
      },
      {
        reference: "nums",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 300 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1417, bottom: 1417, left: 1417, right: 1417 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const names = ["TechDoc.docx", "TechDoc_v3.4.docx"];
  let written = null;
  for (const n of names) {
    try {
      fs.writeFileSync(path.join(__dirname, "..", "docs", n), buf);
      written = n;
      break;
    } catch (e) {
      console.log("write failed for " + n + ": " + e.code);
    }
  }
  if (written) {
    console.log(written + " written, bytes = " + buf.length);
  } else {
    console.error("ALL WRITES FAILED");
    process.exit(1);
  }
});
