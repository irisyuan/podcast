import HeaderAuth from "@/components/header-auth";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "GoodPod",
  description: "A podcast tracking application",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-20">
                <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="GoodPod Logo" className="h-12 w-12 mr-2" />
                    <Link href={"/pods"} className="text-3xl font-bold text-color-secondary-purple">GoodPod</Link>
                  </div>
                  <div className="flex items-center gap-4">
                    <HeaderAuth />
                  </div>
                </div>
              </nav>
              <div className="flex flex-col gap-20 px-8 w-full">
                {children}
              </div>
            </div>
            <footer className="w-full text-center py-4 border-t border-t-foreground/10 text-xs">
              <p>© 2025 <a href="https://www.builtbyiris.io/" target="_blank" rel="noopener noreferrer">builtbyiris</a></p>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
