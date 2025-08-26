# Firebase Setup Guide for ReadyQueue

## 🚀 Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `ReadyQueue` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" provider
3. Click "Save"

### 3. Enable Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location (choose closest to your users)
4. Click "Enable"

### 4. Get Configuration
1. Click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon (</>)
4. Register app with name: `ReadyQueue Web`
5. Copy the config object

### 5. Set Environment Variables
Create `.env.local` file in your project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 6. Security Rules (Optional)
In Firestore → Rules, you can add basic security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
```

## ✅ What You Get

- **Real-time updates** - Tasks and categories update instantly across all tabs
- **Authentication** - User login/register with email/password
- **Database** - NoSQL Firestore with automatic scaling
- **Security** - Row-level security with user authentication

## 🔧 Testing

1. Start your development server: `npm run dev`
2. Try creating a task - it should appear instantly
3. Open another tab - changes should sync in real-time
4. Try editing/deleting tasks - updates should be immediate

## 🚨 Troubleshooting

- **"Firebase not initialized"** - Check your environment variables
- **"Permission denied"** - Check Firestore security rules
- **"Auth not working"** - Ensure Authentication is enabled in Firebase Console

## 📱 Next Steps

After setup, your app will have:
- ✅ Working authentication
- ✅ Real-time task updates
- ✅ Real-time category updates
- ✅ Smooth drag-and-drop
- ✅ Instant CRUD operations

No more manual refreshes or real-time debugging issues!
