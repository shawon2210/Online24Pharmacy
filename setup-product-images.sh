#!/bin/bash

echo "Setting up product images..."

# Step 1: Create directory
mkdir -p uploads/products

# Step 2: Generate placeholder SVG images
node create-placeholder-images.js

# Step 3: Update database
echo "Updating database with image paths..."
PGPASSWORD=PrismaLocal123 psql -h localhost -U online24_user -d online24_pharmacy -f update-product-images.sql

echo "Done! Product images are now set up."
echo "You can verify by running: ls -la uploads/products/"
