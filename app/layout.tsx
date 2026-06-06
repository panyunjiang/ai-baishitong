import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI百事通 - 发现最好用的AI工具",
  description:
    "AI百事通收录并评测各类AI工具，包括ChatGPT、Midjourney、Cursor等热门AI应用，帮助你快速找到最适合的AI助手。",
  keywords:
    "AI工具,人工智能,AI助手,ChatGPT,Midjourney,Cursor,DeepSeek,豆包,Kimi,Claude,AI百事通",
  metadataBase: new URL("https://bs.aiv.yn.cn"),
  alternates: {
    canonical: "https://bs.aiv.yn.cn",
  },
  openGraph: {
    title: "AI百事通 - 发现最好用的AI工具",
    description:
      "AI百事通收录并评测各类AI工具，包括ChatGPT、Midjourney、Cursor等热门AI应用，帮助你快速找到最适合的AI助手。",
    url: "https://bs.aiv.yn.cn",
    siteName: "AI百事通",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="baidu-site-verification" content="codeva-fsVfMkumjC" />
      </head>
      <body style={{ background: "#f5f7fa" }}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
