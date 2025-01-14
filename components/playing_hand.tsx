"use client";

import PlayingCard from "@tschain-sepp/components/playing_card";

function derivePlayer(card: number): number {
  const player = card >> 8;

  if (player < 4) {
    return player;
  } else if (player == 0xff) {
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
