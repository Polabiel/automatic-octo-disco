# create-t3-turbo

> [!NOTE]
>
> create-t3-turbo now uses better-auth for authentication!
> Look out for bugs as we're working through the last issues,
> especially, the oauth proxy might not play very nice with Expo
> so you might need to disable that in [`@acme/auth`](./packages/auth/src/index.ts)

## Installation

> [!NOTE]
>
> Make sure to follow the system requirements specified in [`package.json#engines`](./package.json#L4) before proceeding.

There are two ways of initializing an app using the `create-t3-turbo` starter. You can either use this repository as a template:

![use-as-template](https://github.com/t3-oss/create-t3-turbo/assets/51714798/bb6c2e5d-d8b6-416e-aeb3-b3e50e2ca994)

or use Turbo's CLI to init your project (use PNPM as package manager):

```bash
npx create-turbo@latest -e https://github.com/t3-oss/create-t3-turbo
```

## About

Ever wondered how to migrate your T3 application into a monorepo? Stop right here! This is the perfect starter repo to get you running with the perfect stack!

It uses [Turborepo](https://turborepo.com) and contains:

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ expo
  │   ├─ Expo SDK 53
  │   ├─ React Native using React 19
  │   ├─ Navigation using Expo Router
  │   ├─ Tailwind using NativeWind
  │   └─ Typesafe API calls using tRPC
  └─ next.js
      ├─ Next.js 15
      ├─ React 19
      ├─ Tailwind CSS
      └─ E2E Typesafe API Server & Client
packages
  ├─ api
  │   └─ tRPC v11 router definition
  ├─ auth
  │   └─ Authentication using better-auth.
  ├─ db
  │   └─ Typesafe db calls using Prisma & PostgreSQL
  └─ ui
      └─ Start of a UI package for the webapp using shadcn-ui

## Features

### 🔐 Authentication
- Better Auth integration with Discord OAuth
- Session management
- Secure authentication flow

### 💳 PIX Subscription Billing (SaaS)
Complete PIX-based subscription billing system:
- **Subscription Plans**: Create and manage subscription tiers
- **Subscriptions**: User subscription lifecycle management
- **PIX Payments**: Generate PIX QR codes for payment
- Mock PIX integration (ready for production provider integration)

#### Quick Start with Sample Data

After setting up the database, you can seed it with sample subscription plans:

```bash
# Ensure database is running
pnpm db:start

# Seed sample subscription plans
pnpm tsx packages/db/seed/subscription-plans.ts
```

This will create 5 sample plans:
- Plano Básico (Mensal): R$ 29,90
- Plano Pro (Mensal): R$ 79,90
- Plano Enterprise (Mensal): R$ 299,90
- Plano Básico (Anual): R$ 299,90
- Plano Pro (Anual): R$ 799,90

See [PIX Subscription Billing Documentation](./docs/PIX_SUBSCRIPTION_BILLING.md) for detailed information and [Usage Examples](./docs/PIX_SUBSCRIPTION_USAGE_EXAMPLES.md) for code examples.

tooling
  ├─ eslint
  │   └─ shared, fine-grained, eslint presets
  ├─ prettier
  │   └─ shared prettier configuration
  ├─ tailwind
  │   └─ shared tailwind configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

> In this template, we use `@acme` as a placeholder for package names. As a user, you might want to replace it with your own organization or project name. You can use find-and-replace to change all the instances of `@acme` to something like `@my-company` or `@project-name`.

## Quick Start

> **Note**
> The [db](./packages/db) package is now configured to use **Prisma ORM** with PostgreSQL. For **local development**, this template includes a Docker Compose configuration that automatically sets up a PostgreSQL database. The `dev` scripts will handle starting the database and running migrations automatically. The Prisma schema is located at `packages/db/prisma/schema.prisma`.

> **Docker Required**
> Make sure you have [Docker](https://www.docker.com/get-started) installed and running on your machine before running the dev scripts. The PostgreSQL database will run in a Docker container.

To get it running, follow the steps below:

### 1. Setup dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env

# For local development with Docker PostgreSQL, update the POSTGRES_URL in .env to:
# POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/acme"

# The dev scripts will automatically:
# 1. Start PostgreSQL in Docker (docker compose up -d)
# 2. Generate Prisma Client (pnpm -F @acme/db generate)
# 3. Push the Prisma schema to the database (pnpm -F @acme/db push)
# 4. Start the development servers

# Or manually start the database and push the schema:
pnpm db:start
```

> **Note**: Make sure you have Docker installed and running on your machine. The PostgreSQL database will run in a Docker container on port 5432.

### 2. Generate Better Auth Schema

This project uses [Better Auth](https://www.better-auth.com) for authentication. The auth schema needs to be generated using the Better Auth CLI before you can use the authentication features.

```bash
# Generate the Better Auth schema
pnpm --filter @acme/auth generate
```

This command runs the Better Auth CLI with the following configuration:

- **Config file**: `packages/auth/script/auth-cli.ts` - A CLI-only configuration file (isolated from src to prevent imports)
- **Output**: Prisma schema models are defined in `packages/db/prisma/schema.prisma`

The generation process:

1. Reads the Better Auth configuration from `packages/auth/script/auth-cli.ts`
2. Generates the appropriate database schema based on your auth setup
3. The authentication tables are already defined in the Prisma schema at `packages/db/prisma/schema.prisma`

> **Note**: The `auth-cli.ts` file is placed in the `script/` directory (instead of `src/`) to prevent accidental imports from other parts of the codebase. This file is exclusively for CLI schema generation and should **not** be used directly in your application. For runtime authentication, use the configuration from `packages/auth/src/index.ts`.

For more information about the Better Auth CLI, see the [official documentation](https://www.better-auth.com/docs/concepts/cli#generate).

### 3. Configure Expo `dev`-script

The root `package.json` now includes convenient scripts that automatically start the database before launching the development servers:

- `pnpm dev:android` - Starts PostgreSQL + Expo with Android emulator
- `pnpm dev:ios` - Starts PostgreSQL + Expo with iOS simulator
- `pnpm dev:web` - Starts PostgreSQL + Next.js web app
- `pnpm dev:all` - Starts PostgreSQL + all services (Expo + Next.js)
- `pnpm dev` - Same as `dev:all`

These scripts will automatically:

1. Start the PostgreSQL database in Docker
2. Run database migrations
3. Start the respective development servers

#### Use iOS Simulator

1. Make sure you have XCode and XCommand Line Tools installed [as shown on expo docs](https://docs.expo.dev/workflow/ios-simulator).

   > **NOTE:** If you just installed XCode, or if you have updated it, you need to open the simulator manually once. Run `npx expo start` from `apps/expo`, and then enter `I` to launch Expo Go. After the manual launch, you can run `pnpm dev:ios` in the root directory.

2. Run `pnpm dev:ios` at the project root folder.

#### Use Android Emulator

1. Install Android Studio tools [as shown on expo docs](https://docs.expo.dev/workflow/android-studio-emulator).

2. Run `pnpm dev:android` at the project root folder.

### 4. Configuring Better-Auth to work with Expo

In order to get Better-Auth to work with Expo, you must either:

#### Deploy the Auth Proxy (RECOMMENDED)

Better-auth comes with an [auth proxy plugin](https://www.better-auth.com/docs/plugins/oauth-proxy). By deploying the Next.js app, you can get OAuth working in preview deployments and development for Expo apps.

By using the proxy plugin, the Next.js apps will forward any auth requests to the proxy server, which will handle the OAuth flow and then redirect back to the Next.js app. This makes it easy to get OAuth working since you'll have a stable URL that is publicly accessible and doesn't change for every deployment and doesn't rely on what port the app is running on. So if port 3000 is taken and your Next.js app starts at port 3001 instead, your auth should still work without having to reconfigure the OAuth provider.

#### Add your local IP to your OAuth provider

You can alternatively add your local IP (e.g. `192.168.x.y:$PORT`) to your OAuth provider. This may not be as reliable as your local IP may change when you change networks. Some OAuth providers may also only support a single callback URL for each app making this approach unviable for some providers (e.g. GitHub).

### 5a. When it's time to add a new UI component

Run the `ui-add` script to add a new UI component using the interactive `shadcn/ui` CLI:

```bash
pnpm ui-add
```

When the component(s) has been installed, you should be good to go and start using it in your app.

### 5b. When it's time to add a new package

To add a new package, simply run `pnpm turbo gen init` in the monorepo root. This will prompt you for a package name as well as if you want to install any dependencies to the new package (of course you can also do this yourself later).

The generator sets up the `package.json`, `tsconfig.json` and a `index.ts`, as well as configures all the necessary configurations for tooling around your package such as formatting, linting and typechecking. When the package is created, you're ready to go build out the package.

## FAQ

### Does the starter include Solito?

No. Solito will not be included in this repo. It is a great tool if you want to share code between your Next.js and Expo app. However, the main purpose of this repo is not the integration between Next.js and Expo — it's the code splitting of your T3 App into a monorepo. The Expo app is just a bonus example of how you can utilize the monorepo with multiple apps but can just as well be any app such as Vite, Electron, etc.

Integrating Solito into this repo isn't hard, and there are a few [official templates](https://github.com/nandorojo/solito/tree/master/example-monorepos) by the creators of Solito that you can use as a reference.

### Does this pattern leak backend code to my client applications?

No, it does not. The `api` package should only be a production dependency in the Next.js application where it's served. The Expo app, and all other apps you may add in the future, should only add the `api` package as a dev dependency. This lets you have full typesafety in your client applications, while keeping your backend code safe.

If you need to share runtime code between the client and server, such as input validation schemas, you can create a separate `shared` package for this and import it on both sides.

## Deployment

### Next.js

#### Prerequisites

> **Note**
> Please note that the Next.js application with tRPC must be deployed in order for the Expo app to communicate with the server in a production environment.

#### Deploy to Vercel

Let's deploy the Next.js application to [Vercel](https://vercel.com). If you've never deployed a Turborepo app there, don't worry, the steps are quite straightforward. You can also read the [official Turborepo guide](https://vercel.com/docs/concepts/monorepos/turborepo) on deploying to Vercel.

1. Create a new project on Vercel, select the `apps/nextjs` folder as the root directory. Vercel's zero-config system should handle all configurations for you.

2. Add your `POSTGRES_URL` environment variable.

3. Done! Your app should successfully deploy. Assign your domain and use that instead of `localhost` for the `url` in the Expo app so that your Expo app can communicate with your backend when you are not in development.

### Auth Proxy

The auth proxy comes as a better-auth plugin. This is required for the Next.js app to be able to authenticate users in preview deployments. The auth proxy is not used for OAuth request in production deployments. The easiest way to get it running is to deploy the Next.js app to vercel.

### Expo

Deploying your Expo application works slightly differently compared to Next.js on the web. Instead of "deploying" your app online, you need to submit production builds of your app to app stores, like [Apple App Store](https://www.apple.com/app-store) and [Google Play](https://play.google.com/store/apps). You can read the full [guide to distributing your app](https://docs.expo.dev/distribution/introduction), including best practices, in the Expo docs.

1. Make sure to modify the `getBaseUrl` function to point to your backend's production URL:

   <https://github.com/t3-oss/create-t3-turbo/blob/656965aff7db271e5e080242c4a3ce4dad5d25f8/apps/expo/src/utils/api.tsx#L20-L37>

2. Let's start by setting up [EAS Build](https://docs.expo.dev/build/introduction), which is short for Expo Application Services. The build service helps you create builds of your app, without requiring a full native development setup. The commands below are a summary of [Creating your first build](https://docs.expo.dev/build/setup).

   ```bash
   # Install the EAS CLI
   pnpm add -g eas-cli

   # Log in with your Expo account
   eas login

   # Configure your Expo app
   cd apps/expo
   eas build:configure
   ```

3. After the initial setup, you can create your first build. You can build for Android and iOS platforms and use different [`eas.json` build profiles](https://docs.expo.dev/build-reference/eas-json) to create production builds or development, or test builds. Let's make a production build for iOS.

   ```bash
   eas build --platform ios --profile production
   ```

   > If you don't specify the `--profile` flag, EAS uses the `production` profile by default.

4. Now that you have your first production build, you can submit this to the stores. [EAS Submit](https://docs.expo.dev/submit/introduction) can help you send the build to the stores.

   ```bash
   eas submit --platform ios --latest
   ```

   > You can also combine build and submit in a single command, using `eas build ... --auto-submit`.

5. Before you can get your app in the hands of your users, you'll have to provide additional information to the app stores. This includes screenshots, app information, privacy policies, etc. _While still in preview_, [EAS Metadata](https://docs.expo.dev/eas/metadata) can help you with most of this information.

6. Once everything is approved, your users can finally enjoy your app. Let's say you spotted a small typo; you'll have to create a new build, submit it to the stores, and wait for approval before you can resolve this issue. In these cases, you can use EAS Update to quickly send a small bugfix to your users without going through this long process. Let's start by setting up EAS Update.

   The steps below summarize the [Getting started with EAS Update](https://docs.expo.dev/eas-update/getting-started/#configure-your-project) guide.

   ```bash
   # Add the `expo-updates` library to your Expo app
   cd apps/expo
   pnpm expo install expo-updates

   # Configure EAS Update
   eas update:configure
   ```

7. Before we can send out updates to your app, you have to create a new build and submit it to the app stores. For every change that includes native APIs, you have to rebuild the app and submit the update to the app stores. See steps 2 and 3.

8. Now that everything is ready for updates, let's create a new update for `production` builds. With the `--auto` flag, EAS Update uses your current git branch name and commit message for this update. See [How EAS Update works](https://docs.expo.dev/eas-update/how-eas-update-works/#publishing-an-update) for more information.

   ```bash
   cd apps/expo
   eas update --auto
   ```

   > Your OTA (Over The Air) updates must always follow the app store's rules. You can't change your app's primary functionality without getting app store approval. But this is a fast way to update your app for minor changes and bug fixes.

9. Done! Now that you have created your production build, submitted it to the stores, and installed EAS Update, you are ready for anything!

## References

The stack originates from [create-t3-app](https://github.com/t3-oss/create-t3-app).

A [blog post](https://jumr.dev/blog/t3-turbo) where I wrote how to migrate a T3 app into this.

## Nota sobre Prisma e Next.js

Se você encontrar erros do tipo "Prisma Client could not locate the Query Engine for runtime \"debian-openssl-3.0.x\"" ou versões conflitantes de `@prisma/client` entre pacotes, há um script útil incluído para unificar a versão do Prisma no monorepo e garantir que a engine do query esteja disponível para o Next.js.

Uso rápido:

```bash
# roda o script com a versão alvo (ex: 6.17.0). Se não passado, o script tenta detectar a versão.
bash ./scripts/fix-prisma-engines.sh 6.17.0

# ou simplesmente rode o postinstall já configurado
pnpm i
```

O script faz:

- Instala `@prisma/client` e `prisma` na mesma versão no workspace root (pnpm -w add -W)
- Executa `prisma generate` para os schemas padrões
- Copia a(s) engine(s) libquery_engine-\*.so.node para `apps/nextjs/node_modules/.prisma/client` quando necessário

Se o problema persistir, verifique manualmente se `apps/nextjs/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node` existe e rode `pnpm -w exec prisma generate --schema=packages/prisma/schema.prisma`.
