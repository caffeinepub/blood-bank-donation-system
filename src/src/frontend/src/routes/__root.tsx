import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import type { useInternetIdentity } from '@/hooks/useInternetIdentity';

interface RouterContext {
  queryClient: QueryClient;
  auth: ReturnType<typeof useInternetIdentity>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
