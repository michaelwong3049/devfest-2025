from __future__ import annotations

import logging

from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.multimodal import MultimodalAgent
from livekit.plugins import openai

from prompts import INSTRUCTIONS, WELCOME_MESSAGE
from assistant import AssistantFnc

from dotenv import load_dotenv

import os

load_dotenv(dotenv_path="backend/.env.local")

logger = logging.getLogger("my-worker")
logger.setLevel(logging.INFO)

print("Starting script...")
print("Current working directory:", os.getcwd())

# Try loading the env file with verbose output
print("Attempting to load .env file...")
env_path = ".env.local"  # Since you're already in the backend directory
result = load_dotenv(dotenv_path=env_path, verbose=True)
print("Load_dotenv result:", result)

# Print all environment variables (don't share this output if it contains sensitive info)
print("Environment variables:", {k: v for k, v in os.environ.items() if "KEY" in k})


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    await ctx.wait_for_participant()

    run_multimodal_agent(ctx)

    logger.info("agent started")


def run_multimodal_agent(ctx: JobContext):
    logger.info("starting multimodal agent")

    model = openai.realtime.RealtimeModel(
        instructions=INSTRUCTIONS,
        modalities=["audio", "text"],
    )

    # create a chat context with chat history, these will be synchronized with the server
    # upon session establishment
    assistant_fnc = AssistantFnc()

    agent = MultimodalAgent(
        model=model,
        fnc_ctx=assistant_fnc,
    )
    agent.start(ctx.room)

    session = model.sessions[0]
    session.conversation.item.create(
        llm.ChatMessage(role="assistant", content=WELCOME_MESSAGE)
    )
    session.response.create()

    # to enable the agent to speak first
    # agent.generate_reply()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
