"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import StudentMediaEditor from "./StudentMediaEditor";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const isPublicAdminRoute = pathname === "/admin" || pathname === "/admin/login";

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (isPublicAdminRoute) {
        if (!cancelled) setChecking(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin");
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("is_admin");

      if (error || isAdmin !== true) {
        await supabase.auth.signOut();
        router.replace("/admin");
        return;
      }

      if (!cancelled) setChecking(false);
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [isPublicAdminRoute, pathname, router]);

  if (isPublicAdminRoute) return <>{children}</>;

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
          <p className="mt-4 font-semibold text-gray-600">Checking admin access...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {children}
      <StudentMediaEditor />
    </>
  );
}
