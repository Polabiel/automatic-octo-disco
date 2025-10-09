import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { HydrateClient } from "~/trpc/server";
import { SubscriptionPlans } from "../_components/subscription-plans";

export default function SubscriptionsPage() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        {/* Background blur effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="container relative z-10 py-16">
          <div className="mx-auto max-w-6xl space-y-12">
            {/* Header */}
            <div className="space-y-4 text-center">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Escolha seu Plano
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Selecione o plano perfeito para suas necessidades. Todos os
                planos incluem suporte e atualizações gratuitas.
              </p>
            </div>

            {/* Plans Grid */}
            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              }
            >
              <SubscriptionPlans />
            </Suspense>

            {/* Trust Badge */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-6 py-3 backdrop-blur-sm dark:bg-white/5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">
                  Pagamento Seguro via PIX
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-6 py-3 backdrop-blur-sm dark:bg-white/5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">
                  Cancele quando quiser
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-6 py-3 backdrop-blur-sm dark:bg-white/5">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">Suporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
