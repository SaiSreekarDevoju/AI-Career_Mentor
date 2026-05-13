import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ExpiredTrialGate } from "@/components/ExpiredTrialGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentoria.ai | Autonomous AI Career Mentor",
  description: "Your autonomous AI career strategist. Upload your resume, discover skill gaps, and dominate mock interviews.",
};

const THEME_BOOT = `
(function(){
  try {
    var t = localStorage.getItem('mentoria-theme');
    var d = document.documentElement;
    d.classList.remove('light','dark');
    d.classList.add(t === 'light' ? 'light' : 'dark');
    d.dataset.theme = t === 'light' ? 'light' : 'dark';
  } catch (e) {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = 'dark';
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
        <Script id="mentoria-theme-boot" strategy="beforeInteractive">
          {THEME_BOOT}
        </Script>
        <AuthProvider>
          <ThemeProvider>
            <ExpiredTrialGate>{children}</ExpiredTrialGate>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
