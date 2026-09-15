import os
import json
import traceback
from pathlib import Path

import nest_asyncio
nest_asyncio.apply()

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from backend import run_travel_agent, stream_travel_agent

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="TripMate AI",
    description="Multi-Agent Travel Planner with LangGraph, Groq, and Perplexity-style Streaming",
    version="1.1.0",
)

# Enable CORS for local testing & integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static & template directories
static_dir = BASE_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

class TravelRequest(BaseModel):
    message: str
    thread_id: str | None = None

@app.get("/", response_class=HTMLResponse)
@app.get("/dossier", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )

@app.post("/api/travel")
async def travel_planner(request_data: TravelRequest):
    """Synchronous JSON endpoint for running travel planner agents."""
    try:
        user_message = request_data.message.strip()
        if not user_message:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Message cannot be empty."}
            )

        result = run_travel_agent(
            user_input=user_message,
            thread_id=request_data.thread_id
        )
        return JSONResponse(
            content={
                "success": True,
                "thread_id": result["thread_id"],
                "answer": result["answer"],
                "flight_results": result["flight_results"],
                "hotel_results": result["hotel_results"],
                "weather_results": result["weather_results"],
                "itinerary": result["itinerary"],
                "llm_calls": result["llm_calls"],
            }
        )
    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.post("/api/travel/stream")
async def travel_planner_stream(request_data: TravelRequest):
    """Perplexity-style real-time SSE streaming with thinking, sources, and astream tokens."""
    user_message = request_data.message.strip()
    if not user_message:
        async def empty_error():
            yield f"data: {json.dumps({'type': 'error', 'error': 'Message cannot be empty.'})}\n\n"
        return StreamingResponse(empty_error(), media_type="text/event-stream")

    async def events():
        try:
            async for event in stream_travel_agent(user_message, request_data.thread_id):
                yield f"data: {json.dumps(event, default=str)}\n\n"
        except Exception as error:
            print("STREAM ERROR:", error)
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'error': str(error)})}\n\n"

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "TripMate AI Travel Planner is running",
        "token_limit": 8000,
        "streaming": True,
    }

@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={})

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3000"))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
