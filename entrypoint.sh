#!/bin/bash

# Update Apache port to match Render's environment
echo "Setting Apache port to $PORT..."
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:$PORT>/g" /etc/apache2/sites-available/000-default.conf

# Attempt migrations but don't exit on failure
echo "Running migrations..."
php artisan migrate --force || echo "Migration failed, skipping..."
php artisan db:seed --class=CafeSeeder --force || echo "Seeding failed, skipping..."

echo "Starting Apache on port $PORT..."
apache2-foreground
