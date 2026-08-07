const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, HeadingLevel,
  LevelFormat, PageNumber, Footer, VerticalAlign, ExternalHyperlink
} = require("docx");

const FONT = { ascii: "Times New Roman", eastAsia: "SimSun", hAnsi: "Times New Roman", cs: "Times New Roman" };
const FONT_HEAD = { ascii: "Times New Roman", eastAsia: "SimHei", hAnsi: "Times New Roman", cs: "Times New Roman" };
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
      return new TextRun({ text: seg.slice(1, -1), font: FONT, size: base.size ? base.size - 2 : 20, color: "000000" });
    }
    return new TextRun({ text: seg, font: FONT, size: base.size || 24, color: "000000" });
  });
}

const body = (text, opts = {}) =>
  new Paragraph({
    children: runs(text, opts),
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, before: 0, after: 0 },
    indent: opts.indent || { firstLine: 480 },
  });

const bullet = (text) =>
  new Paragraph({
    children: runs(text),
    numbering: { reference: "bullets", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 0 },
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
    1: { size: 32, bold: false, font: FONT_HEAD },
    2: { size: 28, bold: false, font: FONT_HEAD },
    3: { size: 24, bold: true, font: FONT },
  };
  const m = map[level] || map[1];
  return new Paragraph({
    children: [new TextRun({ text, font: m.font, size: m.size, bold: m.bold })],
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 90, line: 360 },
    keepNext: true,
  });
}

function table(headers, rows, widths, aligns) {
  const mkCell = (text, w, i, isHead) =>
    new TableCell({
      children: [new Paragraph({
        children: isHead ? [new TextRun({ text, font: FONT_HEAD, size: 21, bold: false })] : runs(text, { size: 21 }),
        spacing: { line: 240, after: 0 },
        alignment: isHead ? AlignmentType.CENTER : aligns[i],
      })],
      width: { size: w, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      borders: isHead ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 0 } } : undefined,
      margins: { top: 20, bottom: 20, left: 80, right: 80 },
    });
  const bodyRows = rows.map((r) => new TableRow({ children: r.map((c, i) => mkCell(c, widths[i], i, false)) }));
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

children.push(new Paragraph({
  children: [new TextRun({ text: "SmartFarmAgent 智慧农业智能体系统", font: FONT_HEAD, size: 44, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "项目方案", font: FONT_HEAD, size: 32, bold: false })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 80 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));

// 1 背景与痛点
children.push(heading("1. 项目背景与痛点", 1));
children.push(bullet("传统大棚管理依赖人工巡检与经验调控，存在缺水/涝害、病害发现滞后、水肥浪费等问题。"));
children.push(bullet("市面“智慧农业”多为阈值规则控制，无真正的智能决策；大模型应用停留在“知识问答”层，没有闭环到设备执行。"));
children.push(bullet("2025—2026 年竞赛集中在「智能体 / IoT + 大模型」方向；农业开源大模型与 RAG 框架已成熟可用，硬件成本低，整条链路可自研。"));

// 2 系统总体架构
children.push(heading("2. 系统总体架构", 1));
children.push(table(
  ["层级", "名称", "组成与职责", "关键技术"],
  [
    ["L6", "展示层", "微信小程序 / H5 大屏 / LabVIEW 上位机", "前端、上位机"],
    ["L5", "智能决策层", "大模型智能体（LLM+RAG）→ JSON 设备指令（核心创新）；视觉服务（YOLO 病害/生长分析）", "LLM、RAG、视觉"],
    ["L4", "云端平台层", "MQTT Broker（EMQX/OneNET）→ 时序存储 → Node-RED 可视化", "MQTT、时序存储"],
    ["L3", "边缘层", "ESP32-CAM 拍照/轻量推理；断网规则兜底（本地优先）", "边缘计算、轻量推理"],
    ["L2", "通信层", "USART 文本帧协议 + ESP8266 MQTT", "串口、MQTT"],
    ["L1", "感知执行层", "STM32F103C8T6 + 传感器 + 继电器/泵/灯/喷药", "GPIO、ADC、I2C、SPI"],
  ],
  [800, 1800, 4600, 1872],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER]
));
children.push(spacer());
children.push(body("**安全原则：**本地阈值规则永远优先于云端指令（断网自持、误操作兜底），云端智能体指令走白名单。"));

// 3 功能模块
children.push(heading("3. 功能模块", 1));
children.push(table(
  ["功能", "实现方案", "难度", "可行性依据"],
  [
    ["自动浇水/施肥", "土壤湿度+光照综合判断；继电器驱动水泵/蠕动泵", "中", "传感器与继电器已有；开源整机项目已验证"],
    ["环境自动调控", "DHT11/BH1750 → 风扇/加热/补光灯；PWM 调光（PID 可选）", "中", "传感器已有；PWM/PID 为已学内容"],
    ["病虫害检测+给药", "摄像头定拍 → YOLOv8（先云后边）→ 置信度达标 → 喷药泵", "高", "PlantDoc/PlantVillage 公开数据集 + 多个 ESP32-CAM/YOLO 先例"],
    ["生长状况分析", "定距定时拍照 → 叶片数/株高/颜色统计 → 大模型生成周报", "高", "视觉测量工具包开源可用"],
    ["智能体决策", "传感器+检测+历史 → 大模型（司农/DeepSeek）→ 设备指令+解释", "高", "Dify HTTP 节点可调外部 API；农业大模型已开源"],
    ["数据中台/展示", "MQTT 上行 → 时序存储 → 小程序/H5；W25Q64 本地日志", "中", "EMQX/Node-RED 成熟；农业岛平台可二开"],
  ],
  [2200, 3000, 700, 3172],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.LEFT]
));

