/**
 * Seed script for PIX subscription billing
 *
 * This script creates sample subscription plans in the database.
 * Run with: pnpm tsx packages/db/seed/subscription-plans.ts
 */

import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding subscription plans...");

  // Create Basic Plan
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Plano Básico",
      description: "Perfeito para começar",
      price: "29.90",
      interval: "monthly",
      features: [
        "Acesso básico à plataforma",
        "Suporte por email",
        "Até 5 projetos",
      ],
      isActive: true,
    },
  });
  console.log("✅ Created Basic Plan:", basicPlan.name);

  // Create Pro Plan
  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Plano Pro",
      description: "Para profissionais que precisam de mais recursos",
      price: "79.90",
      interval: "monthly",
      features: [
        "Tudo do Plano Básico",
        "Suporte prioritário",
        "Até 50 projetos",
        "API Access",
        "Relatórios avançados",
      ],
      isActive: true,
    },
  });
  console.log("✅ Created Pro Plan:", proPlan.name);

  // Create Enterprise Plan
  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Plano Enterprise",
      description: "Para empresas que precisam do máximo de recursos",
      price: "299.90",
      interval: "monthly",
      features: [
        "Tudo do Plano Pro",
        "Projetos ilimitados",
        "Suporte dedicado 24/7",
        "SLA garantido",
        "Integração personalizada",
        "Treinamento da equipe",
      ],
      isActive: true,
    },
  });
  console.log("✅ Created Enterprise Plan:", enterprisePlan.name);

  // Create Yearly Basic Plan (with discount)
  const yearlyBasicPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      name: "Plano Básico Anual",
      description: "Plano básico com desconto anual",
      price: "299.90",
      interval: "yearly",
      features: [
        "Acesso básico à plataforma",
        "Suporte por email",
        "Até 5 projetos",
        "💰 Economize 2 meses",
      ],
      isActive: true,
    },
  });
  console.log("✅ Created Yearly Basic Plan:", yearlyBasicPlan.name);

  // Create Yearly Pro Plan (with discount)
  const yearlyProPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000005" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000005",
      name: "Plano Pro Anual",
      description: "Plano profissional com desconto anual",
      price: "799.90",
      interval: "yearly",
      features: [
        "Tudo do Plano Básico",
        "Suporte prioritário",
        "Até 50 projetos",
        "API Access",
        "Relatórios avançados",
        "💰 Economize 2 meses",
      ],
      isActive: true,
    },
  });
  console.log("✅ Created Yearly Pro Plan:", yearlyProPlan.name);

  console.log("\n✨ Seeding completed successfully!");
  console.log(`\nCreated ${5} subscription plans:`);
  console.log("- Plano Básico (Mensal): R$ 29,90");
  console.log("- Plano Pro (Mensal): R$ 79,90");
  console.log("- Plano Enterprise (Mensal): R$ 299,90");
  console.log("- Plano Básico (Anual): R$ 299,90");
  console.log("- Plano Pro (Anual): R$ 799,90");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
