# SmartFarmAgent 智慧农业智能体系统——项目开题链路

## 1. 项目背景与痛点

- 传统大棚管理依赖人工巡检与经验调控：浇水靠手感、病害靠肉眼、生长判断靠主观，存在缺水/涝害、病害发现滞后、水肥浪费等问题。
- 市面"智慧农业"多为阈值规则控制（湿度低于 X 就浇水），无真正的智能决策；大模型应用停留在"知识问答"层，没有闭环到设备执行。
- 机会：2025—2026 年竞赛集中在「智能体 / IoT + 大模型」方向；司农、稷丰等农业开源大模型与 RAGFlow、Dify 等 RAG 框架已成熟可用；ESP32 单芯片即可完成数据采集、拍照与控制，Node.js + Vue 全栈平台生态成熟，硬件与软件成本都低，整条链路可以自研。

## 2. 系统总体架构

| 层级 | 名称 | 组成与职责 | 关键技术 |
|---|---|---|---|
| L6 | 展示层 | Vue 3 Web 大屏 / H5：实时曲线、设备控制、农技问答、视觉告警 | Vue、ECharts、WebSocket |
| L5 | 智能决策层 | 大模型智能体（LLM+RAG）→ JSON 设备指令（核心创新）；视觉服务（YOLO 病害/生长分析） | LLM、RAG、视觉 |
| L4 | 云端平台层 | Node.js 后端：MQTT 接入（mqtt.js）→ 时序存储 → REST/WebSocket API；智能体编排 | Node.js、MQTT、时序存储 |
| L3 | 边缘层 | ESP32-CAM 定时拍照上传；断网规则兜底（本地优先） | 边缘计算、定时任务 |
| L2 | 通信层 | ESP32 内置 Wi-Fi：MQTT（JSON 上行/下行）+ HTTP 图片上传 | Wi-Fi、MQTT |
| L1 | 感知执行层 | ESP32 单芯片：传感器采集 + 继电器/泵/灯/喷药 + OLED + microSD 日志 | GPIO、ADC、I2C、PWM |

**安全原则**：本地阈值规则永远优先于云端指令（断网自持、误操作兜底），云端智能体指令走白名单。

## 3. 功能模块拆解

| # | 功能 | 实现方案 | 难度 | 可行性依据 | 对应学习点 |
|---|---|---|---|---|---|
| 1 | 自动浇水/施肥 | 土壤湿度+光照综合判断；继电器驱动水泵/蠕动泵 | 中 | 已有土壤传感器+继电器；ESP32 整机案例已验证 | GPIO、ADC、MQTT |
| 2 | 环境自动调控 | DHT11/BH1750 → 风扇/加热/补光灯；PWM 调光（PID 可选） | 中 | 传感器已有；PWM 知识可迁移到 ESP32 | 定时器 PWM、PID |
| 3 | 病虫害检测+给药 | ESP32-CAM 定时拍照上传 → YOLOv8（先云后边）→ 置信度达标 → 喷药泵 | 高 | PlantDoc/PlantVillage 公开数据集 + ESP32-CAM/YOLO 全链路先例 | YOLO、HTTP 上传 |
| 4 | 生长状况分析 | 定距定时拍照 → 叶片数/株高/颜色统计 → 大模型生成周报 | 高 | 视觉测量工具包开源可用 | 视觉、LLM API |
| 5 | 农技知识问答 | 种植/病虫害/用药知识库 → RAG 检索增强 → 结构化方案+来源标注 | 中 | 司农/DeepSeek + RAGFlow 已核验，Node.js 可调其 HTTP API | RAG、Node.js |
| 6 | 智能体决策 | Node.js 编排：传感器+视觉+历史 → 大模型（司农/DeepSeek）→ JSON 指令+解释 | 高 | LLM 兼容 API + MQTT 下行链路已验证 | Agent、MQTT |
| 7 | 数据中台/展示 | MQTT 上行 → Node.js 时序存储 → Vue 大屏；ESP32 microSD 断网日志 | 中 | Express/mqtt.js/ECharts 成熟；EMQX 已核验 | Node.js、Vue |

## 4. 完整数据链路（感知 → 决策 → 执行）

