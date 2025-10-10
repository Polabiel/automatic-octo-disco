# Sistema de Cobrança de Assinaturas via PIX - Guia Rápido

## 📋 Visão Geral

Este projeto agora inclui um sistema completo de cobrança de assinaturas via PIX, seguindo o modelo SaaS (Software as a Service). O sistema permite que usuários assinem planos de diferentes valores e períodos, realizando pagamentos via PIX.

## 🚀 Como Começar

### 1. Configurar o Banco de Dados

```bash
# Iniciar o banco de dados PostgreSQL (Docker)
pnpm db:start

# O comando acima já executa:
# - docker compose up -d
# - pnpm -F @acme/db generate (gera o Prisma Client)
# - pnpm -F @acme/db push (sincroniza o schema com o banco)
```

### 2. Popular com Dados de Exemplo

```bash
# Criar planos de assinatura de exemplo
pnpm tsx packages/db/seed/subscription-plans.ts
```

Isso criará 5 planos:
- **Básico Mensal**: R$ 29,90/mês
- **Pro Mensal**: R$ 79,90/mês
- **Enterprise Mensal**: R$ 299,90/mês
- **Básico Anual**: R$ 299,90/ano (desconto de 2 meses)
- **Pro Anual**: R$ 799,90/ano (desconto de 2 meses)

### 3. Iniciar o Desenvolvimento

```bash
# Iniciar Next.js app
pnpm dev:web

# Ou iniciar Expo app
pnpm dev:ios    # iOS
pnpm dev:android # Android
```

## 📚 Documentação

### Documentos Disponíveis

1. **[PIX_SUBSCRIPTION_BILLING.md](./PIX_SUBSCRIPTION_BILLING.md)**
   - Documentação completa da API
   - Descrição dos modelos de dados
   - Referência de todas as rotas tRPC
   - Fluxo de assinatura

2. **[PIX_SUBSCRIPTION_USAGE_EXAMPLES.md](./PIX_SUBSCRIPTION_USAGE_EXAMPLES.md)**
   - Exemplos práticos de código
   - Componentes React prontos para usar
   - Fluxo completo de assinatura
   - Exemplos de admin

## 🎯 Funcionalidades Principais

### Para Usuários

- ✅ Visualizar planos disponíveis
- ✅ Criar assinatura
- ✅ Gerar pagamento PIX (QR Code + Copia e Cola)
- ✅ Acompanhar status do pagamento
- ✅ Visualizar histórico de assinaturas
- ✅ Cancelar assinatura ativa

### Para Administradores

- ✅ Criar planos de assinatura
- ✅ Editar planos existentes
- ✅ Desativar planos
- ✅ Gerenciar intervalos (mensal, trimestral, anual)

## 🔧 Estrutura Técnica

### Modelos de Banco de Dados

```
SubscriptionPlan (Planos)
├── id, name, description
├── price, interval
└── features[], isActive

Subscription (Assinaturas)
├── userId, planId
├── status (pending/active/cancelled/expired)
└── startDate, endDate, cancelledAt

PixPayment (Pagamentos)
├── subscriptionId, userId
├── amount, status
├── pixKey, pixQrCode, pixCopyPaste
└── expiresAt, paidAt, transactionId
```

### Rotas tRPC

```typescript
// Planos
trpc.subscriptionPlan.all.useQuery()
trpc.subscriptionPlan.byId.useQuery({ id })
trpc.subscriptionPlan.create.useMutation()
trpc.subscriptionPlan.update.useMutation()
trpc.subscriptionPlan.deactivate.useMutation()

// Assinaturas
trpc.subscription.mySubscriptions.useQuery()
trpc.subscription.myActiveSubscription.useQuery()
trpc.subscription.byId.useQuery({ id })
trpc.subscription.create.useMutation()
trpc.subscription.cancel.useMutation()

// Pagamentos PIX
trpc.pixPayment.myPayments.useQuery()
trpc.pixPayment.byId.useQuery({ id })
trpc.pixPayment.pendingForSubscription.useQuery({ subscriptionId })
trpc.pixPayment.create.useMutation()
trpc.pixPayment.updateStatus.useMutation()
trpc.pixPayment.confirmPayment.useMutation() // apenas dev/teste
```

## 📝 Exemplo Rápido

### Criar uma Assinatura (Frontend)

