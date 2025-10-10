# PIX Subscription Billing SaaS

Este projeto implementa um sistema de cobrança de assinaturas via PIX, seguindo o modelo SaaS (Software as a Service).

## Estrutura do Sistema

### Modelos de Dados

#### 1. SubscriptionPlan (Plano de Assinatura)
Representa os planos de assinatura disponíveis para os usuários.

**Campos:**
- `id`: UUID único do plano
- `name`: Nome do plano (ex: "Básico", "Premium", "Enterprise")
- `description`: Descrição detalhada do plano
- `price`: Preço do plano (Decimal)
- `interval`: Periodicidade (monthly, quarterly, yearly)
- `features`: Array de funcionalidades incluídas
- `isActive`: Se o plano está ativo para novas assinaturas
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

#### 2. Subscription (Assinatura)
Representa a assinatura de um usuário a um plano específico.

**Campos:**
- `id`: UUID único da assinatura
- `userId`: ID do usuário (Foreign Key)
- `planId`: ID do plano (Foreign Key)
- `status`: Status da assinatura (active, cancelled, expired, pending)
- `startDate`: Data de início da assinatura
- `endDate`: Data de término da assinatura
- `cancelledAt`: Data de cancelamento (se aplicável)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

#### 3. PixPayment (Pagamento PIX)
Representa um pagamento via PIX para uma assinatura.

**Campos:**
- `id`: UUID único do pagamento
- `subscriptionId`: ID da assinatura (Foreign Key)
- `userId`: ID do usuário (Foreign Key)
- `amount`: Valor do pagamento (Decimal)
- `status`: Status do pagamento (pending, paid, expired, cancelled)
- `pixKey`: Chave PIX para pagamento
- `pixQrCode`: Dados do QR Code PIX
- `pixCopyPaste`: Código PIX copia e cola
- `expiresAt`: Data de expiração do pagamento
- `paidAt`: Data do pagamento confirmado
- `transactionId`: ID da transação (do provedor PIX)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

## API Routes (tRPC)

### Subscription Plans (`subscriptionPlan`)

#### `subscriptionPlan.all`
- **Tipo:** Query (Pública)
- **Descrição:** Lista todos os planos de assinatura ativos
- **Retorno:** Array de planos ordenados por preço

#### `subscriptionPlan.byId`
- **Tipo:** Query (Pública)
- **Input:** `{ id: string }`
- **Descrição:** Busca um plano específico por ID
- **Retorno:** Plano de assinatura ou null

#### `subscriptionPlan.create`
- **Tipo:** Mutation (Protegida)
- **Input:** `CreateSubscriptionPlanSchema`
- **Descrição:** Cria um novo plano de assinatura (apenas admin)
- **Retorno:** Plano criado

#### `subscriptionPlan.update`
- **Tipo:** Mutation (Protegida)
- **Input:** `UpdateSubscriptionPlanSchema`
- **Descrição:** Atualiza um plano existente (apenas admin)
- **Retorno:** Plano atualizado

#### `subscriptionPlan.deactivate`
- **Tipo:** Mutation (Protegida)
- **Input:** `{ id: string }`
- **Descrição:** Desativa um plano (apenas admin)
- **Retorno:** Plano desativado

### Subscriptions (`subscription`)

#### `subscription.mySubscriptions`
- **Tipo:** Query (Protegida)
- **Descrição:** Lista todas as assinaturas do usuário logado
- **Retorno:** Array de assinaturas com planos e pagamentos

#### `subscription.myActiveSubscription`
- **Tipo:** Query (Protegida)
- **Descrição:** Busca a assinatura ativa do usuário
- **Retorno:** Assinatura ativa ou null

#### `subscription.byId`
- **Tipo:** Query (Protegida)
- **Input:** `{ id: string }`
- **Descrição:** Busca uma assinatura específica do usuário
- **Retorno:** Assinatura com detalhes

#### `subscription.create`
- **Tipo:** Mutation (Protegida)
- **Input:** `CreateSubscriptionSchema`
- **Descrição:** Cria uma nova assinatura (status: pending)
- **Validações:**
  - Usuário não pode ter assinatura ativa
  - Plano deve existir e estar ativo
- **Retorno:** Assinatura criada

#### `subscription.cancel`
- **Tipo:** Mutation (Protegida)
- **Input:** `CancelSubscriptionSchema`
- **Descrição:** Cancela uma assinatura ativa
- **Retorno:** Assinatura cancelada

### PIX Payments (`pixPayment`)

