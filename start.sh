#!/bin/bash

# TCM Records 项目启动脚本

echo "🏥 启动 TCM Records 可视化系统"
echo "=================================="

# 检查Python环境
if ! command -v python &> /dev/null; then
    echo "❌ Python 未安装或未在PATH中"
    exit 1
fi

# 检查Node.js环境  
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装或未在PATH中"
    exit 1
fi

# 启动后端服务
echo "🔧 启动后端服务 (端口 8000)..."
cd backend
python main.py &
BACKEND_PID=$!
echo "   后端服务 PID: $BACKEND_PID"

# 等待后端启动
sleep 3

# 启动前端服务
echo "🌐 启动前端服务 (端口 5173)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "   前端服务 PID: $FRONTEND_PID"

echo ""
echo "✅ 系统启动完成!"
echo "🔗 前端地址: http://localhost:5173"
echo "🔗 后端API: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
