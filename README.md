# TCM Records 

中医肾病病案可视化



## 🚀 启动

### 方式一：使用启动脚本

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

2. **数据可视化**
   - **河流图**: 展示用药变化趋势
   - **折线图**: 显示指标变化
   - **表格视图**: 详细数据展示


### API接口

主要API端点：
- `GET /api/patients` - 获取患者列表
- `GET /api/patient/{id}` - 获取患者详情
- `GET /api/patient/{id}/timeline` - 获取患者时间线
- `GET /api/medicines` - 获取药物信息
- `GET /api/vis/colors` - 获取可视化配置
- `GET /api/statistics/overview` - 获取统计概览


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

