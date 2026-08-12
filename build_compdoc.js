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
  children: [new TextRun({ text: "全国相关赛事调研报告", font: FONT_HEAD, size: 36, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 60 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "适用范围：SmartFarmAgent 智慧农业智能体系统 · 核验日期：2026 年 8 月 12 日", font: FONT, size: 21 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 120 },
}));
children.push(new Paragraph({
  children: [],
  spacing: { after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "404040", space: 1 } },
}));
children.push(body("核验方式：官方网站、部委官网公告、主办方/学会官网通知、高校教务与学科竞赛通知交叉核验；所有官网链接均为官方或主办方发布渠道。排序依据：主办层级、教育部认可学科竞赛目录 / 中国高等教育学会竞赛榜单收录情况、赛事历史与规模、行业对口度；同一层级内按与本项目契合度微调。说明：各高校对本赛事的级别认定（A/B 类）可能不同，以本校学科竞赛目录为准；具体报名与赛程以当年官方通知为准。"));

// ── 一、含金量总览 ──
children.push(heading("一、含金量总览（从高到低）", 1));
children.push(table(
  ["排名", "赛事", "主办方（层级）", "官网", "契合度"],
  [
    ["1", "中国国际大学生创新大赛", "教育部", "cy.ncss.cn", "高"],
    ["2", "挑战杯（含「人工智能+」专项）", "共青团中央、中国科协、教育部、中国社科院、全国学联", "tiaozhanbei.net", "高"],
    ["3", "中国研究生电子设计竞赛", "教育部学位中心、工程教指委、中国电子学会", "cpipc.acge.org.cn/cw/hp/6", "高"],
    ["4", "全国大学生物联网设计竞赛（华为杯）", "全国高等学校计算机教育研究会", "iot.sjtu.edu.cn", "极高"],
    ["5", "全国大学生嵌入式芯片与系统设计竞赛", "中国电子教育学会（中国电子学会指导）", "socchina.net", "高"],
    ["6", "中国机器人大赛暨 RoboCup 中国赛（农业机器人专项）", "中国自动化学会", "rcccaa.drct-caa.org.cn", "中高"],
    ["7", "国际大学生智能农业装备创新大赛（天鹅杯）", "国际农业和生物系统工程委员会、中国农业机械学会等", "uiaec.ujs.edu.cn", "极高"],
    ["8", "智慧农业创新大赛", "农业农村部信息中心等", "moa.gov.cn（公告）", "极高"],
    ["9", "海峡两岸暨港澳地区大学生计算机创新作品赛", "各省市计算机学会等", "fzs.newoe.cn", "中"],
  ],
  [700, 2900, 2800, 2200, 800],
  [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.CENTER]
));
children.push(spacer());

// ── 二、赛事明细 ──
children.push(heading("二、赛事明细（按含金量从高到低）", 1));

function compItem(name, lines) {
  children.push(heading(name, 2));
  lines.forEach((l) => children.push(bullet(l)));
}

compItem("1. 中国国际大学生创新大赛（原「互联网+」）", [
  "**主办方：**教育部（国家级最高层级创新创业赛事）。",
  "**官网：**全国大学生创业服务网 [https://cy.ncss.cn](https://cy.ncss.cn)",
  "**概况：**2026 年 7 月至 11 月举办，设高教主赛道、青年红色筑梦之旅赛道、产业命题赛道等；参赛团队须登录全国大学生创业服务网报名。",
  "**契合点：**红旅赛道适合「智慧农业 + 乡村振兴」落地叙事；高教主赛道适合技术完整性与商业价值表达；本项目软硬一体闭环与量化数据是加分项。",
  "**含金量：**教育部直接主办，国家级顶级赛事，获奖在评优、保研与双创认定中认可度最高。",
  "**核验依据：**教育部赛事安排（2026-07-30 中国青年网转载）、多校报名通知均指向官网 cy.ncss.cn。",
]);

compItem("2. 挑战杯（全国大学生课外学术科技作品竞赛，含「人工智能+」专项赛）", [
  "**主办方：**共青团中央、中国科协、教育部、中国社会科学院、全国学联共同主办。",
  "**官网：**[https://www.tiaozhanbei.net](https://www.tiaozhanbei.net)",
  "**概况：**第十九届（2025）首次设立「人工智能+」专项赛；「花语智农」（边端云智慧植保，大模型驱动无人机作业）获国家级一等奖，是同类项目直接对标案例。",
  "**契合点：**「人工智能+」专项赛强调大模型/智能体对产业的真实赋能，本项目「大模型决策闭环到设备执行」完全对口。",
  "**含金量：**与创新大赛并列的全国性最高层次赛事之一，教育部认可学科竞赛目录收录。",
  "**核验依据：**挑战杯官网（tiaozhanbei.net 自述主办方）、教育部认可的全国大学生学科竞赛目录清单（2025）。",
]);

