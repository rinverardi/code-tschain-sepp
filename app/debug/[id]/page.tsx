"use client";

import { deriveAddress, fetchGame } from "@components/game_account";
import { makeProgram } from "@components/game_program";
import { inputId } from "@components/id";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

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
    <h1>Debug a Game</h1>
    <pre>
      {dump}
    </pre>
    <p className="error">
      {error}
    </p>
  </>;
};

export default Page;
