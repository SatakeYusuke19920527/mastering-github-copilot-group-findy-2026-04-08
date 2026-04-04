"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/students", label: "生徒管理", icon: "👤" },
  { href: "/schedule", label: "授業スケジュール", icon: "📅" },
  { href: "/grades", label: "成績管理", icon: "📊" },
  { href: "/billing", label: "請求/入金", icon: "💰" },
  { href: "/absences", label: "欠席管理", icon: "📝" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">佐竹塾</h1>
        <p className="text-sm text-gray-400">管理システム</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <UserButton />
      </div>
    </aside>
  );
}
