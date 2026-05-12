import json
from typing import Optional


def log(
    agent: str,
    status: str,
    items_processed: int = 0,
    errors: int = 0,
    duration_ms: int = 0,
    metadata: Optional[dict] = None,
) -> None:
    entry = {
        'agent': agent,
        'status': status,
        'items_processed': items_processed,
        'errors': errors,
        'duration_ms': duration_ms,
        'metadata': metadata or {},
    }
    print(json.dumps(entry))
    try:
        from db import get_client
        get_client().table('agent_logs').insert(entry).execute()
    except Exception as exc:
        print(json.dumps({'warning': f'Failed to write log to DB: {exc}'}))
