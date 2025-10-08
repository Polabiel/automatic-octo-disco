/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod/v4";

import type { Auth, Session } from "@acme/auth";
import { db } from "@acme/db/client";

interface CreateTRPCContextOptions {
  headers: Headers;
  auth: Auth;
}

interface TRPCContext {
  authApi: Auth["api"];
  session: Session | null;
  db: typeof db;
}

export interface TRPCContextPortable {
  authApi?: {
    provider?: string;
  } | null;
  session: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
}

type Serializable<T> = T extends (...args: unknown[]) => unknown
  ? never
  : T extends Date
    ? string
    : // Preserve tuple types by mapping their elements
      T extends readonly [...infer E]
      ? { [K in keyof E]: Serializable<E[K]> }
      : T extends readonly (infer U)[]
        ? readonly Serializable<U>[]
        : T extends (infer U)[]
          ? Serializable<U>[]
          : T extends object
            ? { [K in keyof T]: Serializable<T[K]> }
            : T;

type _DerivedPortable = Serializable<Omit<TRPCContext, "db">>;
export interface TRPCContextPortableDerived extends _DerivedPortable {
  _portable?: true;
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

export const createTRPCContext = async (
  opts: CreateTRPCContextOptions,
): Promise<TRPCContext> => {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({
    headers: opts.headers,
  });
  return {
    authApi,
    session,
    // return the real db at runtime, but its compile-time type is `any`
    db,
  };
};
/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    // Narrow `ctx.session` to a shape we can rely on without leaking
    // external types. We expect session to be an object with optional `user`.
    let session: { user?: unknown } | undefined;
    if (ctx.session && typeof ctx.session === "object") {
      session = ctx.session as { user?: unknown };
    } else {
      session = undefined;
    }
    if (!session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // safely assert session.user exists for downstream handlers
        session: { ...session, user: session.user },
      },
    });
  });
