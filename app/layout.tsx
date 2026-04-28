import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "サブスク管理",
  description: "月額サブスクリプションの費用と更新日をブラウザ内で管理するアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
