@echo off
chcp 65001 >nul

echo ===================================
echo   TCM Records 系统启动脚本
echo ===================================
echo.

REM 检查是否在正确的目录
if not exist "backend\main.py" (
    echo 错误: 未找到后端文件，请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo 错误: 未找到前端文件，请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [1/4] 启动后端服务器...
echo 正在启动 FastAPI 后端服务 (端口 8000)...
cd backend
start "TCM Backend" cmd /k "python main.py"
cd ..

echo.
echo [2/4] 等待后端服务启动...
timeout /t 5 /nobreak > nul

echo [3/4] 启动前端开发服务器...
echo 正在启动 Vue.js 前端服务 (端口 5173)...
cd frontend
start "TCM Frontend" cmd /k "npm run dev"
cd ..

echo.
echo [4/4] 等待前端服务启动...
timeout /t 8 /nobreak > nul

echo.
echo ===================================
echo   🎉 TCM Records 系统启动完成!
echo ===================================
echo.
echo 📱 前端应用: http://localhost:5173
echo 🔧 后端API:  http://localhost:8000
echo 📚 API文档:  http://localhost:8000/docs
echo.
echo 正在打开前端应用...
timeout /t 2 /nobreak > nul
start "" "http://localhost:5173"

echo.
echo 💡 按任意键退出此窗口...
pause > nul
