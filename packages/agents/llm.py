import os
import time
from typing import Optional

AGENT_ENV = os.getenv('AGENT_ENV', 'local')


def complete(
    prompt: str,
    system: str = '',
    model: Optional[str] = None,
    retries: int = 3,
) -> str:
    for attempt in range(retries):
        try:
            return _call(prompt, system, model)
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)  # 1s, 2s, 4s backoff
    return ''


def _call(prompt: str, system: str, model: Optional[str]) -> str:
    if AGENT_ENV == 'production':
        from groq import Groq
        client = Groq(api_key=os.environ['GROQ_API_KEY'])
        response = client.chat.completions.create(
            model=model or 'llama-3.1-8b-instant',
            messages=[
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': prompt},
            ],
            max_tokens=512,
            temperature=0.1,
        )
        return response.choices[0].message.content
    else:
        import ollama
        response = ollama.chat(
            model=model or 'llama3.1:8b',
            messages=[
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': prompt},
            ],
        )
        return response['message']['content']
