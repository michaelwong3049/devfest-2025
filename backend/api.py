from flask import Flask, request, jsonify
from flask_cors import CORS
from code_interpreter import interpret_code

app = Flask(__name__)
CORS(app)
# CORS(app, resources={
#     r"/*": {
#         "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
#         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#         "allow_headers": ["Content-Type", "Authorization"]
#     }
# })

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/interpret', methods=['POST'])
def interpret():
    data = request.json
    user_code = data.get('user_code')
    test_cases = data.get('test_cases')
    
    if not user_code or not test_cases:
        return jsonify({"error": "Invalid input"}), 400
    
    results = interpret_code(user_code, test_cases)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)