
#!/bin/bash

set -e

echo "📦 Installing dependencies with pnpm..."
pnpm install

echo "🔧 Setting up Husky hooks..."
pnpm prepare

echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.dev.yml up -d

echo "✅ Setup complete!"

docker logs -f app_server
