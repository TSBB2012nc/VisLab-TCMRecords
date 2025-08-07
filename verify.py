#!/usr/bin/env python3
"""
快速验证脚本 - 检查TCM Records系统是否正常运行
"""

import requests
import sys
import time
from datetime import datetime

def print_status(message, status="info"):
    """打印状态信息"""
    icons = {
        "info": "ℹ️",
        "success": "✅", 
        "error": "❌",
        "warning": "⚠️"
    }
    icon = icons.get(status, "ℹ️")
    print(f"{icon} {message}")

def check_service(name, url, timeout=5):
    """检查服务是否可用"""
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            print_status(f"{name} 服务正常 - {url}", "success")
            return True
        else:
            print_status(f"{name} 服务异常 - 状态码: {response.status_code}", "error")
            return False
    except requests.exceptions.ConnectionError:
        print_status(f"{name} 服务未启动 - {url}", "error")
        return False
    except Exception as e:
        print_status(f"{name} 服务检查失败 - {str(e)}", "error")
        return False

def check_api_endpoints():
    """检查主要API端点"""
    base_url = "http://localhost:8000/api"
    endpoints = [
        ("健康检查", "/health"),
        ("患者列表", "/patients"),
        ("药物信息", "/medicines"),
        ("可视化配置", "/vis/colors"),
        ("统计概览", "/statistics/overview")
    ]
    
    success_count = 0
    for name, endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        if check_service(name, url):
            success_count += 1
        time.sleep(0.5)  # 避免请求过快
    
    return success_count, len(endpoints)

def main():
    """主函数"""
    print("=" * 60)
    print("🏥 TCM Records 系统状态检查")
    print("=" * 60)
    print(f"⏰ 检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 检查基础服务
    print("📋 基础服务检查:")
    backend_ok = check_service("后端API", "http://localhost:8000")
    frontend_ok = check_service("前端应用", "http://localhost:5173")
    
    print()
    
    if not backend_ok:
        print_status("后端服务未启动，请先启动后端服务", "error")
        print("💡 启动命令: cd backend && python run.py")
        return 1
    
    if not frontend_ok:
        print_status("前端服务未启动，请先启动前端服务", "warning")
        print("💡 启动命令: cd frontend && npm run dev")
    
    # 检查API端点
    print("🔧 API端点检查:")
    success_count, total_count = check_api_endpoints()
    
    print()
    print("=" * 60)
    print("📊 检查结果汇总:")
    print(f"✅ API端点正常: {success_count}/{total_count}")
    
    if backend_ok and success_count == total_count:
        print_status("系统运行正常，可以开始使用！", "success")
        print()
        print("🔗 快速访问链接:")
        print("   📱 前端应用: http://localhost:5173")
        print("   🔧 后端API:  http://localhost:8000")
        print("   📚 API文档:  http://localhost:8000/docs")
        return 0
    else:
        print_status("系统存在问题，请检查服务状态", "error")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n👋 检查中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 检查过程中出现错误: {e}")
        sys.exit(1)
