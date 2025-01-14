import { BN, Program } from "@coral-xyz/anchor";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { makeAnchorProvider } from "@tschain-sepp/components/anchor";

import {
  deriveAddress,
  fetchGame
} from "@tschain-sepp/components/game_account";

import { toggleProgress } from "@tschain-sepp/components/progress";
import IDL from "@tschain-sepp/idl/tschain_sepp.json";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

const STAKE = new BN(LAMPORTS_PER_SOL / 1000);

export async function callAbortGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    const address = deriveAddress(program, id);
    const game = await fetchGame(address, program);

    const remainingAccounts = game.players
      .slice(1)
      .filter((player) => player != null)
      .map((player) => ({ pubkey: player, isSigner: false, isWritable: true }));

    await program.methods
      .abortGame(id)
      .remainingAccounts(remainingAccounts)
      .rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callCreateGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.createGame(id, STAKE).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callDiscardCard(program: Program<TschainSepp>, id: string, card: number) {
  toggleProgress(true);

  try {
    await program.methods.discardCard(id, card).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callDrawCard(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.drawCard(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callJoinGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.joinGame(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callSkipTurn(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.skipTurn(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function callStartGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.startGame(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

export function makeProgram(connection: Connection): Program<TschainSepp> {
  const anchorProvider = makeAnchorProvider(connection);

  return new Program(IDL as TschainSepp, anchorProvider);
}
