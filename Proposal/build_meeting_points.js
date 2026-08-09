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
  children: [new TextRun({ text: "2026-08-10 现场汇报  |  配套方案 v1.7", font: FONT, size: 22 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 80 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));

children.push(heading("一、汇报结构（建议 5 分钟）", 1));
children.push(numItem("一句话定位：以 STM32 为感知执行端、云端大模型智能体为决策大脑，实现“感知 → 决策 → 执行”全闭环的智慧农业系统。"));
children.push(numItem("为什么做：农业农村部 2026 智慧农业创新大赛六大赛道集中在智能体、IoT、机器人方向，强调感知、决策、执行一体化；行业痛点（人工巡检、病害滞后、水肥浪费）与企业级平台重软件集成、大模型停在问答层的问题仍待解决。"));
children.push(numItem("怎么做：六层架构（感知执行 → 通信 → 边缘 → 云平台 → 智能决策 → 展示），智能体输出 JSON 设备指令，本地规则优先兜底。"));
children.push(numItem("做到哪：已有 SmartAgriculture 雏形（STM32 传感器、继电器、OLED、串口协议），已学 GPIO、ADC、I2C、SPI、DMA、串口；方案 v1.6 已按行业案例细化。"));
children.push(numItem("下一步：启动 M1 感知-控制闭环（第 3—6 周），同步搭建 Python、YOLO、Dify 环境。"));

children.push(heading("二、电梯版话术（30 秒）", 1));
children.push(body("面向 2026 智慧农业创新大赛的智能体、IoT 方向，本项目用低成本硬件原型实现“感知—决策—执行”闭环：STM32 采集土壤、光照、温湿度，ESP32-CAM 拍照做病害识别，云端智能体综合判断后下发设备指令，本地规则永远优先兜底。"));

children.push(heading("三、导师可能问的问题与应对", 1));
children.push(table(
  ["问题", "应对"],
  [
    ["和市面企业级智慧农业平台有什么区别？", "企业平台重软件集成、依赖专业团队；本项目做低成本硬件闭环原型，验证“智能决策→设备执行”这一最难落地的环节，硬件成本低、可复制"],
    ["为什么用大模型决策，阈值规则不够吗？", "阈值只能处理单因子场景；智能体综合多传感器、视觉和历史数据，输出可解释指令，还能承担农技问答；本地规则仍优先兜底"],
    ["视觉识别效果怎么保证？", "PlantDoc、PlantVillage 公开数据集预训练加自采微调，范围先缩到 3—5 类常见病害；初期云端推理，边缘只拍照"],
    ["时间不够，怎么保证进度？", "主线 M1—M2 必保（本地闭环加上云）；M3、M4 有明确降级方案（合并施肥、给药，生长分析降级为拍照加周报）"],
    ["预算和器件？", "硬件 15 项清单，多数已有，总成本低；软件全部开源免费"],
    ["相对企业级平台，创新点在哪？", "全链路自研、边缘-云协同、断网兜底、低成本可复制；企业方案偏平台集成，本项目偏硬件闭环实现"],
  ],
  [3400, 5672],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));

children.push(heading("四、需要和导师对齐的事项", 1));
children.push(bullet("项目边界：确认“最小闭环原型”的定位，不做全平台。"));
children.push(bullet("里程碑节奏：24 周是否与学期安排匹配（M1 在第 3—6 周）。"));
children.push(bullet("资源：实验室是否有可用的温室或场地，已有器件清单是否需要补充。"));
children.push(bullet("参赛定位：是否按智慧农业创新大赛方向包装作品（闭环能力原型，还是按单一赛道做成具体作品）。"));

children.push(heading("五、汇报后立即启动", 1));
children.push(bullet("M1：整理 SmartAgriculture 代码，跑通 传感器采集 → OLED → 继电器 → 串口帧协议 → LabVIEW。"));
children.push(bullet("搭建 Python + YOLOv8 + Dify 环境，注册 EMQX、OneNET。"));
children.push(bullet("学完 I2C，修复 BH1750 开漏问题；SPI 接入 W25Q64。"));
children.push(bullet("梳理大赛报名与材料要求（报名表、说明书、演示视频），确定主攻赛道与作品叙事。"));

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