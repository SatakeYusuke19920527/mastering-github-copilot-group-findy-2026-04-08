"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

const navItems = [
  { href: "/portal", label: "ダッシュボード", icon: "🏠" },
  { href: "/portal/grades", label: "成績", icon: "📊" },
  { href: "/portal/absences", label: "欠席連絡", icon: "📝" },
  { href: "/portal/notifications", label: "お知らせ", icon: "🔔" },
];

export function PortalHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <Link href="/portal" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-blue-700">佐竹塾</h1>
              <span className="text-sm text-gray-900">保護者ポータル</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User button & mobile toggle */}
          <div className="flex items-center gap-3">
            <UserButton />
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-900 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">メニュー</span>
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-200 bg-white px-4 pb-3 pt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
