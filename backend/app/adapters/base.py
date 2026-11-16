from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
import logging
from datetime import datetime
from backend.app.core.circuit_breaker import CircuitBreaker
from backend.app.core.rate_limiter import SlidingWindowRateLimiter
from backend.app.core.cache import cache_service

logger = logging.getLogger(__name__)

class BaseMarketAdapter(ABC):
    """
    Base class for all financial market data provider adapters.
    Provides standardized rate limiting, circuit breaking, timeouts, and cache integration.
    """
    def __init__(
        self,
        service_name: str,
        max_requests_per_min: int = 60,
        circuit_failure_threshold: int = 3,
        circuit_recovery_seconds: float = 60.0,
        default_cache_ttl: int = 60
    ):
        self.service_name = service_name
        self.default_cache_ttl = default_cache_ttl
        self.rate_limiter = SlidingWindowRateLimiter(
            service_name=service_name,
            max_requests=max_requests_per_min,
            window_seconds=60.0
        )
        self.circuit_breaker = CircuitBreaker(
            service_name=service_name,
            failure_threshold=circuit_failure_threshold,
            recovery_timeout_seconds=circuit_recovery_seconds,
            expected_exceptions=(httpx.HTTPError, httpx.TimeoutException, ConnectionError)
        )
        self._http_client: Optional[httpx.AsyncClient] = None

    def get_client(self) -> httpx.AsyncClient:
        import asyncio
        try:
            current_loop = asyncio.get_running_loop()
        except RuntimeError:
            current_loop = None

        if (
            self._http_client is None
            or self._http_client.is_closed
            or getattr(self._http_client, "_bound_loop", None) is not current_loop
        ):
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(15.0, connect=5.0),
                headers={
                    "User-Agent": "GrowMoreFinancial/1.0 (Fintech Data Engine; contact@growmore.app)",
                    "Accept": "application/json"
                }
            )
            self._http_client._bound_loop = current_loop
        return self._http_client

    async def close(self):
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

    @abstractmethod
    async def fetch_live_data(self, **kwargs) -> Any:
        """Fetch fresh live data from external provider."""
        pass

    async def get_data(self, cache_key: str, ttl: Optional[int] = None, **kwargs) -> Any:
        """
        Public gateway method:
        Checks cache -> Acquires rate limiter slot -> Executes protected by circuit breaker -> Caches on success.
        """
        ttl_seconds = ttl or self.default_cache_ttl

        async def _execute():
            allowed = await self.rate_limiter.acquire()
            if not allowed:
                logger.warning(f"Rate limit capacity reached for {self.service_name}. Falling back to cache.")
                stale = await cache_service.get_stale(cache_key)
                if stale:
                    return stale
                raise RuntimeError(f"Rate limit exceeded for provider '{self.service_name}'.")

            # Execute via circuit breaker
            @self.circuit_breaker
            async def _call():
                return await self.fetch_live_data(**kwargs)

            return await _call()

        return await cache_service.get_or_set(
            key=cache_key,
            ttl_seconds=ttl_seconds,
            factory=_execute
        )
