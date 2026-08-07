# SmartFarmAgent 智慧农业智能体系统——项目开题链路

## 1. 项目背景与痛点

- 传统大棚管理依赖人工巡检与经验调控：浇水靠手感、病害靠肉眼、生长判断靠主观，存在缺水/涝害、病害发现滞后、水肥浪费等问题。
- 市面"智慧农业"多为阈值规则控制（湿度低于 X 就浇水），无真正的智能决策；大模型应用停留在"知识问答"层，没有闭环到设备执行。
- 机会：2025—2026 年竞赛集中在「智能体 / IoT + 大模型」方向；司农、稷丰等农业开源大模型与 RAGFlow、Dify 等 RAG 框架已成熟可用，硬件成本低，整条链路可以自研。

## 2. 系统总体架构（六层）

| 层级 | 名称 | 组成与职责 | 关键技术 |
|---|---|---|---|
| L6 | 展示层 | 微信小程序 / H5 大屏 / LabVIEW 上位机 | 前端、上位机 |
| L5 | 智能决策层 | 大模型智能体（LLM+RAG）→ JSON 设备指令（核心创新）；视觉服务（YOLO 病害/生长分析） | LLM、RAG、视觉 |
| L4 | 云端平台层 | MQTT Broker（EMQX/OneNET）→ 时序存储 → Node-RED 可视化 | MQTT、时序存储 |
| L3 | 边缘层 | ESP32-CAM 拍照/轻量推理；断网规则兜底（本地优先） | 边缘计算、轻量推理 |
| L2 | 通信层 | USART 文本帧协议 + ESP8266 MQTT | 串口、MQTT |
| L1 | 感知执行层 | STM32F103C8T6 + 传感器 + 继电器/泵/灯/喷药 | GPIO、ADC、I2C、SPI |

**安全原则**：本地阈值规则永远优先于云端指令（断网自持、误操作兜底），云端智能体指令走白名单。

## 3. 功能模块拆解

| # | 功能 | 实现方案 | 难度 | 可行性依据 | 对应学习点 |
|---|---|---|---|---|---|
| 1 | 自动浇水/施肥 | 土壤湿度+光照综合判断；继电器驱动水泵/蠕动泵 | 中 | 已有土壤传感器+继电器；开源整机项目已验证 | GPIO、ADC、串口协议 |
| 2 | 环境自动调控 | DHT11/BH1750 → 风扇/加热/补光灯；PWM 调光（PID 可选） | 中 | 传感器已有；PWM/PID 为已学或进行中内容 | 定时器 PWM、PID |
| 3 | 病虫害检测+给药 | 摄像头定拍 → YOLOv8（先云后边）→ 置信度达标 → 喷药泵 | 高 | PlantDoc/PlantVillage 公开数据集 + 多个 ESP32-CAM/YOLO 先例 | Python、YOLO、视觉 |
| 4 | 生长状况分析 | 定距定时拍照 → 叶片数/株高/颜色统计 → 大模型生成周报 | 高 | 视觉测量工具包开源可用 | 视觉、LLM API |
| 5 | 智能体决策 | 传感器+检测+历史 → 大模型（司农/DeepSeek）→ 设备指令+解释 | 高 | Dify 官方 HTTP 节点可调外部 API；农业大模型已开源 | RAG、Agent |
| 6 | 数据中台/展示 | MQTT 上行 → 时序存储 → 小程序/H5；W25Q64 本地日志 | 中 | EMQX/Node-RED 成熟；农业岛平台可二开 | SPI、云平台 |

## 4. 完整数据链路（感知 → 决策 → 执行）

| 环节 | 内容 | 输出 |
|---|---|---|
| 感知 | BH1750/DHT11/土壤 → STM32 采集打包（文本帧）；ESP32-CAM 拍照上传（HTTP/MQTT） | 数据帧 / 图片 |
| 通信 | USART 帧 + ESP8266 MQTT；本地接 LabVIEW 调试 + W25Q64 日志 | 上行数据 |
| 云端 | MQTT Broker（EMQX/OneNET）→ 时序存储 + Node-RED 可视化 | 时序数据 |
| AI | 视觉服务（YOLO 病害检测/生长分析）→ 结果入事件队列；智能体（LLM+RAG）综合传感器+视觉+历史 | 决策 JSON |
| 执行 | MQTT 下行指令 → 网关转 HTTP/串口 → STM32 解析 → 继电器/泵/灯/喷药 | 设备动作 |
| 闭环 | 执行状态回传 → 数据入库 → 小程序/大屏展示 + 智能体下次决策依据 | 反馈数据 |

## 5. 可行性核验结论（2026-08-07 完成）

