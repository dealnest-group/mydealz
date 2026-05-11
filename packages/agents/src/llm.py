import os
from typing import Optional

# Determine environment
AGENT_ENV = os.getenv('AGENT_ENV', 'local')  # 'local' or 'production'

if AGENT_ENV == 'production':
    # Use Groq API
    from groq import Groq
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
else:
    # Use Ollama locally
    import ollama

def call_llm(prompt: str, model: Optional[str] = None) -> str:
    if AGENT_ENV == 'production':
        if model is None:
            model = 'llama3-70b-8192'
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model,
        )
        return response.choices[0].message.content
    else:
        if model is None:
            model = 'llama3.1:8b'
        response = ollama.chat(model=model, messages=[{'role': 'user', 'content': prompt}])
        return response['message']['content']