import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ResearchLink | Discover Recent University Research & Connect with Professors",
  description: "Find undergraduate research opportunities. Explore research profiles from MIT, Stanford, Harvard, and more. Generate tailored outreach emails to contact professors.",
  keywords: "research, university, undergraduate research, professor, email outreach, science, engineering",
  authors: [{ name: "ResearchLink Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
