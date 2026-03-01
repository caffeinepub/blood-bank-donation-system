import AppointmentsPage from "@/pages/donor/AppointmentsPage";
import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "../__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/donor/appointments",
  component: AppointmentsPage,
  beforeLoad: ({ context }) => {
    if (!context.auth.identity) {
      throw redirect({ to: "/" });
    }
  },
});
