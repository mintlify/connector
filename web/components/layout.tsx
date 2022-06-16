import { useProfile } from "../context/ProfileContext";
import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile } = useProfile();

  const { user, org } = profile;
  if (user == null || org == null) {
    return null;
  }

  return (
    <>
      {/* Background color split screen for large screens */}
      <div className="fixed top-0 left-0 w-1/2 h-full bg-gray-50" aria-hidden="true" />
      <div className="fixed top-0 right-0 w-1/2 h-full bg-gray-50" aria-hidden="true" />
      <main className="relative min-h-screen flex flex-col">
        <Navbar />
        {children}
      </main>
    </>
  );
}
