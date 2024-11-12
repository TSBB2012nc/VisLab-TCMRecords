from flask import Flask, jsonify

app = Flask(__name__)

# 创建测试路由，前端将会访问此接口测试连通性
@app.route('/test', methods=['GET'])
def test():
    return jsonify(message="Hello from Flask NEW!")

if __name__ == '__main__':
    app.run(port=5000, debug=True)
