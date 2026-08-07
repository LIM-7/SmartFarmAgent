const fs = require("fs");
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
  // 解析 [label](url) 链接、**加粗**、`行内代码`
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

const checkbox = (text) =>
  new Paragraph({
    children: [new TextRun({ text: "□  ", font: FONT, size: 24 }), ...runs(text)],
    indent: { left: 480 },
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

function codeBlock(lines) {
  return lines.map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line || " ", font: FONT_MONO, size: 20 })],
        spacing: { line: 240, after: 0 },
        indent: { left: 240 },
      })
  );
}

function table(headers, rows, widths, aligns) {
  const n = widths.length;
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

// ── 标题块（仅题目，备注见 VERSIONS.md）──
children.push(new Paragraph({
  children: [new TextRun({ text: "SmartFarmAgent 智慧农业智能体系统", font: FONT_HEAD, size: 44, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 80 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "项目开题链路", font: FONT_HEAD, size: 32, bold: false })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));

// ── 1 项目背景与痛点 ──
children.push(heading("1. 项目背景与痛点", 1));
children.push(bullet("传统大棚管理依赖人工巡检与经验调控：浇水靠手感、病害靠肉眼、生长判断靠主观，存在缺水/涝害、病害发现滞后、水肥浪费等问题。"));
children.push(bullet("市面“智慧农业”多为阈值规则控制（湿度低于 X 就浇水），无真正的智能决策；大模型应用停留在“知识问答”层，没有闭环到设备执行。"));
children.push(bullet("机会：2025—2026 年竞赛集中在「智能体 / IoT + 大模型」方向；司农、稷丰等农业开源大模型与 RAGFlow、Dify 等 RAG 框架已成熟可用，硬件成本低，整条链路可以自研。"));

// ── 2 系统总体架构（六层，分层表）──
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

// ── 3 功能模块拆解 ──
children.push(heading("3. 功能模块拆解", 1));
children.push(table(
  ["#", "功能", "实现方案", "难度", "可行性依据", "对应学习点"],
  [
    ["1", "自动浇水/施肥", "土壤湿度+光照综合判断；继电器驱动水泵/蠕动泵", "中", "已有土壤传感器+继电器；开源整机项目已验证", "GPIO、ADC、串口协议"],
    ["2", "环境自动调控", "DHT11/BH1750 → 风扇/加热/补光灯；PWM 调光（PID 可选）", "中", "传感器已有；PWM/PID 为已学或进行中内容", "定时器 PWM、PID"],
    ["3", "病虫害检测+给药", "摄像头定拍 → YOLOv8（先云后边）→ 置信度达标 → 喷药泵", "高", "PlantDoc/PlantVillage 公开数据集 + 多个 ESP32-CAM/YOLO 先例", "Python、YOLO、视觉"],
    ["4", "生长状况分析", "定距定时拍照 → 叶片数/株高/颜色统计 → 大模型生成周报", "高", "视觉测量工具包开源可用", "视觉、LLM API"],
    ["5", "智能体决策", "传感器+检测+历史 → 大模型（司农/DeepSeek）→ 设备指令+解释", "高", "Dify 官方 HTTP 节点可调外部 API；农业大模型已开源", "RAG、Agent"],
    ["6", "数据中台/展示", "MQTT 上行 → 时序存储 → 小程序/H5；W25Q64 本地日志", "中", "EMQX/Node-RED 成熟；农业岛平台可二开", "SPI、云平台"],
  ],
  [450, 1100, 2750, 620, 2652, 1500],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER]
));

// ── 4 完整数据链路 ──
children.push(heading("4. 完整数据链路（感知 → 决策 → 执行）", 1));
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

// ── 5 可行性核验结论 ──
children.push(heading("5. 可行性核验结论", 1));
children.push(numItem("**硬件与嵌入式链路：**全部器件为 STM32 生态常用模块，与现有学习内容一一对应；参考整机项目（stm32-flower-greenhouse、smart-orchard-irrigation-system 等）已跑通相同硬件组合。"));
children.push(numItem("**视觉检测链路：**[PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset) 数据集有官方 GitHub 仓库（427 星，CODS-COMAD 2020 论文配套）；PlantVillage 数据集在 Kaggle 公开（5 万+ 图、38 类）；YOLOv8 框架成熟（Ultralytics 60k 星），已有温室作物病害检测、ESP32-CAM 实时检测先例。"));
children.push(numItem("**大模型/智能体链路：**司农（南京农业大学，国内首个农业开源大语言模型，8B/32B，魔搭+GitHub 开源）与稷丰 [AgriAgent](https://github.com/zhiweihu1103/AgriAgent)（125 星，中文农业多模态）均已核验；Dify 官方文档确认 HTTP Request 节点可调用外部 API，因此「智能体 → HTTP → MQTT 网关 → 设备」路径可行。"));
children.push(numItem("**云平台链路：**[EMQX](https://github.com/emqx/emqx)（16.5k 星）、Node-RED（23.5k 星）、农业岛 智慧农业平台（347 星，Java+Vue+Uni-app，支持 MQTT/EMQX）均已核验；OneNET 为中国移动免费物联网平台，教程量大。"));
children.push(numItem("**已知约束（写进风险）：**ESP32-CAM 算力有限，边缘推理只跑轻量模型，初期视觉走云端；司农 32B 本地部署需要较高显存，初期用 8B 或 DeepSeek API 替代。"));

// ── 6 开源项目清单 ──
children.push(heading("6. 开源项目清单", 1));
children.push(body("核验方式：2026-08-07 通过 GitHub API 查询仓库全名、star 数、最近推送、是否归档；模型与数据集通过官方渠道与多家媒体报道交叉确认。"));

children.push(heading("6.1 硬件/温室整机（STM32 侧）", 3));
children.push(bullet("[zhujiu39/stm32-flower-greenhouse](https://github.com/zhujiu39/stm32-flower-greenhouse)（2026-06 更新，0 星，已核验）：STM32F103C8T6 花卉温室，OLED+继电器自动控制+ESP8266 MQTT+ThingsCloud，与现有 SmartAgriculture 几乎同构。"));
children.push(bullet("[cz0729zc/smart-orchard-irrigation-system](https://github.com/cz0729zc/smart-orchard-irrigation-system)（26 星，已核验）：STM32+ESP8266 果园灌溉，土壤/光照/温湿度、自动灌溉、驱鸟、LED 补光、APP 远程控制，功能面最全。"));
children.push(bullet("[mcu-coder/stm32_environmental_monitoring](https://github.com/mcu-coder/stm32_environmental_monitoring)（20 星，已核验）：农业大棚环境监测系统（毕业设计案例）。"));
children.push(bullet("[lidonghang-02/greenhouse_control_system](https://github.com/lidonghang-02/greenhouse_control_system)（13 星，已核验）：基于 STM32 的温室控制系统。"));

children.push(heading("6.2 病虫害检测（视觉组）", 3));
children.push(bullet("[pratikkayal/PlantDoc-Dataset](https://github.com/pratikkayal/PlantDoc-Dataset)（427 星，已核验）：PlantDoc 官方数据集仓库（CODS-COMAD 2020 论文配套）。"));
children.push(bullet("PlantVillage 数据集（Kaggle [abdallahalidev/plantvillage-dataset](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)，已核验）：5 万+ 叶片图、38 类。"));
children.push(bullet("[ajinkyapawar11/yolov8-crop-disease-monitoring](https://github.com/ajinkyapawar11/yolov8-crop-disease-monitoring)（0 星，2025-07 更新，已核验）：YOLOv8 温室作物病害实时检测（菠菜/生菜/白菜），场景最接近，作架构参考。"));
children.push(bullet("[SHN2004/Plant_Disease_Detection](https://github.com/SHN2004/Plant_Disease_Detection)（9 星，已核验）：ESP32-CAM + 深度学习实时植物病害检测全链路。"));
children.push(bullet("[vishnuskandha/strawberry-disease-detection](https://github.com/vishnuskandha/strawberry-disease-detection)（0 星，2026-04 更新，已核验）：YOLOv8 训练 + Streamlit 应用，工程量最小、最快出结果。"));
children.push(bullet("[Kuipyy/plant-disease-agent](https://github.com/Kuipyy/plant-disease-agent)（0 星，2026-07 更新，已核验）：LLM 编排的病害诊断智能体（分类器 + Grad-CAM 可解释 + RAG 防治建议），与智能体想法直接对口。"));

children.push(heading("6.3 生长状况分析", 3));
children.push(bullet("[Tharinda-Pamindu/Plant-Growth-anaysis-measure-project](https://github.com/Tharinda-Pamindu/Plant-Growth-anaysis-measure-project)（1 星，已核验）：视觉测量叶片数/株高/健康度，正合“自动分析生长状况”。"));
children.push(bullet("[mriglab/GroMo-Plant-Growth-Modeling-with-Multiview-Images](https://github.com/mriglab/GroMo-Plant-Growth-Modeling-with-Multiview-Images)（6 星，2026-04 更新，已核验）：多视角图像生长建模竞赛项目，作进阶参考。"));

children.push(heading("6.4 农业大模型 / 智能体", 3));
children.push(bullet("司农（南京农业大学，2026-01 发布，已核验）：国内首个农业开源大语言模型，8B/32B，魔搭+GitHub 开源（IT之家、中国农科院官网、新华报业网等多家交叉报道）。"));
children.push(bullet("[zhiweihu1103/AgriAgent](https://github.com/zhiweihu1103/AgriAgent)（稷丰，125 星，已核验）：首个开源中文农业多模态大模型（图像+文本+气象）。"));
children.push(bullet("[csg2008/InternLMAgricultureAssistant](https://github.com/csg2008/InternLMAgricultureAssistant)（3 星，已核验）：书生浦语农业助手——传感器+执行器+大模型自动控制大棚环境，理念最接近的完整参考。"));
children.push(bullet("[nirmal2i43a5/AgriGen](https://github.com/nirmal2i43a5/AgriGen)（0 星，2026-02 更新，已核验）：RAG + Llama 3.3 农业咨询助手。"));
children.push(bullet("[Shuvam-Banerji-Seal/AgriIR](https://github.com/Shuvam-Banerji-Seal/AgriIR)（6 星，ECIR'26，已核验）：农业 RAG 六阶段流水线，检索+引用可溯源。"));
children.push(bullet("[vios-s/PhenoAssistant](https://github.com/vios-s/PhenoAssistant)（35 星，2026-07 更新，已核验）：多智能体植物表型分析系统，智能体架构参考。"));
children.push(bullet("[langgenius/dify](https://github.com/langgenius/dify)（151k 星，已核验）：开源智能体/工作流平台，官方文档确认 HTTP Request 节点可调外部 API（设备控制通道）。"));
children.push(bullet("[infiniflow/ragflow](https://github.com/infiniflow/ragflow)（87k 星，已核验）：开源 RAG 引擎，知识库问答底座。"));
children.push(bullet("[ultralytics/ultralytics](https://github.com/ultralytics/ultralytics)（60k 星，已核验）：YOLOv8/YOLO11 框架。"));

children.push(heading("6.5 云平台 / 小程序 / 可视化", 3));
children.push(bullet("[roinli/HUIZHI-nongyeOS-cloud](https://github.com/roinli/HUIZHI-nongyeOS-cloud)（农业岛，347 星，已核验）：Java+Vue+Uni-app 完整开源农业物联网平台，温棚监控/设备控制/大屏/小程序全有，可二开。"));
children.push(bullet("[CJL-build/-](https://github.com/CJL-build/-)（4 星，已核验）：完整 IoT 项目（Vue 网页+微信小程序+SpringBoot 后端+硬件），含“湿度+温度+光照综合判断自动浇水”逻辑。"));
children.push(bullet("[node-red/node-red](https://github.com/node-red/node-red)（23.5k 星，已核验）：MQTT 数据可视化低代码工具。"));
children.push(bullet("[emqx/emqx](https://github.com/emqx/emqx)（16.5k 星，已核验）：MQTT Broker。"));
children.push(bullet("[OneNET](https://open.iot.10086.cn)（中国移动物联网开放平台，已核验）：免费云平台，STM32+ESP8266 接入教程量大。"));

// ── 7 硬件清单 ──
children.push(heading("7. 硬件清单", 1));
children.push(table(
  ["器件", "用途"],
  [
    ["STM32F103C8T6 核心板", "主控"],
    ["BH1750 光照传感器", "光照采集（I2C）"],
    ["DHT11 温湿度传感器", "空气温湿度采集"],
    ["土壤湿度传感器", "土壤水分采集（ADC）"],
    ["OLED 显示屏", "本地数据显示"],
    ["W25Q64 Flash", "数据日志存储（SPI）"],
    ["ESP8266-01S", "Wi-Fi 上云（AT/MQTT）"],
    ["ESP32-CAM", "病害/生长拍照与轻量识别"],
    ["继电器模块", "设备开关控制"],
    ["水泵", "浇水"],
    ["蠕动泵", "施肥/给药"],
    ["风扇", "通风降温"],
    ["加热片", "低温补偿"],
    ["补光灯", "光照补充（PWM 调光）"],
    ["舵机 ×2（可选）", "喷药两轴云台"],
  ],
  [3100, 5972],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));

// ── 8 里程碑计划 ──
children.push(heading("8. 里程碑计划（约 6 个月）", 1));
children.push(table(
  ["阶段", "时间", "内容", "验收点"],
  [
    ["M0 开题", "第 1—2 周", "链路定稿、软件环境搭建（Python/Dify/YOLO）", "开题通过"],
    ["M1 感知-控制闭环", "第 3—6 周", "传感器采集→OLED→继电器→串口帧协议→LabVIEW 上位机", "本地闭环运行，数据帧正确，远程手动可控"],
    ["M2 上云+日志", "第 7—10 周", "ESP8266 MQTT→EMQX/OneNET→Node-RED 可视化；W25Q64 日志", "云平台实时曲线、断网日志完整可补传"],
    ["M3 视觉检测", "第 11—18 周", "公开集+自采数据训练 YOLO（先 5 类常见病）→云端推理→触发喷药", "检测准确率 ≥85%，喷药动作联动"],
    ["M4 智能体决策", "第 19—23 周", "Dify 搭智能体+RAG 知识库→综合决策→指令闭环→小程序", "自然语言指令自动执行，误操作有兜底"],
    ["M5 作品化", "第 24 周", "外壳/文档/演示视频/说明书/答辩材料", "可提交参赛"],
  ],
  [1500, 1200, 4100, 2272],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));

// ── 9 创新点与参赛叙事 ──
children.push(heading("9. 创新点与参赛叙事", 1));
children.push(numItem("**智能体闭环决策：**大模型直接输出设备动作指令，不只停留在问答层。"));
children.push(numItem("**边缘-云协同：**断网时本地规则独立运行，联网后云端智能体接管；本地规则永远优先，误操作有兜底。"));
children.push(numItem("**低成本：**硬件总成本低，农户可负担，便于推广。"));
children.push(numItem("**全周期数字档案：**从种子到收获持续记录传感器与视觉数据，形成可追溯的生长档案。"));
children.push(body("叙事主线：链路从底层硬件到智能决策全部自研，「感知—决策—执行」闭环是它与纯软件 AI 项目的主要区别。"));

// ── 10 风险与应对 ──
children.push(heading("10. 风险与应对", 1));
children.push(table(
  ["风险", "应对"],
  [
    ["视觉识别数据不足/效果差", "公开数据集预训练 + 自采微调；范围先缩到 3—5 类常见病害"],
    ["ESP32-CAM 边缘算力不足", "初期视觉推理放云端，边缘只拍照上传；后期再试轻量模型"],
    ["司农本地部署显存要求高", "先用 8B 或 DeepSeek API（现有），作品后期再本地化"],
    ["智能体误操作", "本地规则优先、指令白名单、关键动作人工确认模式"],
    ["网络不稳定", "本地阈值模式 + W25Q64 日志补传"],
    ["时间不足", "裁剪顺序：合并施肥/给药、生长分析降级为拍照+周报、小程序用农业岛二开"],
  ],
  [3200, 5872],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));

// ── 11 学习任务对齐表 ──
children.push(heading("11. 学习任务对齐表（当前学习 ↔ 项目模块）", 1));
children.push(table(
  ["当前学习内容", "项目落点"],
  [
    ["I2C（进行中）", "BH1750 光照驱动（修复 SmartAgriculture 推挽 bug）"],
    ["SPI（进行中）", "W25Q64 数据日志"],
    ["DMA + 串口文本包", "数据帧收发、DMA 不定长接收"],
    ["定时器 PWM / PID", "补光灯调光、温控、泵流量调节"],
    ["LabVIEW UDP/TCP", "本地调试上位机（AA55 协议）"],
    ["新增：Python/OpenCV/YOLO", "病害检测、生长分析"],
    ["新增：Dify/Coze + RAG", "智能体决策层"],
  ],
  [3900, 5172],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));

// ── 12 下一步 ──
children.push(heading("12. 下一步", 1));
children.push(checkbox("搭建 Python + YOLOv8 环境，用 PlantDoc 数据集跑通识别 demo"));
children.push(checkbox("注册 EMQX/OneNET + Dify 账号，跑通 MQTT 收发"));
children.push(checkbox("整理 SmartAgriculture 现有代码，启动 M1 感知-控制闭环"));

const doc = new Document({
  title: "SmartFarmAgent 智慧农业智能体系统——项目开题链路",
  subject: "项目开题链路（学术排版 v1.4.1）",
  description: "智慧农业智能体项目开题链路：感知 → 决策 → 执行全闭环。版本声明与备注见 VERSIONS.md。",
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
  fs.writeFileSync("PROPOSAL.docx", buf);
  console.log("PROPOSAL.docx written, bytes = " + buf.length);
});
