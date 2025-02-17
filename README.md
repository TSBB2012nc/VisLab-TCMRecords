# Vis for TCMFormulas 中医病案可视化
## 项目架构

- Client: 交付给中医医生的即点即用的exe文件
  - backend: 使用flask编写API后端处理
    - 读取Storage下的csv,json文件
    - 执行用户更新并更新Storage下相应文件
  - frontend: vite+vue3+d3实现前端可视化与数据管理
- Static: 部署在github pages上展示用的静态页面
  - 基本与Client/frontend相同
- Storage: 与exe同级的文件管理目录

## 关键功能
### 1. 病案数据管理
- 病人每次诊断并开药方的数据（一张表）
- 经验中草药性质的表格数据（一张表）
- 增删改查
### 2. 病案用药可视分析
- 时间用药河流图
- 生理指标折线图
- UMAP降维散点图
- 根据中草药的性质规定颜色（用户可修改）

