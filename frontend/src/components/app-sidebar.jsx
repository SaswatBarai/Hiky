import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Menu,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  CircleDashed 
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { ChatDots,Telephone  } from "@mynaui/icons-react";
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Chat",
      url: "#",
      icon: ChatDots,
      isActive: true,
    },
    {
      title: "Calls",
      url: "#",
      icon: Telephone,
    },
    {
      title: "Status",
      url: "#",
      icon: CircleDashed,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ]
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
           <div className="flex items-center text-center  pl-1 mt-6 mb-6 ">
            <SidebarTrigger className="-ml-1" />
           </div>
      </SidebarHeader>
      <SidebarContent>
       
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
