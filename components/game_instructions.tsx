import { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { TschainSepp } from "../target/types/tschain_sepp";

const STAKE = new BN(LAMPORTS_PER_SOL / 1000);

export async function abortGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    const game = await fetchGame(program, id);

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

export async function createGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.create(id, STAKE).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function fetchGame(program: Program<TschainSepp>, id: String) {
  const [address, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), Buffer.from(id)],
    program.programId
  );

  return await program.account.game.fetch(address);
}

export async function joinGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.join(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

export async function startGame(program: Program<TschainSepp>, id: string) {
  toggleProgress(true);

  try {
    await program.methods.start(id).rpc();
  } finally {
    toggleProgress(false);
  }
}

function toggleProgress(display: boolean) {
  const element = document.getElementById("progress");

  element.style.display = display ? "block" : "none";
}
