"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

import {
  deriveAddress,
  fetchGame
} from "@tschain-sepp/components/game_account";

import { makeProgram } from "@tschain-sepp/components/game_program";
import { inputId } from "@tschain-sepp/components/id";

import Notifications, {
  showError
} from "@tschain-sepp/components/notification";

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();
  const [dump, setDump] = useState("");

  const id = inputId(params.id);
  const program = makeProgram(connection);

  useEffect(() => {
    const address = deriveAddress(program, id);

    fetchGame(address, program)
      .then((game) => setDump(JSON.stringify(game, null, 2)))
      .catch(() => showError("Cannot fetch the game!"));
  }, []);

  return <>
    <Notifications position="top-right"/>

    <div className="content--debug" id="content">
      <h1>Debug a Game</h1>
      <pre>
        {dump}
      </pre>
    </div>
  </>;
};

export default Page;
