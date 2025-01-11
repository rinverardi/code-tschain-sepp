"use client";

import { joinGame } from "@components/game_instructions";
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

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const id = inputId(event.target.value);

    setId(id);
  }

  function handleCancel() {
    router.push("..");
  }

  function handleJoin() {
    if (!id.length) {
      setError("Please enter a game ID!");
    } else if (wallet.connected) {
      joinGame(program, id)
        .then(() => router.push("joining/" + id))
        .catch(() => setError("Cannot join the game!"));
    }
  }

  return <>
    <h1>Join a Game</h1>
    <p>
      Enter a valid game identifier and join the game.
    </p>
    <div>
      <label>Game ID:</label>
      <input autoFocus maxLength={8} onChange={handleChange} value={outputId(id)} />
    </div>
    <div>
      <button onClick={handleJoin}>Join</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
    <p className="error">
      {error}
    </p>
  </>;
};

export default Page;
