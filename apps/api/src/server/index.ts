import { createApp } from "./app";
import { env } from "./env";

const app = createApp();

app.listen(env.PORT);

console.log(`@lattice/api listening on ${app.server?.hostname}:${app.server?.port}`);
