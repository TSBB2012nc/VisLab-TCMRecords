#!/usr/bin/env python3
"""
TCM Records Backend Server
运行脚本
"""

import subprocess
import sys
from pathlib import Path

def install_requirements():
    """安装依赖包"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    if requirements_file.exists():
        print("Installing requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
        print("Requirements installed successfully!")
    else:
        print("requirements.txt not found!")

def run_server():
    """运行服务器"""
    try:
        import uvicorn
        print("Starting TCM Records API server...")
        print("API will be available at: http://localhost:8000")
        print("API documentation at: http://localhost:8000/docs")
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except ImportError:
        print("uvicorn not installed. Installing requirements first...")
        install_requirements()
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    run_server()
