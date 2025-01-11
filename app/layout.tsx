import SolanaBalance from "@tschain-sepp/components/solana_balance";
import SolanaButton from "@tschain-sepp/components/solana_button";
import SolanaProvider from "@tschain-sepp/components/solana_provider";
import { Metadata } from "next";
import { ReactNode } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

import "./layout.css";

const Layout = ({ children }: LayoutProps) => <>
  <html lang="en">
    <body>
      <SolanaProvider>
        <div id="wallet">
          <SolanaButton />
          <SolanaBalance />
        </div>
        <div id="content">
          {children}
        </div>
      </SolanaProvider>
      <div id="progress">
        <div />
      </div>
    </body>
  </html>
</>;

export default Layout;

type LayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: "Tschain Sepp",
};
