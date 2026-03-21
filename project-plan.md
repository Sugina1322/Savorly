# Savorly Project Plan

## Overview
Savorly is a React Native Expo app focused on meal discovery and personal organization. Users browse recipes, view recipe details, save favorites, and organize saved meals into collections for quick access later. The app should feel visually modern, mobile-first, and easy to use across different phone sizes.

## MVP Features
- Recipe discovery feed with featured and recommended meals
- Search recipes by title, cuisine, ingredients, or tags
- Recipe detail view with ingredients, steps, and tags
- Favorite or save recipes from cards and detail pages
- Saved recipes screen
- Create and manage collections
- Add saved recipes into collections
- Basic onboarding, login, guest mode, sign in, and sign up flows
- Responsive layouts for different phone sizes

## Screens
- Splash screen
- Welcome / login entry screen
- Sign in screen
- Sign up screen
- Landing screen
- Discover screen
- Search screen
- Saved screen
- Collections screen
- Collection detail screen
- Recipe detail screen
- Add recipe screen
- Profile / menu screen
- About / modal screen

## Folder Structure
- `app/`
  App routes and screen entry points
- `app/(tabs)/`
  Tab-based screens such as Discover, Search, Saved, and Collections
- `components/`
  Reusable UI pieces such as buttons, cards, favorite controls, brand elements, and layout wrappers
- `components/ui/`
  Lower-level presentational UI helpers
- `constants/`
  App-wide colors, spacing, typography, and static config
- `data/`
  Seed recipe data and mock content for early development
- `hooks/`
  Reusable hooks for theme, responsiveness, and app behavior
- `utils/`
  Utility helpers, formatters, validators, and mappers
- `assets/`
  Images, icons, splash assets, and future illustrations
- `scripts/`
  Project scripts for maintenance or setup
- `docs/`
  Optional documentation, design notes, and future planning files

## Tech Stack
- React Native
- Expo
- Expo Router
- TypeScript
- React Navigation
- Expo Image
- Expo Haptics
- React Native Reanimated
- Async storage or local persistence for saved recipes and collections
- Optional backend later:
  Firebase, Supabase, or a custom API for auth and synced user data

## Development Phases

### Phase 1: Foundation
- Set up Expo app structure
- Configure routing and tabs
- Establish theme, colors, spacing, and reusable layout patterns
- Add mock recipe data
- Create responsive screen shell and shared components

### Phase 2: Core Browsing Experience
- Build landing screen
- Build discover feed
- Build search experience
- Build recipe detail page
- Add responsive card layouts

### Phase 3: Save and Organize
- Add favorite/save interactions
- Build saved recipes screen
- Add collections data model
- Create collections screen and collection detail screen
- Allow users to assign saved recipes to collections

### Phase 4: Account and Entry Flow
- Build welcome screen
- Build sign in and sign up screens
- Add guest entry flow
- Add profile/menu screen
- Add onboarding polish and navigation improvements

### Phase 5: Recipe Contribution
- Build add recipe screen
- Add validation for recipe input
- Support image input later if needed
- Connect user-created recipes into discovery and saved flows

### Phase 6: Persistence and Backend
- Persist favorites and collections locally
- Add account-based sync if backend is introduced
- Add authentication provider integration
- Prepare data layer for production use

### Phase 7: Polish and QA
- Improve animations, transitions, and haptics
- Test responsiveness across phone sizes
- Improve accessibility and touch targets
- Clean up edge cases and empty states
- Finalize visual polish and app performance
