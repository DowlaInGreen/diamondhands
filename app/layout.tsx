import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "DiamondHands — Solana Conviction Analytics",
  description: "Find Solana's diamond hands before everyone else. On-chain conviction scoring for SPL tokens.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin:0, background:"#060810" }}>{children}</body>
    </html>
  );
}
