import time
import logging
from enum import Enum
from typing import Optional, Callable, Any

logger = logging.getLogger(__name__)

class CircuitState(str, Enum):
    CLOSED = "CLOSED"       # Normal operation: requests pass through
    OPEN = "OPEN"           # Tripped: requests fail immediately with cached fallback
    HALF_OPEN = "HALF_OPEN" # Recovery trial: test single request to verify health

class CircuitBreakerOpenException(Exception):
    def __init__(self, service_name: str, retry_after_seconds: float):
        self.service_name = service_name
        self.retry_after_seconds = retry_after_seconds
        super().__init__(
            f"Circuit breaker for service '{service_name}' is OPEN. "
            f"Retry after {retry_after_seconds:.1f} seconds."
        )

class CircuitBreaker:
    """
    Production-grade circuit breaker to isolate failed external financial data providers
    and prevent cascade failures or hanging requests.
    """
    def __init__(
        self,
        service_name: str,
        failure_threshold: int = 3,
        recovery_timeout_seconds: float = 60.0,
        expected_exceptions: tuple = (Exception,)
    ):
        self.service_name = service_name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        self.expected_exceptions = expected_exceptions
        
        self.state: CircuitState = CircuitState.CLOSED
        self.failure_count: int = 0
        self.last_failure_time: Optional[float] = None
        self.last_success_time: Optional[float] = None

    def __call__(self, func: Callable):
        async def wrapper(*args, **kwargs) -> Any:
            self._before_call()
            try:
                result = await func(*args, **kwargs)
                self._on_success()
                return result
            except self.expected_exceptions as exc:
                self._on_failure(exc)
                raise exc
        return wrapper

    def _before_call(self):
        now = time.time()
        if self.state == CircuitState.OPEN:
            elapsed = now - (self.last_failure_time or now)
            if elapsed >= self.recovery_timeout_seconds:
                logger.info(f"CircuitBreaker [{self.service_name}]: Transitioning from OPEN to HALF_OPEN (probe)")
                self.state = CircuitState.HALF_OPEN
            else:
                remaining = self.recovery_timeout_seconds - elapsed
                raise CircuitBreakerOpenException(self.service_name, remaining)

    def _on_success(self):
        self.last_success_time = time.time()
        if self.state == CircuitState.HALF_OPEN:
            logger.info(f"CircuitBreaker [{self.service_name}]: Probe succeeded. Transitioning to CLOSED.")
        self.state = CircuitState.CLOSED
        self.failure_count = 0

    def _on_failure(self, exc: Exception):
        self.last_failure_time = time.time()
        self.failure_count += 1
        logger.warning(
            f"CircuitBreaker [{self.service_name}]: Failure {self.failure_count}/{self.failure_threshold}. "
            f"Error: {exc}"
        )
        if self.failure_count >= self.failure_threshold or self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN
            logger.error(
                f"CircuitBreaker [{self.service_name}]: Tripped to OPEN state! "
                f"Blocking calls for {self.recovery_timeout_seconds} seconds."
            )

    def reset(self):
        """Manually reset the circuit breaker to CLOSED state."""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.last_success_time = time.time()
        logger.info(f"CircuitBreaker [{self.service_name}]: Manually reset to CLOSED.")
