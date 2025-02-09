import os
from dotenv import load_dotenv
from assistant import AssistantFnc

load_dotenv(dotenv_path="backend/.env.local")

print("Starting script...")
print("Current working directory:", os.getcwd())

# Try loading the env file with verbose output
print("Attempting to load .env file...")
env_path = ".env.local"  # Since you're already in the backend directory
result = load_dotenv(dotenv_path=env_path, verbose=True)
print("Load_dotenv result:", result)

class Singleton:
    _instance = None

    @staticmethod
    def get_instance():
        if Singleton._instance is None:
            Singleton._instance = AssistantFnc()
        return Singleton._instance