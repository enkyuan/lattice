'use client';

import * as React from 'react';
import { Link } from '@tanstack/react-router';
import {
  BaseStation2Fill,
  BookmarkFill,
  ChartLineFill,
  Chat3Fill,
  Document3Fill,
  DownFill,
  InboxFill,
  Paper2Fill,
  PhoneFill,
  RandomFill,
  Settings3Fill,
  UserStarFill,
} from '@mingcute/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@lattice/ui';

const PRIMARY_NAV = [
  { label: 'Inbox', to: '/app/inbox', icon: InboxFill },
  { label: 'Drafts', to: '/app/drafts', icon: Document3Fill },
  { label: 'Outcomes', to: '/app/outcomes', icon: RandomFill },
  { label: 'Analytics', to: '/app/analytics', icon: ChartLineFill },
];

const CONFIG_NAV = [
  { label: 'Watchlists', to: '/app/watchlists', icon: BookmarkFill },
  { label: 'ICPs', to: '/app/icps', icon: UserStarFill },
  { label: 'Sources', to: '/app/sources', icon: BaseStation2Fill },
  { label: 'Summaries', to: '/app/summaries', icon: Paper2Fill },
];

const FOOTER_NAV = [
  { label: 'Support', to: '/app/support', icon: PhoneFill },
  { label: 'Feedback', to: '/app/feedback', icon: Chat3Fill },
  { label: 'Settings', to: '/app/settings/profile', icon: Settings3Fill },
];

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar
      side="left"
      variant="inset"
      collapsible="icon"
      className="group-data-[collapsible=icon]:[&_[data-sidebar=menu-item]]:flex group-data-[collapsible=icon]:[&_[data-sidebar=menu-item]]:justify-start group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:justify-start group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]]:px-2 group-data-[collapsible=icon]:[&_[data-sidebar=menu-button][data-active='true']]:justify-center group-data-[collapsible=icon]:[&_[data-sidebar=menu-button][data-active='true']]:px-0"
      {...props}
    >
      <SidebarHeader className="gap-2 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-auto w-full items-center gap-2 rounded-none border-0 bg-transparent py-0 text-left text-sm font-medium text-foreground shadow-none ring-0 outline-none focus-visible:ring-0">
            <span className="truncate">Lattice Workspace</span>
            <DownFill className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Lattice Workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
          Workflow
        </p>
        <SidebarMenu>
          {PRIMARY_NAV.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                render={
                  <Link to={item.to as never} activeProps={{ 'data-active': 'true' } as never} />
                }
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <p className="mt-4 px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
          Configuration
        </p>
        <SidebarMenu>
          {CONFIG_NAV.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                render={
                  <Link to={item.to as never} activeProps={{ 'data-active': 'true' } as never} />
                }
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-0">
        <SidebarMenu className="px-0">
          {FOOTER_NAV.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                render={
                  <Link to={item.to as never} activeProps={{ 'data-active': 'true' } as never} />
                }
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
