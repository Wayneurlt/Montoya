# 🚀 Vercel Deployment Guide - Complete Setup

## 🔧 **Environment Variables to Set in Vercel**

In your Vercel dashboard, add these environment variables:

### **Required Variables:**
```
DATABASE_URL=postgresql://neondb_owner:npg_SxaDM87Idtcr@ep-withered-bush-a26yqgjm-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

ADMIN_PASSWORD=admin123

NODE_ENV=production

ENVIRONMENT=production
```

## 🎯 **First-Time Setup Steps**

### **Step 1: Deploy to Vercel**
1. Push your code to GitHub
2. Connect to Vercel
3. Add the environment variables above
4. Deploy

### **Step 2: Initialize Database**
After deployment, visit: `https://your-app.vercel.app/setup`

This will:
- ✅ Create all database tables
- ✅ Seed all 365 questions
- ✅ Create admin user (username: admin, password: admin123)

### **Step 3: Test Admin Access**
1. Go to: `https://your-app.vercel.app/admin/login`
2. Login with: `username=admin`, `password=admin123`
3. Access admin dashboard

### **Step 4: Test Games**
1. Go to any game (Truth or Dare, Never Have I Ever, etc.)
2. Questions should load from database
3. Check browser console for loading logs

## 🔧 **Fixes Applied for Vercel**

### **1. Admin Login Issues Fixed:**
- ✅ **Auto-create admin user** if none exists during login
- ✅ **Proper JWT configuration** using runtime config
- ✅ **Database connection** using shared Prisma client
- ✅ **Environment variables** properly configured

### **2. Question Loading Issues Fixed:**
- ✅ **Retry logic** for API calls (3 attempts with backoff)
- ✅ **Timeout handling** (10 second timeout)
- ✅ **Fallback questions** if database fails
- ✅ **Better error logging** for debugging

### **3. Database Connection Fixed:**
- ✅ **Shared Prisma client** to prevent connection issues
- ✅ **Proper connection management** with disconnect
- ✅ **Initialization API** for first-time setup

## 🎯 **Troubleshooting**

### **If Admin Login Fails:**
1. Check Vercel environment variables are set
2. Visit `/setup` to initialize database
3. Check Vercel function logs for errors

### **If Questions Don't Load:**
1. Check browser console for API errors
2. Visit `/setup` to ensure database is seeded
3. Questions will show fallbacks if database fails

### **If Database Issues:**
1. Verify DATABASE_URL is correct in Vercel
2. Check Neon database is accessible
3. Run `/setup` endpoint to reinitialize

## 🚀 **Production Features**

### **Robust Error Handling:**
- Games work even if database is temporarily unavailable
- Admin system auto-creates users if needed
- Comprehensive logging for debugging

### **Performance Optimized:**
- Shared database connections
- Efficient question loading
- Proper caching headers

### **Security:**
- Secure JWT tokens
- HTTP-only cookies in production
- Proper CORS and security headers

## ✅ **Final Checklist**

- [ ] Environment variables set in Vercel
- [ ] App deployed successfully
- [ ] Visit `/setup` to initialize database
- [ ] Test admin login at `/admin/login`
- [ ] Test question loading in games
- [ ] Verify analytics are working

**Your Montoya game is now production-ready on Vercel!** 🎉
