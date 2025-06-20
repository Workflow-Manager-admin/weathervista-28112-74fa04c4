#!/bin/bash
cd /home/kavia/workspace/code-generation/weathervista-28112-74fa04c4/weather_frontend_workspace/weather_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

