import { ReaderContext, TransactionContext, allow } from "@reboot-dev/reboot";
import { SortedMap } from "@reboot-dev/reboot-std/collections/sorted_map.js";
import { v4 as uuidv4 } from "uuid";
import { uuidv7 } from "uuidv7";
import { Account } from "../../api/bank/v1/account_rbt.js";
import { Bank } from "../../api/bank/v1/bank_rbt.js";

export class BankServicer extends Bank.Servicer {
  authorizer() {
    return allow();
  }

  async create(
    context: TransactionContext,
    state: Bank.State,
    request: Bank.CreateRequest
  ): Promise<void> {
    state.accountIdsMapId = uuidv4();

    await SortedMap.ref(state.accountIdsMapId).insert(context, { entries: {} });
  }

  async accountBalances(
    context: ReaderContext,
    state: Bank.State,
    request: Bank.AccountBalancesRequest
  ): Promise<Bank.AccountBalancesResponse> {
    // Get the first "page" of account IDs (32 entries).
    const accountIdsMap = SortedMap.ref(state.accountIdsMapId);

    const accountIds = (
      await accountIdsMap.range(context, { limit: 32 })
    ).entries.map(({ value }) => new TextDecoder().decode(value));

    return {
      balances: await Promise.all(
        accountIds.map(async (accountId) => {
          const { amount } = await Account.ref(accountId).balance(context);
          return { accountId, balance: amount };
        })
      ),
    };
  }

  async signUp(
    context: TransactionContext,
    state: Bank.State,
    { accountId, initialDeposit }: Bank.SignUpRequest
  ): Promise<void> {
    const [account] = await Account.open(context, accountId, {});

    await account.deposit(context, { amount: initialDeposit });

    // Save the account ID to our _distributed_ map using a UUIDv7
    // to get a "timestamp" based ordering.
    await SortedMap.ref(state.accountIdsMapId).insert(context, {
      entries: {
        [uuidv7()]: new TextEncoder().encode(accountId),
      },
    });
  }

  async transfer(
    context: TransactionContext,
    state: Bank.State,
    { fromAccountId, toAccountId, amount }: Bank.TransferRequest
  ): Promise<void> {
    await Account.ref(fromAccountId).withdraw(context, { amount });
    await Account.ref(toAccountId).deposit(context, { amount });
  }
}
