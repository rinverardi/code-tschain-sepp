"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  callCreateGame,
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

  function handleCancel() {
    router.push("..");
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const id = inputId(event.target.value);

    setId(id);
  }

  function handleCreate() {
    if (!id.length) {
      showError("Please enter a game ID!");
      return;
    }

    if (!wallet.connected) {
      showError("Please connect your wallet!");
      return;
    }

    callCreateGame(program, id)
      .then(() => router.push("creating/" + id))
      .catch(() => showError("Cannot create the game!"));
  }

  return <>
    <Notifications position="bottom-right" />

    <div className="content--pre-game" id="content">
      <h1>Create a Game</h1>
      <p>
        Pick a unique game identifier and create the game.
      </p>
      <div>
        <label>Game Identifier:</label>

        <input
          autoFocus
          maxLength={8}
          onChange={handleChange}
          value={outputId(id)} />
      </div>
      <div>
        <button onClick={handleCreate}>Create</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  </>;
};

export default Page;
