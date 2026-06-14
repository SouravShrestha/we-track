import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "WeTrack - Video Course Tracker",
  description: "Track your video course progress",
  icons: {
    icon: "/images/logo.png",
  },
  themeColor: "#010409",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-primarydark">
      <body className="flex flex-col text-colortext bg-primarydark min-h-screen">
        <Header />
        <main className="flex-1 bg-primary flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
