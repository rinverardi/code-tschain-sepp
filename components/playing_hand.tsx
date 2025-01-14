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

const PlayingHand = ({ available, deck, mine, onDiscard, player }: PlayingHandProps) =>
  <div className="hand">
    {deck.map((card, index) => derivePlayer(card) == player && <PlayingCard
      available={available}
      card={mine ? card : NaN}
      key={index}
      onDiscard={onDiscard}
      onDraw={null} />)}
  </div>;

type PlayingHandProps = {
  available: boolean;
  deck: number[];
  mine: boolean;
  onDiscard: (card: number) => void,
  player: number
};

export default PlayingHand;
