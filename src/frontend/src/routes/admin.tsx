import AdminDashboard from "@/pages/admin/AdminDashboard";
import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/admin",
  component: AdminDashboard,
  beforeLoad: ({ context }) => {
    if (!context.auth.identity) {
      throw redirect({ to: "/" });
    }
  },
});
