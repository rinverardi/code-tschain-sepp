"use client";

import PlayingCard from "@tschain-sepp/components/playing_card";

const DrawPile = ({ available }: DrawPileProps) => <>
  <div className="pile" id="draw-pile">
    <label>Draw</label>
    <PlayingCard available={available} card={NaN} onDiscard={null} />
  </div>
</>;

type DrawPileProps = {
  available: boolean;
};

export default DrawPile;
