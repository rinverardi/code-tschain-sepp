"use client";

import { JSX } from "react";

function deriveRank(card: number): string {
  switch (card & 0x0f) {
    case 0x00:
      return "6";
    case 0x01:
      return "7";
    case 0x02:
      return "8";
    case 0x03:
      return "9";
    case 0x04:
      return "10";
    case 0x05:
      return "J";
    case 0x06:
      return "Q";
    case 0x07:
      return "K";
    case 0x08:
      return "A";
  }

  throw new Error("Illegal rank");
}

function deriveSuit(card: number): [string, string] {
  switch (card & 0xf0) {
    case 0x00:
      return ["♥", "red"];
    case 0x10:
      return ["♦", "blue"];
    case 0x20:
      return ["♣", "green"];
    case 0x30:
      return ["♠", "black"];
  }

  throw new Error("Illegal suit");
}

function makeFigures(rank: string, suit: string): JSX.Element {
  const rankValue = Number(rank);

  if (isNaN(rankValue)) {
    return (
      <div className="card__figure--1">
        <span>{rank == "A" ? suit : rank}</span>
      </div>
    );
  } else {
    const suits = [];

    for (let index = 0; index < rankValue; index++) {
      suits.push(<span key={index}>{suit}</span>);
    }

    return <div className="card__figure--n">{suits}</div>;
  }
}

const PlayingCard = ({ canPlay, canSee, card, onClick }: PlayingCardProps) => {
  const playability = canPlay ? "card--playable " : "";

  function handleClick() {
    if (onClick) {
      onClick(card);
    }
  }

  if (canSee) {
    const rank = deriveRank(card);
    const [suit, suitColor] = deriveSuit(card);

    return (
      <div
        className={`card card--faceup ${playability} suit--${suitColor}`}
        onClick={handleClick}
      >
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
    );
  } else {
    return (
      <div
        className={`card card--facedown ${playability}`}
        onClick={handleClick}
      />
    );
  }
};

type PlayingCardProps = {
  canPlay: boolean;
  canSee: boolean;
  card: number;
  onClick: (card: number) => void;
};

export default PlayingCard;
