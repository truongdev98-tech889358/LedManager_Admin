#!/bin/bash
# deploy.sh

echo "Deploying LedManager Server..."

# Uncomment the following line if you want to pull the latest changes from git
# git pull origin main

echo "Building and starting containers..."
docker compose up -d --build

echo "Cleaning up unused images..."
docker image prune -f

echo "Deployment complete! Application should be running at http://localhost:5291"
