# TCM Records Visualization Lab

传统中医病历可视化系统 - 用于中医病历数据的交互式可视化分析平台。

## 🌟 系统特性

- **📊 多维可视化**: 河流图、折线图、地图、表格等多种可视化方式
- **👥 患者管理**: 患者数据查看和时间线分析
- **💊 药物分析**: 中药使用统计和分类可视化
- **🔍 智能搜索**: 患者和药物的快速检索功能
- **📈 统计分析**: 数据统计和趋势分析
- **🎨 响应式设计**: 支持多种屏幕尺寸的响应式布局

## 🛠️ 技术栈

### 前端
- **Vue.js 3** - 现代化前端框架
- **Element Plus** - UI组件库
- **D3.js** - 数据可视化库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具

### 后端
- **FastAPI** - 高性能Web框架
- **Python 3.8+** - 后端开发语言
- **Pandas** - 数据处理
- **Uvicorn** - ASGI服务器

## 🚀 快速开始

### 方式一：使用启动脚本（推荐）

**Windows:**
```bash
# 双击运行或在命令行中执行
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

1. **安装依赖**
   ```bash
   # 后端依赖
   cd backend
   pip install -r requirements.txt
   
   # 前端依赖
   cd ../frontend
   npm install
   ```

2. **启动后端服务**
   ```bash
   cd backend
   python main.py
   ```

3. **启动前端服务**
   ```bash
   cd frontend
   npm run dev
   ```

### 访问地址

- 🌐 **前端应用**: [http://localhost:5173](http://localhost:5173)
- 🔧 **后端API**: [http://localhost:8000](http://localhost:8000)
- 📚 **API文档**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📁 项目结构

```
VisLab-TCMRecords/
├── 📁 frontend/                 # 前端应用
│   ├── 📁 src/
│   │   ├── 📁 components/       # Vue组件
│   │   ├── 📁 services/         # API服务
│   │   ├── 📁 stores/           # 状态管理
│   │   ├── 📁 router/           # 路由配置
│   │   └── 📁 utils/            # 工具函数
│   ├── package.json
│   ├── vite.config.ts           # Vite配置
│   ├── .env.development         # 开发环境变量
│   └── .env.production          # 生产环境变量
├── 📁 backend/                  # 后端API
│   ├── main.py                  # FastAPI应用
│   ├── run.py                   # 开发启动脚本
│   └── requirements.txt         # Python依赖
├── 📁 data/                     # 数据文件
│   ├── 📁 patient/             # 患者数据
│   ├── 📁 med_data/            # 药物数据
│   └── 📁 vis_utils/           # 可视化配置
├── config.json                 # 项目配置
├── start.bat                   # Windows启动脚本
├── start.sh                    # Linux/Mac启动脚本
└── README.md
```

## 📖 功能说明

### 主要功能模块

1. **患者数据视图**
   - 患者列表浏览
   - 患者详细信息查看
   - 诊疗时间线分析

2. **数据可视化**
   - **河流图**: 展示用药变化趋势
   - **折线图**: 显示指标变化
   - **表格视图**: 详细数据展示
   - **地图视图**: 药物分布可视化

3. **搜索与筛选**
   - 患者信息搜索
   - 药物信息查询
   - 多维度数据筛选

### API接口

主要API端点：
- `GET /api/patients` - 获取患者列表
- `GET /api/patient/{id}` - 获取患者详情
- `GET /api/patient/{id}/timeline` - 获取患者时间线
- `GET /api/medicines` - 获取药物信息
- `GET /api/vis/colors` - 获取可视化配置
- `GET /api/statistics/overview` - 获取统计概览

完整API文档请访问：[http://localhost:8000/docs](http://localhost:8000/docs)

## ⚙️ 配置说明

### 环境变量

**开发环境** (`.env.development`):
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=TCM Records Visualization Lab
VITE_DEV_MODE=true
```

**生产环境** (`.env.production`):
```env
VITE_API_BASE_URL=/api
VITE_DEV_MODE=false
```

### 项目配置

详细配置请参考 `config.json` 文件，包含：
- 服务端口配置
- 可视化参数
- 功能开关
- 主题配色

## 🔧 开发指南

### 开发环境要求

- **Node.js**: 16.0+
- **Python**: 3.8+
- **npm**: 8.0+

### 代码规范

- 前端使用 ESLint + Prettier
- 后端遵循 PEP 8 规范
- 组件命名采用 PascalCase
- 函数命名采用 camelCase

### 构建部署

```bash
# 构建前端
cd frontend
npm run build

# 后端部署
cd backend
pip install -r requirements.txt
python main.py
```

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 完成基础可视化功能
- ✅ 实现患者数据管理
- ✅ 添加药物分析模块
- ✅ 优化用户界面体验
- ✅ 统一项目配置管理

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 👥 开发团队

VisLab Team - 北京大学医学部

---

如有问题或建议，请通过 GitHub Issues 联系我们。
