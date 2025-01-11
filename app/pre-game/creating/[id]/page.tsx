"use client";

import { IdlAccounts } from "@coral-xyz/anchor";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  deriveAddress,
  fetchGame,
  watchGame
} from "@tschain-sepp/components/game_account";

import {
  callAbort,
  callStart,
  makeProgram
} from "@tschain-sepp/components/game_program";

import { inputId, outputId, outputIdOr } from "@tschain-sepp/components/id";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const wallet = useWallet();

  const [error, setError] = useState("");
  const [players, setPlayers] = useState(["", "", "", ""]);

  const id = inputId(params.id);
  const program = makeProgram(connection);
  const address = deriveAddress(program, id);

  watchGame(address, connection, program, update);

  useEffect(() => {
    fetchGame(address, program)
      .then(update)
      .catch(() => setError("Cannot fetch the game!"));
  }, []);

  useEffect(
    () => setError(wallet.connected ? "" : "Please connect your wallet!"),
    [wallet]
  );

  function handleAbort() {
    if (wallet.connected) {
      setError("");

      callAbort(program, id)
        .then(() => router.push("../.."))
        .catch(() => setError("Cannot abort the game!"));
    }
  }

  function handleStart() {
    if (wallet.connected) {
      setError("");

      callStart(program, id)
        .then(() => router.push("../../in-game/" + id))
        .catch(() => setError("Cannot start the game!"));
    }
  }

  function update(game: GameAccount): void {
    if (game.status.aborted) {
      router.push("../../..");
    } else if (game.status.ended) {
      router.push("../../../post-game/" + outputId(id));
    } else if (game.status.started) {
      router.push("../../../in-game/" + outputId(id));
    } else {
      const players = game.players.map((player) => player ? player.toString() : "");

      setPlayers(players);
    }
  }

  return <>
    <h1>Waiting for Oponnents</h1>
    <div>
      <label>Game Identifier:</label>
      <output>{outputId(id)}</output>
    </div>
    <div>
      <label>Player One:</label>
      <output>{outputIdOr(players[0], "Empty Slot")}</output>
    </div>
    <div>
      <label>Player Two:</label>
      <output>{outputIdOr(players[1], "Empty Slot")}</output>
    </div>
    <div>
      <label>Player Three:</label>
      <output>{outputIdOr(players[2], "Empty Slot")}</output>
    </div>
    <div>
      <label>Player Four:</label>
      <output>{outputIdOr(players[3], "Empty Slot")}</output>
    </div>
    <div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleAbort}>Abort</button>
    </div>
    <p className="error">
      {error}
    </p>
  </>
};

export default Page;
