/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { z } from "zod/v4";

import {
  CreatePixPaymentSchema,
  UpdatePixPaymentStatusSchema,
} from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const pixPaymentRouter = {
  // Get all PIX payments for the current user
  myPayments: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user as { id: string };
    return ctx.db.pixPayment.findMany({
      where: { userId: user.id },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get a specific PIX payment by ID
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user as { id: string };
      return ctx.db.pixPayment.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });
    }),

  // Get pending PIX payment for a subscription
  pendingForSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user as { id: string };
      return ctx.db.pixPayment.findFirst({
        where: {
          subscriptionId: input.subscriptionId,
          userId: user.id,
          status: "pending",
          expiresAt: { gt: new Date() },
        },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });
    }),

  // Create a new PIX payment
  create: protectedProcedure
    .input(CreatePixPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user as { id: string };

      // Verify subscription belongs to user
      const subscription = await ctx.db.subscription.findFirst({
        where: {
          id: input.subscriptionId,
          userId: user.id,
        },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      // Check if there's already a pending payment
      const existingPendingPayment = await ctx.db.pixPayment.findFirst({
        where: {
          subscriptionId: input.subscriptionId,
          status: "pending",
          expiresAt: { gt: new Date() },
        },
      });

      if (existingPendingPayment) {
        return existingPendingPayment;
      }

      // Generate PIX payment (mock implementation)
      // In a real application, you would integrate with a PIX payment provider
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiration

      const pixPayment = await ctx.db.pixPayment.create({
        data: {
          subscriptionId: input.subscriptionId,
          userId: user.id,
          amount: input.amount,
          status: "pending",
          expiresAt,
          // Mock PIX data - replace with real PIX provider integration
          pixKey: "pix@example.com",
          pixQrCode: `00020126580014BR.GOV.BCB.PIX0136${user.id}520400005303986540${input.amount}5802BR5913Example Store6009SAO PAULO62070503***6304`,
          pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136${user.id}520400005303986540${input.amount}5802BR5913Example Store6009SAO PAULO62070503***6304ABCD`,
        },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      return pixPayment;
    }),

  // Update PIX payment status (simulates webhook from payment provider)
  updateStatus: protectedProcedure
    .input(UpdatePixPaymentStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, status, transactionId } = input;

      const payment = await ctx.db.pixPayment.findUnique({
        where: { id },
        include: { subscription: true },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      const updatedPayment = await ctx.db.pixPayment.update({
        where: { id },
        data: {
          status,
          transactionId,
          paidAt: status === "paid" ? new Date() : payment.paidAt,
        },
      });

      // If payment is confirmed, activate the subscription
      if (status === "paid") {
        await ctx.db.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "active" },
        });
      }

      return updatedPayment;
    }),

  // Simulate payment confirmation (for testing purposes)
  // In production, this would be handled by a webhook from the payment provider
  confirmPayment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user as { id: string };

      const payment = await ctx.db.pixPayment.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
        include: { subscription: true },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status === "paid") {
        throw new Error("Payment already confirmed");
      }

      if (payment.expiresAt < new Date()) {
        await ctx.db.pixPayment.update({
          where: { id: input.id },
          data: { status: "expired" },
        });
        throw new Error("Payment expired");
      }

      const updatedPayment = await ctx.db.pixPayment.update({
        where: { id: input.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          transactionId: `TXN-${Date.now()}`,
        },
      });

      // Activate the subscription
      await ctx.db.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "active" },
      });

      return updatedPayment;
    }),
};
