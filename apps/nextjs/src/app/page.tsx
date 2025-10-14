import "./globals.css";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/20 font-bold">
              CV
            </div>
            <span className="text-lg font-semibold">Chatvolt</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="hover:underline">
              Funcionalidades
            </a>
            <a href="#pricing" className="hover:underline">
              Preços
            </a>
            <a href="#docs" className="hover:underline">
              Docs
            </a>
            <a href="#contact" className="rounded-md bg-white/20 px-4 py-2">
              Entrar
            </a>
          </nav>
        </div>
      </header>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Cobrança de assinaturas via PIX para seu SaaS
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Automatize cobranças recorrentes por PIX, gerencie planos e
              assinantes, e ofereça uma experiência simples para seus clientes —
              tudo integrado ao painel.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/subscriptions"
                className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-white shadow hover:bg-indigo-700"
              >
                Ver planos
              </a>
              <a
                href="/my-subscriptions"
                className="inline-block rounded-md border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-50"
              >
                Minhas assinaturas
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <strong className="block text-slate-900">99.9%</strong>
                uptime
              </div>
              <div>
                <strong className="block text-slate-900">
                  Meios de pagamento
                </strong>
                PIX, boletos e integrações bancárias
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-6 shadow-sm">
            <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gradient-to-br from-white to-slate-100 text-slate-400">
              Dashboard de cobranças
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Crie planos, gere cobranças PIX automáticas e acompanhe pagamentos
              em tempo real.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold">Funcionalidades</h2>
          <p className="mt-2 text-slate-600">
            Tudo que você precisa para construir e operar chatbots de alto
            valor.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold">Agentes personalizáveis</h3>
              <p className="mt-2 text-sm text-slate-600">
                Crie agentes com personalidade, contexto e skills específicas
                para sua empresa.
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="font-semibold">Integrações prontas</h3>
              <p className="mt-2 text-sm text-slate-600">
                Conecte-se a canais (WhatsApp, Slack) e fontes de dados (S3,
                Notion, sites).
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="font-semibold">Escalabilidade</h3>
              <p className="mt-2 text-sm text-slate-600">
                Arquitetura pronta para produção com monitoramento e rate-limits
                configuráveis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold">Preços</h2>
          <p className="mt-2 text-slate-600">
            Planos simples e previsíveis para startups e empresas.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-4 text-3xl font-extrabold">
                R$0 <span className="text-base font-medium">/mês</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>1 agente</li>
                <li>500 mensagens/mês</li>
                <li>Comunidade</li>
              </ul>
              <a
                className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white"
                href="#signup"
              >
                Começar
              </a>
            </div>

            <div className="rounded-lg border-2 border-indigo-600 bg-white p-6 shadow">
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="mt-4 text-3xl font-extrabold">
                R$199 <span className="text-base font-medium">/mês</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>10 agentes</li>
                <li>10k mensagens/mês</li>
                <li>Suporte</li>
              </ul>
              <a
                className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white"
                href="#signup"
              >
                Experimentar Pro
              </a>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-xl font-semibold">Enterprise</h3>
              <p className="mt-4 text-3xl font-extrabold">Sob consulta</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Agentes ilimitados</li>
                <li>SLAs e onboarding</li>
                <li>Integrações avançadas</li>
              </ul>
              <a
                className="mt-6 inline-block rounded-md border border-slate-200 px-4 py-2"
                href="#contact"
              >
                Fale com vendas
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
          <div>
            <h4 className="font-semibold">Pronto para começar?</h4>
            <p className="text-sm text-slate-600">
              Crie sua conta e lance seu primeiro agente em minutos.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#signup"
              className="rounded-md bg-indigo-600 px-5 py-3 text-white"
            >
              Criar conta
            </a>
            <a href="#docs" className="text-slate-600 hover:underline">
              Ver documentação
            </a>
          </div>
        </div>
        <div className="mt-6 border-t">
          <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-500">
            © {new Date().getFullYear()} Chatvolt. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
