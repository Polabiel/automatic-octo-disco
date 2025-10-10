# Exemplos de Uso - Sistema de Assinaturas PIX

Este documento demonstra como usar o sistema de assinaturas PIX em sua aplicação.

## Configuração Inicial

Primeiro, certifique-se de que o banco de dados está atualizado com os novos modelos:

```bash
# Gerar o Prisma Client
pnpm -F @acme/db generate

# Enviar o schema para o banco de dados
pnpm db:push
```

## Exemplos de Uso (Frontend)

### 1. Listar Planos Disponíveis

```typescript
import { trpc } from "~/utils/api";

function SubscriptionPlansPage() {
  const { data: plans, isLoading } = trpc.subscriptionPlan.all.useQuery();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Escolha seu Plano</h1>
      {plans?.map((plan) => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
          <p>R$ {plan.price.toString()} / {plan.interval}</p>
          <ul>
            {plan.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
          <button onClick={() => handleSubscribe(plan.id)}>
            Assinar
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 2. Criar uma Assinatura

```typescript
import { trpc } from "~/utils/api";

function useSubscription() {
  const createSubscription = trpc.subscription.create.useMutation();

  const handleSubscribe = async (planId: string) => {
    try {
      const subscription = await createSubscription.mutateAsync({ planId });
      console.log("Assinatura criada:", subscription);
      // Redirecionar para página de pagamento
      return subscription;
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
    }
  };

  return { handleSubscribe };
}
```

### 3. Gerar Pagamento PIX

```typescript
import { trpc } from "~/utils/api";

