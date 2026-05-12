import os

AGENT_ENV = os.getenv('AGENT_ENV', 'local')

# fastembed model — same nomic-embed-text-v1, 768-dim, runs locally via ONNX
_LOCAL_MODEL = None


def _get_local_model():
    global _LOCAL_MODEL
    if _LOCAL_MODEL is None:
        from fastembed import TextEmbedding
        _LOCAL_MODEL = TextEmbedding('nomic-ai/nomic-embed-text-v1')
    return _LOCAL_MODEL


def embed(text: str) -> list[float]:
    """
    Generate a 768-dim embedding for text.
    Uses fastembed (local ONNX, no API key) — works in both local and production.
    HuggingFace API is available as an optional override via HF_API_KEY if needed.
    """
    hf_key = os.getenv('HF_API_KEY', '')

    if hf_key:
        # Attempt HuggingFace Inference API (requires a valid router-capable token)
        import requests
        url = 'https://router.huggingface.co/hf-inference/models/nomic-ai/nomic-embed-text-v1/pipeline/feature-extraction'
        try:
            r = requests.post(
                url,
                headers={'Authorization': f'Bearer {hf_key}', 'Content-Type': 'application/json'},
                json={'inputs': text, 'options': {'wait_for_model': True}},
                timeout=30,
            )
            if r.ok:
                data = r.json()
                vector = data[0] if isinstance(data[0], list) else data
                return [float(v) for v in vector]
        except Exception:
            pass  # fall through to local model

    # Local ONNX via fastembed — reliable, no rate limits, same model
    model = _get_local_model()
    vectors = list(model.embed([text]))
    return [float(v) for v in vectors[0]]
