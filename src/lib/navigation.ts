import type { Href, useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

export function navigateTo(router: AppRouter, path: string) {
  router.navigate(path as Href);
}
