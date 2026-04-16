"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Wallet, Wallet2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { ThemeToggleSimple } from "@/components/theme-toggle-simple";

export default function Navbar({
  credit,
  email,
}: {
  credit: number;
  email: string;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  return (
    <header className="bg-background sticky top-0 flex z-10 justify-center border-b">
      <div className="container flex h-16 items-center justify-between px-4 py-2">
        {/* dashborad product name */}
        <Link href="/dashboard" className="flex items-center">
          <div className="font-sans text-2xl font-medium tracking-tighter">
            <span className="text-foreground">Clipa</span>
            <span className="text-blue-400 font-light"></span>
            <span className="text-orange-500 font-light">Ai</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Badge
              className="h-8 px-3 py-1 text-xs font-medium relative"
              variant={"outline"}
            >
              <div className="absolute inset-0 animate-ping rounded-full bg-orange-500 opacity-75"></div>
              <span className="relative">{credit} Credits</span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-medium"
            >
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-2"
              >
                <Wallet className="h-3 w-3" />
                Buy Credits
              </Link>
            </Button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggleSimple />

          {/* for profile dropdownmenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={email} />
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                    {email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="text-sm font-medium">{email}</p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    {email}
                  </p>
                </div>
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center cursor-pointer"
                >
                  <Wallet2Icon className="mr-2 h-4 w-4" />
                  <span>Buy Credits</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className=" mr-2 h-4 w-4" />
                <span className="cursor-pointer">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
