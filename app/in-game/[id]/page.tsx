"use client";

import { IdlAccounts } from "@coral-xyz/anchor";
import { useParams, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import DiscardPile from "@tschain-sepp/components/discard_pile";
import DrawPile from "@tschain-sepp/components/draw_pile";

import {
  deriveAddress,
  fetchGame,
  watchGame
} from "@tschain-sepp/components/game_account";

import {
  callAbortGame,
  callDiscardCard,
  callSkipTurn,
  makeProgram
} from "@tschain-sepp/components/game_program";

import { inputId, outputId } from "@tschain-sepp/components/id";

import Notifications, {
  showError
} from "@tschain-sepp/components/notification";

import Player, { getMe } from "@tschain-sepp/components/player";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

const Page = () => {
  const { connection } = useConnection();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [game, setGame] = useState<GameAccount>(null);
  const wallet = useWallet();

  const id = inputId(params.id);
  const me = game && wallet.publicKey ? getMe(game, wallet.publicKey) : NaN;
  const program = makeProgram(connection);
  const address = deriveAddress(program, id);

  watchGame(address, connection, program, update);

  useEffect(() => {
    fetchGame(address, program)
      .then(update)
      .catch(() => showError("Cannot fetch the game!"));
  }, []);

  function handleAbort(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();

    callAbortGame(program, id).catch(() => showError("Cannot abort the game!"));
  }

  function handleDiscard(card: number): void {
    callDiscardCard(program, id, card).catch(() => showError("Cannot discard the card!"));
  }

  function handleSkip(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();

    callSkipTurn(program, id).catch(() => showError("Cannot skip the turn!"));
  }

  function update(game: GameAccount): void {
    if (game.status.aborted) {
      router.push("../..");
    } else if (game.status.ended) {
      router.push("../../post-game/" + outputId(id));
    } else {
      setGame(game);
    }
  }

  return <>
    <Notifications position="top-center" />

    <div className="content--in-game" id="in-game">
      {game && <>
        <DrawPile available={game.currentPlayer == me} />
        <DiscardPile card={game.deck[game.currentCard]} />

        <Player
          game={game}
          onAbort={handleAbort}
          onDiscard={handleDiscard}
          onSkip={handleSkip}
          publicKey={wallet.publicKey}
          slot={0} />

        <Player
          game={game}
          onAbort={null}
          onDiscard={handleDiscard}
          onSkip={handleSkip}
          publicKey={wallet.publicKey}
          slot={1} />

        <Player
          game={game}
          onAbort={null}
          onDiscard={handleDiscard}
          onSkip={handleSkip}
          publicKey={wallet.publicKey}
          slot={2} />

        <Player
          game={game}
          onAbort={null}
          onDiscard={handleDiscard}
          onSkip={handleSkip}
          publicKey={wallet.publicKey}
          slot={3} />
      </>}
    </div>
  </>;
};

export default Page;
