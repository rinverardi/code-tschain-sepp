import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

export function deriveAddress(program: Program<TschainSepp>, id: string): PublicKey {
  const [address, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), Buffer.from(id)],
    program.programId
  );

  return address;
}

export async function fetchGame(
  address: PublicKey,
  program: Program<TschainSepp>,
): Promise<GameAccount> {
  return await program.account.game.fetch(address);
}

export function watchGame(
  address: PublicKey,
  connection: Connection,
  program: Program<TschainSepp>,
  listener: (account: GameAccount) => void,
): void {
  useEffect(() => {
    const subscription = connection.onAccountChange(
      address,
      (info) => {
        const game = program.coder.accounts.decode<GameAccount>("game", info.data);

        listener(game);
      },
      { commitment: "confirmed" },
    );

    return () => {
      connection.removeAccountChangeListener(subscription);
    }
  });
}
