import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders } from "@db/schema";

export const orderRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        orderType: z.enum(["storage_expand", "guidance_fee", "equipment"]),
        amount: z.number().positive(),
        metadata: z.object({}).passthrough().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const values: Record<string, unknown> = {
        userId: ctx.user.id,
        orderType: input.orderType,
        amount: input.amount.toString(),
      };
      if (input.metadata) values.metadata = input.metadata;
      // @ts-expect-error drizzle insert typing
      const result = await db.insert(orders).values(values);

      return { id: Number(result[0].insertId), ...input, status: "pending" as const };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt));
    return rows;
  }),
});
