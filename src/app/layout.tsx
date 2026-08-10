import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistente de Posts",
  description: "Assistente multimarca local para criar posts e carrosséis com consistência.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="h-full antialiased"><body className="h-full">{children}</body></html>;
}
