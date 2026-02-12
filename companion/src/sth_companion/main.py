from __future__ import annotations

import os
import sys

from dotenv import load_dotenv
import uvicorn

from .config import load_config
from .server import create_app


def main() -> None:
    load_dotenv()
    config = load_config()
    app = create_app(config)

    # Bind localhost only.
    uvicorn.run(app, host="127.0.0.1", port=config.port, log_level=os.environ.get("LOG_LEVEL", "info"))


if __name__ == "__main__":
    main()

