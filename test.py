import asyncio
# from mcp_client_test import get_all_tools, tavily_mcp_search
from mcp_client import get_all_tools



if __name__ == "__main__":
    # query="last football world cup match played"
    asyncio.run(get_all_tools())