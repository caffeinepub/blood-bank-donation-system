import { createRoute, redirect } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import RegisterPage from '@/pages/RegisterPage';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/register',
  component: RegisterPage,
});
