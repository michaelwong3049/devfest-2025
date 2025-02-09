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

load_dotenv(dotenv_path="backend/.env.local")

logger = logging.getLogger("my-worker")
logger.setLevel(logging.INFO)


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()

    run_multimodal_agent(ctx, participant)

    logger.info("agent started")


def run_multimodal_agent(ctx: JobContext, participant: rtc.RemoteParticipant):
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
    agent.start(ctx.room, participant)

    session = model.sessions[0]
    session.conversation.item.create(
        llm.ChatMessage(role="assistant", content=WELCOME_MESSAGE)
    )
    session.response.create()

    # to enable the agent to speak first
    agent.generate_reply()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
