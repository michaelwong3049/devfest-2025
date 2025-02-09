from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from code_interpreter import interpret_code

from flask_socketio import SocketIO, emit
from singleton import Singleton


app = Flask(__name__)
# cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
CORS(
    app,
    resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

socketio = SocketIO(app, cors_allowed_origins="*")
assistant_fnc = Singleton.get_instance()


@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")
    
@socketio.on("update_question")
def handle_update_question(data):
    question = data.get("question")
    print("Received updated question:", question)  # Optionally, store or process the question here.
    assistant_fnc.set_question(question)


@socketio.on("update_code")
def handle_update_code(data):
    code = data.get("code")
    print("Received updated code:", code)  # Optionally, store or process the code here.
    assistant_fnc.set_user_code(code)


@socketio.event
def connect():
    print("connected")
    emit("my_response", {"data": "Connected"})


@app.route("/")
def index():
    return "Hello, World!"


@app.route("/interpret", methods=["POST"])
@cross_origin()
def interpret():
    data = request.json
    print(data)
    user_code = data.get("user_code")
    test_cases = data.get("test_cases")

    if not user_code or not test_cases:
        return jsonify({"error": "Invalid input"}), 400

    results = interpret_code(user_code, test_cases)
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)
    socketio.run(app)
