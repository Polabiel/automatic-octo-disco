"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

import type { RouterOutputs } from "@acme/api";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/react";

export function SubscriptionPlans() {
  const trpc = useTRPC();
  const { data: plans, isLoading } = trpc.subscriptionPlan.all.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          Nenhum plano disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan, index) => (
        <PlanCard key={plan.id} plan={plan} featured={index === 1} />
      ))}
    </div>
  );
}

interface PlanCardProps {
  plan: RouterOutputs["subscriptionPlan"]["all"][number];
  featured?: boolean;
}

function PlanCard({ plan, featured }: PlanCardProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    // This will be implemented when creating the subscription flow
    setTimeout(() => setIsSubscribing(false), 2000);
  };

  const interval =
    plan.interval === "monthly"
      ? "mês"
      : plan.interval === "yearly"
        ? "ano"
        : "trimestre";

  return (
    <Card
      variant={featured ? "gradient" : "glass"}
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl",
        featured && "ring-2 ring-blue-500/50",
      )}
    >
      {featured && (
        <div className="absolute right-4 top-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Sparkles className="mr-1 h-3 w-3" />
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="relative">
        <CardTitle className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {plan.name}
        </CardTitle>
        {plan.description && (
          <CardDescription className="text-sm">
            {plan.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-baseline">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
            R$ {plan.price.toString()}
          </span>
          <span className="ml-2 text-muted-foreground">/ {interval}</span>
        </div>

        <div className="space-y-3">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-blue-500/10 p-0.5">
                <Check className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm text-foreground/80">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSubscribe}
          disabled={isSubscribing}
          className={cn(
            "w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
            featured && "shadow-lg shadow-blue-500/50",
          )}
        >
          {isSubscribing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Assinar Agora"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
