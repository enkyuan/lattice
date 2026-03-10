import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

export const openapiPlugin = new Elysia({
  name: "openapi.plugin",
}).use(
  swagger({
    path: "/api/openapi",
    documentation: {
      info: {
        title: "Lattice API",
        version: "1.0.50",
      },
    },
  }),
);
