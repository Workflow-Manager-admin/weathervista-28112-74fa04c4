#!/bin/bash
cd /home/kavia/workspace/code-generation/weathervista-28112-74fa04c4/weather_backend_workspace/weather_backend
source venv/bin/activate
flake8 .
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

