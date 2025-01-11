import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

export function makeAnchorProvider(connection: Connection): AnchorProvider {
  const anchorWallet = useAnchorWallet();

  return new AnchorProvider(connection, anchorWallet, {
    commitment: "confirmed",
  });
}
