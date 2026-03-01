import { Route as rootRoute } from "./routes/__root";
import { Route as adminRoute } from "./routes/admin";
import { Route as donorRoute } from "./routes/donor";
import { Route as donorAppointmentsRoute } from "./routes/donor/appointments";
import { Route as donorFindDonorsRoute } from "./routes/donor/find-donors";
import { Route as emergencyRoute } from "./routes/emergency";
import { Route as indexRoute } from "./routes/index";
import { Route as registerRoute } from "./routes/register";

export const routeTree = rootRoute.addChildren([
  indexRoute,
  emergencyRoute,
  registerRoute,
  donorRoute,
  donorAppointmentsRoute,
  donorFindDonorsRoute,
  adminRoute,
]);
