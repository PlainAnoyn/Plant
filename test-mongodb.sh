#!/bin/bash

echo "Testing MongoDB Connection..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Creating one with default local MongoDB URI..."
    echo "MONGODB_URI=mongodb://localhost:27017/plant-selling" > .env.local
fi

# Read MongoDB URI from .env.local
MONGODB_URI=$(grep MONGODB_URI .env.local | cut -d '=' -f2)

echo "Current MongoDB URI: $MONGODB_URI"
echo ""

# Check if it's Atlas (mongodb+srv)
if [[ $MONGODB_URI == *"mongodb+srv"* ]]; then
    echo "✓ Detected MongoDB Atlas connection"
    echo "Testing connection..."
    node -e "
    const mongoose = require('mongoose');
    mongoose.connect('$MONGODB_URI').then(() => {
        console.log('✅ Successfully connected to MongoDB Atlas!');
        process.exit(0);
    }).catch(err => {
        console.log('❌ Connection failed:', err.message);
        process.exit(1);
    });
    "
elif [[ $MONGODB_URI == *"localhost"* ]] || [[ $MONGODB_URI == *"127.0.0.1"* ]]; then
    echo "Detected local MongoDB connection"
    
    # Check if MongoDB is running
    if pgrep -f mongod > /dev/null; then
        echo "✓ MongoDB process is running"
        echo "Testing connection..."
        node -e "
        const mongoose = require('mongoose');
        mongoose.connect('$MONGODB_URI').then(() => {
            console.log('✅ Successfully connected to local MongoDB!');
            process.exit(0);
        }).catch(err => {
            console.log('❌ Connection failed:', err.message);
            console.log('   Make sure MongoDB is running: sudo systemctl start mongod');
            process.exit(1);
        });
        "
    else
        echo "❌ MongoDB is not running!"
        echo ""
        echo "To start MongoDB locally:"
        echo "  sudo systemctl start mongod"
        echo "  sudo systemctl enable mongod"
        echo ""
        echo "Or use MongoDB Atlas (cloud) - see MONGODB_SETUP.md"
    fi
else
    echo "Unknown MongoDB URI format"
fi


