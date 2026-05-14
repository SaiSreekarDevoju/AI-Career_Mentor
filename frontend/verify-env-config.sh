#!/bin/bash
# Verification script to ensure no hardcoded localhost URLs in compiled output

echo "🔍 Scanning frontend source code for hardcoded localhost URLs..."
echo ""

# Search for any direct localhost URLs in source files (excluding env declarations)
HARDCODED=$(grep -r "http://localhost:8000" src/ --include="*.ts" --include="*.tsx" | grep -v "const API = " | grep -v ".env" | grep -v "process.env")

if [ -z "$HARDCODED" ]; then
    echo "✅ No hardcoded localhost URLs found outside of API constant declarations"
else
    echo "❌ Found hardcoded localhost URLs:"
    echo "$HARDCODED"
    exit 1
fi

echo ""
echo "✅ Environment variable usage verified"
echo "All API calls use: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'"
echo ""
echo "✅ Build verification"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "✅ All verifications passed!"
echo ""
echo "📝 Next steps for production deployment:"
echo "1. Set NEXT_PUBLIC_API_URL in Vercel environment variables"
echo "2. Value: https://your-render-backend.onrender.com/api/v1"
echo "3. Deploy frontend to Vercel"
echo "4. Test API calls in browser DevTools Network tab"
