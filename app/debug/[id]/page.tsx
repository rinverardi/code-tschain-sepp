"use client";

import { IdlAccounts } from "@coral-xyz/anchor";
import { useParams } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

import {
  deriveAddress,
  fetchGame,
  PILE_DRAW,
  watchGame,
} from "@tschain-sepp/components/game_account";

import { makeProgram } from "@tschain-sepp/components/game_program";
import { inputId } from "@tschain-sepp/components/id";

import Notifications, {
  showError,
} from "@tschain-sepp/components/notification";

import PlayingCard from "@tschain-sepp/components/playing_card";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();
  const [game, setGame] = useState<GameAccount>(null);

  const id = inputId(params.id);
  const program = makeProgram(connection);
  const address = deriveAddress(program, id);

  useEffect(() => {
    fetchGame(address, program)
      .then(setGame)
      .catch(() => showError("Cannot fetch the game!"));
  }, []);

  watchGame(address, connection, program, setGame);

  function dumpCard(card: number): JSX.Element {
    return (
      <PlayingCard canPlay={false} canSee={true} card={card} onClick={null} />
    );
  }

  function dumpCards(holder: number): JSX.Element {
    const cards: JSX.Element[] = [];

    for (const card of game.deck) {
      if ((card & 0xff00) >> 8 == holder) {
        cards.push(
          <PlayingCard
            canPlay={false}
            canSee={true}
            card={card}
            key={cards.length}
            onClick={null}
          />
        );
      }
    }

    if (holder == PILE_DRAW) {
      cards.reverse();
    }

    return <div className="hand">{cards}</div>;
  }

  function dumpGame(): JSX.Element {
    return <pre>{JSON.stringify(game, null, 2)}</pre>;
  }

  return (
    <>
      <Notifications position="bottom-right" />

      <div className="content--debug" id="content">
        {game && (
          <>
            <h1>Discard Pile</h1>
            {dumpCard(game.deck[game.currentCard])}

            <h1>Draw Pile</h1>
            {dumpCards(PILE_DRAW)}

            <h1>Player One</h1>
            {dumpCards(0x00)}

            <h1>Player Two</h1>
            {dumpCards(0x01)}

            <h1>Player Three</h1>
            {dumpCards(0x02)}

            <h1>Player Four</h1>
            {dumpCards(0x03)}

            <h1>Game Data</h1>
            {dumpGame()}
          </>
        )}
      </div>
    </>
  );
};

export default Page;
