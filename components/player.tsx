import { IdlAccounts } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import PlayingHand from "@tschain-sepp/components/playing_hand";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

export function deriveLabel(game: GameAccount, slot: number): string {
  if (game.players[slot] == null) {
    switch (slot) {
      case 0: return "No First Player";
      case 1: return "No Second Player";
      case 2: return "No Third Player";
      case 3: return "No Fourth Player";
    }
  } else {
    switch (slot) {
      case 0: return "Player One";
      case 1: return "Player Two";
      case 2: return "Player Three";
      case 3: return "Player Four";
    }
  }

  throw new Error("Illegal slot");
}

export function getMe(game: GameAccount, publicKey: PublicKey): number {
  if (!publicKey) {
    return NaN;
  }

  for (let index = 0; index < game.players.length; index++) {
    if (game.players[index] && game.players[index].equals(publicKey)) {
      return index;
    }
  }

  throw new Error("Unknown player");
}

const Player = ({ game, publicKey, slot }: PlayerProps) => {
  const me = getMe(game, publicKey);

  return <div className="player" id={"player" + slot}>
    <label>{deriveLabel(game, slot)}</label>

    {game.currentPlayer == slot &&
      <span className="player-indicator" />}

    {game.players[slot] &&
      <PlayingHand
        available={game.currentPlayer == me && game.currentPlayer == slot}
        cards={game.cards}
        mine={slot == me}
        player={slot} />
    }
  </div>
};

type PlayerProps = {
  game: GameAccount;
  publicKey: PublicKey;
  slot: number;
};

export default Player;