compItem("3. 中国研究生电子设计竞赛（研电赛）", [
  "**主办方：**教育部学位与研究生教育发展中心、全国工程专业学位研究生教育指导委员会、中国电子学会联合主办；中国研究生创新实践系列大赛主题赛事。",
  "**官网：**[https://cpipc.acge.org.cn/cw/hp/6](https://cpipc.acge.org.cn/cw/hp/6)（研电赛主页，注册报名入口 cpipc.acge.org.cn）",
  "**概况：**第二十一届（2026）3 月开赛，6 月 20 日报名截止，7 月初赛、8 月决赛；分技术类与商业计划类；「基于 5G 通信技术的智能萝卜收获清分装置」等智慧农业作品曾获全国一等奖。",
  "**契合点：**嵌入式 + 视觉 + 通信 + 上位机的完整技术作品，与本项目技术栈一致。",
  "**含金量：**教育部学位中心等联合主办的国家级研究生学科竞赛，证书在研究生评奖评优与就业中认可度高（本科生是否可参加以当年通知为准）。",
  "**核验依据：**中国研究生创新实践系列大赛管理平台官网、多所高校 2026 年报名通知。",
]);

compItem("4. 全国大学生物联网设计竞赛（华为杯）", [
  "**主办方：**全国高等学校计算机教育研究会；秘书处设于上海交通大学；华为、乐鑫等为金牌合作伙伴。",
  "**官网：**[https://iot.sjtu.edu.cn](https://iot.sjtu.edu.cn)",
  "**概况：**每年 4 月发布通知，4—6 月报名，7 月提交方案与演示视频，8 月分赛区评审与全国总决赛；获奖证书由主办单位统一印制颁发；2025 年一等奖作品「AgriMind 智农系统」即「边缘智能 + 云端协同」智慧温室方案。",
  "**契合点：**本项目 ESP32 + MQTT + Node.js + Vue 全链路直接对口，属同类获奖作品技术路线。",
  "**含金量：**全国性学科竞赛，多所高校认定为国家 A 级；华为杯等企业奖项含金量较高。",
  "**核验依据：**大赛官网 iot.sjtu.edu.cn、湖北民族大学等高校赛事介绍（明确「国家级、A」）。",
]);

compItem("5. 全国大学生嵌入式芯片与系统设计竞赛", [
  "**主办方：**中国电子教育学会主办，中国电子学会指导；大赛组织委员会运营。",
  "**官网：**[https://www.socchina.net](https://www.socchina.net)",
  "**概况：**第九届（2026）设芯片应用、芯片设计、FPGA 创新设计三个赛道；芯片应用赛道 4 月报名截止，7 月提交作品，8 月全国总决赛（现场演示 + 答辩 + 能力测评）；分研究生组、本科组、高职高专组。「灵枢智慧农业边缘智控系统」等智慧农业作品获国家级奖。",
  "**契合点：**边缘智能、芯片选型与低功耗设计，可突出 ESP32 端侧采集控制与云端协同。",
  "**含金量：**国家级榜单赛事（多所高校校长杯/保研认定），获奖证书由组委会与主办单位颁发。",
  "**核验依据：**大赛官网 www.socchina.net、电子科技大学/哈尔滨工业大学（威海）等高校 2026 年通知。",
]);

compItem("6. 中国机器人大赛暨 RoboCup 机器人世界杯中国赛（农业机器人专项）", [
  "**主办方：**中国自动化学会。",
  "**官网：**[http://rcccaa.drct-caa.org.cn](http://rcccaa.drct-caa.org.cn)（报名系统 [https://robotreg.drct-caa.org.cn](https://robotreg.drct-caa.org.cn)）",
  "**概况：**2026 年设专项赛与 RoboCup 中国赛两轮；农业机器人专项涵盖采摘机器人、节水灌溉机器人等赛项，2025 年专项赛获奖队伍包括西北农林科技大学、沈阳农业大学等。",
  "**契合点：**本项目视觉 + 执行器联动可向采摘/灌溉机器人方向改造后参赛。",
  "**含金量：**中国自动化学会主办的国家级学科竞赛，高校竞赛榜单收录；机器人方向认可度高。",
  "**核验依据：**中国自动化学会机器人竞赛与培训部官网（rcccaa.drct-caa.org.cn）、重庆交通大学/西北农林科技大学等 2026 年通知。",
]);

compItem("7. 国际大学生智能农业装备创新大赛（天鹅杯）", [
  "**主办方：**国际农业和生物系统工程委员会、中国农业机械学会、中国农业工程学会、省部共建现代农业装备与技术协同创新中心（江苏大学）、农业工程大学国际联盟联合主办；秘书处常设江苏大学。",
  "**官网：**[http://uiaec.ujs.edu.cn](http://uiaec.ujs.edu.cn)（另可关注中国农业机械学会 [http://www.agro-csam.org](http://www.agro-csam.org)）",
  "**概况：**2015 年由江苏大学发起，至今第十一届（2026 年 5 月决赛于甘肃农业大学，240 余所高校 1950 余项作品）；设 A 自由选题（A1 耕作 / A2 种植 / A3 田间管理 / A4 节水灌溉 / A5 收获 / A6 初加工 / A7 基础零部件 / A8 其他）、B 机器人、C 企业命题、D 概念设计四类；设特等奖、一等奖、二等奖、优秀奖与高校「优胜杯」。",
  "**契合点：**A2/A3/A4 类与本项目智能种植、环境调控、灌溉施肥直接对口；B 类可机器人化参赛。",
  "**含金量：**农业工程领域最具影响力的国际大学生赛事之一，国家级学会与国际组织联合主办；特等/一等奖证书在农业工程专业认可度高。",
  "**核验依据：**大赛官网 uiaec.ujs.edu.cn 官方通知（第十届通知含五家联合主办单位与章程）、西北农林科技大学 2026 年获奖报道。",
]);

