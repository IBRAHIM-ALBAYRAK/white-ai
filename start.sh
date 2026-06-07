#!/bin/bash
# Start Docker containers
cd ~/whiteai/backend
docker-compose start || docker-compose up -d
sleep 5

# Backend
source ~/whiteai/backend/venv/bin/activate
~/whiteai/backend/venv/bin/uvicorn app.main:app --reload &

# Frontend
cd ~/whiteai/frontend
npm run dev &

wait
