import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import { TschainSepp } from "../target/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

export async function fetchGame(
  program: Program<TschainSepp>,
  id: string
): Promise<GameAccount> {
  const address = findAddress(program, id);

  return await program.account.game.fetch(address);
}

function findAddress(program: Program<TschainSepp>, id: string): PublicKey {
  const [address, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), Buffer.from(id)],
    program.programId
  );

  return address;
}
