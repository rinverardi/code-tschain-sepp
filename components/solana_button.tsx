"use client";

import dynamic from "next/dynamic";

const SolanaButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then(
    that => that.WalletMultiButton
  ),
  { ssr: false }
);

export default SolanaButton;
