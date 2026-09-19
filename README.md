# 校园助手

基于 HTML + CSS + JavaScript 的校园服务整合站点，包含自习室查询、使用量统计图表与三维校园导览四个模块。

## 项目简介

- **首页**：功能入口总览，Bootstrap 卡片墙
- **自习室**：9 间自习室数据，按楼层 / 开放状态即时筛选（事件委托 + state 驱动）
- **统计**：通过 `fetch` 加载本地 JSON，使用 Chart.js 渲染各自习室本周使用量柱状图，含加载中 / 暂无数据 / 加载失败三态处理
- **校园三维**：A-Frame 声明式校园场景（教学楼、旗杆、路灯），支持拖拽旋转视角与 WASD 移动

## 运行方法

**必须通过本地 HTTP 服务器访问，不能直接双击 HTML 打开。** 原因：统计页使用 `fetch` 读取本地 `data/data.json`，浏览器在 `file://` 协议下会拦截该请求，导致加载失败。

推荐方式：

1. 用 VS Code 打开本仓库根目录
2. 安装 **Live Server** 插件
3. 右键 `index.html` → **Open with Live Server**
4. 访问 `http://127.0.0.1:5500/index.html`

或使用任意静态服务器（如 `python -m http.server`）指向仓库根目录后访问 `index.html`。

## 目录说明

```
README/
├── index.html              # 首页（功能入口卡片）
├── study.html              # 自习室列表与筛选
├── stats.html              # 统计图表
├── css/
│   └── style.css           # 全站自定义样式
├── js/
│   ├── study.js            # 自习室筛选逻辑（数据写死在数组中）
│   └── stats.js            # 图表加载与渲染（jQuery + Chart.js）
├── data/
│   └── data.json           # 各自习室本周使用量数据
├── three-d/
│   ├── scene.html          # 校园三维导览场景
│   └── libs/
│       └── aframe.min.js   # A-Frame 运行库
├── libs/                   # jQuery / Chart.js / Bootstrap 本地库
└── docs/
    └── selfcheck/          # 自查截图（三档宽度、错误状态、Console）
```

## 数据与资源来源

- 自习室数据：写死在 `js/study.js` 的 `rooms` 数组中（模拟数据）
- 统计数据：`data/data.json`，模拟校园门禁刷卡统计
- 三维场景：A-Frame 原生几何体（box / cylinder / sphere / plane）搭建，无外部模型资源

## 第三方代码与素材

| 库 | 版本 | 许可 | 来源 |
|---|---|---|---|
| Bootstrap | 5.3.3 | MIT | <https://getbootstrap.com/>（CDN + 本地 bundle） |
| jQuery | 3.7.1 | MIT | <https://jquery.com/>（本地 `libs/jquery-3.7.1.min.js`） |
| Chart.js | 4.x | MIT | <https://www.chartjs.org/>（本地 `libs/chart.umd.js`） |
| A-Frame | 1.8.0 | MIT | <https://aframe.io/>（本地 `three-d/libs/aframe.min.js`） |

所有第三方库均通过 CDN 或本地文件引入，未修改源码。
