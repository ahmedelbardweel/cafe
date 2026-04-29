#!/bin/bash

# Run migrations
php artisan migrate --force
php artisan db:seed --class=CafeSeeder --force

# Start Apache
apache2-foreground
