import { Elysia } from "elysia";
import { getHealth } from "@modules/health/health.service";

export const healthRoutes = new Elysia({
  name: "health.routes",
})
  .get("/api/health", async () => {
    return getHealth();
  });
