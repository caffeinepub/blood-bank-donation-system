import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import EmergencyRequestPage from '@/pages/EmergencyRequestPage';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/emergency',
  component: EmergencyRequestPage,
});
