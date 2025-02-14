from flask import Flask, jsonify
import json
app = Flask(__name__)

# 创建测试路由，前端将会访问此接口测试连通性
@app.route('/test', methods=['GET'])
def test():
    return jsonify(message="Hello from Flask NEW!")

@app.route('/patient/<path:pid>', methods=['GET'])
def get_data(pid):
    if pid:
        with open(f'data/patient/patient{pid}_visit.json', 'r', encoding='utf-8') as f:
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
