import { User } from "../pages";
import Navbar from "./Navbar";

export default function Layout({ children, user }: { children: React.ReactNode; user: User }) {
  return (
    <>
      {/* Background color split screen for large screens */}
      <div className="fixed top-0 left-0 w-1/2 h-full bg-gray-50" aria-hidden="true" />
      <div className="fixed top-0 right-0 w-1/2 h-full bg-gray-50" aria-hidden="true" />
      <main className="relative min-h-screen flex flex-col">
        <Navbar user={user} />
        {children}
      </main>
    </>
  );
}
