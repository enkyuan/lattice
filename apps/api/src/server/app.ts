import { Elysia } from "elysia";
import { registerErrorHandlers } from "@bootstrap/register-error-handlers";
import { registerPlugins } from "@bootstrap/register-plugins";
import { registerRoutes } from "@bootstrap/register-routes";

export function createApp() {
  const app = new Elysia({
    name: "@lattice/api",
  });

  registerPlugins(app);
  registerErrorHandlers(app);
  registerRoutes(app);

  return app;
}
