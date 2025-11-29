# Chrome Extension OAuth Setup Guide

## 🔐 Setting Up OAuth for Extension Authentication

You need **TWO separate OAuth 2.0 credentials** from Google Cloud Console:

---

## Step 1: Get Your Extension ID

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Find your HerCircle Shield extension
4. Copy the **Extension ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

---

## Step 2: Create Chrome Extension OAuth Credential

### Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Select your project (or create one)

### Create New OAuth Client ID
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. **Application type:** Select **"Chrome extension"**
5. **Item ID:** Paste your Extension ID from Step 1
6. Click **"CREATE"**

### Copy the Client ID
7. Copy the **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
8. **NOTE:** Chrome extensions don't use a Client Secret!

---

## Step 3: Update Your .env File

Add the extension OAuth credential to your `.env` file:

```bash
# Chrome Extension OAuth 2.0 Configuration
EXTENSION_GOOGLE_CLIENT_ID=your_extension_client_id.apps.googleusercontent.com
```

**Example:**
```bash
EXTENSION_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

---

## Step 4: Verify You Have Both Credentials

Your `.env` should now have:

### 1. Web Application OAuth (for backend)
```bash
GOOGLE_CLIENT_ID=your_web_app_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_web_app_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 2. Chrome Extension OAuth (for extension)
```bash
EXTENSION_GOOGLE_CLIENT_ID=your_extension_client_id.apps.googleusercontent.com
```

---

## Step 5: Update Extension Manifest

The extension's `manifest.json` needs the OAuth client ID:

```json
{
  "oauth2": {
    "client_id": "your_extension_client_id.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  },
  "permissions": [
    "identity",
    "storage"
  ]
}
```

---

## Important Notes

### ⚠️ Common Mistakes

1. **Using the same OAuth credential for both**
   - ❌ Don't use the web app credential for the extension
   - ✅ Create a separate "Chrome Extension" type credential

2. **Trying to use a Client Secret for extension**
   - ❌ Chrome extensions don't use secrets
   - ✅ Only the Client ID is needed

3. **Wrong Extension ID**
   - ❌ Using a placeholder or wrong ID
   - ✅ Get the actual ID from `chrome://extensions/`

### 🔒 Security

- **Web App Credential:** Has both Client ID and Secret (keep secret safe!)
- **Extension Credential:** Only has Client ID (no secret needed)
- **Never commit** your `.env` file to git (it's in `.gitignore`)

---

## Testing

After setup, test the OAuth flow:

1. Load the extension in Chrome
2. Click "Login with Google"
3. Authorize the extension
4. Extension should receive auth token
5. Extension can now call backend APIs

---

## Troubleshooting

### "Invalid Client ID"
- Check Extension ID matches in Google Console
- Verify Client ID is copied correctly to `.env`

### "Redirect URI mismatch"
- For extensions, this shouldn't happen
- If it does, check the Extension ID

### "Access blocked"
- Enable Google+ API in Google Cloud Console
- Add test users if app is not published

---

## Next Steps

After OAuth setup:
1. ✅ Update `.env` with `EXTENSION_GOOGLE_CLIENT_ID`
2. ✅ Update `extension/manifest.json` with OAuth config
3. ✅ Implement login flow in extension
4. ✅ Test authentication
5. ✅ Connect buttons to backend APIs

---

## Resources

- [Google OAuth for Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
