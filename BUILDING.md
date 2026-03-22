# Building Savorly

## One-time setup

1. Install EAS CLI:

```powershell
npm install -g eas-cli
```

2. Log in:

```powershell
eas login
```

3. Configure EAS environment variables so builds work in the cloud:

```powershell
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://qvetsxkttcrljybwoife.supabase.co --environment development --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://qvetsxkttcrljybwoife.supabase.co --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://qvetsxkttcrljybwoife.supabase.co --environment production --visibility plaintext
```

```powershell
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_SUPABASE_ANON_KEY --environment development --visibility sensitive
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_SUPABASE_ANON_KEY --environment preview --visibility sensitive
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_SUPABASE_ANON_KEY --environment production --visibility sensitive
```

## Local env sync

Pull a specific environment into your local `.env`:

```powershell
npm run env:pull:development
```

```powershell
npm run env:pull:preview
```

```powershell
npm run env:pull:production
```

## Build commands

Internal Android APK:

```powershell
npm run build:android:apk
```

Production Android AAB:

```powershell
npm run build:android:aab
```

Production iOS:

```powershell
npm run build:ios
```

Build both platforms:

```powershell
npm run build:all
```

## Store submission

Android submit:

```powershell
npm run submit:android
```

iOS submit:

```powershell
npm run submit:ios
```

## OAuth reminder

For Supabase mobile OAuth to work in a development build or production build, keep this redirect URL in Supabase:

```text
savorly://auth/callback
```

If you are testing in Expo Go, the redirect is not `savorly://auth/callback`. Expo Go uses an `exp://.../--/auth/callback` URL instead, and that exact URL also needs to be allowed in Supabase Auth URL configuration. If you want the simplest Google sign-in setup, use an Expo development build so the native `savorly://auth/callback` redirect is used consistently.
