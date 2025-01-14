"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const SolanaBalance = () => {
  const [balance, setBalance] = useState<number>(-1);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      const subscription = connection.onAccountChange(
        publicKey,
        (updatedAccountInfo) => {
          setBalance(updatedAccountInfo.lamports);
        },
        { commitment: "confirmed" }
      );

      connection.getAccountInfo(publicKey).then((info) => {
        if (info != null) {
          setBalance(info.lamports);
        }
      });

      return () => {
        connection.removeAccountChangeListener(subscription);
      };
    } else {
      setBalance(-1);
    }
  }, [publicKey]);

  return balance < 0 ? (
    <></>
  ) : (
    <output>{balance / LAMPORTS_PER_SOL} SOL</output>
  );
};

export default SolanaBalance;
