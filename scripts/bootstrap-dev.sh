
#!/bin/bash

set -e

echo "📦 Installing dependencies with pnpm..."
pnpm i

echo "🔧 Setting up Husky hooks..."
pnpm prepare

echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.dev.yml up -d postgres pgadmin redis

echo "🌿 Setting up environment file..."
if [ ! -f .env ]; then
  mv .env.example .env
  echo ".env file created from .env.example"
else
  echo ".env already exists, skipping..."
fi

if [ -d src/generated ]; then
  echo "skipping db:migrate:dev..."
else
  pnpm db:migrate:dev
fi

echo "✅ Setup complete!"

pnpm start:dev
