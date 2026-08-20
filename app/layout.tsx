import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Madrasa Majmaul Bahrain Bijol",
  description: "Official website of Madrasa Majmaul Bahrain Bijol.",
  icons: { icon: "/madrasa-logo.jpg", shortcut: "/madrasa-logo.jpg", apple: "/madrasa-logo.jpg" },
};

const profileBrandCss = `
#overview{position:relative;overflow:hidden}
#overview::after{content:"";position:absolute;top:22px;right:28px;width:108px;height:108px;border-radius:24px;background:rgba(255,255,255,.96) url("/madrasa-logo.jpg") center/contain no-repeat;box-shadow:0 14px 36px rgba(0,0,0,.16);pointer-events:none;z-index:0}
#overview>div{position:relative;z-index:1}
#id-card>div:last-child{overflow:hidden}
#id-card>div:last-child>div:first-child{position:relative;padding-left:124px!important;min-height:108px}
#id-card>div:last-child>div:first-child::before{content:"";position:absolute;left:24px;top:22px;width:82px;height:82px;border-radius:18px;background:#fff url("/madrasa-logo.jpg") center/contain no-repeat;box-shadow:0 10px 28px rgba(0,0,0,.18)}
@media(max-width:640px){#overview::after{width:68px;height:68px;top:14px;right:14px;border-radius:16px}#overview>div{padding-right:82px}#id-card>div:last-child>div:first-child{padding-left:88px!important;min-height:86px}#id-card>div:last-child>div:first-child::before{left:16px;top:16px;width:58px;height:58px;border-radius:14px}}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head><style dangerouslySetInnerHTML={{ __html: profileBrandCss }} /></head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
