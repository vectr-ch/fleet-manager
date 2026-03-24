"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const logoutMutation = trpc.sysadminAuth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/admin/login";
    },
  });

  // Don't show nav on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin/organisations", label: "Organisations" },
    { href: "/admin/sysadmins", label: "Sysadmins" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">VECTR</span>
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                Admin
              </span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
