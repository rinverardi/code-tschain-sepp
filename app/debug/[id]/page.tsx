"use client";

import { fetchGame } from "@components/game_instructions";
import { useProgram } from "@components/game_program";
import { inputId } from "@components/id";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const params = useParams<{ id: string }>();
  const program = useProgram();

  let [dump, setDump] = useState("");
  let [error, setError] = useState("");

  useEffect(() => {
    const id = inputId(params.id);

    fetchGame(program, id)
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
