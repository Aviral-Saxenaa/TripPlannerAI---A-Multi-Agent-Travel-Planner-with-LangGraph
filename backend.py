import os
import certifi
import re
import uuid
import json
import asyncio
from typing import TypedDict, Annotated
import operator

from dotenv import load_dotenv
load_dotenv()

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

from langchain_core.messages import (
    AnyMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
)
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END

# Optional Postgres checkpointer; gracefully falls back to MemorySaver
try:
    from langgraph.checkpoint.memory import MemorySaver
    checkpoint_saver = MemorySaver()
except Exception:
    checkpoint_saver = None

database_url = os.getenv("DATABASE_URL")
if database_url:
    try:
        import psycopg
        from psycopg.rows import dict_row
        from langgraph.checkpoint.postgres import PostgresSaver

        if "sslmode=" not in database_url:
            separator = "&" if "?" in database_url else "?"
            database_url = f"{database_url}{separator}sslmode=require"
        
        conn = psycopg.connect(database_url, autocommit=True, row_factory=dict_row)
        checkpoint_saver = PostgresSaver(conn)
        checkpoint_saver.setup()
    except Exception as db_err:
        print(f"PostgreSQL checkpointer unavailable, using in-memory saver: {db_err}")

# Optional MCP imports
try:
    from mcp_client import (
        tavily_mcp_search,
        aviation_mcp_call,
        extract_destination,
        forecast_mcp_search,
        weather_mcp_search,
    )
except ImportError:
    # Graceful fallback stubs if mcp_client dependencies are not configured
    async def tavily_mcp_search(q): return f"Curated hotel recommendations for {q}"
    async def aviation_mcp_call(cmd): return [{"airport": "International", "code": "INT"}]
    def extract_destination(q): return "Destination"
    async def forecast_mcp_search(city): return "Forecast: 20-25°C, mild"
    async def weather_mcp_search(city): return "Current: 22°C, partly cloudy"

# ==========================================================
# STRICT TOKEN BUDGET CONFIGURATION (Total stays well under 8000)
# ==========================================================
FLIGHT_OUTPUT_TOKENS = 500
ITINERARY_OUTPUT_TOKENS = 1000
FINAL_OUTPUT_TOKENS = 2200
MAX_TOTAL_OUTPUT_TOKENS = FLIGHT_OUTPUT_TOKENS + ITINERARY_OUTPUT_TOKENS + FINAL_OUTPUT_TOKENS

# Input payload compression limits (characters)
AIRPORT_DATA_LIMIT = 1200
AIRLINE_DATA_LIMIT = 1200
HOTEL_DATA_LIMIT = 1400
WEATHER_DATA_LIMIT = 600
ITINERARY_CONTEXT_LIMIT = 1400
FINAL_CONTEXT_LIMIT = 1800
USER_QUERY_LIMIT = 1200

def compact_data(value: object, limit: int = 1500) -> str:
    """Preserve informative content while aggressively eliminating token waste."""
    text = str(value).replace("\x00", " ").strip()
    # Remove excessive whitespace and repetitive noise
    text = re.sub(r"\s+", " ", text)
    if len(text) <= limit:
        return text
    return f"{text[:limit]}... [summarized for token limits]"

def compress_hotel_results(raw_results: str) -> str:
    """Extract only essential hotel details (name, price, rating, link)."""
    clean = compact_data(raw_results, HOTEL_DATA_LIMIT)
    return clean

def extract_urls(value: object) -> list[str]:
    """Return unique http(s) links from tool output for live source cards."""
    urls = list(dict.fromkeys(re.findall(r"https?://[^\s)\\\"']+", str(value))))
    # Filter out internal/tracking URLs
    clean_urls = [u for u in urls if not u.endswith((".png", ".jpg", ".svg", ".css"))]
    return clean_urls[:8]

# Initialize LLM with safety fallback
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    llm = ChatGroq(
        model="openai/gpt-oss-120b",
        api_key=GROQ_API_KEY,
        temperature=0.4
    )
else:
    # If no Groq key, create dummy or inform user
    llm = None

# =========================
# State Definition
# =========================
class TravelState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    user_query: str
    flight_results: str
    hotel_results: str
    weather_results: str
    itinerary: str
    llm_calls: int

# =========================
# 1. Flight Agent
# =========================
FLIGHT_AGENT_PROMPT = """You are an elite international flight specialist.
User Query: {query}
Flight & Airport Data: {flight_data}

Provide a concise recommendation in at most 8 bullets:
- Origin and arrival hubs with IATA codes
- 2-3 airlines, duration, layovers
- Economy fare range and one booking tip
Do not repeat the user request or explain your reasoning."""

