import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as emergencyRoute } from './routes/emergency';
import { Route as registerRoute } from './routes/register';
import { Route as donorRoute } from './routes/donor';
import { Route as adminRoute } from './routes/admin';

export const routeTree = rootRoute.addChildren([
  indexRoute,
  emergencyRoute,
  registerRoute,
  donorRoute,
  adminRoute,
]);