| 环节 | 内容 | 输出 |
|---|---|---|
| 感知 | BH1750/DHT11/土壤 → ESP32 采集打包（JSON）；ESP32-CAM 定时拍照 | 数据 / 图片 |
| 通信 | ESP32 Wi-Fi：MQTT 上行情报 + HTTP 图片上传；断网时 microSD 本地日志 | 上行数据 / 图片 |
| 云端 | Node.js 后端（mqtt.js）订阅 → 时序存储 → REST/WebSocket API | 时序数据 |
| AI | 视觉服务（YOLO 病害检测/生长分析）→ 结果入事件队列；智能体（LLM+RAG）综合传感器+视觉+历史 | 决策 JSON |
| 执行 | MQTT 下行指令 → ESP32 解析（白名单）→ 继电器/泵/灯/喷药 | 设备动作 |
| 闭环 | 执行状态回传 → 数据入库 → Vue 大屏展示 + 智能体下次决策依据 | 反馈数据 |

## 5. 可行性核验结论

1. **硬件与嵌入式链路**：ESP32 生态成熟（arduino-esp32 官方核心，17k+ 星，持续更新）；ESP32-CAM 单板集成摄像头、Wi-Fi 与 microSD，外接传感器/继电器的整机案例丰富；现有 I2C、SPI、串口、PWM 知识可直接迁移。
2. **视觉检测链路**：[PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset) 数据集有官方 GitHub 仓库（427 星，CODS-COMAD 2020 论文配套）；PlantVillage 数据集在 Kaggle 公开（5 万+ 图、38 类）；YOLOv8 框架成熟（Ultralytics 60k 星），已有温室作物病害检测、ESP32-CAM 实时检测全链路先例。
3. **大模型/智能体链路**：司农（南京农业大学，国内首个农业开源大语言模型，8B/32B）与稷丰 [AgriAgent](https://github.com/zhiweihu1103/AgriAgent)（125 星，中文农业多模态）均已核验；RAGFlow/Dify 提供 HTTP API，Node.js 后端可直接调用，因此「智能体 → HTTP → MQTT → 设备」路径可行。
4. **平台链路**：[Express](https://github.com/expressjs/express)（69k 星）、[MQTT.js](https://github.com/mqttjs/MQTT.js)（9k 星）、[Vue 3](https://github.com/vuejs/core)（54k 星）、[ECharts](https://github.com/apache/echarts)（67k 星）均已核验；[EMQX](https://github.com/emqx/emqx)（16.5k 星）与 OneNET 支持 ESP32 直连，教程量大。
5. **已知约束（写进风险）**：ESP32-CAM 引脚少、供电敏感，需稳压供电与 I/O 规划；边缘算力有限，初期视觉推理走云端；司农 32B 本地部署显存要求高，初期用 8B 或 DeepSeek API 替代。

## 6. 开源项目清单

> 核验方式：2026-08-07/08-10 通过 GitHub API 查询仓库全名、star 数、最近推送、是否归档；模型与数据集通过官方渠道与多家媒体报道交叉确认。

### 6.1 硬件 / 整机（ESP32 侧）
- [espressif/arduino-esp32](https://github.com/espressif/arduino-esp32)（17.2k 星，2026-08 更新，已核验）：乐鑫官方 Arduino 核心，ESP32-CAM 开发与示例的基准环境。
- [SHN2004/Plant_Disease_Detection](https://github.com/SHN2004/Plant_Disease_Detection)（9 星，已核验）：ESP32-CAM + 深度学习实时植物病害检测全链路，与本项目视觉链路直接对口。

### 6.2 病虫害检测（视觉组）
- [pratikkayal/PlantDoc-Dataset](https://github.com/pratikkayal/PlantDoc-Dataset)（427 星，已核验）：PlantDoc 官方数据集仓库（CODS-COMAD 2020 论文配套）。
- PlantVillage 数据集（Kaggle [abdallahalidev/plantvillage-dataset](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)，已核验）：5 万+ 叶片图、38 类。
- [ajinkyapawar11/yolov8-crop-disease-monitoring](https://github.com/ajinkyapawar11/yolov8-crop-disease-monitoring)（0 星，2025-07 更新，已核验）：YOLOv8 温室作物病害实时检测（菠菜/生菜/白菜），场景最接近，作架构参考。
- [vishnuskandha/strawberry-disease-detection](https://github.com/vishnuskandha/strawberry-disease-detection)（0 星，2026-04 更新，已核验）：YOLOv8 训练 + Streamlit 应用，工程量最小、最快出结果。
- [Kuipyy/plant-disease-agent](https://github.com/Kuipyy/plant-disease-agent)（0 星，2026-07 更新，已核验）：LLM 编排的病害诊断智能体（分类器 + Grad-CAM 可解释 + RAG 防治建议），与智能体想法直接对口。

### 6.3 生长状况分析
- [Tharinda-Pamindu/Plant-Growth-anaysis-measure-project](https://github.com/Tharinda-Pamindu/Plant-Growth-anaysis-measure-project)（1 星，已核验）：视觉测量叶片数/株高/健康度，正合"自动分析生长状况"。
- [mriglab/GroMo-Plant-Growth-Modeling-with-Multiview-Images](https://github.com/mriglab/GroMo-Plant-Growth-Modeling-with-Multiview-Images)（6 星，2026-04 更新，已核验）：多视角图像生长建模竞赛项目，作进阶参考。

### 6.4 农业大模型 / 智能体
- 司农（南京农业大学，2026-01 发布，已核验）：国内首个农业开源大语言模型，8B/32B，魔搭+GitHub 开源（IT之家、中国农科院官网、新华报业网等多家交叉报道）。
- [zhiweihu1103/AgriAgent](https://github.com/zhiweihu1103/AgriAgent)（稷丰，125 星，已核验）：首个开源中文农业多模态大模型（图像+文本+气象）。
- [csg2008/InternLMAgricultureAssistant](https://github.com/csg2008/InternLMAgricultureAssistant)（3 星，已核验）：书生浦语农业助手——传感器+执行器+大模型自动控制大棚环境，理念最接近的完整参考。
- [nirmal2i43a5/AgriGen](https://github.com/nirmal2i43a5/AgriGen)（0 星，2026-02 更新，已核验）：RAG + Llama 3.3 农业咨询助手。
- [Shuvam-Banerji-Seal/AgriIR](https://github.com/Shuvam-Banerji-Seal/AgriIR)（6 星，ECIR'26，已核验）：农业 RAG 六阶段流水线，检索+引用可溯源。
- [vios-s/PhenoAssistant](https://github.com/vios-s/PhenoAssistant)（35 星，2026-07 更新，已核验）：多智能体植物表型分析系统，智能体架构参考。
- [langgenius/dify](https://github.com/langgenius/dify)（151k 星，已核验）：开源智能体/工作流平台，HTTP API 可被 Node.js 后端调用（可选编排层）。
- [infiniflow/ragflow](https://github.com/infiniflow/ragflow)（87k 星，已核验）：开源 RAG 引擎，HTTP API 可被 Node.js 后端调用。
- [ultralytics/ultralytics](https://github.com/ultralytics/ultralytics)（60k 星，已核验）：YOLOv8/YOLO11 框架（视觉服务为独立 Python 服务，由 Node.js 编排调用）。

### 6.5 平台 / 前端 / 可视化（Node.js + Vue）
- [expressjs/express](https://github.com/expressjs/express)（69.4k 星，已核验）：Node.js Web 框架，REST/WebSocket API 底座。
- [mqttjs/MQTT.js](https://github.com/mqttjs/MQTT.js)（9.1k 星，已核验）：Node.js MQTT 客户端，云端接入层。
- [vuejs/core](https://github.com/vuejs/core)（Vue 3，54.2k 星，已核验）：前端框架，大屏/控制页/问答界面。
- [apache/echarts](https://github.com/apache/echarts)（67k 星，已核验）：可视化图表库，实时曲线与看板。
- [emqx/emqx](https://github.com/emqx/emqx)（16.5k 星，已核验）：MQTT Broker。
- [OneNET](https://open.iot.10086.cn)（中国移动物联网开放平台，已核验）：免费云平台，ESP32 MQTT 直连教程量大。

## 7. 硬件清单

| 器件 | 用途 |
|---|---|
| ESP32-CAM 开发板（OV2640 + microSD 卡槽） | 主控：数据采集、拍照、联网、控制 |
| BH1750 光照传感器 | 光照采集（I2C） |
| DHT11 温湿度传感器 | 空气温湿度采集 |
| 土壤湿度传感器 | 土壤水分采集（ADC） |
| OLED 显示屏 | 本地数据显示（I2C） |
| 继电器模块 | 设备开关控制 |
| 水泵 | 浇水 |
| 蠕动泵 | 施肥/给药 |
| 风扇 | 通风降温 |
| 加热片 | 低温补偿 |
| 补光灯 | 光照补充（PWM 调光） |
| 舵机 ×2（可选） | 喷药两轴云台 |
| 5V 稳压供电模块 | ESP32-CAM 稳定供电（电流敏感） |
| USB 转串口模块（可选） | ESP32-CAM 烧录与调试（板载无 USB） |
| microSD 卡 | 断网本地日志存储 |

## 8. 里程碑计划（约 6 个月）

| 阶段 | 时间 | 内容 | 验收点 |
|---|---|---|---|
| M0 开题 | 第 1—2 周 | 链路定稿（ESP32 + Node.js + Vue）、软件环境搭建 | 开题通过 |
| M1 感知-控制闭环 | 第 3—6 周 | ESP32 传感器采集→OLED→继电器→MQTT（本地 EMQX）→Node.js→Vue 控制页 | 局域网内数据正确、远程手动可控 |
| M2 上云+拍照+日志 | 第 7—10 周 | ESP32-CAM 定时拍照上传；MQTT 上云；Node.js 时序存储+Vue 大屏；microSD 断网补传 | 云平台实时曲线、图片可查、断网日志完整可补传 |
| M3 视觉检测 | 第 11—18 周 | 公开集+自采数据训练 YOLO（先 5 类常见病）→Node.js 调视觉服务→触发喷药 | 检测准确率 ≥85%，喷药动作联动 |
| M4 智能体决策 | 第 19—23 周 | Node.js 编排智能体+RAG 知识库（设备决策+农技问答）→ JSON 指令闭环 → Vue 对话 | 自然语言指令自动执行，农技问答可溯源，误操作有兜底 |
| M5 作品化 | 第 24 周 | 外壳/文档/演示视频/说明书/答辩材料 | 可提交参赛 |

## 9. 创新点与参赛叙事

1. **智能体闭环决策**：大模型直接输出设备动作指令，不只停留在问答层。
2. **边缘-云协同**：断网时本地规则独立运行，联网后云端智能体接管；本地规则永远优先，误操作有兜底。
3. **低成本单芯片**：ESP32 单芯片完成采集、拍照、控制与联网，链路最短、硬件成本低，整套闭环可复现，适合竞赛展示与教学科研场景推广。
4. **全周期数字档案**：从种子到收获持续记录传感器与视觉数据，形成可追溯的生长档案。

叙事主线：链路从底层硬件到智能决策全部自研，「感知—决策—执行」闭环是它与纯软件 AI 项目的主要区别。

## 10. 风险与应对

| 风险 | 应对 |
|---|---|
| 视觉识别数据不足/效果差 | 公开数据集预训练 + 自采微调；范围先缩到 3—5 类常见病害 |
| ESP32-CAM 算力不足 | 初期视觉推理放云端，边缘只拍照上传；后期再试轻量模型 |
| ESP32-CAM 引脚少/供电敏感 | 稳压供电；继电器组用 I/O 扩展（如 PCF8574/74HC595）或精简执行器数量 |
| 智能体误操作 | 本地规则优先、指令白名单、关键动作人工确认模式 |
| Wi-Fi 不稳定 | 本地阈值模式 + microSD 日志补传 |
| 时间不足 | 裁剪顺序：合并施肥/给药、生长分析降级为拍照+周报、Vue 先做单页大屏 |

## 11. 学习任务对齐表（当前学习 ↔ 项目模块）

| 当前学习内容 | 项目落点 |
|---|---|
| I2C（已学） | BH1750/OLED 驱动迁移到 ESP32 |
| SPI / 串口（已学） | microSD 卡日志、调试串口；数据帧设计迁移到 MQTT JSON |
| 定时器 PWM（已学） | 补光灯调光、风扇调速 |
| 新增：ESP32（Arduino/ESP-IDF） | 感知执行端固件（采集/拍照/控制/本地规则） |
| 新增：Wi-Fi/MQTT | 设备上云通道（MQTT JSON + HTTP 图片） |
| 新增：Node.js（Express/mqtt.js/WebSocket） | 云端平台后端 |
| 新增：Vue 3 + ECharts | 前端大屏/控制页/问答 |
| 新增：Python/OpenCV/YOLO | 视觉服务（独立 AI 服务，Node.js 编排调用） |

## 12. 下一步

- [ ] 采购/整理 ESP32-CAM 与传感器，跑通 M1：传感器采集 → MQTT → Node.js → Vue 控制页
- [ ] 搭建 Node.js（Express + mqtt.js）+ Vue 3（Vite + ECharts）脚手架与本地 EMQX
- [ ] 搭建 Python + YOLOv8 环境，用 PlantDoc 数据集跑通识别 demo