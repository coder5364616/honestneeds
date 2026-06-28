import { useAuthHydration } from './useAuthHydration';
import { useAuthStore } from '@/store/authStore';

export function useUser() {
  // Trigger localStorage -> store hydration on mount and track its status
  const isHydrated = useAuthHydration();
  const user = useAuthStore((state) => state.user);

  // Until hydration completes we don't yet know if the user is logged in,
  // so report loading rather than "not authenticated".
  return { user, isLoading: !isHydrated };
}
