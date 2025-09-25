"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  LogOutIcon,
  Settings,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSelector, useDispatch } from "react-redux";
import { useLogout } from "../utils/queries.js";
import { clearUser } from "../state/authSlice.js";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// : {
//   user: {
//     name: string
//     email: string
//     avatar: string
//   }
// }

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const currentUser = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Logout clicked - starting logout process");
    
    try {
      // Call backend logout
      console.log("Calling backend logout...");
      const result = await logoutMutation.mutateAsync();
      console.log("Backend logout successful:", result);
      
      // Clear Redux state
      console.log("Clearing Redux state...");
      dispatch(clearUser());
      
      // Clear all cached queries
      console.log("Clearing query cache...");
      queryClient.clear();
      
      // Navigate to home/login page
      console.log("Navigating to home page...");
      navigate("/");
      
      console.log("Logout process completed successfully");
    } catch (error) {
      console.log("Logout Error:", error);
      
      // Even if backend logout fails, clear local state
      console.log("Clearing local state due to error...");
      dispatch(clearUser());
      queryClient.clear();
      navigate("/");
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 ">
                <AvatarImage
                  src={currentUser?.profileImage?.image}
                  className="rounded-full"
                  alt={currentUser?.name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentUser?.name}
                </span>
                <span className="truncate text-xs">{currentUser?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser?.profileImage?.image}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentUser?.name}
                  </span>
                  <span className="truncate text-xs">{currentUser?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
