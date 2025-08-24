
#!/bin/bash

set -e

echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.dev.yml up -d

echo "🌿 Setting up environment file..."
if [ ! -f .env ]; then
  mv .env.example .env
  echo ".env file created from .env.example"
else
  echo ".env already exists, skipping..."
fi


echo "✅ Setup complete!"

docker logs -f app_server
