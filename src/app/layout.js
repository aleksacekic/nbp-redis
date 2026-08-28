export const metadata = {
  title: "Real-time Polling",
  description:
    "Kreiraj ankete i glasaj u realnom vremenu (Next.js + Redis Pub/Sub)",
}

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  )
}
