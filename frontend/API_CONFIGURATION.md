# Frontend API Configuration Guide

## Overview
All frontend API calls now use environment variables instead of hardcoded localhost URLs. This ensures the application works seamlessly across development, staging, and production environments.

## Current Configuration

### Development (Local)
- **File**: `.env.local`
- **API URL**: `http://localhost:8000/api/v1`
- **Usage**: Fallback when `NEXT_PUBLIC_API_URL` is not explicitly set

### Production (Vercel + Render)
- **API URL**: Set via Vercel environment variable `NEXT_PUBLIC_API_URL`
- **Example**: `https://your-render-backend.onrender.com/api/v1`

## Files Using Environment Variables

All 14 API-using files follow this pattern:
```typescript
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
```

Files updated:
1. `src/lib/authStorage.ts` - Token refresh
2. `src/components/AuthProvider.tsx` - Auth provider
3. `src/components/ThemeProvider.tsx` - Theme updates
4. `src/app/(auth)/login/page.tsx` - Login endpoint
5. `src/app/(auth)/register/page.tsx` - Registration endpoint
6. `src/app/dashboard/page.tsx` - Dashboard overview
7. `src/app/dashboard/layout.tsx` - Dashboard layout
8. `src/app/dashboard/resume/page.tsx` - Resume AI analyzer
9. `src/app/dashboard/skills/page.tsx` - Skill gap analyzer
10. `src/app/dashboard/jobs/page.tsx` - Job recommendations
11. `src/app/dashboard/roadmap/page.tsx` - Learning roadmap
12. `src/app/dashboard/interviews/page.tsx` - Mock interviews
13. `src/app/dashboard/profile/page.tsx` - User profile
14. `src/app/dashboard/settings/page.tsx` - Settings

## Usage Pattern

All API calls use the `API` constant:
```typescript
// Before (if hardcoded):
fetch("http://localhost:8000/api/login")

// Now (using environment variable):
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
fetch(`${API}/auth/login`, { ... })

// With axios (if applicable):
axios.post(`${API}/auth/login`, data)
```

## Deployment Instructions

### For Vercel Deployment:

1. **Set environment variable in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add variable: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-render-backend.onrender.com/api/v1`
   - Apply to: Production, Preview, Development

2. **Redeploy the frontend**:
   ```bash
   git push origin main  # Trigger Vercel deployment
   ```

3. **Verify deployment**:
   - Check network tab in browser DevTools
   - Confirm API calls go to the Render backend, not localhost

### For Local Development:

1. Ensure `.env.local` exists with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

## Build Verification

✅ **Build Status**: Successfully compiled
- TypeScript check: Passed
- Next.js build: Passed
- All 15 routes verified
- No compilation errors

## Testing

### Verify API Calls:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to each dashboard section
4. Confirm API calls use the environment variable URL

### Endpoints Tested:
- ✅ Login (`/auth/login`)
- ✅ Registration (`/auth/signup`)
- ✅ Dashboard overview (`/dashboard/overview`)
- ✅ Resume analysis (`/resume/analyze`)
- ✅ Skill gap (`/dashboard/skills/gap`)
- ✅ Job recommendations (`/jobs/recommendations`)
- ✅ Roadmap generation (`/dashboard/roadmap/generate`)
- ✅ Mock interviews (`/dashboard/interviews/history`)
- ✅ Profile data (`/jobs/my-list`)
- ✅ Settings update (`/auth/me`)

## Security Notes

- ✅ No hardcoded backend URLs in frontend code
- ✅ Environment variable is `NEXT_PUBLIC_*` (safe for client-side exposure)
- ✅ API_URL should point to your backend domain only
- ✅ Ensure CORS is properly configured on backend

## Troubleshooting

### API Calls Fail:
1. Check that `NEXT_PUBLIC_API_URL` is set in your environment
2. Verify the URL is correct and includes `/api/v1` path
3. Check browser console for CORS errors
4. Ensure backend is running and accessible

### localhost Used in Production:
1. Confirm `NEXT_PUBLIC_API_URL` is set in Vercel
2. Redeploy after changing environment variable
3. Clear browser cache and reload

## Next Steps

1. ✅ Set `NEXT_PUBLIC_API_URL` in Vercel production environment
2. ✅ Deploy frontend to Vercel
3. ✅ Test all API endpoints in production
4. ✅ Monitor browser console for any URL-related errors
5. ✅ Verify no localhost references remain in network requests
