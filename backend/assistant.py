from typing import Annotated

import os
from dotenv import load_dotenv
import logging
from groq import Groq
from livekit.agents import llm

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Load environment variables from .env.local file
load_dotenv()

# Debug print to check if the environment variable is loaded
print("GROQ_API_KEY:", os.getenv("GROQ_API_KEY"))
print("LIVEKIT API KEY:", os.getenv("LIVEKIT_API_KEY"))

class AssistantFnc(llm.FunctionContext):
    def __init__(self):
        super().__init__()
        self._user_code = """def binary_search(arr, target):"""
        self._client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def get_user_code(self):
        return self._user_code

    @llm.ai_callable()
    async def search(
        self, query: Annotated[str, llm.TypeInfo(description="The search query")]
    ):
        """Called when the user asks to search for something"""
        return f"searching for {query}"

    @llm.ai_callable()
    async def generate_hint(self):
        """Called when the user asks for a hint or for help"""
        user_code = self.get_user_code()
        logger.info(f"getting hint for {user_code}")
        try:
            # get hint for user code
            chat_completion = await self._client.chat.completions.create(
                messages=[
                    {
                        "role": "assistant",
                        "content": "You are an AI Agent acting as a mock interviewer. You have deep experience in data structures and algorithms and are skilled in core problem-solving techniques. Your goal is to help the interviewee solve problems and find working solutions without giving too much help. Provide hints and guidance as needed, but encourage the interviewee to think critically and work through the problems independently. Follow standard guidelines for creating a supportive and challenging interview environment. The user will send you a code snippet. Your job is to guide them.",
                    },
                    {
                        "role": "user",
                        "content": user_code,
                    },
                ],
                model="llama-3.3-70b-versatile",
            )
            print("chat_completion", chat_completion)
            print("result", chat_completion.choices[0].message.content)
            return chat_completion.choices[0].message.content
        except Exception as e:
            logging.error(f"Error getting hint: {e}")
            return f"Error getting hint: {e}"