1. **硬件与嵌入式链路**：全部器件为 STM32 生态常用模块，与现有学习内容一一对应；参考整机项目（[stm32-flower-greenhouse](https://github.com/zhujiu39/stm32-flower-greenhouse)、[smart-orchard-irrigation-system](https://github.com/cz0729zc/smart-orchard-irrigation-system) 等）已跑通相同硬件组合。
2. **视觉检测链路**：[PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset) 数据集有官方 GitHub 仓库（427 星，CODS-COMAD 2020 论文配套）；[PlantVillage](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset) 数据集在 Kaggle 公开（5 万+ 图、38 类）；YOLOv8 框架成熟（[Ultralytics](https://github.com/ultralytics/ultralytics) 60k 星），已有温室作物病害检测、ESP32-CAM 实时检测先例。
3. **大模型/智能体链路**：司农（南京农业大学，国内首个农业开源大语言模型，8B/32B，魔搭+GitHub 开源）与稷丰 [AgriAgent](https://github.com/zhiweihu1103/AgriAgent)（125 星，中文农业多模态）均已核验；[Dify](https://github.com/langgenius/dify) 官方文档确认 HTTP Request 节点可调用外部 API，因此「智能体 → HTTP → MQTT 网关 → 设备」路径可行。
4. **云平台链路**：[EMQX](https://github.com/emqx/emqx)（16.5k 星）、[Node-RED](https://github.com/node-red/node-red)（23.5k 星）、[农业岛](https://github.com/roinli/HUIZHI-nongyeOS-cloud) 智慧农业平台（347 星，Java+Vue+Uni-app，支持 MQTT/EMQX）均已核验；[OneNET](https://open.iot.10086.cn) 为中国移动免费物联网平台，教程量大。
5. **已知约束（写进风险）**：ESP32-CAM 算力有限，边缘推理只跑轻量模型，初期视觉走云端；司农 32B 本地部署需要较高显存，初期用 8B 或 DeepSeek API 替代。

## 6. 开源项目清单（已逐项核验）

> 核验方式：2026-08-07 通过 GitHub API 查询仓库全名、star 数、最近推送、是否归档；模型与数据集通过官方渠道与多家媒体报道交叉确认。

### 6.1 硬件/温室整机（STM32 侧）
- [zhujiu39/stm32-flower-greenhouse](https://github.com/zhujiu39/stm32-flower-greenhouse)（2026-06 更新，0 星，已核验）：STM32F103C8T6 花卉温室，OLED+继电器自动控制+ESP8266 MQTT+ThingsCloud，与现有 SmartAgriculture 几乎同构。
- [cz0729zc/smart-orchard-irrigation-system](https://github.com/cz0729zc/smart-orchard-irrigation-system)（26 星，已核验）：STM32+ESP8266 果园灌溉，土壤/光照/温湿度、自动灌溉、驱鸟、LED 补光、APP 远程控制，功能面最全。
- [mcu-coder/stm32_environmental_monitoring](https://github.com/mcu-coder/stm32_environmental_monitoring)（20 星，已核验）：农业大棚环境监测系统（毕业设计案例）。
- [lidonghang-02/greenhouse_control_system](https://github.com/lidonghang-02/greenhouse_control_system)（13 星，已核验）：基于 STM32 的温室控制系统。

### 6.2 病虫害检测（视觉组）
- [pratikkayal/PlantDoc-Dataset](https://github.com/pratikkayal/PlantDoc-Dataset)（427 星，已核验）：PlantDoc 官方数据集仓库（CODS-COMAD 2020 论文配套）。
- PlantVillage 数据集（Kaggle [abdallahalidev/plantvillage-dataset](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)，已核验）：5 万+ 叶片图、38 类。
- [ajinkyapawar11/yolov8-crop-disease-monitoring](https://github.com/ajinkyapawar11/yolov8-crop-disease-monitoring)（0 星，2025-07 更新，已核验）：YOLOv8 温室作物病害实时检测（菠菜/生菜/白菜），场景最接近，作架构参考。
- [SHN2004/Plant_Disease_Detection](https://github.com/SHN2004/Plant_Disease_Detection)（9 星，已核验）：ESP32-CAM + 深度学习实时植物病害检测全链路。
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
- [langgenius/dify](https://github.com/langgenius/dify)（151k 星，已核验）：开源智能体/工作流平台，官方文档确认 HTTP Request 节点可调外部 API（设备控制通道）。
- [infiniflow/ragflow](https://github.com/infiniflow/ragflow)（87k 星，已核验）：开源 RAG 引擎，知识库问答底座。
- [ultralytics/ultralytics](https://github.com/ultralytics/ultralytics)（60k 星，已核验）：YOLOv8/YOLO11 框架。

### 6.5 云平台 / 小程序 / 可视化
- [roinli/HUIZHI-nongyeOS-cloud](https://github.com/roinli/HUIZHI-nongyeOS-cloud)（农业岛，347 星，已核验）：Java+Vue+Uni-app 完整开源农业物联网平台，温棚监控/设备控制/大屏/小程序全有，可二开。
- [CJL-build/-](https://github.com/CJL-build/-)（4 星，已核验）：完整 IoT 项目（Vue 网页+微信小程序+SpringBoot 后端+硬件），含"湿度+温度+光照综合判断自动浇水"逻辑。
- [node-red/node-red](https://github.com/node-red/node-red)（23.5k 星，已核验）：MQTT 数据可视化低代码工具。
- [emqx/emqx](https://github.com/emqx/emqx)（16.5k 星，已核验）：MQTT Broker。
- [OneNET](https://open.iot.10086.cn)（中国移动物联网开放平台，已核验）：免费云平台，STM32+ESP8266 接入教程量大。

## 7. 硬件清单

| 器件 | 用途 |
|---|---|
| STM32F103C8T6 核心板 | 主控 |
| BH1750 光照传感器 | 光照采集（I2C） |
| DHT11 温湿度传感器 | 空气温湿度采集 |
| 土壤湿度传感器 | 土壤水分采集（ADC） |
| OLED 显示屏 | 本地数据显示 |
| W25Q64 Flash | 数据日志存储（SPI） |
| ESP8266-01S | Wi-Fi 上云（AT/MQTT） |
| ESP32-CAM | 病害/生长拍照与轻量识别 |
| 继电器模块 | 设备开关控制 |
| 水泵 | 浇水 |
| 蠕动泵 | 施肥/给药 |
| 风扇 | 通风降温 |
| 加热片 | 低温补偿 |
| 补光灯 | 光照补充（PWM 调光） |
| 舵机 ×2（可选） | 喷药两轴云台 |

## 8. 里程碑计划（约 6 个月，最完整成熟预设）

| 阶段 | 时间 | 内容 | 验收点 |
|---|---|---|---|
| M0 开题 | 第 1—2 周 | 链路定稿、软件环境搭建（Python/Dify/YOLO） | 开题汇报通过 |
| M1 感知-控制闭环 | 第 3—6 周 | 传感器采集→OLED→继电器→串口帧协议→LabVIEW 上位机 | 本地闭环运行，数据帧正确，远程手动可控 |
| M2 上云+日志 | 第 7—10 周 | ESP8266 MQTT→EMQX/OneNET→Node-RED 可视化；W25Q64 日志 | 云平台实时曲线、断网日志完整可补传 |
| M3 视觉检测 | 第 11—18 周 | 公开集+自采数据训练 YOLO（先 5 类常见病）→云端推理→触发喷药 | 检测准确率 ≥85%，喷药动作联动 |
| M4 智能体决策 | 第 19—23 周 | Dify 搭智能体+RAG 知识库→综合决策→指令闭环→小程序 | 自然语言指令自动执行，误操作有兜底 |
| M5 作品化 | 第 24 周 | 外壳/文档/演示视频/说明书/答辩材料 | 可提交参赛 |

## 9. 创新点与参赛叙事

1. **智能体闭环决策**：大模型直接输出设备动作指令，不只停留在问答层。
2. **边缘-云协同**：断网时本地规则独立运行，联网后云端智能体接管；本地规则永远优先，误操作有兜底。
3. **低成本**：硬件总成本低，农户可负担，便于推广。
4. **全周期数字档案**：从种子到收获持续记录传感器与视觉数据，形成可追溯的生长档案。

叙事主线：链路从底层硬件到智能决策全部自研，「感知—决策—执行」闭环是它与纯软件 AI 项目的主要区别。

## 10. 风险与应对

| 风险 | 应对 |
|---|---|
| 视觉识别数据不足/效果差 | 公开数据集预训练 + 自采微调；范围先缩到 3—5 类常见病害 |
| ESP32-CAM 边缘算力不足 | 初期视觉推理放云端，边缘只拍照上传；后期再试轻量模型 |
| 司农本地部署显存要求高 | 先用 8B 或 DeepSeek API（现有），作品后期再本地化 |
| 智能体误操作 | 本地规则优先、指令白名单、关键动作人工确认模式 |
| 网络不稳定 | 本地阈值模式 + W25Q64 日志补传 |
| 时间不足 | 裁剪顺序：合并施肥/给药、生长分析降级为拍照+周报、小程序用农业岛二开 |

## 11. 学习任务对齐表（当前学习 ↔ 项目模块）

| 当前学习内容 | 项目落点 |
|---|---|
| I2C（进行中） | BH1750 光照驱动（顺带修复 SmartAgriculture 推挽 bug） |
| SPI（进行中） | W25Q64 数据日志 |
| DMA + 串口文本包 | 数据帧收发、DMA 不定长接收 |
| 定时器 PWM / PID | 补光灯调光、温控、泵流量调节 |
| LabVIEW UDP/TCP | 本地调试上位机（AA55 协议） |
| 新增：Python/OpenCV/YOLO | 病害检测、生长分析 |
| 新增：Dify/Coze + RAG | 智能体决策层 |

## 12. 下一步（本周）

- [ ] 搭建 Python + YOLOv8 环境，用 PlantDoc 数据集跑通识别 demo
- [ ] 注册 EMQX/OneNET + Dify 账号，跑通 MQTT 收发
- [ ] 整理 SmartAgriculture 现有代码，启动 M1 感知-控制闭环
