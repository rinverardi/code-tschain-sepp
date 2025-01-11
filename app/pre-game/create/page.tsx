"use client";

import { createGame } from "@components/game_instructions";
import { useProgram } from "@components/game_program";
import { inputId, outputId } from "@components/id";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const Page = () => {
  const program = useProgram();
  const router = useRouter();
  const wallet = useWallet();

  let [error, setError] = useState("");
  let [id, setId] = useState("");

  useEffect(
    () => setError(wallet.connected ? "" : "Please connect your wallet!"),
    [wallet]
  );

  function handleCancel() {
    router.push("..");
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const id = inputId(event.target.value);

    setId(id);
  }

  function handleCreate() {
    if (!id.length) {
      setError("Please enter a game ID!");
    } else if (wallet.connected) {
      createGame(program, id)
        .then(() => router.push("creating/" + id))
        .catch(() => setError("Cannot create the game!"));
    }
  }

  return <>
    <h1>Create a Game</h1>
    <p>
      Pick a unique game identifier and create the game.
    </p>
    <div>
      <label>Game Identifier:</label>
      <input autoFocus maxLength={8} onChange={handleChange} value={outputId(id)} />
    </div>
    <div>
      <button onClick={handleCreate}>Create</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
    <p className="error">
      {error}
    </p>
  </>;
};

export default Page;
