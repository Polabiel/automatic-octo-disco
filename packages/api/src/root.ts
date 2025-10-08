import type { AnyRouter } from "@trpc/server";

import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter: AnyRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
});

export type AppRouter = AnyRouter;
