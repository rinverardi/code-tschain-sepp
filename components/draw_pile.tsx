"use client";

import PlayingCard from "@tschain-sepp/components/playing_card";

const DrawPile = ({ available, onDraw }: DrawPileProps) => <>
  <div className="pile" id="draw-pile">
    <label>Draw</label>

    <PlayingCard
      available={available}
      card={NaN}
      onDraw={onDraw}
      onDiscard={null} />
  </div>
</>;

type DrawPileProps = {
  available: boolean;
  onDraw: () => void;
};

export default DrawPile;
