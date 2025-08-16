"use client";
import Image from "next/image";
import { useUser } from '@clerk/clerk-react';

export default function Home() {
    const { user, isLoaded, isSignedIn } = useUser();

    if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in.</div>;
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-2xl font-bold">Welcome to the Tree Page</h1>
      <p className="text-center">Explore the tree structure of your project.</p>
        <p className="text-lg">Hello, {user.firstName} {user.lastName}!</p>
      <Image
        src="/tree.svg"
        alt="Tree Illustration"
        width={200}
        height={200}
        className="rounded-lg shadow-lg transition-transform hover:scale-105 bg-green-100"
      />
    </div>
  );
}
