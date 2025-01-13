"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { callJoin, makeProgram } from "@tschain-sepp/components/game_program";
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

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const id = inputId(event.target.value);

    setId(id);
  }

  function handleCancel() {
    router.push("..");
  }

  function handleJoin() {
    if (wallet.connected) {
      if (id.length) {
        setError("");

        callJoin(program, id)
          .then(() => router.push("joining/" + id))
          .catch(() => setError("Cannot join the game!"));
      } else
        setError("Please enter a game ID!");
    }
  }

  return <>
    <div className="content--pre-game" id="content">
      <h1>Join a Game</h1>
      <p>
        Enter a valid game identifier and join the game.
      </p>
      <div>
        <label>Game ID:</label>

        <input
          autoFocus
          maxLength={8}
          onChange={handleChange}
          value={outputId(id)} />
      </div>
      <div>
        <button onClick={handleJoin}>Join</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
      <p className="error">
        {error}
      </p>
    </div>
  </>;
};

export default Page;
