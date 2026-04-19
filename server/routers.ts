import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { financialRouter } from "./routers/financial";
import { servicesRouter } from "./routers/services";
import { whatsappRouter } from "./routers/whatsapp";
import { databaseRouter } from "./routers/database";
import { authenticateUser, createSessionToken } from "./_core/auth";
import * as db from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await authenticateUser(input.username, input.password);
        if (!user) {
          throw new Error("Invalid username or password");
        }

        // Create session token
        const token = await createSessionToken(user);

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        // Update last signed in
        await db.updateUserLastSignedIn(user.id!);

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  financial: financialRouter,
  services: servicesRouter,
  whatsapp: whatsappRouter,
  database: databaseRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
