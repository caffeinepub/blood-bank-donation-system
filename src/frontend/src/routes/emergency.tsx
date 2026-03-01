import EmergencyRequestPage from "@/pages/EmergencyRequestPage";
import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/emergency",
  component: EmergencyRequestPage,
});
