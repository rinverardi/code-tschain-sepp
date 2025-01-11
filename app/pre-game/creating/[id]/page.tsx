"use client";

import {
  abortGame,
  fetchGame,
  startGame,
} from "@components/game_instructions";

import { makeProgram } from "@components/game_program";
import { inputId, outputId, outputIdOr } from "@components/id";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const wallet = useWallet();

  const [error, setError] = useState("");
  const [players, setPlayers] = useState(["", "", "", ""]);

  const id = inputId(params.id);
  const program = makeProgram(connection);

  useEffect(() => {
    fetchGame(program, id)
      .then((game) => {
        const players = game.players.map((player) => player ? player.toString() : "");

        setPlayers(players);
      })
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
