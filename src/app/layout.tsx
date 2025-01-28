import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Roboto } from "next/font/google";
import { UserProvider } from "@/context/userContext";
import { PermissionsProvider } from "@/context/userPermissions";
import { CompanyProfileProvider } from "@/context/userCompanyProfile";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Document Management System",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} w-100 p-0 m-0`}>
        <UserProvider>
          <CompanyProfileProvider>
            <PermissionsProvider>
              {children}
            </PermissionsProvider>
          </CompanyProfileProvider>
        </UserProvider>
      </body>
    </html>
  );
}
