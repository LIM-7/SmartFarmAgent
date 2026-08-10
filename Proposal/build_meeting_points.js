const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, HeadingLevel,
  LevelFormat, PageNumber, Footer, VerticalAlign
} = require("docx");

const FONT = { ascii: "Times New Roman", eastAsia: "SimSun", hAnsi: "Times New Roman", cs: "Times New Roman" };
const FONT_HEAD = { ascii: "Times New Roman", eastAsia: "SimHei", hAnsi: "Times New Roman", cs: "Times New Roman" };

const body = (text, opts = {}) =>
  new Paragraph({
    children: [new TextRun({ text, font: FONT, size: opts.size || 24, color: "000000" })],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, before: 0, after: 0 },
    indent: opts.indent || { firstLineChars: 200 },
  });

const bullet = (text) =>
  new Paragraph({
    children: [new TextRun({ text, font: FONT, size: 24, color: "000000" })],
    numbering: { reference: "bullets", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 0 },
  });

const numItem = (text) =>
  new Paragraph({
    children: [new TextRun({ text, font: FONT, size: 24, color: "000000" })],
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
        children: [new TextRun({ text, font: isHead ? FONT_HEAD : FONT, size: 21, bold: false })],
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
  children: [new TextRun({ text: "SmartFarmAgent 导师汇报与参赛准备要点", font: FONT_HEAD, size: 40, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "2026-08-10 现场汇报  |  配套方案 v2.0", font: FONT, size: 22 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 80 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));

children.push(heading("一、汇报结构（建议 5 分钟）", 1));
children.push(numItem("一句话定位：以 ESP32 单芯片为感知执行端、Node.js/Vue 为平台、云端大模型智能体为决策大脑，实现“感知 → 决策 → 执行”全闭环的智慧农业系统。"));
children.push(numItem("为什么做：农业农村部 2026 智慧农业创新大赛六大赛道集中在智能体、IoT、机器人方向，强调感知、决策、执行一体化；行业痛点（人工巡检、病害滞后、水肥浪费）与企业级平台重软件集成、大模型停在问答层的问题仍待解决。"));
children.push(numItem("怎么做：六层架构（ESP32 感知执行 → Wi-Fi/MQTT 通信 → Node.js 云平台 → 智能决策 → Vue 展示），智能体输出 JSON 设备指令，本地规则优先兜底。"));
children.push(numItem("做到哪：已学 GPIO、ADC、I2C、SPI、串口、PWM，可直接迁移到 ESP32；方案 v2.0 完成技术栈重构（STM32/ESP8266/LabVIEW/Node-RED → ESP32 + Node.js + Vue）。"));
children.push(numItem("下一步：启动 M1 ESP32 感知-控制闭环（第 3—6 周），同步搭建 Node.js、Vue、YOLO 环境。"));

children.push(heading("二、电梯版话术（30 秒）", 1));
children.push(body("面向 2026 智慧农业创新大赛的智能体、IoT 方向，本项目用低成本硬件原型实现“感知—决策—执行”闭环：ESP32 单芯片采集土壤、光照、温湿度并定时拍照，通过 Wi-Fi/MQTT 上云；Node.js 后端汇聚存储与智能体编排，Vue 大屏实时展示与控制；云端智能体综合判断后下发设备指令，本地规则永远优先兜底。"));

children.push(heading("三、导师可能问的问题与应对", 1));
children.push(table(
  ["问题", "应对"],
  [
    ["和市面企业级智慧农业平台有什么区别？", "企业平台重软件集成、依赖专业团队；本项目做低成本硬件闭环原型，验证“智能决策→设备执行”这一最难落地的环节，硬件成本低、可复制"],
    ["为什么从 STM32 换成 ESP32？", "ESP32 单芯片集成 Wi-Fi、摄像头与 I/O 控制，去掉串口网关与 ESP8266 中转，链路更短、成本更低、可复制性更强；原有 I2C/SPI/串口/PWM 知识可直接迁移"],
    ["为什么选 Node.js + Vue？", "与数据上云、API、WebSocket 实时链路天然契合；前后端统一 JavaScript 技术栈，学习与维护成本低；Express/mqtt.js/Vue/ECharts 生态成熟，全部开源免费"],
    ["为什么用大模型决策，阈值规则不够吗？", "阈值只能处理单因子场景；智能体综合多传感器、视觉和历史数据，输出可解释指令，还能承担农技问答；本地规则仍优先兜底"],
    ["视觉识别效果怎么保证？", "PlantDoc、PlantVillage 公开数据集预训练加自采微调，范围先缩到 3—5 类常见病害；初期云端推理，ESP32 只拍照上传"],
    ["时间不够，怎么保证进度？", "主线 M1—M2 必保（本地闭环加上云）；M3、M4 有明确降级方案（合并施肥、给药，生长分析降级为拍照加周报）"],
    ["预算和器件？", "硬件清单精简为单 ESP32-CAM 主控加传感器与执行器，多数已有，总成本更低；软件全部开源免费"],
    ["相对企业级平台，创新点在哪？", "全链路自研、单芯片低成本闭环、边缘-云协同、断网兜底；企业方案偏平台集成，本项目偏硬件闭环实现"],
  ],
  [3400, 5672],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));

children.push(heading("四、需要和导师对齐的事项", 1));
children.push(bullet("项目边界：确认“最小闭环原型”的定位，不做全平台。"));
children.push(bullet("里程碑节奏：24 周是否与学期安排匹配（M1 在第 3—6 周）。"));
children.push(bullet("资源：实验室是否有可用的温室或场地，已有器件清单是否需要补充。"));
children.push(bullet("参赛定位：建议主攻「设施小番茄采摘机器人」赛道（场景与链路契合度最高），备选「智能农机作业控制」；按单一赛道包装时，把喷药、浇水执行器替换为采摘装置即可。"));

children.push(heading("五、汇报后立即启动", 1));
children.push(bullet("M1：ESP32 传感器采集 → OLED → 继电器 → MQTT → Node.js → Vue 控制页。"));
children.push(bullet("搭建 Node.js（Express + mqtt.js）+ Vue 3（Vite + ECharts）脚手架，本地 EMQX。"));
children.push(bullet("搭建 Python + YOLOv8 环境；梳理大赛报名与材料要求，确定主攻赛道与作品叙事。"));

const doc = new Document({
  title: "SmartFarmAgent 导师汇报与参赛准备要点",
  subject: "2026-08-10 现场汇报",
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
  fs.writeFileSync("Meeting_Points.docx", buf);
  console.log("Meeting_Points.docx written, bytes = " + buf.length);
});