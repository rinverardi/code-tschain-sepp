import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

export function useAnchorProvider(): AnchorProvider {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return new AnchorProvider(connection, anchorWallet, {
    commitment: "confirmed",
  });
}