function CheckoutPage({ subscriptionId }: { subscriptionId: string }) {
  const createPayment = trpc.pixPayment.create.useMutation();
  const { data: subscription } = trpc.subscription.byId.useQuery({
    id: subscriptionId,
  });

  const handleGeneratePixPayment = async () => {
    if (!subscription) return;

    try {
      const payment = await createPayment.mutateAsync({
        subscriptionId: subscription.id,
        amount: subscription.plan.price.toString(),
      });

      // Mostrar QR Code e código copia e cola
      return payment;
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      <button onClick={handleGeneratePixPayment}>
        Gerar PIX
      </button>
    </div>
  );
}
```

### 4. Exibir QR Code PIX

```typescript
import { trpc } from "~/utils/api";
import QRCode from "qrcode.react"; // npm install qrcode.react

function PixPaymentDisplay({ paymentId }: { paymentId: string }) {
  const { data: payment } = trpc.pixPayment.byId.useQuery({ id: paymentId });

  if (!payment) return <div>Carregando...</div>;

  const handleCopyPixCode = () => {
    if (payment.pixCopyPaste) {
      navigator.clipboard.writeText(payment.pixCopyPaste);
      alert("Código PIX copiado!");
    }
  };

  return (
    <div>
      <h2>Pagamento via PIX</h2>
      <p>Valor: R$ {payment.amount.toString()}</p>
      <p>Expira em: {new Date(payment.expiresAt).toLocaleString()}</p>

      {/* QR Code */}
      <div>
        <h3>Escaneie o QR Code:</h3>
        {payment.pixQrCode && (
          <QRCode value={payment.pixQrCode} size={256} />
        )}
      </div>

      {/* Código Copia e Cola */}
      <div>
        <h3>Ou copie o código:</h3>
        <code>{payment.pixCopyPaste}</code>
        <button onClick={handleCopyPixCode}>Copiar Código</button>
      </div>

      {/* Status */}
      <p>Status: {payment.status}</p>
    </div>
  );
}
```

### 5. Verificar Status de Pagamento

```typescript
import { trpc } from "~/utils/api";
import { useEffect } from "react";

function PaymentStatusChecker({ paymentId }: { paymentId: string }) {
  const { data: payment, refetch } = trpc.pixPayment.byId.useQuery({
    id: paymentId,
  });

  // Polling a cada 5 segundos para verificar o status
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    // Parar polling se pagamento foi confirmado
    if (payment?.status === "paid") {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [payment?.status, refetch]);

  if (payment?.status === "paid") {
    return (
      <div>
        <h2>✅ Pagamento Confirmado!</h2>
        <p>Sua assinatura foi ativada.</p>
      </div>
    );
  }

  return (
    <div>
      <p>Aguardando confirmação do pagamento...</p>
    </div>
  );
}
```

### 6. Visualizar Minhas Assinaturas

```typescript
import { trpc } from "~/utils/api";

function MySubscriptionsPage() {
  const { data: subscriptions } = trpc.subscription.mySubscriptions.useQuery();
  const cancelSubscription = trpc.subscription.cancel.useMutation();

  const handleCancel = async (id: string) => {
    if (confirm("Tem certeza que deseja cancelar sua assinatura?")) {
      try {
        await cancelSubscription.mutateAsync({ id });
        alert("Assinatura cancelada com sucesso!");
      } catch (error) {
        console.error("Erro ao cancelar:", error);
      }
    }
  };

  return (
    <div>
      <h1>Minhas Assinaturas</h1>
      {subscriptions?.map((sub) => (
        <div key={sub.id}>
          <h2>{sub.plan.name}</h2>
          <p>Status: {sub.status}</p>
          <p>Início: {new Date(sub.startDate).toLocaleDateString()}</p>
          {sub.endDate && (
            <p>Término: {new Date(sub.endDate).toLocaleDateString()}</p>
          )}
          
          {sub.status === "active" && (
            <button onClick={() => handleCancel(sub.id)}>
              Cancelar Assinatura
            </button>
          )}

          <h3>Pagamentos Recentes:</h3>
          <ul>
            {sub.pixPayments.map((payment) => (
              <li key={payment.id}>
                R$ {payment.amount.toString()} - {payment.status} 
                {payment.paidAt && ` - Pago em ${new Date(payment.paidAt).toLocaleDateString()}`}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### 7. Simular Confirmação de Pagamento (Desenvolvimento)

```typescript
import { trpc } from "~/utils/api";

function PaymentTestControls({ paymentId }: { paymentId: string }) {
  const confirmPayment = trpc.pixPayment.confirmPayment.useMutation();
  const utils = trpc.useContext();

  const handleConfirmPayment = async () => {
    try {
      await confirmPayment.mutateAsync({ id: paymentId });
      // Invalidar queries para atualizar a UI
      await utils.pixPayment.byId.invalidate({ id: paymentId });
      await utils.subscription.myActiveSubscription.invalidate();
      alert("Pagamento confirmado! (simulação)");
    } catch (error) {
      console.error("Erro:", error);
      alert(error.message);
    }
  };

  return (
    <div style={{ border: "2px solid orange", padding: "10px" }}>
      <p>⚠️ Controles de Teste - Apenas Desenvolvimento</p>
      <button onClick={handleConfirmPayment}>
        Simular Confirmação de Pagamento
      </button>
    </div>
  );
}
```

## Exemplos de Uso (Backend/Admin)

### 1. Criar um Plano de Assinatura

```typescript
import { trpc } from "~/utils/api";

function AdminCreatePlan() {
  const createPlan = trpc.subscriptionPlan.create.useMutation();

  const handleCreatePlan = async () => {
    try {
      const plan = await createPlan.mutateAsync({
        name: "Plano Premium",
        description: "Acesso completo a todos os recursos",
        price: "99.90",
        interval: "monthly",
        features: [
          "Acesso ilimitado",
          "Suporte prioritário",
          "Sem anúncios",
          "API Access",
        ],
      });
      console.log("Plano criado:", plan);
    } catch (error) {
      console.error("Erro ao criar plano:", error);
    }
  };

  return (
    <button onClick={handleCreatePlan}>
      Criar Plano Premium
    </button>
  );
}
```

### 2. Atualizar um Plano

```typescript
import { trpc } from "~/utils/api";

function AdminUpdatePlan({ planId }: { planId: string }) {
  const updatePlan = trpc.subscriptionPlan.update.useMutation();

  const handleUpdatePrice = async (newPrice: string) => {
    try {
      await updatePlan.mutateAsync({
        id: planId,
        price: newPrice,
      });
      alert("Preço atualizado!");
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <button onClick={() => handleUpdatePrice("79.90")}>
      Atualizar Preço para R$ 79,90
    </button>
  );
}
```

### 3. Desativar um Plano

```typescript
import { trpc } from "~/utils/api";

function AdminDeactivatePlan({ planId }: { planId: string }) {
  const deactivatePlan = trpc.subscriptionPlan.deactivate.useMutation();

  const handleDeactivate = async () => {
    if (confirm("Desativar este plano? Novas assinaturas não poderão ser criadas.")) {
      try {
        await deactivatePlan.mutateAsync({ id: planId });
        alert("Plano desativado!");
      } catch (error) {
        console.error("Erro:", error);
      }
    }
  };

  return (
    <button onClick={handleDeactivate}>
      Desativar Plano
    </button>
  );
}
```

## Fluxo Completo de Assinatura

```typescript
import { useState } from "react";
import { trpc } from "~/utils/api";

function CompleteSubscriptionFlow() {
  const [step, setStep] = useState<"plans" | "checkout" | "payment" | "success">("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const { data: plans } = trpc.subscriptionPlan.all.useQuery();
  const createSubscription = trpc.subscription.create.useMutation();
  const createPayment = trpc.pixPayment.create.useMutation();

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId);
    
    // Criar assinatura
    const subscription = await createSubscription.mutateAsync({ planId });
    setSubscriptionId(subscription.id);
    setStep("checkout");
  };

  const handleGeneratePayment = async () => {
    if (!subscriptionId || !selectedPlanId) return;
    
    const plan = plans?.find(p => p.id === selectedPlanId);
    if (!plan) return;

    // Gerar pagamento PIX
    const payment = await createPayment.mutateAsync({
      subscriptionId,
      amount: plan.price.toString(),
    });
    
    setPaymentId(payment.id);
    setStep("payment");
  };

  // Renderizar componentes baseado no step atual
  if (step === "plans") {
    return (
      <div>
        {/* Listar planos e botão para selecionar */}
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div>
        {/* Resumo e botão para gerar PIX */}
        <button onClick={handleGeneratePayment}>Gerar PIX</button>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div>
        {/* Mostrar QR Code e aguardar pagamento */}
        {/* Usar PaymentStatusChecker para monitorar */}
      </div>
    );
  }

  return <div>Assinatura ativada com sucesso! ✅</div>;
}
```

## Notas Importantes

1. **Webhook em Produção**: O endpoint `pixPayment.updateStatus` deve ser chamado via webhook do provedor PIX, não diretamente pelo frontend.

2. **Segurança**: Adicione validação de roles para rotas admin (criar/editar planos).

3. **Polling vs WebSocket**: Para produção, considere usar WebSocket em vez de polling para verificar status de pagamento.

4. **Tratamento de Erros**: Sempre envolva as mutações em try-catch e forneça feedback ao usuário.

5. **Validação**: Os schemas Zod garantem validação em tempo de execução. Use os tipos TypeScript gerados para type-safety no frontend.
