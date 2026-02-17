import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import CartSideModal from "./components/CartSideModal";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sunnah Addict | Modest Wear",
  description: "Muslim modest wear – hijab, khimar, jilbab, abaya and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartSideModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
