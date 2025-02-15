"""
main app
"""

import json
import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

from entities import *
from process_new_data import *

def get_storage_path():
    """
    get current storage path
    """
    # 判断是否打包环境
    if getattr(sys, 'frozen', False):
        base_path = os.path.dirname(sys.executable)  # exe所在目录
    else:
        base_path = os.getcwd()
    
    storage_path = os.path.join(base_path, 'Storage')
    # os.makedirs(storage_path, exist_ok=True)  # 自动创建目录
    return storage_path

SYS_PATH = get_storage_path()

# initialization
def initialize():
    """
    读取系统初始状态
    """
    with open(f'{SYS_PATH}/sys_info.json', 'r', encoding='utf-8') as f:
        info = json.load(f)
    if info['new']:
        process_new_data(SYS_PATH)
    return info

# Initialize system info
sys_info = initialize()
while sys_info['new']:
    print("处理新数据")
    sys_info = initialize()



app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def handle_upload():
    """
    上传文件
    """
    storage_path = get_storage_path()
    file = request.files['file']
    upload_path = os.path.join(storage_path, 'uploads')
    os.makedirs(upload_path, exist_ok=True)
    file.save(os.path.join(upload_path, file.filename))
    return jsonify({'status': 'success'})

@app.route("/", methods=['GET'])
def index():
    """
    API index, show storage path
    """
    return f"Storage path: {SYS_PATH}"


@app.route('/patient/<path:pid>', methods=['GET'])
def get_patient_data(pid) -> json:
    """get patient data

    Args:
        pid (_type_): patient id, starts from 1

    Returns:
        json: {info:[{}, {},...], vistis:[{}, ...]}
    """
    if pid:
        with open(f'data/patient/patient{pid}.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify(data)
    else:
        return jsonify({"error": "Invalid filename"}), 400

@app.route('/table', methods=['GET'])
def get_table():
    with open('data/herb/Table.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        return jsonify(data)


if __name__ == '__main__':
    app.run(port=5000, debug=True)