// 4 数据链路
children.push(heading("4. 数据链路", 1));
children.push(table(
  ["环节", "内容", "输出"],
  [
    ["感知", "BH1750/DHT11/土壤 → STM32 采集打包（文本帧）；ESP32-CAM 拍照上传（HTTP/MQTT）", "数据帧 / 图片"],
    ["通信", "USART 帧 + ESP8266 MQTT；本地接 LabVIEW 调试 + W25Q64 日志", "上行数据"],
    ["云端", "MQTT Broker（EMQX/OneNET）→ 时序存储 + Node-RED 可视化", "时序数据"],
    ["AI", "视觉服务（YOLO 病害检测/生长分析）→ 结果入事件队列；智能体（LLM+RAG）综合传感器+视觉+历史", "决策 JSON"],
    ["执行", "MQTT 下行指令 → 网关转 HTTP/串口 → STM32 解析 → 继电器/泵/灯/喷药", "设备动作"],
    ["闭环", "执行状态回传 → 数据入库 → 小程序/大屏展示 + 智能体下次决策依据", "反馈数据"],
  ],
  [1400, 5900, 1772],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER]
));

// 5 技术可行性
children.push(heading("5. 技术可行性", 1));
children.push(numItem("硬件与嵌入式：全部器件为 STM32 生态常用模块，与现有学习内容一一对应，参考整机项目已跑通相同硬件组合。"));
children.push(numItem("视觉检测：PlantDoc（427 星）/ PlantVillage（5 万+ 图、38 类）公开数据集可用，YOLOv8 框架成熟（Ultralytics 60k 星），已有温室病害检测与 ESP32-CAM 实时检测先例。"));
children.push(numItem("智能体链路：司农（国内首个农业开源大语言模型，8B/32B）与 AgriAgent（125 星）均已开源；Dify 官方确认 HTTP 节点可调外部 API，「智能体 → HTTP → MQTT 网关 → 设备」路径可行。"));
children.push(numItem("云平台：EMQX（16.5k 星）、Node-RED（23.5k 星）、农业岛（347 星）均已核验；OneNET 免费可用。"));
children.push(numItem("已知约束：ESP32-CAM 算力有限，初期视觉推理走云端；司农 32B 本地部署显存要求高，初期用 8B 或 DeepSeek API。"));

