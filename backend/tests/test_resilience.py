import pytest
import asyncio
import time
from backend.app.core.circuit_breaker import CircuitBreaker, CircuitState, CircuitBreakerOpenException
from backend.app.core.rate_limiter import SlidingWindowRateLimiter
from backend.app.core.cache import CacheService

@pytest.mark.asyncio
async def test_circuit_breaker_tripping_and_recovery():
    cb = CircuitBreaker(
        service_name="TestProvider",
        failure_threshold=2,
        recovery_timeout_seconds=0.2,
        expected_exceptions=(RuntimeError,)
    )

    call_count = 0

    @cb
    async def failing_call():
        nonlocal call_count
        call_count += 1
        raise RuntimeError("External network connection timeout")

    # 1. First failure -> Still CLOSED
    with pytest.raises(RuntimeError):
        await failing_call()
    assert cb.state == CircuitState.CLOSED
    assert cb.failure_count == 1

    # 2. Second failure -> Exceeds threshold (2) -> OPEN
    with pytest.raises(RuntimeError):
        await failing_call()
    assert cb.state == CircuitState.OPEN

    # 3. Third call immediately -> Fails FAST without executing the function
    with pytest.raises(CircuitBreakerOpenException):
        await failing_call()
    assert call_count == 2  # The function was NOT invoked!

    # 4. Wait for recovery timeout (0.2s)
    await asyncio.sleep(0.25)

    # 5. Next call should probe in HALF_OPEN
    @cb
    async def successful_call():
        return "reconnected"

    res = await successful_call()
    assert res == "reconnected"
    assert cb.state == CircuitState.CLOSED
    assert cb.failure_count == 0

@pytest.mark.asyncio
async def test_sliding_window_rate_limiter():
    limiter = SlidingWindowRateLimiter(service_name="TestAPI", max_requests=3, window_seconds=0.5)

    # First 3 requests should be allowed immediately
    assert await limiter.acquire() is True
    assert await limiter.acquire() is True
    assert await limiter.acquire() is True

    # Check capacity load
    assert limiter.current_load_pct() == 100.0

@pytest.mark.asyncio
async def test_cache_service_ttl_and_stale_fallback():
    cache = CacheService()

    # Set value with short 0.2s TTL
    await cache.set("test_key", {"price": 100.0}, ttl_seconds=1)
    val = await cache.get("test_key")
    assert val == {"price": 100.0}

    # Delete
    await cache.delete("test_key")
    assert await cache.get("test_key") is None

    # Stale fallback test
    await cache.set("stale_key", {"price": 250.0}, ttl_seconds=0.01)
    await asyncio.sleep(0.02)
    # get() should return None because it's expired
    assert await cache.get("stale_key") is None
    # get_stale() should return the expired value
    stale_val = await cache.get_stale("stale_key")
    assert stale_val == {"price": 250.0}
