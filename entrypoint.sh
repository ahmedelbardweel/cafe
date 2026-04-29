#!/bin/bash

# Attempt migrations but don't exit on failure
echo "Running migrations..."
php artisan migrate --force || echo "Migration failed, skipping..."
php artisan db:seed --class=CafeSeeder --force || echo "Seeding failed, skipping..."

echo "Starting Apache..."
apache2-foreground
