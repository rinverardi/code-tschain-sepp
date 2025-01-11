import { BN, Program } from "@coral-xyz/anchor";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { makeAnchorProvider } from "@tschain-sepp/components/anchor";

import {
  deriveAddress,
  fetchGame
} from "@tschain-sepp/components/game_account";

import { toggleProgress } from "@tschain-sepp/components/progress";
import IDL from "@tschain-sepp/idl/tschain_sepp.json";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

const STAKE = new BN(LAMPORTS_PER_SOL / 1000);

export async function callAbort(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    const address = deriveAddress(program, id);
    const game = await fetchGame(address, program);

    const remainingAccounts = game.players
      .slice(1)
      .filter((player) => player != null)
      .map((player) => ({ pubkey: player, isSigner: false, isWritable: true }));

    await program.methods
      .abort(id)
      .remainingAccounts(remainingAccounts)
      .rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callCreate(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.create(id, STAKE).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callJoin(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.join(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callStart(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.start(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

export function makeProgram(connection: Connection): Program<TschainSepp> {
  const anchorProvider = makeAnchorProvider(connection);

  return new Program(IDL as TschainSepp, anchorProvider);
}
