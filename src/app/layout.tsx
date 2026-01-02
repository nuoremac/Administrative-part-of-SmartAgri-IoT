import "./globals.css";
import LanguageProvider from "@/components/i18n/LangProvider";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AdminSearchProvider } from "@/components/admin/AdminSearchProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AdminSearchProvider>{children}</AdminSearchProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
