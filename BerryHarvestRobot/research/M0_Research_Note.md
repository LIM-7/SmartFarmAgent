# M0 调研笔记：小浆果柔性采摘机器人（沙棘、枸杞）

| 项目 | 内容 |
| --- | --- |
| 日期 | 2026-08-29 |
| 状态 | 初稿（数据已尽量溯源，个别口径待核验） |
| 归属 | BerryHarvestRobot 方向框架 · M0 调研 |

## 1. 调研摘要

沙棘、枸杞等小浆果种植规模大、人工采收成本高、招工难，是西部特色农业的长期痛点。现有机械采收以振动、梳刷、气吸、剪枝为主，普遍存在果实损伤、青果误摘、伤枝伤树等问题；全球尚无成熟的小浆果单果柔性无损采摘产品。软体抓手（soft gripper）近年成为农业采摘研究热点，但整链路成功率仍偏低，工程化空间大。本方向以「视觉识别 + 柔性末端 + 智能决策」构建低损伤、高效率的采摘机器人，可复用 SmartFarmAgent 的「感知—决策—执行」闭环架构。

## 2. 痛点量化

### 2.1 产业规模

- 枸杞：截至 2024 年底，全国枸杞种植面积 159.27 万亩，鲜果产量 130.69 万吨，干果产量 29.96 万吨，形成以宁夏为核心、青海甘肃为两翼的产业集群（[《中国枸杞产业蓝皮书（2025）》，中新网](https://www.chinanews.com.cn/cj/2025/07-10/10445720.shtml)）。分省口径：甘肃 69.34 万亩（43.5%）、青海 46 万亩（28.9%）、宁夏 22.87 万亩（14.4%）、新疆 20 万亩（[国家林草局](https://www.forestry.gov.cn/c/www/cyyw/637362.jhtml)；宁夏另有约 38 万亩、综合产值约 250 亿元的口径，统计口径不同，待核验）。
- 沙棘：据国际沙棘协会 2024 年度报告，全球沙棘资源约 263.86 万公顷，中国约 232.53 万公顷（约 3488 万亩），占全球约 88%（[国际沙棘发展报告 2024](https://www.oblepiha22.ru/assets/2024_annual_report_of_isa.pdf)）。另有报道称全国沙棘产业年总产值 240—260 亿元、年加工利用果实 8—10 万吨（转载口径，待核验）。新疆兵团一七〇团沙棘种植 5.2 万亩，为全国最大大果沙棘人工连片种植区，2024 年收获 1.84 万吨、产值 1 亿余元（[新华网兵团频道](http://bt.xinhuanet.com/20250715/2a6929fe28904be789c5ab1126e48e97/c.html)）。

### 2.2 采收痛点

- 沙棘人工采收：果实仅黄豆大小、浑身带刺、果肉娇嫩；人工约 20 kg/天，成本约 7 元/kg，招工困难；传统剪枝刮果法伤树、隔年减产（[吉林省科协云服务平台](http://www.jlstnet.net/science/show-7345.html)）。
- 枸杞采收：果实小而密集、与枝叶夹杂生长，叠加劳动力少、高寒高海拔（柴达木）等条件；青海海西州 2024 年已签约「AI 识别采摘关键点 + 强化学习运动规划 + 柔性抓取」智能采摘项目（[青海省政府](http://www.qinghai.gov.cn/zwgk/system/2024/08/05/030050484.shtml)）。
- 果柄结合力（力学窗口）：熟果-果柄结合力约 0.758 N，青果约 1.879 N，熟果与青果之间存在明确分离力差，为「摘熟不摘青」提供了力学依据（[万方收录论文：枸杞采摘结合力测定](https://s.wanfangdata.com.cn/paper?q=%E5%85%B3%E9%94%AE%E8%AF%8D%3A%22%E6%9E%B8%E6%9D%9E%E9%87%87%E6%91%98%22)）。
- 已有智能平台指标：玉门 2025 年智能枸杞采摘平台采摘率大于 85%、果实损伤率低于 5%（[甘肃科技](https://www.gspst.com/info/1351/1187691.htm)）；科创中国项目「人机协同振动采摘 + 柔性无损接果归集」一次鲜果采净率大于 95%、鲜果损伤低于 2%、漏集率低于 1%、效率提升约 10 倍（[科创中国](https://www.kczg.org.cn/fruit/plandetail?id=95922&achieve_id=719278)）。
- 沙棘冬采路线：冬季气温低于 -25℃ 时冻果可敲打震落（冻打采集），或喷乙烯利催熟后采收；该路线仅适用冻果/加工，鲜食高值果仍需低损伤采收（[青海省农业农村厅](https://nynct.qinghai.gov.cn/hdjl/znwdk/202409/t20240926_333800.html)）。

## 3. 国内外研究现状

### 3.1 国内研究（枸杞、沙棘）

- 石河子大学：综述气流式、梳刷式、剪切式、振动式枸杞采收装置的结构与特点（[安徽农业科学](https://www.ahnykx.com/3g/article.asp?id=68000)）；开展枸杞振动采收机理（果-蒂振动分离）研究（[知网](https://xuewen.cnki.net/ArticleCatalog.aspx?dbname=CMFD201802&dbtype=CMFD&filename=1018883837.nh)）。
- 甘肃农业大学：与甘肃杞采一号联合研制 4GQZ-320 型自走式枸杞采收机并完成田间试验（[甘肃农业大学官网](https://www.gsau.edu.cn/info/1381/27435.htm)）；测定收获期枸杞挂果枝固有频率 2.5—11.6 Hz，设计自走式振动采收机（振幅 15—80 mm）（[干旱地区农业研究](https://www.agrijournal.com.cn/article/detail/180A45D2-E404-4724-8C53-0B9007A2CB59)）；融合振动与梳刷的枸杞采收机振动采收机理分析（[中国林科院期刊](https://journals.caf.ac.cn/article/doi/10.13279/j.cnki.fmwe.20230911.001)）。
- 沙棘采收研究：机械振动式沙棘采收动力学（[农机化研究 2017](https://opaj.napstic.cn/periodicalArticle/0120161001999238)）；气吸式沙棘采摘装置及输送系统仿真（[吉林化工学院学报 2022](https://xuebao.jlict.edu.cn/CN/10.16039/j.cnki.cn22-1249.2022.09.016)）；拨簧-吸送式沙棘果实采收机（[林业机械与木工设备](https://journals.caf.ac.cn/data/article/lyjxymgsb/preview/pdf/826d78e7-5433-4b75-a7bf-49dcd35da7a8.pdf)）。
- 视觉识别（枸杞）：改进 YOLOv8 枸杞果实目标检测（[北京林业大学等，2024](https://m.qikan.cqvip.com/Article/ArticleDetail?id=7108401558)）；风沙噪声影响下基于改进 YOLOv8 的枸杞识别（[IJABE 2025](http://zgnywz.cnjournals.net/ch/reader/create_pdf.aspx?file_no=97&year_id=2025&quarter_id=6&falg=1)）；FLD-YOLO 轻量框架同步检测枸杞果实与果柄（[生物通 2026-04](https://news.ebiotrade.com/2026-4/20260403084701951.htm)）；YOLO-VitBiS + 双目立体视觉定位（检测精度 96.6%、模型 4.3 MB、1.856 M 参数、400—1000 mm 距离平均相对误差 2.42%）（[AgriEngineering 2026](https://openurl.ebsco.com/c/t4a2lo/EPDB%3Agcd%3A15%3A23132159/detailv2?sid=ebsco%3Aocu%3Arecord&id=ebsco%3Adoi%3A10.3390%2Fagriengineering8010006)）。

### 3.2 国际研究（软体抓手 + 小浆果）

- 黑莓：阿肯色大学研发软体机器人抓手，2025 年 4 月获美国专利「Soft Robotic Gripper for Berry Harvesting」（[FreshPlaza](https://www.freshplaza.com/north-america/article/9752975/arkansas-engineer-develops-soft-robot-for-blackberry-picking/)）；RoboSoft 2025 黑莓采摘系统（低成本 6 自由度机械臂 + 软充气抓手 + YOLOv8），视觉识别 98.4%、抓取有效性 76.6%，整条链路成功率约 52%（[NSTL 收录](https://hrb.nstl.gov.cn/paper_detail.html?id=609ff6cbb4f300e4bbbbbd237bc7a97b)）。
- 覆盆子：GraspBerry 软气动抓手 + 可互换软指尖（[IEEE RAM 2025](https://ieeexplore.ieee.org/document/11522859/references)）。
- 沙棘：拉脱维亚 AgroBots「AgroRobot」由 3 自由度移动平台 + 6 自由度机械臂组成，视觉识别枝条后剪枝收集（[RTU 论文库](https://ortus.rtu.lv/science/en/publications/40206)；该路线属剪枝式，非单果采摘）。
- 综述：软体抓手农业采摘综述（[MDPI Machines 2025](https://www.mdpi.com/2075-1702/13/1/55)）给出软抓手典型指标：脱落率 75.6%、损伤率 4.55%、采摘率 70.77%，说明「低损伤」成立但「采摘率」仍是瓶颈。

## 4. 现有方案对比

| 方案 | 代表 | 关键参数 | 成熟度 | 主要局限 | 来源 |
| --- | --- | --- | --- | --- | --- |
| 人工采摘 | 传统 | 沙棘约 20 kg/天、约 7 元/kg | 在用 | 成本高、招工难 | 吉林科协 |
| 振动式 | 甘肃农大 4GQZ-320 | 频率 2.5—11.6 Hz、振幅 15—80 mm | 样机/田间试验 | 损伤率与青果错采 | 甘农大官网 |
| 梳刷/振刷式 | 石河子大学、甘肃农大 | 梳刷转速 60—70 r/min | 样机 | 伤枝叶、易误摘青果 | 安徽农业科学综述 |
| 气吸式 | 吉林化工学院 | 气吸管道流场仿真 | 样机 | 需配套设备、效率待验证 | 吉林化工学院学报 |
| 剪枝式 | AgroBots（拉脱维亚） | 3+6 自由度、剪枝收集 | 接近商品化 | 剪枝伤树、非单果采摘 | RTU |
| 冻打采收（沙棘） | 冬季冻果敲打 | 气温低于 -25℃ | 在用 | 仅冻果/加工，鲜食不适用 | 青海省农业农村厅 |
| 柔性爪单果采摘 | Arkansas、GraspBerry、RoboSoft 2025 | 黑莓整链路约 52% | 实验室/样机 | 效率低、硬件专用化不足 | FreshPlaza、RoboSoft |
| 人机协同振动 + 柔性接果 | 科创中国项目 | 采净率大于 95%、损伤低于 2% | 样机/中试 | 非全自动、需人工辅助 | 科创中国 |

## 5. 技术路线论证

### 5.1 为什么柔性爪适合小浆果

沙棘、枸杞果实小、脆、带刺、簇生，刚性夹持极易挤伤果皮、误伤枝条。软体抓手通过大接触面积分散应力、低刚度自适应果实形状，配合「拉断果柄」而非「捏碎果实」的策略，可同时满足低损伤与有效分离；综述数据显示软抓手损伤率可低至约 4.55%。但现有整链路成功率仅约 52%（黑莓），主要瓶颈在视觉定位、抓取姿态与节拍效率，恰好是工程化改进空间。

### 5.2 力控窗口设计

- 力学依据：熟果-果柄结合力约 0.758 N，青果约 1.879 N。
- 抓手设计目标：输出拉力大于 0.758 N（摘下熟果）、小于 1.879 N（不误摘青果），同时夹持压强足够低、不损伤果皮。
- 候选驱动：软体气动（PneuNet/纤维增强）、线驱动、变刚度（颗粒阻塞/低熔点合金）；配合力传感器或电机电流环做力控反馈。
- 试验路线：M2 阶段复测果柄结合力，标定抓取力-位移曲线，再做熟/青分离试验。

### 5.3 视觉与决策路线

- 小目标检测：果实小、密、遮挡，采用 YOLO 系 + 注意力/Transformer 改进（FLD-YOLO 果实-果柄同步检测、YOLO-VitBiS 双目定位均已验证可行）。
- 深度估计：双目立体（400—1000 mm 内误差约 2.42%）或单目深度估计；户外光照、风沙噪声需数据增强与鲁棒设计。
- 成熟度分级：熟果/青果分类，与果柄力窗口联动实现「摘熟不摘青」。
- 决策：采摘点选择（果柄位置）、带刺枝条避障、运动规划（规则/强化学习），参考海西州项目路线。
- 部署：轻量化模型（几 MB 级）可跑嵌入式设备，与 SmartFarmAgent 视觉服务同构。

### 5.4 与 SmartFarmAgent 承接

| SmartFarmAgent 模块 | 复用到本方向 |
| --- | --- |
| 视觉服务（YOLOv8） | 果实检测、成熟度识别、果柄定位 |
| 智能体决策 | 采摘方案、避障路径、采收窗口判断 |
| MQTT 设备链路 | 采摘机器人状态上报与控制 |
| 数据闭环 | 损伤率、采摘效率、产量反馈 |
| 四情监测 | 果情、成熟度监测延伸 |

## 6. 商业化对标

- 水果采摘机器人全球市场：2025 年约 10 亿美元，预计 2026 年约 12 亿美元（[GM Insights](https://www.gminsights.com/industry-analysis/fruit-picking-robots-market)）。
- 软爪采摘机器人全球市场：2025 年约 9.40 亿元，预计 2032 年约 29.45 亿元，CAGR 约 18.1%（[恒州诚思调研，格隆汇转载](https://dxpress.gelonghui.com/p/5929233)，待核验）。
- 草莓采摘已商业化：Dogtooth（英国）Gen 5 机器人提取率 80—90%、约 200 kg/天、单价约 3 万英镑，2025 年投入商用（[Dogtooth 规格书](https://dogtooth.tech/wp-content/uploads/2025/04/Gen-5-Specification-Sheet-0.1.pdf)、[IT Brief UK](https://itbrief.co.uk/story/dogtooth-raises-gbp-14-million-for-fruit-harvesting-robots)）。
- 软体末端执行器供应商涌现：Zimmer Group AG-Soft（2025-06 发布）、Gripwiq（樱桃、李子、草莓等易损水果软体夹持器）（[GM Insights 中文版](https://www.gminsights.com/zh/industry-analysis/fruit-picking-robots-market)）。
- 结论：采摘机器人整体进入商业化早期，但「软爪 + 小浆果」细分（尤其枸杞、沙棘）国内外均无成熟产品，差异化空间大。

## 7. 风险与开放问题

- 采摘率与损伤率权衡：振动式效率高但损伤大，柔性爪损伤低但整链路成功率仅约 52%，需明确目标指标组合（如采摘率大于 85%、损伤率低于 5%，对标玉门平台）。
- 节拍效率与成本回收：单果逐个摘的节拍 vs 人工成本（沙棘约 7 元/kg）的平衡点需要测算。
- 户外环境：强光、风沙、遮挡、枝条摆动对视觉与抓取的干扰。
- 果柄与枝条干扰、带刺避障：末端与路径规划需专门设计。
- 目标市场差异：枸杞鲜食收购价值高，适合柔性爪；沙棘多为冻采/榨汁加工，柔性爪更适配鲜食与高值场景，需明确应用定位。
- 数据集：需自建枸杞/沙棘果实-果柄-熟青标注数据集，前期标注成本高。
- 整机成本：机械臂、末端、算力与传感器成本 vs 农户可接受价格的平衡。

## 8. 参考文献清单

1. 《中国枸杞产业蓝皮书（2025）》，中新网，2025-07：https://www.chinanews.com.cn/cj/2025/07-10/10445720.shtml
2. 国家林草局《三个转变，看枸杞产业焕新升级》：https://www.forestry.gov.cn/c/www/cyyw/637362.jhtml
3. 国际沙棘协会《国际沙棘发展报告（2024）》：https://www.oblepiha22.ru/assets/2024_annual_report_of_isa.pdf
4. 新华网兵团频道《野果子如何成就亿元产业链》，2025-07：http://bt.xinhuanet.com/20250715/2a6929fe28904be789c5ab1126e48e97/c.html
5. 吉林省科协《采收机器人——智能又高效》：http://www.jlstnet.net/science/show-7345.html
6. 青海省政府《海西：智能机械采摘枸杞项目助力产业转型升级》，2024-08：http://www.qinghai.gov.cn/zwgk/system/2024/08/05/030050484.shtml
7. 万方数据（枸杞果实-果柄结合力测定论文检索）：https://s.wanfangdata.com.cn/paper?q=枸杞采摘
8. 甘肃科技《玉门市举办智能枸杞采摘平台研讨会》，2025-05：https://www.gspst.com/info/1351/1187691.htm
9. 科创中国《枸杞高效低损采收技术装备》：https://www.kczg.org.cn/fruit/plandetail?id=95922&achieve_id=719278
10. 青海省农业农村厅《沙棘果实采收方法》：https://nynct.qinghai.gov.cn/hdjl/znwdk/202409/t20240926_333800.html
11. 安徽农业科学《枸杞采收装置的研究现状》：https://www.ahnykx.com/3g/article.asp?id=68000
12. 甘肃农业大学《副校长马国军实地调研我校机电工程学院研制的枸杞采收机研发情况》：https://www.gsau.edu.cn/info/1381/27435.htm
13. 《自走式枸杞振动采收机设计与试验》，干旱地区农业研究 2021(5)：https://www.agrijournal.com.cn/article/detail/180A45D2-E404-4724-8C53-0B9007A2CB59
14. 《枸杞采收机振动采收机理分析》，中国林科院期刊 2023：https://journals.caf.ac.cn/article/doi/10.13279/j.cnki.fmwe.20230911.001
15. 《机械振动式沙棘采收的动力学研究》，农机化研究 2017：https://opaj.napstic.cn/periodicalArticle/0120161001999238
16. 《沙棘果采摘装置气吸输送系统的仿真分析》，吉林化工学院学报 2022：https://xuebao.jlict.edu.cn/CN/10.16039/j.cnki.cn22-1249.2022.09.016
17. 《拨簧-吸送式沙棘果实采收机的研制》，林业机械与木工设备：https://journals.caf.ac.cn/data/article/lyjxymgsb/preview/pdf/826d78e7-5433-4b75-a7bf-49dcd35da7a8.pdf
18. 《基于改进 YOLOv8 算法的枸杞果实目标检测》，2024：https://m.qikan.cqvip.com/Article/ArticleDetail?id=7108401558
19. 《风沙噪声影响下基于改进 YOLOv8 的枸杞识别算法》，IJABE 2025：http://zgnywz.cnjournals.net/ch/reader/create_pdf.aspx?file_no=97&year_id=2025&quarter_id=6&falg=1
20. 《FLD-YOLO：非结构化农业环境中枸杞果实与果柄检测的轻量高效框架》，2026-04：https://news.ebiotrade.com/2026-4/20260403084701951.htm
21. 《Research on a Method for Identifying and Localizing Goji Berries Based on Binocular Stereo Vision Technology》，AgriEngineering 2026，DOI: 10.3390/agriengineering8010006
22. Arkansas 黑莓软体抓手专利报道，FreshPlaza 2025-07：https://www.freshplaza.com/north-america/article/9752975/arkansas-engineer-develops-soft-robot-for-blackberry-picking/
23. 《Toward autonomous blackberry harvesting with a soft gripper and vision-controlled robotic arm》，RoboSoft 2025（NSTL）：https://hrb.nstl.gov.cn/paper_detail.html?id=609ff6cbb4f300e4bbbbbd237bc7a97b
24. GraspBerry（覆盆子软气动抓手），IEEE RAM 2025：https://ieeexplore.ieee.org/document/11522859/references
25. AgroBots 沙棘采收机器人，拉脱维亚 RTU：https://ortus.rtu.lv/science/en/publications/40206
26. 《Application of Soft Grippers in the Field of Agricultural Harvesting: A Review》，MDPI Machines 2025：https://www.mdpi.com/2075-1702/13/1/55
27. Fruit Picking Robots Market，GM Insights：https://www.gminsights.com/industry-analysis/fruit-picking-robots-market
28. Dogtooth Gen 5 草莓采摘机器人规格书：https://dogtooth.tech/wp-content/uploads/2025/04/Gen-5-Specification-Sheet-0.1.pdf

