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

const PlayingHand = ({ available, cards, mine, player }: PlayingHandProps) => {
  return <>
    <div className="hand">
      {cards.map((card, index) => derivePlayer(card) == player &&
        <PlayingCard
          available={available}
          card={mine ? card : NaN}
          key={index} />)}
    </div>
  </>;
};

type PlayingHandProps = {
  available: boolean;
  cards: number[];
  mine: boolean;
  player: number
};

export default PlayingHand;
