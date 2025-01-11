import { Program } from "@coral-xyz/anchor";
import { PublicKey} from "@solana/web3.js";

import { TschainSepp } from "../target/types/tschain_sepp";

export async function fetchGame(program: Program<TschainSepp>, id: String) {
  const [address, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), Buffer.from(id)],
    program.programId
  );

  return await program.account.game.fetch(address);
}
