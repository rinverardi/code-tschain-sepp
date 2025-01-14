"use client";

import { IdlAccounts } from "@coral-xyz/anchor";
import { PILE_DRAW } from "@tschain-sepp/components/game_account";
import PlayingCard from "@tschain-sepp/components/playing_card";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

export function isDrawPileEmpty(game: GameAccount): boolean {
  return game.deck
    .map((candidate) => (candidate & 0xff00) >> 8)
    .every((candidate) => candidate != PILE_DRAW);
}

const DrawPile = ({ canPlay, onDraw }: DrawPileProps) => (
  <div className="pile" id="draw-pile">
    <label>Draw</label>

    <PlayingCard
      canPlay={canPlay}
      canSee={false}
      card={NaN}
      onClick={canPlay && onDraw}
    />
  </div>
);

type DrawPileProps = {
  canPlay: boolean;
  onDraw: () => void;
};

export default DrawPile;
