"use client";

import { IdlAccounts } from "@coral-xyz/anchor";
import { useParams, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import DiscardPile from "@tschain-sepp/components/discard_pile";
import DrawPile, { isDrawPileEmpty } from "@tschain-sepp/components/draw_pile";

import {
  deriveAddress,
  fetchGame,
  watchGame,
} from "@tschain-sepp/components/game_account";

import {
  callAbortGame,
  callDiscardCard,
  callDrawCard,
  callSkipTurn,
  makeProgram,
} from "@tschain-sepp/components/game_program";

import { inputId, outputId } from "@tschain-sepp/components/id";

import Notifications, {
  showError,
} from "@tschain-sepp/components/notification";

import Player from "@tschain-sepp/components/player";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

function getMe(game: GameAccount, publicKey: PublicKey): number {
  if (!publicKey) {
    return NaN;
  }

  for (let index = 0; index < game.players.length; index++) {
    if (game.players[index] && game.players[index].equals(publicKey)) {
      return index;
    }
  }

  throw new Error("Unknown player");
}

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
    callDiscardCard(program, id, card).catch(() =>
      showError("Cannot discard the card!")
    );
  }

  function handleDraw(): void {
    callDrawCard(program, id).catch(() => showError("Cannot draw the card!"));
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

  return (
    <>
      <Notifications />

      <div className="content--in-game" id="in-game">
        {game && (
          <>
            <div id="piles">
              {isDrawPileEmpty(game) || (
                <DrawPile
                  canPlay={me == game.currentPlayer}
                  onDraw={handleDraw}
                />
              )}

              <DiscardPile card={game.deck[game.currentCard]} />
            </div>

            <Player
              canPlay={me == game.currentPlayer && me == 0}
              canSee={me == 0}
              game={game}
              me={me}
              onAbort={handleAbort}
              onDiscard={handleDiscard}
              onSkip={handleSkip}
              slot={0}
            />

            <Player
              canPlay={me == game.currentPlayer && me == 1}
              canSee={me == 1}
              game={game}
              me={me}
              onAbort={null}
              onDiscard={handleDiscard}
              onSkip={handleSkip}
              slot={1}
            />

            <Player
              canPlay={me == game.currentPlayer && me == 2}
              canSee={me == 2}
              game={game}
              me={me}
              onAbort={null}
              onDiscard={handleDiscard}
              onSkip={handleSkip}
              slot={2}
            />

            <Player
              canPlay={me == game.currentPlayer && me == 3}
              canSee={me == 3}
              game={game}
              me={me}
              onAbort={null}
              onDiscard={handleDiscard}
              onSkip={handleSkip}
              slot={3}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Page;
