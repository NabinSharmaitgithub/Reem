import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Reem - Voice AI Assistant",
  description: "A friendly voice AI assistant powered by OpenRouter",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}