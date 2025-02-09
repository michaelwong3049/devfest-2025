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
# print("GROQ_API_KEY:", os.getenv("GROQ_API_KEY"))
# print("LIVEKIT API KEY:", os.getenv("LIVEKIT_API_KEY"))


class AssistantFnc(llm.FunctionContext):
    def __init__(self):
        super().__init__()
        self._question = ""
        self._user_code = ""
        self._client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    @llm.ai_callable(description="Get the current question")
    def get_question(self):
        """Called when the user asks for the current question"""
        return self._question

    def set_question(self, new_question: str):
        self._question = new_question

    @llm.ai_callable(description="Get the user's current code")
    def get_user_code(self):
        """Called when you need to access the code of the user"""
        return self._user_code

    def set_user_code(self, new_code: str):
        self._user_code = new_code

    @llm.ai_callable()
    async def search(
        self, query: Annotated[str, llm.TypeInfo(description="The search query")]
    ):
        """Called when the user asks to search for something"""
        return "Binary search"

    @llm.ai_callable(description="Create a hint for the user")
    async def generate_hint(
        self,
        user_code: Annotated[
            str,
            llm.TypeInfo(
                description="The user's current code inside of the editor for the question."
            ),
        ],
    ):
        """Called when the user asks for a hint or for help. This function will return some hint or form of guidance to the user."""
        logger.info(f"getting hint for {user_code}")
        try:
            # get hint for user code
            chat_completion = await self._client.chat.completions.create(
                messages=[
                    {
                        "role": "assistant",
                        "content": "You are an AI Agent acting as a mock interviewer. You have deep experience in data structures and algorithms and are skilled in core problem-solving techniques. Your goal is to help the interviewee solve problems and find working solutions without giving too much help. Provide hints and guidance as needed, but encourage the interviewee to think critically and work through the problems independently. Follow standard guidelines for creating a supportive and challenging interview environment. The user will send you a code snippet. Your job is to guide them. Do not give them too much information.",
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
