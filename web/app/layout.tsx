import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BajaDentalGuide",
  description: "Find dental clinics in Baja California",
};

const extensionErrorGuardScript = `
(() => {
  const targetMessage = "Cannot redefine property: StacksProvider";
  const isTarget = (message, filename) => {
    if (typeof message !== "string" || !message.includes(targetMessage)) {
      return false;
    }
    if (typeof filename === "string" && filename.startsWith("chrome-extension://")) {
      return true;
    }
    return true;
  };

  window.addEventListener(
    "error",
    (event) => {
      if (!isTarget(event.message, event.filename)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason && typeof reason.message === "string"
            ? reason.message
            : "";
      if (!isTarget(message, "")) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === "development" ? (
          <Script id="extension-error-guard" strategy="beforeInteractive">
            {extensionErrorGuardScript}
          </Script>
        ) : null}
        <Header />
        <div>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
