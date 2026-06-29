"""Block until the database is reachable.

Run before the app boots (see ``entrypoint.sh``) so that the first request —
and the schema bootstrap — never hit a database that is still starting up.
"""

import logging
import time

from sqlalchemy import text

from app.core.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prestart")

MAX_TRIES = 30
WAIT_SECONDS = 2


def main() -> None:
    for attempt in range(1, MAX_TRIES + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database is ready (attempt %d).", attempt)
            return
        except Exception as exc:  # noqa: BLE001 — any driver error means "not ready yet"
            logger.warning(
                "Database not ready (attempt %d/%d): %s", attempt, MAX_TRIES, exc
            )
            time.sleep(WAIT_SECONDS)
    raise RuntimeError(
        f"Database unreachable after {MAX_TRIES * WAIT_SECONDS}s — aborting startup."
    )


if __name__ == "__main__":
    main()
