import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "CS5351 Software Engineering - Codebase Analysis",
  description: "Analyze the codebase of a project to find potential issues and improve the quality of the code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID!}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
