# Savorly

Savorly is an Expo Router app for discovering, saving, and managing recipes.

## Tech Stack

- Expo
- React Native
- Expo Router
- Supabase
- TypeScript

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Start the app:

```bash
npm start
```

## Available Scripts

- `npm start` to launch Expo
- `npm run android` to open Android
- `npm run ios` to open iOS
- `npm run web` to open the web build
- `npm run lint` to run linting

## Project Notes

- The app expects Supabase credentials through Expo public environment variables.
- Update the values in `.env` to point to your own Supabase project before testing auth flows.
