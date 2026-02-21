import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import LandingPage from '@/pages/LandingPage';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: LandingPage,
});
