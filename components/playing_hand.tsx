"use client";

import { PILE_DISCARD, PILE_DRAW } from "@tschain-sepp/components/game_account";
import PlayingCard from "@tschain-sepp/components/playing_card";

function derivePlayer(card: number): number {
  const holder = card >> 8;

  if (holder < 4) {
    return holder;
  } else if (holder == PILE_DISCARD || holder == PILE_DRAW) {
    return null;
  }

  throw new Error("Illegal player");
}

const PlayingHand = ({
  canPlay,
  canSee,
  deck,
  onDiscard,
  player
}: PlayingHandProps) => {
  const cards = deck.filter((candidate) => derivePlayer(candidate) == player);

  return <div className="hand">
    {cards.map((card, card_index) => <PlayingCard
      canPlay={canPlay}
      canSee={canSee}
      card={card}
      key={card_index}
      onClick={onDiscard} />)}
  </div>;
}
type PlayingHandProps = {
  canPlay: boolean;
  canSee: boolean;
  deck: number[];
  onDiscard: (card: number) => void,
  player: number
};

export default PlayingHand;