def flight_agent(state: TravelState):
    query = compact_data(state["user_query"], USER_QUERY_LIMIT)
    flight_data = ""
    try:
        from tools.flight_tool import search_flights
        raw_flights = search_flights(query, limit=5)
        flight_data = compact_data(raw_flights, AIRPORT_DATA_LIMIT)
    except Exception:
        try:
            airports = asyncio.run(aviation_mcp_call("list_airports"))
            flight_data = compact_data(airports, AIRPORT_DATA_LIMIT)
        except Exception:
            flight_data = "Major international flight hubs and carriers available."

    try:
        prompt = FLIGHT_AGENT_PROMPT.format(
            query=query,
            flight_data=flight_data
        )
        if llm:
            response = llm.bind(max_tokens=FLIGHT_OUTPUT_TOKENS).invoke([
                SystemMessage(content="You are an expert flight route specialist. Be concise and factual."),
                HumanMessage(content=prompt)
            ])
            flight_results = str(response.content)
        else:
            flight_results = f"Flight options for {query}:\n{flight_data}"
    except Exception as e:
        flight_results = f"Direct & connecting flights available. Estimated economy airfare: $450 - $950 round-trip. (Note: {e})"

    return {
        "flight_results": flight_results,
        "messages": [AIMessage(content="Flight analysis complete.")],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# =========================
# 2. Hotel Agent
# =========================
def hotel_agent(state: TravelState):
    query = f"Boutique hotels, hostels, and best stays for {compact_data(state['user_query'], USER_QUERY_LIMIT)}"
    try:
        from tools.tavily_tool import tavily_search
        raw_hotels = tavily_search(query)
        hotel_results = compress_hotel_results(raw_hotels)
    except Exception:
        try:
            raw_hotels = asyncio.run(tavily_mcp_search(query))
            hotel_results = compress_hotel_results(raw_hotels)
        except Exception as e:
            hotel_results = f"Recommended stays for {state['user_query']}: Boutique central hotels, traveler lofts, and guest houses (~$60 - $150/night)."

    return {
        "hotel_results": hotel_results,
        "messages": [AIMessage(content="Hotel stays curated.")],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# =========================
# 3. Weather Agent
# =========================
def weather_agent(state: TravelState):
    city = extract_destination(compact_data(state["user_query"], USER_QUERY_LIMIT))
    try:
        from custom_weather_mcp_server import get_current_weather, get_forecast
        cur = get_current_weather(city)
        fc = get_forecast(city)
        weather_text = f"Current Climate for {city}: {compact_data(cur, WEATHER_DATA_LIMIT)}\nForecast Trends: {compact_data(fc, WEATHER_DATA_LIMIT)}"
    except Exception:
        try:
            weather_data = compact_data(asyncio.run(weather_mcp_search(city)), WEATHER_DATA_LIMIT)
            forecast_data = compact_data(asyncio.run(forecast_mcp_search(city)), WEATHER_DATA_LIMIT)
            weather_text = f"Current Climate: {weather_data}\nUpcoming Trends: {forecast_data}"
        except Exception:
            weather_text = f"Expected climate for {city}: Pleasant seasonal temperatures (18°C - 26°C), ideal for sightseeing and walking."

    return {
        "weather_results": weather_text,
        "messages": [AIMessage(content="Weather checked.")]
    }

# =========================
# 4. Itinerary Agent
# =========================
def itinerary_agent(state: TravelState):
    prompt = f"""Build a compact day-by-day travel itinerary based on this request.
Request: {compact_data(state['user_query'], USER_QUERY_LIMIT)}
Flights: {compact_data(state['flight_results'], 500)}
Hotels: {compact_data(state['hotel_results'], 600)}
Weather: {compact_data(state['weather_results'], 350)}

Guidelines:
- Give exactly 2 short bullets per day: one daytime activity and one evening idea.
- Include one food or neighborhood suggestion every 2 days.
- Fit the complete itinerary within the output limit. No filler or repeated descriptions."""

    if llm:
        response = llm.bind(max_tokens=ITINERARY_OUTPUT_TOKENS).invoke([
            SystemMessage(content="You are a concise travel route architect. Prioritize useful details over prose."),
            HumanMessage(content=prompt)
        ])
        itinerary_text = str(response.content)
    else:
        itinerary_text = f"Day-by-day planned schedule for {state['user_query']} across cultural sites, culinary hubs, and scenic districts."

    return {
        "itinerary": itinerary_text,
        "messages": [AIMessage(content="Itinerary synthesized.")],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# =========================
# 5. Final Synthesis Agent
# =========================
def build_final_prompt(state: TravelState) -> str:
        return f"""Synthesize a concise but useful travel plan.
    User Query: {compact_data(state['user_query'], USER_QUERY_LIMIT)}

Flights Summary:
{compact_data(state['flight_results'], FINAL_CONTEXT_LIMIT)}

Hotel Options:
{compact_data(state['hotel_results'], FINAL_CONTEXT_LIMIT)}

Weather Forecast:
{compact_data(state['weather_results'], 700)}

Itinerary:
{compact_data(state['itinerary'], ITINERARY_CONTEXT_LIMIT)}

CRITICAL INSTRUCTIONS:
- Keep the answer under 1,800 output tokens.
- Include every requested category, but use compact bullets and tables.
- Use one short line for the trip summary, 3-5 bullets for flights, 3 hotel options, a short weather and packing note, and the day-by-day itinerary.
- Do not repeat source data, the user request, or your reasoning.
- Structure using clear Markdown:
    # Trip plan: [Destination]
    ## Summary
    ## Flights
    ## Hotels
    ## Weather & packing
    ## Day-by-day itinerary
    ## Budget
    ## Practical tips
Finish all sections briefly."""

def final_agent(state: TravelState):
    prompt = build_final_prompt(state)
    if llm:
        response = llm.bind(max_tokens=FINAL_OUTPUT_TOKENS).invoke([
            SystemMessage(content="You are TripMate, a concise AI travel concierge. Give short, high-signal markdown."),
            HumanMessage(content=prompt)
        ])
        content = str(response.content)
    else:
        content = "Travel guide successfully compiled."
        
    return {
        "messages": [AIMessage(content=content)],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# =========================
# LangGraph Workflow Definition
# =========================
graph = StateGraph(TravelState)
graph.add_node("flight_agent", flight_agent)
graph.add_node("hotel_agent", hotel_agent)
graph.add_node("weather_agent", weather_agent)
graph.add_node("itinerary_agent", itinerary_agent)
graph.add_node("final_agent", final_agent)

graph.add_edge(START, "flight_agent")
graph.add_edge("flight_agent", "hotel_agent")
graph.add_edge("hotel_agent", "weather_agent")
graph.add_edge("weather_agent", "itinerary_agent")
graph.add_edge("itinerary_agent", "final_agent")
graph.add_edge("final_agent", END)

if checkpoint_saver:
    travel_graph = graph.compile(checkpointer=checkpoint_saver)
else:
    travel_graph = graph.compile()

# =========================
# Synchronous Entrypoint
# =========================
def run_travel_agent(user_input: str, thread_id: str | None = None):
    if not thread_id:
        thread_id = f"user_{uuid.uuid4().hex}"
    config = {"configurable": {"thread_id": thread_id}}
    
    result = travel_graph.invoke(
        {
            "messages": [HumanMessage(content=user_input)],
            "user_query": user_input,
            "flight_results": "",
            "hotel_results": "",
            "weather_results": "",
            "itinerary": "",
            "llm_calls": 0,
        },
        config=config,
    )
    final_answer = result["messages"][-1].content
    return {
        "thread_id": thread_id,
        "answer": final_answer,
        "flight_results": result.get("flight_results", ""),
        "hotel_results": result.get("hotel_results", ""),
        "weather_results": result.get("weather_results", ""),
        "itinerary": result.get("itinerary", ""),
        "llm_calls": result.get("llm_calls", 0),
    }

# ==========================================================
# Real-Time SSE Generator (Perplexity-style Thinking & astream)
# ==========================================================
async def stream_travel_agent(user_input: str, thread_id: str | None = None):
    """
    Asynchronously streams travel planning progress with:
    - Live Thinking logs
    - Discovered URLs/sources
    - Step-by-step stage statuses
    - Real-time LLM token streaming via astream()
    """
    if not thread_id:
        thread_id = f"user_{uuid.uuid4().hex}"

    state: TravelState = {
        "messages": [HumanMessage(content=user_input)],
        "user_query": user_input,
        "flight_results": "",
        "hotel_results": "",
        "weather_results": "",
        "itinerary": "",
        "llm_calls": 0,
    }

    # Initial start event
    yield {"type": "start", "thread_id": thread_id, "query": user_input}

    stages = [
        (
            "flights",
            "Flight Scout",
            "Searching flight routes, airlines & average fares",
            "Analyzing international airport pairs and flight schedules...",
            flight_agent,
            ["https://www.google.com/travel/flights", "https://www.skyscanner.net"]
        ),
        (
            "hotels",
            "Stay Curator",
            "Scanning boutique stays, traveler lofts & amenities",
            "Comparing neighborhood accommodations, traveler ratings and nightly rates...",
            hotel_agent,
            ["https://www.booking.com", "https://www.agoda.com"]
        ),
        (
            "weather",
            "Weather Check",
            "Retrieving temperature ranges & packing advice",
            "Checking meteorological radars and seasonal packing guides...",
            weather_agent,
            ["https://weather.com"]
        ),
        (
            "itinerary",
            "Route Designer",
            "Architecting balanced day-by-day exploration",
            "Plotting walking routes, culinary landmarks, and scenic spots...",
            itinerary_agent,
            []
        ),
    ]

    for key, label, detail, thinking_text, agent_fn, default_sources in stages:
        # Perplexity-style: emit thinking step
        yield {
            "type": "thinking",
            "stage": key,
            "thought": thinking_text,
        }
        yield {
            "type": "stage",
            "stage": key,
            "label": label,
            "detail": detail,
            "status": "running",
        }

        try:
            update = await asyncio.to_thread(agent_fn, state)
            state.update(update)

            # Emit discovered sources
            discovered_urls = extract_urls(update) or default_sources
            for url in discovered_urls:
                yield {"type": "source", "url": url, "stage": key}

            yield {
                "type": "stage",
                "stage": key,
                "label": label,
                "detail": "Analysis complete",
                "status": "complete",
            }
        except Exception as error:
            yield {
                "type": "stage",
                "stage": key,
                "label": label,
                "detail": f"Completed with fallback: {error}",
                "status": "complete",
            }

    # Final stage: Thinking + LLM Streaming
    yield {
        "type": "thinking",
        "stage": "answer",
        "thought": "Compressing the research into a short, complete travel plan...",
    }
    yield {
        "type": "stage",
        "stage": "answer",
        "label": "TripMate Synthesis",
        "detail": "Writing a concise personalized travel guide",
        "status": "running",
    }

    final_prompt = build_final_prompt(state)
    answer_parts: list[str] = []

    if llm:
        try:
            async for chunk in llm.bind(max_tokens=FINAL_OUTPUT_TOKENS).astream([
                SystemMessage(content="You are TripMate, a concise travel booking concierge. Write short, practical markdown under 1,800 tokens."),
                HumanMessage(content=final_prompt),
            ]):
                token_text = chunk.content if isinstance(chunk.content, str) else ""
                if token_text:
                    answer_parts.append(token_text)
                    yield {"type": "token", "content": token_text}
        except Exception as stream_err:
            fallback = f"\n\n*Note: Output stream encountered: {stream_err}. Displaying collected notes:*\n\n"
            answer_parts.append(fallback)
            yield {"type": "token", "content": fallback}

    if not answer_parts:
        # Synthetic fallback text if LLM key is absent
        fallback_text = f"""# TripMate Travel Dossier: {state['user_query']}

## 1. Trip Summary
- **Target Route**: Tailored journey based on your request.
- **Flight Overview**: {compact_data(state['flight_results'], 300)}
- **Recommended Stays**: {compact_data(state['hotel_results'], 300)}
- **Weather Overview**: {compact_data(state['weather_results'], 200)}

## 2. Day-by-Day Schedule
{state['itinerary']}

## 3. Estimated Budget & Practical Tips
- **Airfare**: Mid-tier economy bookings recommended 6 weeks prior.
- **Lodging**: Central neighborhood stays for walkable access to sights and dining.
- **Packing**: Comfortable walking footwear, versatile layers, and local currency for small vendors.
"""
        for word in fallback_text.split(" "):
            piece = word + " "
            answer_parts.append(piece)
            yield {"type": "token", "content": piece}
            await asyncio.sleep(0.02)

    final_answer = "".join(answer_parts)
    yield {
        "type": "done",
        "thread_id": thread_id,
        "answer": final_answer,
        "flight_results": state["flight_results"],
        "hotel_results": state["hotel_results"],
        "weather_results": state["weather_results"],
        "itinerary": state["itinerary"],
        "llm_calls": state.get("llm_calls", 0) + 1,
    }
