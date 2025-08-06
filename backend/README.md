# TCM Records Backend API

中医记录数据分析系统后端API服务

## 功能特性

- ✅ 患者数据管理和查询
- ✅ 中药信息查询和搜索
- ✅ 患者时间线数据分析
- ✅ 统计数据分析
- ✅ 可视化数据支持
- ✅ RESTful API接口
- ✅ 自动数据缓存优化
- ✅ CORS跨域支持

## API 接口

### 基础接口
- `GET /` - 根路径信息
- `GET /api/health` - 健康检查
- `GET /docs` - API文档（Swagger UI）

### 患者数据接口
- `GET /api/patients` - 获取患者概览列表
- `GET /api/patient/{patient_id}` - 获取特定患者详细记录
- `GET /api/patient/{patient_id}/timeline` - 获取患者时间线数据

### 药物数据接口
- `GET /api/medicines` - 获取所有药物信息
- `GET /api/medicine/{medicine_name}` - 获取特定药物详细信息

### 可视化数据接口
- `GET /api/vis/attr-locations` - 获取属性位置数据
- `GET /api/vis/colors` - 获取可视化颜色配置

### 统计分析接口
- `GET /api/statistics/overview` - 获取统计概览
- `GET /api/statistics/medicines` - 获取药物使用统计

### 搜索接口
- `GET /api/search/patients` - 搜索患者（支持关键词、性别、亚组筛选）
- `GET /api/search/medicines` - 搜索药物（支持关键词、分类筛选）

## 安装和运行

### 方式1：直接运行
```bash
# 进入backend目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 运行服务器
python main.py
```

### 方式2：使用运行脚本
```bash
# 进入backend目录
cd backend

# 运行脚本（会自动安装依赖）
python run.py
```

服务器启动后会在以下地址提供服务：
- API服务：http://localhost:8000
- API文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/api/health

## 数据结构

### 患者数据 (overview.csv)
- PID: 患者ID
- 性别: 患者性别
- 病理: 病理诊断
- Oxford分型: Oxford分型信息
- 亚组: 患者亚组分类

### 患者详细记录 (patient/*.json)
每个患者的详细就诊记录，包含：
- date: 就诊日期
- metrics: 检验指标（肌酐、蛋白量、蛋白定性、血尿定性）
- scripts: 处方药物及用量
- 味数: 药物种类数
- 剂数: 剂量数
- 频次: 服药频次
- 途径: 给药途径

### 药物数据 (med_data/med_data.json)
药物详细信息：
- 性味归经: 中医药性理论
- 功效: 药物功效
- 主治: 主要治疗疾病
- 教材分类: 教材中的分类
- 名医对于药物的用法: 专家用法
- 专家分类: 专家分类方式

### 可视化数据 (vis_utils/)
- attr_loc.json: 属性位置坐标
- book_color.json: 书籍颜色配置
- exp_color.json: 实验颜色配置
- symp_loc.json: 症状位置配置

## 技术栈

- **FastAPI**: 现代、快速的Web框架
- **Pandas**: 数据处理和分析
- **Uvicorn**: ASGI服务器
- **Pydantic**: 数据验证和序列化

## 开发说明

### 性能优化
- 启动时预加载常用数据到内存缓存
- 支持增量数据加载
- 异步处理支持

### 错误处理
- 完整的异常捕获和处理
- 详细的错误日志记录
- 友好的错误响应格式

### 扩展支持
- 模块化设计，易于扩展新功能
- 标准的RESTful API设计
- 完整的API文档支持
