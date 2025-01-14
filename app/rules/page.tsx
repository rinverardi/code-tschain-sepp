"use client";

import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  function handleReturn() {
    router.push("..");
  }

  return (
    <div className="content--pre-game" id="content">
      <h1>Rules of the Game</h1>
      <p>
        At the beginning of a game, each player is dealt five cards. The
        remaining cards form the draw pile, with the top card turned face-up to
        create the discard pile. The top card of the discard pile must be
        matched in turn by each player, either by color or by rank.
      </p>
      <p>
        If the current player does not have a matching card in their hand, they
        may either draw a card from the draw pile or skip their turn. If the
        drawn card matches, it can be played immediately. If the drawn card does
        not match, they can either draw another card or skip their turn.
      </p>
      <p>
        If a player plays a seven, the next player must draw two cards. If a
        player plays an eight, the next player is skipped. All other cards have
        no special effect.
      </p>
      <p>The player who has discarded all their cards wins the game.</p>
      <div>
        <button onClick={handleReturn}>Go Back</button>
      </div>
    </div>
  );
};

export default Page;
