"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  callCreate,
  makeProgram
} from "@tschain-sepp/components/game_program";

import { inputId, outputId } from "@tschain-sepp/components/id";

const Page = () => {
  const { connection } = useConnection();
  const router = useRouter();
  const wallet = useWallet();

  const [error, setError] = useState("");
  const [id, setId] = useState("");

  const program = makeProgram(connection);

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
    if (wallet.connected) {
      if (id.length) {
        setError("");

        callCreate(program, id)
          .then(() => router.push("creating/" + id))
          .catch(() => setError("Cannot create the game!"));
      } else {
        setError("Please enter a game ID!");
      }
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
