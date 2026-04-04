"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  onSearch?: (service: string, location: string) => void
}

export function Header({ onSearch }: HeaderProps) {
  const [service, setService] = useState("")
  const [location, setLocation] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = () => {
    onSearch?.(service, location)
  }

  const handleDetectLocation = () => {
    setLocation("Detecting...")
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation("New York, NY")
        },
        () => {
          setLocation("New York, NY")
        }
      )
    } else {
      setLocation("New York, NY")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full glass premium-border border-t-0 border-x-0">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-primary/30 group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg transition-opacity opacity-0 group-hover:opacity-100" />
          </div>
          <span className="hidden text-xl font-semibold tracking-tight text-foreground sm:inline-block">
            MediFind
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden flex-1 items-center gap-3 px-12 lg:flex">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="Search services like MRI, X-ray..."
              className="h-12 pl-11 bg-secondary/50 border-transparent rounded-xl transition-all duration-300 focus:bg-card focus:border-primary/20 focus:shadow-lg focus:shadow-primary/5"
              value={service}
              onChange={(e) => setService(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="relative flex items-center max-w-xs group">
            <MapPin className="absolute left-4 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="Location"
              className="h-12 pl-11 pr-20 bg-secondary/50 border-transparent rounded-xl transition-all duration-300 focus:bg-card focus:border-primary/20 focus:shadow-lg focus:shadow-primary/5"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 h-8 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
              onClick={handleDetectLocation}
            >
              Detect
            </Button>
          </div>
          <Button 
            onClick={handleSearch} 
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
          >
            Search
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:translate-y-[-1px]"
          >
            Services
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:translate-y-[-1px]"
          >
            Hospitals
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0 transition-all duration-200 hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                <Avatar className="h-10 w-10 ring-2 ring-border">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-medium">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 glass-card rounded-xl p-2">
              <DropdownMenuItem className="rounded-lg cursor-pointer transition-colors">My Profile</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer transition-colors">My Bookings</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer transition-colors">Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem className="rounded-lg cursor-pointer transition-colors text-destructive">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 rounded-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/50 glass px-6 py-6 lg:hidden animate-in-up">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search services like MRI, X-ray..."
                className="h-12 pl-11 bg-secondary/50 border-transparent rounded-xl"
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
            </div>
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Location"
                className="h-12 pl-11 bg-secondary/50 border-transparent rounded-xl"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20">
              Search
            </Button>
            <div className="mt-4 flex flex-col gap-1 border-t border-border/50 pt-6">
              <Link href="#" className="py-3 px-4 text-sm font-medium rounded-xl hover:bg-muted transition-colors">
                Services
              </Link>
              <Link href="#" className="py-3 px-4 text-sm font-medium rounded-xl hover:bg-muted transition-colors">
                Hospitals
              </Link>
              <Link href="#" className="py-3 px-4 text-sm font-medium rounded-xl hover:bg-muted transition-colors">
                My Bookings
              </Link>
              <Link href="#" className="py-3 px-4 text-sm font-medium rounded-xl hover:bg-muted transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
