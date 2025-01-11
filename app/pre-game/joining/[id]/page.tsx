"use client";

import { fetchGame } from "@components/game_instructions";
import { useProgram } from "@components/game_program";
import { inputId, outputId, outputIdOr } from "@components/id";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const params = useParams<{ id: string }>();
  const program = useProgram();

  let [error, setError] = useState("");
  let [players, setPlayers] = useState(["", "", "", ""]);

  const id = inputId(params.id);

  useEffect(() => {
    fetchGame(program, id)
      .then((game) => {
        const players = game.players.map((player) => player ? player.toString() : "");

        setPlayers(players);
      })
      .catch(() => setError("Cannot fetch the game!"));
  }, []);

  return <>
    <h1>Waiting for Oponnents</h1>
    <div>
      <label>Game Identifier:</label>
      <output>{outputId(id)}</output>
    </div>
    <div>
      <label>Player One:</label>
      <output>{outputIdOr(players[0], "Empty Slot")}</output>
    </div>
    <div>
      <label>Player Two:</label>
      <output>{outputIdOr(players[1], "Empty Slot")}</output>
    </div>
    <div>
      <label>Player Three:</label>
      <output>{outputIdOr(players[2], "Empty Slot")}</output>
    </div>
    <div>
      <label>Player Four:</label>
      <output>{outputIdOr(players[3], "Empty Slot")}</output>
    </div>
    <p className="error">
      {error}
    </p>
  </>
};

export default Page;