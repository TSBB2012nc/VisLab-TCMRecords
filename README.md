# Vis for TCMRecords 中医病案可视化

![Vue](https://img.shields.io/badge/Vue-3.5.12-brightgreen)
![D3](https://img.shields.io/badge/D3.js-7.9.0-orange)

基于Vue3 + D3.js构建的中医病案可视化分析界面

当前实现基础功能

## 核心功能

### 📊 多维数据可视化
1. **用药河流图**  
   - 使用D3.js堆叠布局呈现药材使用频率时序变化
   - 药材名称标签防重叠算法
   - TODO: 时间轴缩放/拖拽交互/悬浮显示/标签联动

2. **生理指标折线图**  
   - 虚线辅助线

3. **中药UMAP散点图**  
   - 基于药物四气五味特征/对应症状特征降维绘制散点图
   - TODO: 交互
   - TODO: 完善症状降维的基础坐标
   - 多病案的降维图对比
   - 
### 📂 数据处理
- 切换患者数据

## 数据格式
数据存储于`public/data/`目录
