import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Inter, Instrument_Serif, Fira_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const LOGO =
  "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1778217940/logo_x82dia.png";

export const metadata: Metadata = {
  title: "Pratibha AI — Autonomous AI Recruitment Platform",
  description:
    "10 specialized AI agents screen, score, and shortlist your best candidates — autonomously. Powered by Google ADK + Gemini.",
  icons: {
    icon: [{ url: LOGO, type: "image/png" }],
    shortcut: [{ url: LOGO, type: "image/png" }],
    apple: [{ url: LOGO, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} ${inter.variable} ${instrumentSerif.variable} ${firaSans.variable} h-full antialiased`}
    >
      <body className="h-full">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
