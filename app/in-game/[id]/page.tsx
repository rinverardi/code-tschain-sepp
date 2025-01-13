"use client";

import { IdlAccounts } from "@coral-xyz/anchor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import DiscardPile from "@tschain-sepp/components/discard_pile";
import DrawPile from "@tschain-sepp/components/draw_pile";
import { deriveAddress, fetchGame, watchGame } from "@tschain-sepp/components/game_account";
import { makeProgram } from "@tschain-sepp/components/game_program";
import { inputId } from "@tschain-sepp/components/id";

import Notifications, {
  showError
} from "@tschain-sepp/components/notification";

import Player, { getMe } from "@tschain-sepp/components/player";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();
  const [game, setGame] = useState<GameAccount>(null);
  const wallet = useWallet();

  const id = inputId(params.id);
  const me = game && wallet.publicKey ? getMe(game, wallet.publicKey) : NaN;
  const program = makeProgram(connection);
  const address = deriveAddress(program, id);

  watchGame(address, connection, program, setGame);

  useEffect(() => {
    fetchGame(address, program)
      .then(setGame)
      .catch(() => showError("Cannot fetch the game!"));
  }, []);

  return <>
    <Notifications position="top-center" />

    <div className="content--in-game" id="in-game">
      {game && <>
        <DrawPile available={game.currentPlayer == me} />
        <DiscardPile card={game.deck[game.currentCard]} />

        <Player
          game={game}
          publicKey={wallet.publicKey}
          slot={0} />

        <Player
          game={game}
          publicKey={wallet.publicKey}
          slot={1} />

        <Player
          game={game}
          publicKey={wallet.publicKey}
          slot={2} />

        <Player
          game={game}
          publicKey={wallet.publicKey}
          slot={3} />
      </>}
    </div>
  </>;
};

export default Page;
