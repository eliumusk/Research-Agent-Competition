from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.openrouter import OpenRouter
# from agno.models.litellm import LiteLLMOpenAI
from agno.os import AgentOS
from agno.tools.mcp import MCPTools

# Create the Agent
agno_agent = Agent(
    name="test",
    # model=LiteLLMOpenAI(
    #     id="gpt-5",
    #     base_url="http://123.129.219.111:3000",
    #     api_key="sk-95HcihQfAEbiR5VwRYJLf1ZXXP1LExpjcsJ1ZbjURXPPRmkV"),
    model=OpenRouter(id="deepseek/deepseek-v3.2"),
    # Add a database to the Agent
    db=SqliteDb(db_file="agno.db"),
    # Add the Agno MCP server to the Agent
    tools=[MCPTools(
        transport="sse",
        url="http://101.42.2.250:8051/sse",
        timeout_seconds=30,
    )],
    # Add the previous session history to the context
    add_history_to_context=True,
    markdown=True,
    description="你是一个比赛文档查询助手，叫赛大师，有3种搜索工具可以调用，负责耐心专业地回答参赛选手的问题，不要过于啰嗦，精准搜索，如果没有找到示例，就应该告诉选手回去查看相关文档"
)


# Create the AgentOS
agent_os = AgentOS(agents=[agno_agent])
# Get the FastAPI app for the AgentOS
app = agent_os.get_app()