```typescript
import { trpc } from "~/utils/api";

function SubscribeToPlan({ planId }: { planId: string }) {
  const createSubscription = trpc.subscription.create.useMutation();
  const createPayment = trpc.pixPayment.create.useMutation();

  const handleSubscribe = async () => {
    // 1. Criar assinatura
    const subscription = await createSubscription.mutateAsync({ planId });
    
    // 2. Gerar pagamento PIX
    const payment = await createPayment.mutateAsync({
      subscriptionId: subscription.id,
      amount: subscription.plan.price.toString(),
    });
    
    // 3. Mostrar QR Code para o usuário
    console.log("PIX QR Code:", payment.pixQrCode);
    console.log("Copia e Cola:", payment.pixCopyPaste);
  };

  return <button onClick={handleSubscribe}>Assinar</button>;
}
```

## 🔄 Fluxo Completo

1. **Usuário escolhe plano** → `subscriptionPlan.all`
2. **Cria assinatura** → `subscription.create` (status: pending)
3. **Gera PIX** → `pixPayment.create`
4. **Realiza pagamento** → (via app do banco)
5. **Sistema confirma** → `pixPayment.updateStatus` (webhook)
6. **Assinatura ativa** → (automático quando payment.status = 'paid')

## 🚧 Próximos Passos para Produção

### 1. Integrar Provedor PIX Real

Substitua o código mock em `packages/api/src/router/pix-payment.ts` por integração com:
- Mercado Pago
- PagSeguro
- Pagar.me
- Asaas
- Outro provedor de sua escolha

### 2. Implementar Webhooks

Configure o webhook do provedor PIX para chamar `pixPayment.updateStatus`:

```typescript
// Exemplo de endpoint webhook
app.post("/api/webhook/pix", async (req, res) => {
  const { paymentId, status, transactionId } = req.body;
  
  // Validar webhook (importante!)
  // ...
  
  // Atualizar status
  await trpc.pixPayment.updateStatus.mutate({
    id: paymentId,
    status: status,
    transactionId: transactionId,
  });
  
  res.json({ success: true });
});
```

### 3. Adicionar Controle de Acesso

Implementar verificação de roles para rotas admin:

```typescript
// Exemplo de middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const user = ctx.session.user as { role?: string };
  if (user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});
```

### 4. Implementar Renovação Automática

Criar um cron job para verificar assinaturas próximas do vencimento:

```typescript
// packages/api/src/jobs/subscription-renewal.ts
async function renewSubscriptions() {
  const expiringSubscriptions = await db.subscription.findMany({
    where: {
      endDate: {
        lte: addDays(new Date(), 3), // 3 dias antes
        gte: new Date(),
      },
      status: "active",
    },
    include: { plan: true, user: true },
  });

  for (const subscription of expiringSubscriptions) {
    // Gerar novo pagamento PIX
    // Enviar email de notificação
  }
}
```

## 🎨 UI Components Sugeridos

Para implementar a interface de usuário, considere criar:

1. **SubscriptionPlansGrid** - Grid de cards de planos
2. **PixPaymentModal** - Modal com QR Code e copia e cola
3. **SubscriptionStatusBadge** - Badge de status colorido
4. **PaymentHistory** - Tabela de pagamentos
5. **SubscriptionDashboard** - Dashboard do usuário

Exemplos completos estão em `docs/PIX_SUBSCRIPTION_USAGE_EXAMPLES.md`.

## 💡 Dicas

- Use `pixPayment.confirmPayment` apenas para testes locais
- Em produção, sempre use webhooks para confirmar pagamentos
- Configure polling ou WebSocket para atualizar status em tempo real
- Adicione rate limiting nas rotas de criação
- Implemente logs de auditoria para operações importantes
- Configure alertas para pagamentos pendentes há muito tempo

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação completa em `/docs`
2. Revise os exemplos de código
3. Verifique os logs do console
4. Certifique-se de que o banco de dados está rodando

## ✅ Checklist de Implementação

- [x] Modelos de banco de dados
- [x] Validação com Zod
- [x] Rotas tRPC
- [x] Documentação completa
- [x] Exemplos de uso
- [x] Seed script
- [ ] Integração com provedor PIX real
- [ ] Webhooks configurados
- [ ] UI Components
- [ ] Testes automatizados
- [ ] Sistema de notificações
- [ ] Renovação automática
- [ ] Controle de acesso (roles)
- [ ] Analytics e métricas

---

**Desenvolvido com ❤️ usando:**
- Next.js 15
- tRPC v11
- Prisma ORM
- PostgreSQL
- Better Auth
