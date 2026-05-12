import os

AGENT_ENV = os.getenv('AGENT_ENV', 'local')


def embed(text: str) -> list[float]:
    if AGENT_ENV == 'production':
        import requests
        model = 'nomic-ai/nomic-embed-text-v1'
        response = requests.post(
            f'https://api-inference.huggingface.co/pipeline/feature-extraction/{model}',
            headers={'Authorization': f'Bearer {os.environ["HF_API_KEY"]}'},
            json={'inputs': text, 'options': {'wait_for_model': True}},
        )
        return response.json()[0]
    else:
        import ollama
        response = ollama.embeddings(model='nomic-embed-text', prompt=text)
        return response['embedding']
