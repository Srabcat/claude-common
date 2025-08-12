'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, User, Settings, LogOut, Monitor, Smartphone, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { User as UserType, UserRole } from '@/types'
import { mockUsers, getCurrentUser, setCurrentUser, getNavigationItems } from '@/lib/mock-data'
import { useTheme } from '@/components/providers/theme-provider'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [currentUser, setCurrentUserState] = React.useState<UserType>(getCurrentUser())
  const [searchQuery, setSearchQuery] = React.useState('')

  const navigationItems = getNavigationItems(currentUser.role)

  const handleRoleSwitch = (newUser: UserType) => {
    setCurrentUser(newUser)
    setCurrentUserState(newUser)
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'platform_admin':
        return 'default' as const
      case 'agency_recruiter':
        return 'secondary' as const
      case 'employer_recruiter':
        return 'outline' as const
      case 'platform_prototype':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'platform_admin':
        return 'Platform Admin'
      case 'agency_recruiter':
        return 'Agency Recruiter'
      case 'employer_recruiter':
        return 'Employer Recruiter'
      case 'platform_prototype':
        return 'Platform Prototype'
      default:
        return role
    }
  }

  return (
    <nav className={cn('border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      {/* Main Navigation Bar */}
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ATS</span>
            </div>
            <span className="font-semibold">Candidate Platform</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-1 flex-1">
          {navigationItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'relative',
                  pathname === item.href && 'bg-secondary'
                )}
              >
                {item.title}
              </Button>
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
            {searchQuery && (
              <Badge variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                ⌘K
              </Badge>
            )}
          </div>
        </div>

        {/* Right Side Items */}
        <div className="flex items-center space-x-4">
          {/* Role Switcher - Testing Mode */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Badge variant={getRoleBadgeVariant(currentUser.role)} className="mr-2">
                  TEST
                </Badge>
                {getRoleDisplayName(currentUser.role)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-2">
                <p className="text-sm font-medium">Testing Mode - Switch Roles</p>
                <p className="text-xs text-muted-foreground">For development and testing purposes</p>
              </div>
              <DropdownMenuSeparator />
              {mockUsers.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => handleRoleSwitch(user)}
                  className={cn(
                    'flex items-center gap-2',
                    currentUser.id === user.id && 'bg-accent'
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.organizationName}</div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  {currentUser.avatar}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  {currentUser.avatar}
                </div>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t px-4 py-2">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {navigationItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                size="sm"
                className="whitespace-nowrap"
              >
                {item.title}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}