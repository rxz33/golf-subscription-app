"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) {
        const res = await fetch("/api/profile");
        const json = await res.json();
        setIsAdmin(json.isAdmin);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-slate-900 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-black text-emerald-400 text-lg">
          ⛳ Golf Charity
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-amber-400 hover:text-amber-300 font-semibold transition"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-slate-300 hover:text-white transition"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg font-semibold transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
