import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Applies the Inter font family across the whole dashboard area
// (dashboard, analytics, templates) — including uppercase labels.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={inter.className}>{children}</div>;
}
