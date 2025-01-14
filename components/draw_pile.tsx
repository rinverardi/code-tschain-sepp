"use client";

import PlayingCard from "@tschain-sepp/components/playing_card";

const DrawPile = ({
  canPlay,
  onDraw
}: DrawPileProps) =>
  <div className="pile" id="draw-pile">
    <label>Draw</label>

    <PlayingCard
      canPlay={canPlay}
      canSee={false}
      card={NaN}
      onClick={canPlay && onDraw} />
  </div>;

type DrawPileProps = {
  canPlay: boolean;
  onDraw: () => void;
};

export default DrawPile;
