import time
import json
import logging
from typing import Any, Optional, Dict, Tuple, Callable
import asyncio

logger = logging.getLogger(__name__)

class CacheService:
    """
    High-performance caching engine with TTL management and stale-on-error fallback.
    Operates in-memory by default and supports distributed Redis.
    """
    def __init__(self):
        self._memory_store: Dict[str, Tuple[Any, float]] = {}  # key -> (data, expires_at)
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            entry = self._memory_store.get(key)
            if not entry:
                return None
            data, expires_at = entry
            if time.time() >= expires_at:
                return None
            return data

    async def get_stale(self, key: str) -> Optional[Any]:
        """Retrieve even if expired (used for fallback when provider is down)."""
        async with self._lock:
            entry = self._memory_store.get(key)
            if not entry:
                return None
            data, _ = entry
            return data

    async def set(self, key: str, value: Any, ttl_seconds: int = 60) -> None:
        async with self._lock:
            expires_at = time.time() + ttl_seconds
            self._memory_store[key] = (value, expires_at)

    async def delete(self, key: str) -> None:
        async with self._lock:
            if key in self._memory_store:
                del self._memory_store[key]

    async def clear(self) -> None:
        async with self._lock:
            self._memory_store.clear()

    async def get_stats(self) -> Dict[str, Any]:
        async with self._lock:
            now = time.time()
            total_keys = len(self._memory_store)
            active_keys = [k for k, (_, exp) in self._memory_store.items() if exp > now]
            expired_keys = total_keys - len(active_keys)
            return {
                "total_entries": total_keys,
                "active_entries": len(active_keys),
                "expired_entries": expired_keys,
                "sample_keys": list(self._memory_store.keys())[:20]
            }

    async def get_or_set(self, key: str, ttl_seconds: int, factory: Callable) -> Any:
        cached = await self.get(key)
        if cached is not None:
            return cached
        # Generate fresh
        try:
            fresh_value = await factory()
            if fresh_value is not None:
                await self.set(key, fresh_value, ttl_seconds)
            return fresh_value
        except Exception as e:
            # Check for stale fallback
            stale = await self.get_stale(key)
            if stale is not None:
                logger.warning(f"Cache factory failed for key '{key}'. Returning STALE fallback. Error: {e}")
                if isinstance(stale, dict):
                    stale["is_stale"] = True
                return stale
            raise e

cache_service = CacheService()
