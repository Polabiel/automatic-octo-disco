import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { HydrateClient } from "~/trpc/server";
import { MySubscriptions } from "../_components/my-subscriptions";

export default function MySubscriptionsPage() {
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
          <div className="mx-auto max-w-5xl space-y-12">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Minhas Assinaturas
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Gerencie suas assinaturas ativas e visualize o histórico de
                pagamentos.
              </p>
            </div>

            {/* Subscriptions List */}
            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              }
            >
              <MySubscriptions />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
