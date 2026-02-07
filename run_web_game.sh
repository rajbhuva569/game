#!/bin/bash
# Runs the web game locally using Python's http.server

# Ensure we are in the project root
cd "$(dirname "$0")"

echo "Starting local server at http://localhost:8000/web-game/index.html"
echo "Press Ctrl+C to stop."

python3 -m http.server 8000
