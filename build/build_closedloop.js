const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, HeadingLevel,
  LevelFormat, PageNumber, Footer, VerticalAlign
} = require("docx");

const FONT = { ascii: "Times New Roman", eastAsia: "SimSun", hAnsi: "Times New Roman", cs: "Times New Roman" };
const FONT_HEAD = { ascii: "Times New Roman", eastAsia: "SimHei", hAnsi: "Times New Roman", cs: "Times New Roman" };
const FONT_MONO = { ascii: "Consolas", eastAsia: "SimSun", hAnsi: "Consolas", cs: "Consolas" };

function runs(text, base = {}) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.filter((s) => s).map((seg) => {
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

const code = (text) =>
  new Paragraph({
    children: [new TextRun({ text, font: FONT_MONO, size: 18, color: "000000" })],
    spacing: { line: 240, after: 0 },
    indent: { left: 480 },
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
  children: [new TextRun({ text: "SmartFarmAgent 闭环系统设计方案（Web 版）", font: FONT_HEAD, size: 36, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 120 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));

// ── 1 背景与目标 ──
children.push(heading("1. 背景与目标", 1));
children.push(heading("1.1 项目现状", 2));
children.push(body("SmartFarmAgent 已按「感知—决策—执行」闭环完成总体设计（见 TechDoc）："));
children.push(bullet("边缘端：ESP32 / ESP32-CAM 单芯片，数据采集、拍照、本地规则、microSD 日志"));
children.push(bullet("平台：Node.js + Express + MQTT.js + WebSocket，MySQL / SQLite"));
children.push(bullet("前端：Vue 3 + ECharts"));
children.push(bullet("视觉：Python + OpenCV + YOLOv8（独立服务，Node.js 编排）"));
children.push(bullet("智能体：大模型（OpenAI 兼容接口）+ RAG 知识库"));
children.push(body("本方案版本信息见表 1-1。"));
children.push(caption("表 1-1\u3000文档版本信息"));
children.push(table(
  ["项目", "内容"],
  [
    ["版本", "v0.1"],
    ["日期", "2026-08-29"],
    ["状态", "初稿待评审"],
    ["关联文档", "TechDoc.md（系统技术文档 v3.4）、PROPOSAL.md（参赛作品说明书）"],
  ],
  [1800, 7272],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));
children.push(spacer());

children.push(heading("1.2 本方案目标", 2));
children.push(body("用户赴江苏叁拾叁智慧农业有限公司考察后，提出按如下完整业务闭环细化设计："));
children.push(body("数据采集 → 环境、虫情、苗情监测 → 评估意见 → 施肥方案 → 决策执行 → 反馈", { indent: { left: 480 } }));
children.push(body("UI 以网页（手机优先）为主，本方案在 TechDoc 架构基础上，补全四情监测、评估意见、施肥与灌溉处方、执行反馈四个业务环节的详细设计。"));

children.push(heading("1.3 借鉴来源", 2));
children.push(body("借鉴江苏叁拾叁智慧农业有限公司（官网 www.33iot.com）的以下理念："));
children.push(bullet("四情监测体系（墒情、虫情、苗情、灾情），多源感知统一入平台"));
children.push(bullet("「感知—分析—决策—执行」闭环（无人农场、草莓园等案例）"));
children.push(bullet("「一田一策」处方图、变量施肥、按需水肥"));
children.push(bullet("执行结果回写，数据全留痕，支撑模型迭代"));

// ── 2 总体架构 ──
children.push(heading("2. 总体架构", 1));
children.push(body("系统沿用 TechDoc 六层架构：展示层、智能决策层、云端平台层、通信层、边缘层与感知执行层，本方案重点细化智能决策层与数据层。各层职责如下："));
children.push(bullet("展示层：Vue 3 + ECharts + WebSocket，大屏看板与手机端四页"));
children.push(bullet("智能决策层：评估规则引擎、处方生成器、智能体编排（大模型 + RAG），输出评估意见、施肥灌溉方案与 JSON 指令（白名单校验）"));
children.push(bullet("云端平台层：Node.js + Express，提供 REST API、MQTT 网关与 WebSocket 推送"));
children.push(bullet("通信层：MQTT 设备上下行、HTTP 图片上传、WebSocket 前端推送"));
children.push(bullet("边缘层：ESP32 / ESP32-CAM 采集、拍照、本地规则与 microSD 日志"));
children.push(bullet("感知执行层：传感器组、摄像头、继电器、水泵、电磁阀、风扇、补光与水肥执行器"));

children.push(heading("2.1 上行数据流", 2));
children.push(bullet("ESP32 采集环境数据，经 MQTT 主题上报（JSON），Node.js 订阅后写入 MySQL"));
children.push(bullet("ESP32-CAM 定时拍照，经 HTTP 上传，视觉服务识别后写入虫情、苗情表"));

children.push(heading("2.2 下行控制流", 2));
children.push(bullet("Web UI 确认方案，智能决策层生成指令"));
children.push(bullet("指令经白名单校验后经 MQTT 下发"));
children.push(bullet("ESP32 本地复核后驱动执行器动作"));
children.push(bullet("执行状态回传，写控制日志并更新方案状态，形成反馈闭环"));

// ── 3 感知与四情监测设计 ──
children.push(heading("3. 感知与四情监测设计", 1));
children.push(heading("3.1 环境监测（墒情 + 小气象）", 2));
children.push(body("环境监测数据项见表 3-1。"));
children.push(caption("表 3-1\u3000环境监测数据"));
children.push(table(
  ["数据", "传感器", "接口", "采集周期建议"],
  [
    ["温度、湿度", "DHT11", "单总线", "60 s"],
    ["光照", "BH1750", "I2C（开漏需上拉）", "60 s"],
    ["土壤湿度", "土壤湿度模块", "ADC", "300 s"],
    ["雨量、风速（可选）", "气象传感器", "I2C / 脉冲", "300 s"],
  ],
  [2200, 2700, 2200, 1972],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER]
));
children.push(spacer());
children.push(body("上报采用统一 JSON 结构，字段名固定，包含设备标识、时间戳、温度、湿度、光照与土壤湿度六项，便于解析。"));

children.push(heading("3.2 虫情监测", 2));
children.push(bullet("ESP32-CAM 定时拍照（可配置 30～60 min），夜间 LED 补光"));
children.push(bullet("视觉服务 YOLOv8 识别害虫类别并计数，输出置信度"));
children.push(bullet("结果写入虫情记录表：类型、数量、图片、置信度、告警标记"));
children.push(bullet("单次计数超阈值时，评估层触发防治建议"));

children.push(heading("3.3 苗情监测", 2));
children.push(bullet("定时拍照 + 表型分析：绿度指数（颜色统计）、叶面积、株高估算（目标检测）"));
children.push(bullet("可选多光谱简化方案：红、近红外双通道估算 NDVI（低成本）"));
children.push(bullet("结果写入苗情记录表：绿度、叶面积、株高、生长阶段"));
children.push(bullet("绿度连续下降时，评估层提示养分、水分胁迫"));

children.push(heading("3.4 灾情（预留）", 2));
children.push(body("接入雨量、风速、极端温度等气象预警，触发告警进入评估层，本期可不实现。"));

// ── 4 评估意见设计 ──
children.push(heading("4. 评估意见设计", 1));
children.push(body("评估层输出结构化意见并写入评估意见表。输出结构包含评估类型（ENV、PEST、CROP）、等级（NORMAL、WARNING、ALARM）、摘要、建议与输入数据快照等字段。例如，摘要为「土壤偏干且连续 3 次低于阈值」，建议为「执行灌溉方案，水量 500 ml」。"));

children.push(heading("4.1 规则引擎（v1，先落地）", 2));
children.push(body("评估规则示例见表 4-1。"));
children.push(caption("表 4-1\u3000评估规则引擎（示例）"));
children.push(table(
  ["规则", "条件", "等级", "意见、建议"],
  [
    ["温度偏高", "温度大于 32℃ 且连续 3 次", "ALARM", "开启风扇、通风"],
    ["湿度偏高", "湿度大于 80%", "WARNING", "除湿"],
    ["光照不足", "光照小于 50 lx", "WARNING", "补光"],
    ["土壤偏干", "土壤湿度小于 25%", "ALARM", "灌溉"],
    ["闷热复合", "温度大于 30℃ 且湿度大于 75%", "WARNING", "通风防病"],
    ["虫情", "单次计数大于阈值", "WARNING", "针对性防治"],
    ["苗情", "绿度连续 3 次下降", "ALARM", "检查养分、水分"],
  ],
  [1700, 3200, 1300, 2872],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.LEFT]
));
children.push(spacer());
children.push(body("规则以 JSON 配置存储，平台可改，本地 ESP32 可同步阈值子集（断网自持）。"));

children.push(heading("4.2 大模型评估（v2，演进）", 2));
children.push(body("智能体聚合传感器最新值、视觉结果与历史趋势，结合 RAG 知识库生成诊断意见并附依据；模型不可用时降级到规则引擎（沿用 TechDoc 容错设计）。"));

// ── 5 施肥、灌溉方案设计 ──
children.push(heading("5. 施肥、灌溉方案设计", 1));
children.push(heading("5.1 方案结构", 2));
children.push(body("方案结构字段见表 5-1。"));
children.push(caption("表 5-1\u3000方案结构（prescription）"));
children.push(table(
  ["字段", "说明"],
  [
    ["crop_type、growth_stage", "作物与生长阶段"],
    ["plan_type", "FERT、IRRIGATE、PEST"],
    ["params", "JSON 参数：水量、N-P-K 比例、执行时长、目标设备"],
    ["status", "DRAFT → CONFIRMED → EXECUTING → DONE、FAILED、EXPIRED"],
  ],
  [3000, 6072],
  [AlignmentType.LEFT, AlignmentType.LEFT]
));
children.push(spacer());

children.push(heading("5.2 方案生成", 2));
children.push(bullet("v1 查表模型：作物 × 阶段 → 需水量、需肥量，再按墒情、光照修正系数"));
children.push(bullet("v2 智能体处方：大模型 + RAG 知识（种植手册、测土配方）生成「一田一策」处方，含推理依据"));
children.push(bullet("默认人工确认后才执行，可配置自动执行（仅限低风险动作）"));

children.push(heading("5.3 执行设备映射", 2));
children.push(body("方案类型与执行设备映射见表 5-2。"));
children.push(caption("表 5-2\u3000执行设备映射"));
children.push(table(
  ["方案类型", "执行设备", "执行参数"],
  [
    ["IRRIGATE", "水泵、电磁阀", "时长、流量"],
    ["FERT", "水泵 + 施肥罐、蠕动泵", "水量、肥液比例"],
    ["PEST", "喷雾泵（预留）", "时长、浓度"],
    ["ENV", "风扇、除湿、补光", "开关、PWM 档位"],
  ],
  [2000, 3200, 3872],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));
children.push(spacer());

// ── 6 决策执行与反馈闭环 ──
children.push(heading("6. 决策执行与反馈闭环", 1));
children.push(numItem("方案生成，人工确认（或自动）。"));
children.push(numItem("智能决策层输出 JSON 指令，包含动作、参数与会话号三个字段。"));
children.push(numItem("白名单校验（动作 + 参数边界），本地规则复核（冲突以本地安全为准）。"));
children.push(numItem("MQTT 下行，ESP32 执行，状态回传（带 session_id 确认）。"));
children.push(numItem("后端写控制日志，更新方案执行结果，并记录决策日志。"));
children.push(numItem("执行结果进入下次评估输入，形成持续闭环。"));

// ── 7 数据存储设计 ──
children.push(heading("7. 数据存储设计", 1));
children.push(heading("7.1 MySQL 业务表（v2 扩展）", 2));
children.push(body("保留 sensor_data、control_log、alarm_log、device_status 四张表，新增业务表见表 7-1。"));
children.push(caption("表 7-1\u3000新增业务表"));
children.push(table(
  ["表", "用途", "关键字段"],
  [
    ["pest_log", "虫情记录", "device_id、sample_time、pest_type、count、image_path、confidence、alarm_flag"],
    ["crop_growth_log", "苗情记录", "device_id、sample_time、green_index、leaf_area、height、growth_stage、image_path"],
    ["evaluation_log", "评估意见", "device_id、eval_time、type、level、summary、advice、snapshot(JSON)"],
    ["prescription", "施肥灌溉方案", "device_id、crop_type、growth_stage、plan_type、params(JSON)、status、exec_result"],
    ["decision_log", "决策审计", "presc_id、input_ref(JSON)、rule_version、output(JSON)、executed_at、feedback"],
  ],
  [2400, 2400, 4272],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT]
));
children.push(spacer());

children.push(heading("7.2 其他存储", 2));
children.push(bullet("时序数据：sensor_data（或 SQLite 时序备份）"));
children.push(bullet("图片与识别结果：文件目录 + 路径入库"));
children.push(bullet("知识库向量索引：RAGFlow、Dify（智能体方案演进用）"));

// ── 8 接口设计 ──
children.push(heading("8. 接口设计", 1));
children.push(body("系统接口以 REST 风格组织，统一响应结构、权限前置校验（沿用 TechDoc 约定），接口域划分见表 8-1。"));
children.push(caption("表 8-1\u3000接口域划分"));
children.push(table(
  ["接口域", "典型接口"],
  [
    ["设备域", "设备注册、状态查询、指令下发（MQTT）"],
    ["数据域", "最新数据、历史查询、聚合统计"],
    ["视觉域", "图片上传、检测请求、结果查询"],
    ["评估域", "评估意见列表（按等级、时间过滤）、详情"],
    ["方案域", "方案生成、列表、确认、驳回、执行"],
    ["实时推送", "WebSocket：时序数据、告警、执行结果"],
  ],
  [2200, 6872],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));
children.push(spacer());

// ── 9 前端页面设计 ──
children.push(heading("9. 前端页面设计（手机优先）", 1));
children.push(body("底部 Tab 四页，顶部标题栏显示设备在线状态（依据最近在线时间判断）。"));
children.push(heading("9.1 监控页", 2));
children.push(bullet("标题栏与设备在线状态"));
children.push(bullet("实时数据卡片：温度、湿度、光照、土壤"));
children.push(bullet("近 24 小时趋势图（ECharts 折线）"));
children.push(bullet("执行器状态行与快捷控制"));

children.push(heading("9.2 虫情苗情页", 2));
children.push(bullet("Tab 切换虫情、苗情"));
children.push(bullet("图片卡片流：时间 + 识别结果"));
children.push(bullet("种类、数量、置信度，绿度、长势等级"));
children.push(bullet("立即拍照按钮"));

children.push(heading("9.3 评估页", 2));
children.push(bullet("告警横幅（最新 ALARM）"));
children.push(bullet("评估意见卡片列表"));
children.push(bullet("等级色标：正常、预警、告警"));
children.push(bullet("类型、时间、摘要、建议，展开查看数据快照"));

children.push(heading("9.4 方案页", 2));
children.push(bullet("方案列表（状态徽标）：施肥方案、灌溉方案"));
children.push(bullet("方案详情：参数渲染 + 依据"));
children.push(bullet("确认执行、驳回（二次弹窗）"));
children.push(bullet("执行反馈：成功、失败 + 结果"));

children.push(heading("9.5 交互约定", 2));
children.push(bullet("每 5 秒自动刷新 + 下拉刷新"));
children.push(bullet("执行类操作二次确认"));
children.push(bullet("断线、离线提示"));

// ── 10 实施里程碑 ──
children.push(heading("10. 实施里程碑", 1));
children.push(body("实施里程碑与验收标准见表 10-1（与 TechDoc 的 M1—M6 对齐）。"));
children.push(caption("表 10-1\u3000实施里程碑"));
children.push(table(
  ["里程碑", "要点", "验收标准"],
  [
    ["M1 感知执行端", "ESP32 传感器接入、拍照、本地阈值、microSD 日志", "读数正确、断网规则自持"],
    ["M2 通信数据", "EMQX + MQTT 上下行、Node.js 入库、MySQL v2 建表", "数据入库、指令往返闭环"],
    ["M3 前端展示", "Vue 3 四页 + ECharts + WebSocket", "实时曲线、控制可达、手机适配"],
    ["M4 视觉检测", "虫情识别 + 苗情表型分析", "图片入库、识别结果展示"],
    ["M5 智能体方案", "规则评估 + 处方生成 + RAG 问答", "告警自动生成、方案可确认"],
    ["M6 端到端联调", "评估、方案、执行、反馈全链路", "闭环稳定运行、演示完整"],
  ],
  [1800, 4000, 3272],
  [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
));
children.push(spacer());

// ── 11 借鉴点对照表 ──
children.push(heading("11. 借鉴点对照表", 1));
children.push(body("江苏叁拾叁与 SmartFarmAgent 的借鉴对照见表 11-1。"));
children.push(caption("表 11-1\u3000借鉴点对照（叁拾叁 → SmartFarmAgent）"));
children.push(table(
  ["叁拾叁产品、理念", "SmartFarmAgent 落地"],
  [
    ["四情监测体系", "环境 + 虫情 + 苗情三情，灾情预留"],
    ["感知—分析—决策—执行", "采集、评估、方案、执行、反馈"],
    ["处方图、一田一策", "prescription 方案表 + 查表模型 → 智能体处方"],
    ["水肥一体化", "水泵 + 电磁阀 + 施肥罐定量执行"],
    ["新农人小能手 APP", "手机优先 Web UI（Vue 3）"],
    ["数据全留痕", "evaluation、prescription、decision 日志表"],
  ],
  [3000, 6072],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));
children.push(spacer());

// ── 12 风险与注意事项 ──
children.push(heading("12. 风险与注意事项", 1));
children.push(bullet("BH1750 开漏输出需外部上拉；DHT11 时序敏感，读取间隔不宜过密"));
children.push(bullet("ESP32 本地规则优先于云端指令，冲突以安全为准（TechDoc 已约定）"));
children.push(bullet("时间统一：ESP32 NTP、MySQL NOW()、前端 UTC+8"));
children.push(bullet("接口鉴权与指令白名单必须前置；局域网演示可加简单 token"));
children.push(bullet("摄像头夜间需补光 LED；图片存储定期清理"));
children.push(bullet("设备离线判断：最近在线时间超阈值时提示"));
children.push(bullet("公开仓库注意隐私脱敏：文档与代码不出现个人信息与内部规划"));

const doc = new Document({
  title: "SmartFarmAgent 闭环系统设计方案（Web 版）",
  subject: "闭环系统设计方案（v0.1）",
  description: "四情监测、评估意见、施肥灌溉处方、决策执行与反馈闭环的详细设计。",
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
  const names = ["ClosedLoop_Design.docx", "ClosedLoop_Design_v0.1.docx"];
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
