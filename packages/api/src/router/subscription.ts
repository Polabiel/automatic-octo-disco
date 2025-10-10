/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import {
  CancelSubscriptionSchema,
  CreateSubscriptionSchema,
} from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const subscriptionRouter: TRPCRouterRecord = {
  // Get all subscriptions for the current user
  mySubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user as { id: string };
    return ctx.db.subscription.findMany({
      where: { userId: user.id },
      include: {
        plan: true,
        pixPayments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get active subscription for the current user
  myActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user as { id: string };
    return ctx.db.subscription.findFirst({
      where: {
        userId: user.id,
        status: "active",
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      include: {
        plan: true,
      },
    });
  }),

  // Get a specific subscription by ID
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user as { id: string };
      return ctx.db.subscription.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
        include: {
          plan: true,
          pixPayments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Create a new subscription (initiates subscription process)
  create: protectedProcedure
    .input(CreateSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user as { id: string };

      // Check if user already has an active subscription
      const activeSubscription = await ctx.db.subscription.findFirst({
        where: {
          userId: user.id,
          status: "active",
          OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
        },
      });

      if (activeSubscription) {
        throw new Error("User already has an active subscription");
      }

      // Get the plan details
      const plan = await ctx.db.subscriptionPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan?.isActive) {
        throw new Error("Invalid or inactive subscription plan");
      }

      // Calculate end date based on interval
      const startDate = new Date();
      const endDate = new Date(startDate);
      switch (plan.interval) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Create the subscription with pending status
      const subscription = await ctx.db.subscription.create({
        data: {
          userId: user.id,
          planId: input.planId,
          status: "pending",
          startDate,
          endDate,
        },
        include: {
          plan: true,
        },
      });

      return subscription;
    }),

  // Cancel a subscription
  cancel: protectedProcedure
    .input(CancelSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user as { id: string };

      const subscription = await ctx.db.subscription.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      if (subscription.status === "cancelled") {
        throw new Error("Subscription is already cancelled");
      }

      return ctx.db.subscription.update({
        where: { id: input.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });
    }),
};