// 6 里程碑计划
children.push(heading("6. 里程碑计划", 1));
children.push(table(
  ["阶段", "时间", "内容", "验收点"],
  [
    ["M0 开题", "第 1—2 周", "链路定稿、软件环境搭建（Python/Dify/YOLO）", "开题通过"],
    ["M1 感知-控制闭环", "第 3—6 周", "传感器采集→OLED→继电器→串口帧协议→LabVIEW 上位机", "本地闭环运行，数据帧正确，远程手动可控"],
    ["M2 上云+日志", "第 7—10 周", "ESP8266 MQTT→EMQX/OneNET→Node-RED 可视化；W25Q64 日志", "云平台实时曲线、断网日志完整可补传"],
    ["M3 视觉检测", "第 11—18 周", "公开集+自采数据训练 YOLO（先 5 类常见病）→云端推理→触发喷药", "检测准确率 ≥85%，喷药动作联动"],
    ["M4 智能体决策", "第 19—23 周", "Dify 搭智能体+RAG 知识库→综合决策→指令闭环→小程序", "自然语言指令自动执行，误操作有兜底"],
    ["M5 作品化", "第 24 周", "外壳/文档/演示视频/说明书/答辩材料", "达到参赛交付标准"],
  ],
  [1500, 1200, 4100, 2272],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));

// 7 创新点与预期成果
children.push(heading("7. 创新点与预期成果", 1));
children.push(numItem("智能体闭环决策：大模型直接输出设备动作指令，不只停留在问答层。"));
children.push(numItem("边缘-云协同：断网时本地规则独立运行，联网后云端智能体接管；本地规则永远优先，误操作有兜底。"));
children.push(numItem("低成本：硬件总成本低，便于推广。"));
children.push(numItem("全周期数字档案：从种子到收获持续记录传感器与视觉数据，形成可追溯的生长档案。"));

// 8 风险与应对
children.push(heading("8. 风险与应对", 1));
children.push(table(
  ["风险", "应对"],
  [
    ["视觉识别数据不足/效果差", "公开数据集预训练 + 自采微调；范围先缩到 3—5 类常见病害"],
    ["ESP32-CAM 边缘算力不足", "初期视觉推理放云端，边缘只拍照上传；后期再试轻量模型"],
    ["智能体误操作", "本地规则优先、指令白名单、关键动作人工确认模式"],
    ["时间不足", "按里程碑裁剪：合并施肥/给药、生长分析降级为拍照+周报"],
  ],
  [3200, 5872],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));

// 附：主要开源参考
children.push(heading("附：主要开源参考", 1));
children.push(bullet("[Dify](https://github.com/langgenius/dify)（智能体/工作流平台，151k 星）"));
children.push(bullet("[RAGFlow](https://github.com/infiniflow/ragflow)（RAG 引擎，87k 星）"));
children.push(bullet("[Ultralytics](https://github.com/ultralytics/ultralytics)（YOLO 框架，60k 星）"));
children.push(bullet("[PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset)（病害数据集，427 星）"));
children.push(bullet("PlantVillage（[Kaggle](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)，5 万+ 图、38 类）"));
children.push(bullet("司农（南京农业大学农业大语言模型，8B/32B）"));
children.push(bullet("[AgriAgent](https://github.com/zhiweihu1103/AgriAgent)（农业多模态大模型，125 星）"));
children.push(bullet("[EMQX](https://github.com/emqx/emqx)（16.5k 星）/ [Node-RED](https://github.com/node-red/node-red)（23.5k 星）（MQTT Broker 与可视化工具）"));

const doc = new Document({
  title: "SmartFarmAgent 智慧农业智能体系统——项目方案",
  subject: "项目方案（导师提交版，v1.5.1）",
  description: "导师提交精简版：背景、架构、功能、数据链路、可行性、里程碑、创新点、风险与主要开源参考。",
  creator: "LIM",
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
  fs.writeFileSync("Proposal.docx", buf);
  console.log("Proposal.docx written, bytes = " + buf.length);
});
