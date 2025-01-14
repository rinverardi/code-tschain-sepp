"use client";

import { JSX } from "react";

function deriveRank(card: number): string {
  switch (card & 0x0f) {
    case 0x00: return "6";
    case 0x01: return "7";
    case 0x02: return "8";
    case 0x03: return "9";
    case 0x04: return "10";
    case 0x05: return "J";
    case 0x06: return "Q";
    case 0x07: return "K";
    case 0x08: return "A";
  }

  throw new Error("Illegal rank");
}

function deriveSuit(card: number): [string, string] {
  switch (card & 0xf0) {
    case 0x00: return ["♥", "red"];
    case 0x10: return ["♦", "blue"];
    case 0x20: return ["♣", "green"];
    case 0x30: return ["♠", "black"];
  }

  throw new Error("Illegal suit");
}

function makeFigures(rank: string, suit: string): JSX.Element {
  const rankValue = Number(rank);

  if (isNaN(rankValue)) {
    return <>
      <div className="card__figure--1">
        <span>{rank == "A" ? suit : rank}</span>
      </div>
    </>;
  } else {
    const suits = [];

    for (let index = 0; index < rankValue; index++) {
      suits.push(<span key={index}>{suit}</span>)
    }

    return <>
      <div className="card__figure--n">
        {suits}
      </div>
    </>;
  }
}

const PlayingCard = ({ available, card, onDiscard, onDraw }: PlayingCardProps) => {
  const availability = available ? "card--available " : "";

  function handleClick() {
    if (onDiscard) {
      onDiscard(card);
    }

    if (onDraw) {
      onDraw();
    }
  }

  if (isNaN(card)) {
    return <div className={`card ${availability} card--facedown`} onClick={handleClick} />;
  } else {
    const rank = deriveRank(card);
    const [suit, suitColor] = deriveSuit(card);

    return <>
      <div className={`card ${availability} card--faceup suit--${suitColor}`} onClick={handleClick}>
        <div className="card__index">
          <span>{rank}</span>
          <br />
          <span>{suit}</span>
        </div>
        <div className="card__index card__index--bottom">
          <span>{rank}</span>
          <br />
          <span>{suit}</span>
        </div>
        {makeFigures(rank, suit)}
      </div>
    </>;
  }
};

type PlayingCardProps = {
  available: boolean;
  card: number;
  onDiscard: (card: number) => void;
  onDraw: () => void;
};

export default PlayingCard;
