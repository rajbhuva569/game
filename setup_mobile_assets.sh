#!/bin/bash
# Prepares web assets for the Flutter mobile app

# Ensure we are in the project root
cd "$(dirname "$0")"

echo "Creating assets directory..."
mkdir -p mobile-app/assets/www

echo "Copying web game files..."
cp -r web-game/* mobile-app/assets/www/

echo "Assets prepared successfully!"
echo "You can now run the mobile app:"
echo "  cd mobile-app"
echo "  flutter run"
