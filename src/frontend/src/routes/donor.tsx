import DonorDashboard from "@/pages/donor/DonorDashboard";
import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/donor",
  component: DonorDashboard,
  beforeLoad: ({ context }) => {
    if (!context.auth.identity) {
      throw redirect({ to: "/" });
    }
  },
});
