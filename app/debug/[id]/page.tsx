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

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();

  const [dump, setDump] = useState("");
  const [error, setError] = useState("");

  const id = inputId(params.id);
  const program = makeProgram(connection);

  useEffect(() => {
    const address = deriveAddress(program, id);

    fetchGame(address, program)
      .then((game) => setDump(JSON.stringify(game, null, 2)))
      .catch(() => setError("Cannot fetch the game!"));
  }, []);

  return <>
    <div className="content--debug" id="content">
      <h1>Debug a Game</h1>
      <pre>
        {dump}
      </pre>
      <p className="error">
        {error}
      </p>
    </div>
  </>;
};

export default Page;
