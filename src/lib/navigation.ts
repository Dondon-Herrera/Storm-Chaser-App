import type { Href } from 'expo-router';
import type { useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

export function navigateTo(router: AppRouter, path: string) {
  router.navigate(path as Href);
}
