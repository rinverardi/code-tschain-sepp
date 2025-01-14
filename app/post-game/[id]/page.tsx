"use client";

import { IdlAccounts } from "@coral-xyz/anchor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import {
  deriveAddress,
  fetchGame,
} from "@tschain-sepp/components/game_account";

import { makeProgram } from "@tschain-sepp/components/game_program";
import { inputId, outputId } from "@tschain-sepp/components/id";

import Notifications, {
  showError,
} from "@tschain-sepp/components/notification";

import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

function calculateLoss(game: GameAccount): number {
  return game.stake.toNumber() / LAMPORTS_PER_SOL;
}

function calculateWin(game: GameAccount): number {
  const losers = game.players.filter((that) => that != null).length - 1;

  return (game.stake.toNumber() * losers) / LAMPORTS_PER_SOL;
}

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();
  const [game, setGame] = useState<GameAccount>(null);
  const { publicKey } = useWallet();

  const id = inputId(params.id);
  const program = makeProgram(connection);
  const address = deriveAddress(program, id);

  useEffect(() => {
    fetchGame(address, program)
      .then(setGame)
      .catch(() => showError("Cannot fetch the game!"));
  }, []);

  const isLoser = game && publicKey && !game.winner.equals(publicKey);
  const isWinner = game && publicKey && game.winner.equals(publicKey);

  return (
    <div className="content--post-game" id="content">
      <Notifications position="bottom-right" />

      {isLoser || isWinner || <h1>Game Over</h1>}

      {isLoser && (
        <>
          <h1>Defeat!</h1>
          <p>Close, but no cigar, {outputId(publicKey.toBase58())}!</p>
          <p>
            You just lost {calculateLoss(game)} SOL to{" "}
            {outputId(game.winner.toBase58())}.
          </p>
        </>
      )}

      {isWinner && (
        <>
          <h1>Victory!</h1>
          <p>
            Winner winner, chicken dinner, {outputId(game.winner.toBase58())}!
          </p>
          <p>You just won {calculateWin(game)} SOL.</p>
        </>
      )}
    </div>
  );
};

export default Page;
