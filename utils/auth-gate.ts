import { router } from 'expo-router';
import { useEffect } from 'react';

export const PROTECTED_AUTH_ROUTES = {
  addRecipe: '/add-recipe',
  mealPlanner: '/meal-planner',
} as const;

export type ProtectedAuthPath = (typeof PROTECTED_AUTH_ROUTES)[keyof typeof PROTECTED_AUTH_ROUTES];

function isProtectedAuthPath(value: string): value is ProtectedAuthPath {
  return Object.values(PROTECTED_AUTH_ROUTES).includes(value as ProtectedAuthPath);
}

function getRedirectParams(path: ProtectedAuthPath) {
  return { redirectTo: path };
}

export function resolveProtectedAuthPath(value: string | string[] | undefined) {
  const path = Array.isArray(value) ? value[0] ?? '' : value ?? '';
  return isProtectedAuthPath(path) ? path : null;
}

export function openProtectedRoute(isSignedIn: boolean, path: ProtectedAuthPath) {
  if (isSignedIn) {
    router.push(path);
    return true;
  }

  router.push({
    pathname: '/sign-in',
    params: getRedirectParams(path),
  });
  return false;
}

export function replaceWithSignIn(path: ProtectedAuthPath) {
  router.replace({
    pathname: '/sign-in',
    params: getRedirectParams(path),
  });
}

export function useProtectedRouteGuard(isLoading: boolean, isSignedIn: boolean, path: ProtectedAuthPath) {
  useEffect(() => {
    if (isLoading || isSignedIn) {
      return;
    }

    replaceWithSignIn(path);
  }, [isLoading, isSignedIn, path]);

  return !isLoading && isSignedIn;
}

export function getProtectedRouteNotice(path: ProtectedAuthPath | null) {
  if (path === PROTECTED_AUTH_ROUTES.addRecipe) {
    return {
      title: 'Create an account to add recipes',
      copy: 'Add recipe is available for signed-in cooks so every recipe stays tied to a real account.',
    };
  }

  if (path === PROTECTED_AUTH_ROUTES.mealPlanner) {
    return {
      title: 'Create an account to plan meals',
      copy: 'Meal planning is available for signed-in cooks so your weekly plan stays attached to your account.',
    };
  }

  return null;
}
