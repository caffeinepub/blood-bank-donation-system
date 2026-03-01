import FindDonorsPage from "@/pages/donor/FindDonorsPage";
import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "../__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/donor/find-donors",
  component: FindDonorsPage,
  beforeLoad: ({ context }) => {
    if (!context.auth.identity) {
      throw redirect({ to: "/" });
    }
  },
});
