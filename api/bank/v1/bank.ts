import { z } from "zod/v4";

export const api = {
  Bank: {
    state: {
      accountIdsMapId: z.string().meta({ tag: 1 }),
    },

    methods: {
      create: {
        kind: "transaction",
        factory: {},
        request: {},
        response: z.void(),
      },
      signUp: {
        kind: "transaction",
        request: {
          accountId: z.string().meta({ tag: 1 }),
          initialDeposit: z.number().meta({ tag: 2 }),
        },
        response: z.void(),
      },
      transfer: {
        kind: "transaction",
        request: {
          fromAccountId: z.string().meta({ tag: 1 }),
          toAccountId: z.string().meta({ tag: 2 }),
          amount: z.number().meta({ tag: 3 }),
        },
        response: z.void(),
      },
      accountBalances: {
        kind: "reader",
        request: {},
        response: {
          balances: z
            .array(
              z.object({
                accountId: z.string().meta({ tag: 1 }),
                balance: z.number().meta({ tag: 2 }),
              })
            )
            .default(() => [])
            .meta({ tag: 1 }),
        },
      },
    },
  },
};
