#!/bin/bash

ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"

if [ ! -f "$ENV_FILE" ]; then
    echo "Keine .env Datei gefunden. Erstelle eine neue aus $ENV_EXAMPLE_FILE..."
    
    if [ ! -f "$ENV_EXAMPLE_FILE" ]; then
        echo "Fehler: Die Datei $ENV_EXAMPLE_FILE existiert nicht!"
        exit 1
    fi

    cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
    
    # Generate random passwords/keys
    if command -v openssl > /dev/null; then
        POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
        DJANGO_KEY=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 50)
    else
        POSTGRES_PASSWORD=$(head /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 32)
        DJANGO_KEY=$(head /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 50)
    fi

    # Replace values in the newly created .env
    # We use sed for replacement. It behaves differently on Mac vs Linux, so we handle both.
    if sed --version >/dev/null 2>&1; then
        # GNU sed (Linux)
        sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$ENV_FILE"
        sed -i "s/^SECRET_KEY=.*/SECRET_KEY='$DJANGO_KEY'/" "$ENV_FILE"
    else
        # BSD sed (Mac)
        sed -i '' "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$ENV_FILE"
        sed -i '' "s/^SECRET_KEY=.*/SECRET_KEY='$DJANGO_KEY'/" "$ENV_FILE"
    fi
    
    echo "✅ .env erfolgreich erstellt und mit sicheren Schlüsseln befüllt."
else
    echo ".env Datei existiert bereits. Überspringe Generierung."
fi

echo "Starte Docker Container..."
docker compose up -d --build
