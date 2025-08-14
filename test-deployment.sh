#!/usr/bin/env bash

# Test script for deployed Todo app
echo "🧪 Testing Todo App Deployment..."
echo "🌐 Production URL: https://todo-five-ebon.vercel.app"
echo ""

# Test the main page
echo "📄 Testing main page..."
curl -I https://todo-five-ebon.vercel.app
echo ""

# Test the API health endpoint
echo "🔍 Testing debug API endpoint..."
curl -X GET https://todo-five-ebon.vercel.app/api/debug
echo ""

# Test authentication endpoint
echo "🔐 Testing auth API endpoint..."
curl -I https://todo-five-ebon.vercel.app/api/auth/providers
echo ""

echo "✅ Basic tests completed. Check the responses above for any errors."
echo ""
echo "📝 Next steps:"
echo "1. Update Google OAuth configuration with the production domain"
echo "2. Test user authentication and todo creation"
echo "3. Verify MongoDB connectivity by creating a todo"
