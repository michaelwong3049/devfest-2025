from flask import Flask, request, jsonify
from code_interpreter import interpret_code

app = Flask(__name__) # creates a new Flask app

@app.route("/interpret", methods=["POST"]) # initializes a route for the interpret function in the frontend

def interpret():
    data = request.get_json() # gets the json data from the frontend
    user_code = data["user_code"]
    test_cases = data["test_cases"] 

    if not test_cases or not user_code:
        return jsonify({"error": "Missing user code or test cases"})
    
    results = interpret_code(user_code, test_cases) # uses the interpret_code function through an API endpoint to call run the tests through the frontend
    return jsonify(results) # turns the results into json for the frontend to easily read

if __name__ == "__main__":
    app.run(debug=True) # runs the app in debug mode