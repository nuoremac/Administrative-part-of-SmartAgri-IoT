import "./globals.css";
import OpenApiProvider from "@/components/OpenApiProvider";
import LanguageProvider from "@/components/i18n/LangProvider";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AdminSearchProvider } from "@/components/admin/AdminSearchProvider";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <OpenApiProvider>
            <LanguageProvider>
              <ToastProvider>
                <AdminSearchProvider>{children}</AdminSearchProvider>
              </ToastProvider>
            </LanguageProvider>
          </OpenApiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