compItem("8. 智慧农业创新大赛", [
  "**主办方：**农业农村部信息中心、河北省农业农村厅、河北雄安新区管理委员会。",
  "**官网（官方发布渠道）：**比赛规则公告 [https://www.moa.gov.cn/xw/bmdt/202605/t20260520_6484332.htm](https://www.moa.gov.cn/xw/bmdt/202605/t20260520_6484332.htm)（农业农村部官网）；比赛结果公告 [http://www.agri.cn/zx/zxdt/202607/t20260731_8860151.htm](http://www.agri.cn/zx/zxdt/202607/t20260731_8860151.htm)（中国农业农村信息网）。",
  "**概况：**2026 年首届举办，7 月 28 日在雄安伏羲农场现场竞技；设智能农机作业控制、无人机巡田、激光除草机器人、设施小番茄采摘机器人、家禽巡检机器人、鱼群智能检测设备六大赛道，共 70 支队伍参赛；采用实景场地、真机实操、公证监督。",
  "**契合点：**设施小番茄采摘、智能农机作业控制等赛道与本项目「感知—决策—执行」设备级闭环底座直接同构；首届以企业和科研院所为主，高校亦有获奖先例。",
  "**含金量：**农业农村部信息中心等部级机构主办，农业行业对口度与权威性最高；首届举办，历史积淀与证书通用度尚在建立中，建议作为行业对标与赛事参与的重点关注对象。",
  "**核验依据：**农业农村部官网比赛规则公告（2026-05-20）、中国农业农村信息网比赛结果公告（2026-07-31）、中国农业大学与中科院自动化所获奖报道。",
]);

compItem("9. 海峡两岸暨港澳地区大学生计算机创新作品赛", [
  "**主办方：**各省市计算机学会及相关港澳台学术机构联合组织（广东省赛由广东省计算机学会主办，深圳理工大学承办）。",
  "**官网（广东省赛报名与通知渠道）：**[https://fzs.newoe.cn](https://fzs.newoe.cn)；通知发布 [https://www.gdcomf.com](https://www.gdcomf.com)（广东省计算机学会）。",
  "**概况：**第二十一届（2026）总决赛于 7 月 19—22 日在乐山职业技术学院举行，28 个地区高校参赛；分本科组、高职高专组；2026 年新增「AI Agent 创新赛道」并设最高 3 万元奖金；要求作品为本科生独立完成、可现场展示。",
  "**契合点：**可现场演示的软硬一体系统完全符合其「创新性、实用性、完整性、可现场展示」要求；AI Agent 新赛道与本项目智能体能力契合。",
  "**含金量：**区域性两岸交流赛事，主办层级为学会级；在两岸高校交流、作品展示与竞赛体验层面有价值，通用类证书认可度低于前八项。",
  "**核验依据：**广东省计算机学会官网通知、韶关学院等高校 2026 年参赛通知（均指向 fzs.newoe.cn 报名平台）。",
]);

// ── 三、参赛策略建议 ──
children.push(heading("三、参赛策略建议", 1));
children.push(numItem("以「感知—决策—执行闭环能力底座」为统一作品叙事，按赛事切换侧重点：物联网/嵌入式类强调链路完整性与工程实现；挑战杯/创新大赛强调大模型应用与社会价值；农业装备类强调装备化改造与作业指标；计算机创新作品赛强调系统完整性与现场演示。"));
children.push(numItem("主攻建议：本科阶段优先物联网设计竞赛（华为杯）与嵌入式芯片竞赛（技术栈最对口、证书认可成熟），同步准备挑战杯「人工智能+」专项赛；如项目机器人化改造顺利，可追加天鹅杯与机器人大赛；智慧农业创新大赛作为行业对标与长期主攻目标。"));
children.push(numItem("材料标准化：按「作品说明书 + 技术文档 + 演示视频 + 易拉宝 + 承诺书」标准包准备，可快速适配不同赛事。"));
children.push(numItem("合规提醒：各赛事对作品原创性与重复参赛有明确约束（如天鹅杯不得使用已获国家级奖励成果申报、物联网竞赛谢绝导师课题作品、海峡两岸要求本科生独立完成），同一作品多赛申报前须核对各赛章程。"));

const doc = new Document({
  title: "全国相关赛事调研报告",
  subject: "赛事调研（含金量排序 + 官网核验）",
  description: "9 类全国性相关赛事核验与含金量排序，附官网链接与参赛策略建议。",
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
  fs.writeFileSync("Competition_Research.docx", buf);
  console.log("Competition_Research.docx written, bytes = " + buf.length);
});
