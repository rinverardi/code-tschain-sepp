import { useAnchorProvider } from "@components/anchor";
import { Program } from "@coral-xyz/anchor";

import IDL from "../target/idl/tschain_sepp.json";

import { TschainSepp } from "../target/types/tschain_sepp";

export function useProgram(): Program<TschainSepp> {
  const anchorProvider = useAnchorProvider();

  return new Program(IDL as TschainSepp, anchorProvider);
}
