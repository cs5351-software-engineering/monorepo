'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Overview', path: '/dashboard' },
  { name: 'Projects', path: '/dashboard/projects' },
  { name: 'Analysis', path: '/dashboard/analysis' },
];

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userinfo');
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
    }
  }, []);

  return (
    <div className="flex h-screen bg-black text-white">
      <nav className="w-64 border-r border-gray-800 flex flex-col">
        {userInfo && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-semibold">{userInfo.name}</h3>
                <p className="text-sm text-gray-400">{userInfo.email}</p>
              </div>
            </div>
          </div>
        )}
        <ul className="py-4 flex-grow">
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.path}
                className={`block px-4 py-2 hover:bg-gray-800 ${
                  pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
