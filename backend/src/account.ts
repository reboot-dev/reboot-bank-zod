import { allow, ReaderContext, WriterContext } from "@reboot-dev/reboot";
import { Account } from "../../api/bank/v1/account_rbt.js";

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class AccountServicer extends Account.Servicer {
  authorizer() {
    return allow();
  }

  async balance(
    context: ReaderContext,
    state: Account.State,
    request: Account.BalanceRequest
  ): Promise<Account.BalanceResponse> {
    return { amount: state.balance };
  }

  async deposit(
    context: WriterContext,
    state: Account.State,
    request: Account.DepositRequest
  ): Promise<void> {
    state.balance += request.amount;
  }

  async withdraw(
    context: WriterContext,
    state: Account.State,
    request: Account.WithdrawRequest
  ): Promise<void> {
    state.balance -= request.amount;
    if (state.balance < 0) {
      throw new Account.WithdrawAborted({
        type: "OverdraftError",
        amount: Number(-state.balance),
      });
    }
  }

  async open(
    context: WriterContext,
    state: Account.State,
    request: Account.OpenRequest
  ): Promise<void> {
    // Schedule infinite "interest" task.
    await this.ref()
      .schedule({ when: new Date(Date.now() + 1000) })
      .interest(context);
  }

  async interest(
    context: WriterContext,
    state: Account.State,
    request: Account.InterestRequest
  ): Promise<void> {
    state.balance += 1;

    await this.ref()
      .schedule({ when: new Date(Date.now() + random(1, 4) * 1000) })
      .interest(context);
  }
}
