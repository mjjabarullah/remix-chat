import { Document } from "./document.tsx";

export function HomePage() {
  return () => (
    <Document head={<HomeHead />}>
      <main>Helo</main>
    </Document>
  );
}

function HomeHead() {
  return () => (
    <>
      <meta name="color-scheme" content="light dark" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
      />
    </>
  );
}
