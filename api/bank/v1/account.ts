import { z } from "zod/v4";

export const api = {
  Account: {
    state: {
      balance: z.number().default(0).meta({ tag: 2 }),
    },

    methods: {
      balance: {
        kind: "reader",
        request: {},
        response: {
          amount: z.number().meta({ tag: 1 }),
        },
      },
      deposit: {
        kind: "writer",
        request: {
          amount: z.number().meta({ tag: 1 }),
        },
        response: z.void(),
      },
      withdraw: {
        kind: "writer",
        request: {
          amount: z.number().meta({ tag: 1 }),
        },
        response: z.void(),
        errors: [
          z
            .object({
              type: z.literal("OverdraftError"),
              amount: z.number().meta({ tag: 1 }),
            })
            .meta({ tag: 1 }),
        ] as const,
      },
      open: {
        kind: "writer",
        factory: {},
        request: {},
        response: z.void(),
      },
      interest: {
        kind: "writer",
        request: {},
        response: z.void(),
      },
    },
  },
};
