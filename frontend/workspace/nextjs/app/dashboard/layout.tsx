"use client"

import React, { createContext, useEffect, useState } from 'react';
import Link from "next/link"
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { handleLogout } from '@/lib/auth/handleLogout';

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

// Define sidebar configuration
const sidebarConfig = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "Projects", href: "/dashboard/projects" },
  { icon: LineChart, label: "Analytics", href: "/dashboard/analytics" },
]

// Define footer configuration
const footerConfig = [
  { icon: Settings, label: "Settings", href: "#" },
]

import { TooltipProvider } from "@/components/ui/tooltip";
import axios from 'axios';

export const UserIdContext = createContext<string | null>(null);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user info from local storage
    const storedUserInfo = localStorage.getItem('userinfo');
    if (!storedUserInfo) {
      console.error('No user info found');
      return;
    }

    const parsedUserInfo = JSON.parse(storedUserInfo);
    setUserInfo(parsedUserInfo);

    // Get user id from email
    const userId = parsedUserInfo?.email;
    if (!userId) {
      console.error('No user email found');
      return;
    }
    axios.get(`http://localhost:8080/user/byemail?email=${userId}`).then((response) => {
      setUserId(response.data.id);
      console.log('User ID:', response.data.id);
    });
  }, []);

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }];

    pathSegments.forEach((segment, index) => {
      if (index > 0 || segment !== 'dashboard') {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        breadcrumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1), href });
      }
    });

    return breadcrumbs;
  };

  return (
    <TooltipProvider>
      <UserIdContext.Provider value={userId}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
              <Link
                href="#"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
              >
                <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">Codebase Analysis</span>
              </Link>
              {sidebarConfig.map((item, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
              {footerConfig.map((item, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </aside>
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                  <nav className="grid gap-6 text-lg font-medium">
                    <Link
                      href="#"
                      className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                      <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                      <span className="sr-only">Codebase Analysis</span>
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <Home className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                      <ShoppingCart className="h-5 w-5" />
                      Orders
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-2.5 text-foreground">
                      <Package className="h-5 w-5" />
                      Products
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                      <Users2 className="h-5 w-5" />
                      Customers
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                      <LineChart className="h-5 w-5" />
                      Settings
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  {generateBreadcrumbs().map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {index === generateBreadcrumbs().length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < generateBreadcrumbs().length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
              </div>
              {userInfo && (
                <>
                  <div className="ml-2">{userInfo?.name}</div>
                  <div className="ml-2">{userInfo?.email}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                        <Avatar>
                          <AvatarImage src={userInfo?.picture} />
                          <AvatarFallback>{userInfo?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              {children}
            </main>
          </div>
        </div>
      </UserIdContext.Provider>
    </TooltipProvider>
  )
}
