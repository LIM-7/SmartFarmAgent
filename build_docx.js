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

// ── 标题块 ──
children.push(new Paragraph({
  children: [new TextRun({ text: "参赛作品说明书", font: FONT_HEAD, size: 44, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 80 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "SmartFarmAgent——基于大模型智能体的设施农业「感知—决策—执行」闭环系统", font: FONT_HEAD, size: 24, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "完成时间：2026 年 8 月", font: FONT, size: 21 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));

// ── 一、作品简介 ──
children.push(heading("一、作品简介", 1));
children.push(heading("（一）背景与痛点", 3));
children.push(body("设施农业（大棚、连栋温室）是保障果蔬稳定供给的重要生产方式，但传统管理高度依赖人工巡检与经验调控：浇水靠手感、病害靠肉眼、生长判断靠主观，存在缺水涝害、病害发现滞后、水肥浪费、环境调控不及时等问题。现有市售「智慧农业」产品大多采用阈值规则控制（如土壤湿度低于设定值即浇水），缺少多源数据综合判断能力；大模型应用多停留在「知识问答」层，只回答问题、不驱动设备，难以形成真正的智能闭环。企业级智慧农业平台功能完整，但重软件集成、成本高、部署复杂，不适合小规模设施农业与教学科研场景快速落地。"));
children.push(heading("（二）行业与赛事趋势", 3));
children.push(body("2026 年 7 月，农业农村部信息中心等单位在雄安举办智慧农业创新大赛，设智能农机作业控制、无人机巡田、激光除草、设施小番茄采摘、家禽巡检、鱼群智能检测六大赛道，采用实景场地、真机实操、现场竞技，重点检验装备在真实生产场景中的作业能力；同期国际大学生智能农业装备创新大赛（天鹅杯）、全国大学生物联网设计竞赛（华为杯）、挑战杯「人工智能+」专项赛、中国国际大学生创新大赛等获奖作品普遍具备「软硬一体化、感知—决策—执行闭环、量化效果、场景验证」的共性。低成本、可复现、闭环落地的软硬一体系统，是当前竞赛与行业共同认可的立项方向。"));
children.push(heading("（三）作品定位", 3));
children.push(body("本作品以 ESP32 单芯片为感知执行端，Node.js + Vue 为云平台，大模型智能体为决策大脑，构建设施农业「感知—决策—执行」全闭环系统：传感器与摄像头持续采集环境与作物状态，云端智能体综合传感器、视觉与历史数据给出设备指令和农技方案，指令经白名单校验后下发执行并回传状态，形成数据驱动、可追溯的完整业务闭环。"));
children.push(heading("（四）核心理念", 3));
children.push(body("数据驱动、检索前置、本地优先、闭环落地。本地阈值规则永远优先于云端指令（断网自持、误操作兜底），云端大模型指令走白名单；软硬一体、低成本单芯片，整套系统可快速复现，适配教学科研、小规模经营与竞赛展示。"));

// ── 二、设计原理 ──
children.push(heading("二、设计原理", 1));
children.push(heading("（一）系统分层架构", 3));
children.push(table(
  ["层级", "名称", "组成与职责", "关键技术"],
  [
    ["L6", "展示层", "Vue 3 Web 大屏 / H5：实时曲线、设备控制、农技问答、视觉告警", "Vue、ECharts、WebSocket"],
    ["L5", "智能决策层", "大模型智能体（LLM+RAG）→ JSON 设备指令；视觉服务（YOLO 病害/生长分析）", "LLM、RAG、视觉"],
    ["L4", "云端平台层", "Node.js 后端：MQTT 接入 → 时序存储 → REST/WebSocket API；智能体编排", "Node.js、MQTT、时序存储"],
    ["L3", "边缘层", "ESP32-CAM 定时拍照上传；断网规则兜底（本地优先）", "边缘计算、定时任务"],
    ["L2", "通信层", "ESP32 内置 Wi-Fi：MQTT（JSON 上行/下行）+ HTTP 图片上传", "Wi-Fi、MQTT"],
    ["L1", "感知执行层", "ESP32 单芯片：传感器采集 + 继电器/泵/灯/喷药 + OLED + microSD 日志", "GPIO、ADC、I2C、PWM"],
  ],
  [700, 1500, 5100, 1772],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER]
));
children.push(spacer());
children.push(body("**安全原则：**本地阈值规则永远优先于云端指令（断网自持、误操作兜底），云端智能体指令走白名单。"));

children.push(heading("（二）核心业务模块", 3));
children.push(numItem("**感知采集与本地日志：**BH1750 光照、DHT11 温湿度、土壤湿度等传感器由 ESP32 定时采集，打包为 JSON 上行；同时写入 microSD 本地日志，断网时数据不丢失，联网后补传。"));
children.push(numItem("**环境自动调控：**根据温湿度与光照综合判断，驱动风扇、加热片与补光灯，PWM 调光调速（PID 可选），实现设施环境自动调节。"));
children.push(numItem("**病虫害检测与给药：**ESP32-CAM 定时拍照上传，YOLO 模型检测叶片病害，置信度达标后自动触发喷药泵，实现「识别—决策—执行」联动。"));
children.push(numItem("**生长状况分析：**定距定时拍照，统计叶片数、株高、颜色等表型信息，由大模型生成阶段性生长周报，形成可量化的生长记录。"));
children.push(numItem("**农技知识问答：**种植、病虫害、用药知识库经 RAG 检索增强生成结构化方案，回答附来源标注，抑制模型幻觉，可溯源。"));
children.push(numItem("**智能体决策：**Node.js 编排大模型智能体，综合传感器、视觉与历史数据输出 JSON 设备指令与解释；指令经白名单校验后下发 ESP32 执行，误操作有兜底。"));
children.push(numItem("**数据中台与可视化：**MQTT 上行数据经 Node.js 时序存储，Vue + ECharts 大屏实时展示；执行状态回传形成下一次决策依据。"));

children.push(heading("（三）大模型与智能体协同机制", 3));
children.push(body("系统采用「检索前置、模型后置、数据驱动」的运行机制：RAG 检索真实农业知识构建上下文，约束大模型基于真实素材生成回答与方案；智能体将方案转换为 JSON 设备指令，经白名单校验后下发执行，执行结果回传闭环。与纯软件问答系统相比，本作品把大模型从「回答问题」延伸到「驱动设备」，从机制上形成闭环；与纯阈值规则控制相比，具备多源数据综合判断与自然语言交互能力。"));

children.push(heading("（四）完整数据链路", 3));
children.push(table(
  ["环节", "内容", "输出"],
  [
    ["感知", "BH1750/DHT11/土壤 → ESP32 采集打包（JSON）；ESP32-CAM 定时拍照", "数据 / 图片"],
    ["通信", "ESP32 Wi-Fi：MQTT 上行情报 + HTTP 图片上传；断网时 microSD 本地日志", "上行数据 / 图片"],
    ["云端", "Node.js 后端（mqtt.js）订阅 → 时序存储 → REST/WebSocket API", "时序数据"],
    ["AI", "视觉服务（YOLO 病害检测/生长分析）→ 结果入事件队列；智能体（LLM+RAG）综合传感器+视觉+历史", "决策 JSON / 问答方案"],
    ["执行", "MQTT 下行指令 → ESP32 解析（白名单）→ 继电器/泵/灯/喷药", "设备动作"],
    ["闭环", "执行状态回传 → 数据入库 → Vue 大屏展示 + 智能体下次决策依据", "反馈数据"],
  ],
  [1200, 6300, 1572],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.CENTER]
));

// ── 三、技术方案 ──
children.push(heading("三、技术方案", 1));
children.push(heading("（一）技术栈", 3));
children.push(table(
  ["技术层", "采用技术", "作用说明"],
  [
    ["前端界面", "Vue 3、ECharts、WebSocket", "大屏看板、设备控制、农技问答、视觉告警等交互界面"],
    ["后端服务", "Node.js、Express、MQTT.js", "业务逻辑、接口路由、MQTT 接入、智能体编排与权限校验"],
    ["通信协议", "MQTT（JSON）/ HTTP / WebSocket", "设备上行数据、下行指令与图片上传、前端实时推送"],
    ["数据存储", "MySQL / SQLite 时序存储", "传感器数据、设备状态、问答会话与配置等结构化数据"],
    ["视觉服务", "Python、OpenCV、YOLOv8", "病害检测、生长表型分析（独立 AI 服务，由 Node.js 编排调用）"],
    ["大模型与 RAG", "兼容 OpenAI API 的模型服务（如 DeepSeek）、RAGFlow/Dify 或自建向量检索", "农技问答、智能体决策与知识溯源"],
    ["边缘端", "ESP32（Arduino/ESP-IDF）、ESP32-CAM", "数据采集、拍照、本地规则控制、microSD 日志"],
  ],
  [1600, 3600, 3872],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));

children.push(heading("（二）硬件方案", 3));
children.push(table(
  ["器件", "用途"],
  [
    ["ESP32-CAM 开发板（OV2640 + microSD 卡槽）", "主控：数据采集、拍照、联网、控制"],
    ["BH1750 光照传感器", "光照采集（I2C）"],
    ["DHT11 温湿度传感器", "空气温湿度采集"],
    ["土壤湿度传感器", "土壤水分采集（ADC）"],
    ["OLED 显示屏", "本地数据显示（I2C）"],
    ["继电器模块", "设备开关控制"],
    ["水泵 / 蠕动泵", "浇水、施肥/给药"],
    ["风扇 / 加热片 / 补光灯", "通风、低温补偿、光照补充（PWM 调光）"],
    ["5V 稳压供电模块", "ESP32-CAM 稳定供电（电流敏感）"],
    ["microSD 卡", "断网本地日志存储"],
  ],
  [3900, 5172],
  [AlignmentType.LEFT, AlignmentType.LEFT]
));

// ── 四、创新点 ──
children.push(heading("四、创新点", 1));
children.push(heading("（一）低成本单芯片软硬一体闭环", 3));
children.push(body("采用 ESP32 单芯片完成采集、拍照、控制、联网与日志存储，链路最短、硬件总成本低，整套「感知—决策—执行」闭环可在千元级硬件上完整复现，突破传统方案软硬分离、成本高的局限。"));
children.push(heading("（二）大模型决策闭环到设备动作", 3));
children.push(body("大模型智能体不仅回答问题，还直接输出 JSON 设备指令；指令经白名单校验、本地规则复核后下发执行，兼顾智能化与安全性。这是与纯软件问答系统、纯阈值控制系统的核心区别。"));
children.push(heading("（三）边缘—云协同与断网自持", 3));
children.push(body("断网时本地阈值规则独立运行并写入 microSD，联网后数据补传、云端智能体接管；本地规则永远优先，关键动作可设人工确认模式，误操作有兜底。"));
children.push(heading("（四）农业 RAG 溯源问答", 3));
children.push(body("种植与植保知识库经检索增强生成回答，附来源标注，抑制大模型幻觉，使农技建议可查证、可追溯，适合严肃农业场景。"));
children.push(heading("（五）全周期生长数字档案", 3));
children.push(body("从定植到收获持续记录传感器与视觉数据，生成可追溯、可对比的生长档案，支撑产量预测与栽培方案优化，形成数据资产。"));
children.push(heading("（六）创新效果对比", 3));
children.push(table(
  ["创新点", "技术方案", "与现有方法对比", "量化目标"],
  [
    ["单芯片软硬一体", "ESP32 单芯片集成采集/拍照/控制/联网", "传统方案软硬分离、成本高、部署繁琐", "硬件总成本千元级，5 分钟现场部署"],
    ["智能体闭环决策", "LLM+RAG → JSON 指令 → 白名单 → 执行回传", "纯问答无执行、纯规则无智能", "指令闭环响应 < 2 秒，误动作拦截率 100%"],
    ["边缘-云协同", "本地规则优先 + microSD 断网补传", "云端依赖型方案断网即失控", "断网自持 ≥ 24 小时，日志零丢失"],
    ["RAG 溯源问答", "知识库检索增强 + 来源标注", "通用大模型易幻觉、不可溯源", "问答溯源覆盖率 100%，关键指标可核验"],
    ["生长数字档案", "传感器+视觉持续记录与对比", "人工记录零散、不可追溯", "全周期档案连续可查，周报自动生成"],
  ],
  [1500, 2300, 2500, 1772],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
));

// ── 五、实用价值与应用场景 ──
children.push(heading("五、实用价值与应用场景", 1));
children.push(heading("（一）降低管理门槛、提升响应效率", 3));
children.push(body("管理者以自然语言提问或下达指令即可完成查询与调控，无需学习数据库与编程；环境异常自动告警，病害早发现早处置，减少水肥浪费与产量损失。"));
children.push(heading("（二）数据真实可靠、可追溯", 3));
children.push(body("所有回答与方案均基于本地知识库与实测数据生成，附来源标注；设备动作全记录，执行状态可回查，满足严肃生产场景对可靠性的要求。"));
children.push(heading("（三）低成本可复制", 3));
children.push(body("千元级硬件 + 开源软件栈，单套系统可快速复现，适合家庭农场、教学实验、科研平台与竞赛展示等低成本场景。"));
children.push(heading("（四）模块化可推广", 3));
children.push(body("感知与执行模块可替换：更换传感器与执行器即可迁移到水产养殖、禽舍巡检、果园管理、大田监测等场景；平台与智能体底座复用，推广性强。"));
children.push(heading("（五）竞赛与展示适配", 3));
children.push(body("系统具备真机实操演示能力：现场可展示传感器实时曲线、自然语言控制设备、病害识别联动喷药、断网自持等完整闭环，配套说明书、演示视频、易拉宝等材料，适配多类赛事评审要求。"));

// ── 六、总结 ──
children.push(heading("六、总结", 1));
children.push(body("本作品以「感知—决策—执行」闭环为核心，采用 ESP32 单芯片、Node.js/Vue 平台与云端大模型智能体，将数据采集、视觉识别、智能决策与设备执行打通为一个可运行、可复现、可推广的软硬一体系统。通过本地规则优先与指令白名单双重安全机制、RAG 溯源问答与全周期数字档案，解决传统设施农业管理依赖人工、智能决策不闭环、数据不可追溯等痛点。系统以低成本单芯片实现完整闭环，紧贴当前全国性竞赛「实景实操、闭环落地、量化验证」的评审导向，具备良好的竞赛适配性与成果转化前景。"));

// ── 附录 A 赛事适配说明 ──
children.push(heading("附录 A：赛事适配说明", 1));
children.push(body("全国 9 类相关赛事已完成官网核验并按含金量排序，明细见独立文档《全国相关赛事调研报告》（Competition_Research.md，同目录附 PDF/DOCX）。核心结论："));
children.push(bullet("**技术栈主攻：**全国大学生物联网设计竞赛（华为杯，iot.sjtu.edu.cn）、全国大学生嵌入式芯片与系统设计竞赛（socchina.net）、挑战杯「人工智能+」专项赛（tiaozhanbei.net）。"));
children.push(bullet("**行业主攻：**智慧农业创新大赛（农业农村部信息中心，公告见 moa.gov.cn）、国际大学生智能农业装备创新大赛（天鹅杯，uiaec.ujs.edu.cn）。"));
children.push(bullet("**获奖共性：**实景实操、软硬一体、大模型/智能体落到执行、量化验证与场景验证（示例：2026 智慧农业创新大赛设施小番茄赛道满分 200 分；挑战杯「人工智能+」一等奖「花语智农」）。"));
children.push(body("申报策略：以「感知—决策—执行闭环能力底座」统一叙事，按赛事切换侧重点（物联网/嵌入式类重工程实现，挑战杯/创新大赛重 AI 应用与社会价值，农业装备类重装备化与作业指标）；材料按「作品说明书 + 技术文档 + 演示视频 + 易拉宝 + 承诺书」标准包准备。"));
// ── 附录 B 里程碑 ──
children.push(heading("附录 B：里程碑计划（约 6 个月）", 1));
children.push(table(
  ["阶段", "时间", "内容", "验收点"],
  [
    ["M0 开题", "第 1—2 周", "链路定稿（ESP32 + Node.js + Vue）、软件环境搭建", "开题通过"],
    ["M1 感知-控制闭环", "第 3—6 周", "ESP32 传感器采集 → OLED → 继电器 → MQTT（本地 EMQX）→ Node.js → Vue 控制页", "局域网内数据正确、远程手动可控"],
    ["M2 上云+拍照+日志", "第 7—10 周", "ESP32-CAM 定时拍照上传；MQTT 上云；Node.js 时序存储 + Vue 大屏；microSD 断网补传", "实时曲线、图片可查、断网日志完整可补传"],
    ["M3 视觉检测", "第 11—18 周", "公开集 + 自采数据训练 YOLO（先 5 类常见病）→ Node.js 调视觉服务 → 触发喷药", "检测准确率 ≥ 85%，喷药动作联动"],
    ["M4 智能体决策", "第 19—23 周", "Node.js 编排智能体 + RAG 知识库（设备决策 + 农技问答）→ JSON 指令闭环 → Vue 对话", "自然语言指令自动执行，问答可溯源，误操作有兜底"],
    ["M5 作品化", "第 24 周", "外壳/说明书/演示视频/易拉宝/答辩材料", "达到参赛交付标准"],
  ],
  [1500, 1200, 4100, 2272],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
));

// ── 附录 C 风险与应对 ──
children.push(heading("附录 C：风险与应对", 1));
children.push(table(
  ["风险", "应对"],
  [
    ["视觉识别数据不足/效果差", "公开数据集预训练 + 自采微调；范围先缩到 3—5 类常见病害"],
    ["ESP32-CAM 算力不足", "初期视觉推理放云端，边缘只拍照上传；后期再试轻量模型"],
    ["ESP32-CAM 引脚少/供电敏感", "稳压供电；继电器组用 I/O 扩展（如 PCF8574/74HC595）或精简执行器数量"],
    ["智能体误操作", "本地规则优先、指令白名单、关键动作人工确认模式"],
    ["Wi-Fi 不稳定", "本地阈值模式 + microSD 日志补传"],
    ["时间不足", "裁剪顺序：合并施肥/给药、生长分析降级为拍照+周报、Vue 先做单页大屏"],
  ],
  [3200, 5872],
  [AlignmentType.CENTER, AlignmentType.LEFT]
));

// ── 附录 D 队员分工 ──
children.push(heading("附录 D：队员分工（占位，按实际团队填写）", 1));
children.push(table(
  ["队员", "负责模块", "具体工作内容"],
  [
    ["队员 A", "感知执行端开发", "ESP32 采集/拍照/控制固件，MQTT 上下行协议，本地规则与日志"],
    ["队员 B", "云平台与智能体", "Node.js 后端、MQTT 接入、智能体编排、RAG 问答链路"],
    ["队员 C", "视觉与数据", "YOLO 模型训练与部署、前端大屏、数据整理与测试"],
  ],
  [1300, 2200, 5572],
  [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT]
));

const doc = new Document({
  title: "SmartFarmAgent 智慧农业智能体系统——参赛作品说明书",
  subject: "参赛作品说明书（按作品说明书模板重构 v3.0）",
  description: "基于大模型智能体的设施农业感知-决策-执行闭环系统：作品简介、设计原理、技术方案、创新点、实用价值与赛事适配。",
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
  const names = ["PROPOSAL.docx", "PROPOSAL_v3.1.docx"];
  let written = null;
  for (const n of names) {
    try {
      fs.writeFileSync(n, buf);
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
