# Vis for TCMFormulas 中医病案可视化
## 项目架构

```text
├── client/                  # 客户端项目
│   ├── backend/             # Flask API服务
│   │   ├── data_cache/      # CSV缓存文件夹（自动生成）
│   │   ├── app.py           # 主API入口
│   ├── frontend/            # Vue前端
│   │   ├── public/          # 静态资源
│   │   ├── src/             # 源码目录
│   ├── build/               # 打包后的exe文件（最终产出）
│
├── site/             # 静态展示版本
│   ├── public/             
│   │   ├── dataset/         # 预置JSON数据
│   ├── src/                 # 与client共享的Vue组件
│
├── docs/                    # GitHub Pages部署目录
```

## TODO: MVP
### 1. 基础框架
- [ ] Flask API基础框架
  - [x] 文件上传接口
  - [ ] 文件转换函数
  - [ ] 文件管理
- [ ] Vue最小原型
  - [x] 上传组件
  - [ ] 表格组件
- [ ] 前后端联调
## 2. 核心功能
- [ ] 数据可视化模块
- [ ] 文件处理优化

## 3. Client打包
- [ ] 使用PyInstaller打包
- 隐藏控制台窗口（--noconsole）
- 资源路径配置
- 自包含执行环境
- 内置Python运行时（--onefile）

## 4. Github Pages部署
- [ ] 部署site
- [ ] 移除API调用