"use client";

import { useState } from "react";
import { Calendar, CreditCard, Loader2, XCircle } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export function MySubscriptions() {
  const trpc = useTRPC();
  const { data: subscriptions, isLoading } =
    trpc.subscription.mySubscriptions.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          Você ainda não possui assinaturas.
        </p>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          onClick={() => (window.location.href = "/subscriptions")}
        >
          Ver Planos Disponíveis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: RouterOutputs["subscription"]["mySubscriptions"][number];
}

function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const utils = useTRPC();
  const cancelMutation = utils.subscription.cancel.useMutation({
    onSuccess: () => {
      utils.subscription.mySubscriptions.invalidate();
    },
  });

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura?")) return;

    setIsCancelling(true);
    try {
      await cancelMutation.mutateAsync({ id: subscription.id });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCancelling(false);
    }
  };

  const statusColors = {
    active: "success",
    pending: "warning",
    cancelled: "destructive",
    expired: "outline",
  } as const;

  const statusLabels = {
    active: "Ativa",
    pending: "Pendente",
    cancelled: "Cancelada",
    expired: "Expirada",
  } as const;

  return (
    <Card
      variant="glass"
      className="overflow-hidden transition-all hover:shadow-xl"
    >
      <CardHeader className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{subscription.plan.name}</CardTitle>
            {subscription.plan.description && (
              <CardDescription>{subscription.plan.description}</CardDescription>
            )}
          </div>
          <Badge
            variant={
              statusColors[subscription.status as keyof typeof statusColors]
            }
          >
            {statusLabels[subscription.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
            R$ {subscription.plan.price.toString()}
          </span>
          <span className="text-muted-foreground">
            /{" "}
            {subscription.plan.interval === "monthly"
              ? "mês"
              : subscription.plan.interval === "yearly"
                ? "ano"
                : "trimestre"}
          </span>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-blue-500/5 p-3">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Início</p>
              <p className="text-sm font-medium">
                {new Date(subscription.startDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {subscription.endDate && (
            <div className="flex items-center gap-3 rounded-lg bg-purple-500/5 p-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Renovação</p>
                <p className="text-sm font-medium">
                  {new Date(subscription.endDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Recursos incluídos:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {subscription.plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-foreground/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        {subscription.pixPayments && subscription.pixPayments.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">Pagamentos recentes:</p>
            <div className="space-y-2">
              {subscription.pixPayments.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">
                        R$ {payment.amount.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.status === "paid"
                        ? "success"
                        : payment.status === "pending"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {payment.status === "paid"
                      ? "Pago"
                      : payment.status === "pending"
                        ? "Pendente"
                        : payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {subscription.status === "active" && (
        <CardFooter className="bg-muted/30">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isCancelling}
            className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Assinatura
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
