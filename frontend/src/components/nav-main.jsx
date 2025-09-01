"use client"

import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger
} from "@/components/ui/sidebar"
import {useNavigate} from "react-router-dom"
// : {
//   items: {
//     title: string
//     url: string
//     icon?: LucideIcon
//     isActive?: boolean
//     items?: {
//       title: string
//       url: string
//     }[]
//   }[]
// }









export function NavMain({
  items,
}) {
  const navigate = useNavigate();
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            onClick= {() => navigate(item.url)}
            className="group/collapsible"
          >
            <SidebarMenuItem className="text-center">
                <SidebarMenuButton tooltip={item.title}
                className="text-center "
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="text-green-400 w-6 h-6 mr-10 " />}
                  </div>
                  <div className="text-center">{item.title}</div>
                </SidebarMenuButton>
                {/* we will make unclickable */}
              <SidebarMenuButton className="cursor-not-allowed pointer-events-none opacity-50">
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
