import { authRouter } from "./router/auth";
import { pixPaymentRouter } from "./router/pix-payment";
import { postRouter } from "./router/post";
import { subscriptionRouter } from "./router/subscription";
import { subscriptionPlanRouter } from "./router/subscription-plan";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  subscriptionPlan: subscriptionPlanRouter,
  subscription: subscriptionRouter,
  pixPayment: pixPaymentRouter,
});

export type AppRouter = typeof appRouter;
