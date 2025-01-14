import { IdlAccounts } from "@coral-xyz/anchor";
import { MouseEvent } from "react";
import PlayingHand from "@tschain-sepp/components/playing_hand";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

export function deriveLabel(game: GameAccount, slot: number): string {
  if (game.players[slot] == null) {
    switch (slot) {
      case 0: return "No First Player";
      case 1: return "No Second Player";
      case 2: return "No Third Player";
      case 3: return "No Fourth Player";
    }
  } else {
    switch (slot) {
      case 0: return "Player One";
      case 1: return "Player Two";
      case 2: return "Player Three";
      case 3: return "Player Four";
    }
  }

  throw new Error("Illegal slot");
}

const Player = ({
  canPlay,
  canSee,
  game,
  me,
  onAbort,
  onDiscard,
  onSkip,
  slot
}: PlayerProps) => {
  const canAbort = me == 0 && me == slot;

  return <div className="player" id={"player" + slot}>
    {canPlay &&
      <span className="player__indicator player__indicator--left" />}

    <label>{deriveLabel(game, slot)}</label>

    {canPlay &&
      <span className="player__indicator player__indicator--right" />}

    {game.players[slot] && <>
      <PlayingHand
        canPlay={canPlay}
        canSee={canSee}
        deck={game.deck}
        onDiscard={canPlay ? onDiscard : null}
        player={slot} />

      {canAbort && <a href="" onClick={onAbort}>Abort</a>}
      {canPlay && <a href="" onClick={onSkip}>Skip</a>}
    </>}
  </div>;
}

type PlayerProps = {
  canPlay: boolean;
  canSee: boolean;
  game: GameAccount;
  me: number,
  onAbort: (event: MouseEvent<HTMLAnchorElement>) => void;
  onDiscard: (card: number) => void;
  onSkip: (event: MouseEvent<HTMLAnchorElement>) => void;
  slot: number;
};

export default Player;
