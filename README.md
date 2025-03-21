# Vis for TCMFormulas 中医病案可视化

![Vue](https://img.shields.io/badge/Vue-3.5.12-brightgreen)
![D3](https://img.shields.io/badge/D3.js-7.9.0-orange)

基于Vue3 + D3.js构建的中医病案可视化分析界面

## 核心功能

### 📊 多维数据可视化
1. **时间用药河流图**  
   - 使用D3.js堆叠布局呈现药材使用频率时序变化
   - 支持时间轴缩放/拖拽交互
   - 药材名称动态标签防重叠算法

2. **生理指标折线图**  
   - D3.js线性比例尺与路径生成器
   - 多指标切换（脉象/血压/舌象编码）
   - 异常值标注与趋势预测辅助线

3. **药性UMAP散点图**  
   - D3力导向模拟实现动态投影
   - 基于药性（寒热温凉）的颜色编码系统
   - 点击筛选关联病例

### 📂 数据预处理
- 

## 数据格式
数据存储于`public/data/`目录：


## 使用指南

### 在线访问
直接访问GitHub Pages部署版本：  
[https://yourusername.github.io/Vis-for-TCMFormulas](https://yourusername.github.io/Vis-for-TCMFormulas)

### 本地运行
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

