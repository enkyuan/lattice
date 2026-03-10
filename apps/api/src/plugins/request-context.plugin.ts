import { Elysia } from "elysia";
import { SERVICE_NAME } from "@lib/constants";
import { createRequestId } from "@lib/ids";

export const requestContextPlugin = new Elysia({
  name: "request-context.plugin",
})
  .derive(({ request, set }) => {
    const requestId = request.headers.get("x-request-id") ?? createRequestId();
    set.headers["x-request-id"] = requestId;
    return {
      requestId,
    };
  })
  .decorate("serviceName", SERVICE_NAME);
