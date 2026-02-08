import "./globals.css";

export const metadata = {
  title: "RecallEngine-EN",
  description: "Personal English learning app with spaced repetition and AI conversation"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
