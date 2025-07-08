import "~/styles/globals.css";
import "@uploadthing/react/styles.css";
import "~/styles/uploadthing.css";

import "~/styles/dashboard/history_work.css"

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TopNav } from "./_components/topnav";


import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";


export const metadata: Metadata = {
  title: "Stud-freelance",
  description: "Yeah",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <TopNav/>
            {children}
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}