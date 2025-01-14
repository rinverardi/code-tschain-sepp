"use client";

import PlayingCard from "@tschain-sepp/components/playing_card";

const DiscardPile = ({ card }: DiscardPileProps) => (
  <div className="pile" id="discard-pile">
    <label>Discard</label>

    <PlayingCard canPlay={false} canSee={true} card={card} onClick={null} />
  </div>
);

type DiscardPileProps = {
  card: number;
};

export default DiscardPile;
