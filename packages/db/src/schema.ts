import { z } from "zod/v4";

export * from "./generated/client";

export const CreatePostSchema = z.object({
  title: z.string().max(256),
  content: z.string().max(256),
});

// Subscription Plan Schemas
export const CreateSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/), // Decimal as string
  interval: z.enum(["monthly", "quarterly", "yearly"]),
  features: z.array(z.string()),
});

export const UpdateSubscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(256).optional(),
  description: z.string().optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(), // Decimal as string
  interval: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Subscription Schemas
export const CreateSubscriptionSchema = z.object({
  planId: z.string().uuid(),
});

export const UpdateSubscriptionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "cancelled", "expired", "pending"]).optional(),
});

export const CancelSubscriptionSchema = z.object({
  id: z.string().uuid(),
});

// PIX Payment Schemas
export const CreatePixPaymentSchema = z.object({
  subscriptionId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/), // Decimal as string
});

export const UpdatePixPaymentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "paid", "expired", "cancelled"]),
  transactionId: z.string().optional(),
});
