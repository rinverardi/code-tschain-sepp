"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  callJoinGame,
  makeProgram
} from "@tschain-sepp/components/game_program";

import { inputId, outputId } from "@tschain-sepp/components/id";

import Notifications, {
  showError
} from "@tschain-sepp/components/notification";

const Page = () => {
  const { connection } = useConnection();
  const router = useRouter();
  const [id, setId] = useState("");
  const wallet = useWallet();

  const program = makeProgram(connection);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const id = inputId(event.target.value);

    setId(id);
  }

  function handleCancel() {
    router.push("..");
  }

  function handleJoin() {
    if (!id.length) {
      showError("Please enter a game ID!");
      return;
    }

    if (!wallet.connected) {
      showError("Please connect your wallet!");
      return;
    }

    callJoinGame(program, id)
      .then(() => router.push("joining/" + id))
      .catch(() => showError("Cannot join the game!"));
  }

  return <>
    <Notifications position="top-right" />

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
    </div>
  </>;
};

export default Page;