#### `pixPayment.myPayments`
- **Tipo:** Query (Protegida)
- **Descrição:** Lista todos os pagamentos PIX do usuário
- **Retorno:** Array de pagamentos com assinaturas

#### `pixPayment.byId`
- **Tipo:** Query (Protegida)
- **Input:** `{ id: string }`
- **Descrição:** Busca um pagamento específico
- **Retorno:** Pagamento com detalhes

#### `pixPayment.pendingForSubscription`
- **Tipo:** Query (Protegida)
- **Input:** `{ subscriptionId: string }`
- **Descrição:** Busca pagamento pendente para uma assinatura
- **Retorno:** Pagamento pendente ou null

#### `pixPayment.create`
- **Tipo:** Mutation (Protegida)
- **Input:** `CreatePixPaymentSchema`
- **Descrição:** Cria um novo pagamento PIX
- **Validações:**
  - Assinatura deve pertencer ao usuário
  - Não pode ter pagamento pendente válido
- **Retorno:** Pagamento criado com QR Code e chave PIX

#### `pixPayment.updateStatus`
- **Tipo:** Mutation (Protegida)
- **Input:** `UpdatePixPaymentStatusSchema`
- **Descrição:** Atualiza o status de um pagamento
- **Efeito colateral:** Se status = "paid", ativa a assinatura
- **Retorno:** Pagamento atualizado

#### `pixPayment.confirmPayment`
- **Tipo:** Mutation (Protegida)
- **Input:** `{ id: string }`
- **Descrição:** Simula confirmação de pagamento (para testes)
- **Validações:**
  - Pagamento não pode estar expirado
  - Pagamento não pode já estar pago
- **Efeito colateral:** Ativa a assinatura automaticamente
- **Retorno:** Pagamento confirmado

## Fluxo de Assinatura

1. **Usuário escolhe um plano:**
   - Busca planos disponíveis: `subscriptionPlan.all`
   - Visualiza detalhes: `subscriptionPlan.byId`

2. **Usuário cria assinatura:**
   - Cria assinatura: `subscription.create`
   - Status inicial: "pending"

3. **Usuário realiza pagamento:**
   - Cria pagamento PIX: `pixPayment.create`
   - Recebe QR Code e chave PIX
   - Realiza pagamento no app do banco

4. **Sistema confirma pagamento:**
   - Via webhook (em produção): `pixPayment.updateStatus`
   - Para testes: `pixPayment.confirmPayment`
   - Assinatura é ativada automaticamente

5. **Gerenciamento:**
   - Usuário pode cancelar: `subscription.cancel`
   - Usuário visualiza histórico: `subscription.mySubscriptions`
   - Usuário visualiza pagamentos: `pixPayment.myPayments`

## Schemas de Validação

Todos os schemas de validação estão em `packages/db/src/schema.ts`:

- `CreateSubscriptionPlanSchema`
- `UpdateSubscriptionPlanSchema`
- `CreateSubscriptionSchema`
- `CancelSubscriptionSchema`
- `CreatePixPaymentSchema`
- `UpdatePixPaymentStatusSchema`

## Notas de Implementação

### PIX Provider
A implementação atual inclui dados PIX mockados. Em produção, você deve integrar com um provedor de pagamentos PIX real, como:
- Mercado Pago
- PagSeguro
- Pagar.me
- Asaas
- Outro provedor de sua escolha

### Webhooks
Em produção, o `pixPayment.updateStatus` deve ser chamado via webhook do provedor PIX quando um pagamento for confirmado.

### Segurança
- Todas as rotas de assinatura e pagamento são protegidas (requerem autenticação)
- Rotas de admin (criar/editar planos) devem ter validação adicional de role
- Em produção, adicione rate limiting e validação de webhooks

### Renovação Automática
Para implementar renovação automática de assinaturas:
1. Crie um job agendado (cron) que verifica assinaturas próximas do vencimento
2. Gere automaticamente um novo pagamento PIX
3. Notifique o usuário
4. Se não pago, expire a assinatura

## Próximos Passos

Para completar o sistema, considere adicionar:

1. **UI Components:**
   - Tela de listagem de planos
   - Tela de checkout com QR Code PIX
   - Dashboard de assinaturas do usuário
   - Painel admin para gerenciar planos

2. **Notificações:**
   - Email quando assinatura é criada
   - Email quando pagamento é confirmado
   - Email de lembrete antes do vencimento
   - Notificações push

3. **Analytics:**
   - Métricas de conversão
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Lifetime value

4. **Funcionalidades Avançadas:**
   - Cupons de desconto
   - Períodos de teste gratuito
   - Upgrade/downgrade de planos
   - Histórico de faturas
