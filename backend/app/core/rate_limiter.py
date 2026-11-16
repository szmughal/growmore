import time
import asyncio
from typing import Dict, List

class SlidingWindowRateLimiter:
    """
    Sliding window in-memory rate limiter to respect external API tiers and prevent HTTP 429.
    """
    def __init__(self, service_name: str, max_requests: int, window_seconds: float = 60.0):
        self.service_name = service_name
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.timestamps: List[float] = []
        self._lock = asyncio.Lock()

    async def acquire(self) -> bool:
        """
        Acquire permission to execute an external request.
        Waits if within reasonable throttle or returns False if capacity exceeded.
        """
        async with self._lock:
            now = time.time()
            cutoff = now - self.window_seconds
            # Remove timestamps outside current window
            self.timestamps = [t for t in self.timestamps if t > cutoff]

            if len(self.timestamps) < self.max_requests:
                self.timestamps.append(now)
                return True
            
            # If full, calculate sleep time to next available slot
            oldest = self.timestamps[0]
            sleep_needed = (oldest + self.window_seconds) - now
            if sleep_needed > 0 and sleep_needed <= 5.0:
                await asyncio.sleep(sleep_needed + 0.05)
                self.timestamps = [t for t in self.timestamps if t > (time.time() - self.window_seconds)]
                self.timestamps.append(time.time())
                return True
            return False

    def current_load_pct(self) -> float:
        now = time.time()
        cutoff = now - self.window_seconds
        active_count = len([t for t in self.timestamps if t > cutoff])
        return (active_count / self.max_requests) * 100.0
