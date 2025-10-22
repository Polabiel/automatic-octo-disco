/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { z } from "zod/v4";

import {
  CreateSubscriptionPlanSchema,
  UpdateSubscriptionPlanSchema,
} from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const subscriptionPlanRouter = {
  // Get all active subscription plans (public)
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
  }),

  // Get a specific subscription plan by ID (public)
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.subscriptionPlan.findFirst({
        where: { id: input.id, isActive: true },
      });
    }),

  // Create a new subscription plan (protected - admin only)
  create: protectedProcedure
    .input(CreateSubscriptionPlanSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.subscriptionPlan.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          interval: input.interval,
          features: input.features,
        },
      });
    }),

  // Update a subscription plan (protected - admin only)
  update: protectedProcedure
    .input(UpdateSubscriptionPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.subscriptionPlan.update({
        where: { id },
        data,
      });
    }),

  // Deactivate a subscription plan (protected - admin only)
  deactivate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.subscriptionPlan.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),
};
