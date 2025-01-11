import { makeAnchorProvider } from "@components/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";

import IDL from "../target/idl/tschain_sepp.json";

import { TschainSepp } from "../target/types/tschain_sepp";

export function makeProgram(connection: Connection): Program<TschainSepp> {
  const anchorProvider = makeAnchorProvider(connection);

  return new Program(IDL as TschainSepp, anchorProvider);
}
