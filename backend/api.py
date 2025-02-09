import logging
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from code_interpreter import app, interpret_code

flask_app = Flask(__name__)
CORS(flask_app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default ports
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@flask_app.route('/interpret', methods=['GET'])
@cross_origin(support_credentials=True)
def index():
  return jsonify({ "hello": " Hello, World!"})

# with app.run():
@flask_app.route('/interpret', methods=['POST'])
@cross_origin(support_credentials=True)
def interpret():
  data = request.get_json()
  user_code = data.get('user_code')
  test_cases = data.get('test_cases')

  if not user_code or not test_cases:
    return jsonify({"error": "Invalid input"}), 400

  with app.run() as modal_context:
    results = interpret_code.remote(user_code, test_cases)
    return jsonify(results)

if __name__ == '__main__':
    flask_app.run(host="localhost", port=5000, debug=True)
