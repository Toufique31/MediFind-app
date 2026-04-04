"use client"

import { useState } from "react"
import { MapPin, X, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Hospital } from "./hospital-card"

interface MapViewProps {
  hospitals: Hospital[]
  selectedHospital?: Hospital | null
  onSelectHospital?: (hospital: Hospital | null) => void
  onClose?: () => void
}

export function MapView({ hospitals, selectedHospital, onSelectHospital, onClose }: MapViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const getPosition = (id: string, index: number) => {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return {
      left: 15 + (hash % 70),
      top: 15 + ((hash * index) % 60),
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-secondary via-secondary to-muted">
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="rounded-xl glass-card premium-border px-4 py-2">
          <span className="text-sm font-medium text-foreground">{hospitals.length} hospitals in view</span>
        </div>
        {onClose && (
          <Button variant="outline" size="icon" onClick={onClose} className="h-9 w-9 rounded-xl glass-card border-border/50">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Map Background with premium grid */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/30" />
            </pattern>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Simulated roads with gradient fade */}
        <div className="absolute top-1/3 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
        <div className="absolute top-2/3 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-muted-foreground/8 to-transparent" />
        <div className="absolute left-1/4 top-0 bottom-0 w-3 bg-gradient-to-b from-transparent via-muted-foreground/10 to-transparent" />
        <div className="absolute left-2/3 top-0 bottom-0 w-2 bg-gradient-to-b from-transparent via-muted-foreground/8 to-transparent" />
      </div>

      {/* Hospital Pins */}
      {hospitals.map((hospital, index) => {
        const position = getPosition(hospital.id, index)
        const isSelected = selectedHospital?.id === hospital.id
        const isHovered = hoveredId === hospital.id

        return (
          <button
            key={hospital.id}
            className="absolute transform -translate-x-1/2 -translate-y-full z-20 transition-all duration-300"
            style={{ 
              left: `${position.left}%`, 
              top: `${position.top}%`,
              animationDelay: `${index * 100}ms`
            }}
            onMouseEnter={() => setHoveredId(hospital.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectHospital?.(isSelected ? null : hospital)}
          >
            <div className={`relative transition-all duration-300 ${isSelected || isHovered ? "scale-125 -translate-y-1" : ""}`}>
              {/* Pin glow effect */}
              {(isSelected || isHovered) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 blur-md animate-pulse" />
                </div>
              )}
              
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30"
                    : isHovered
                    ? "bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground shadow-lg shadow-primary/20"
                    : "glass-card text-primary premium-border"
                }`}
              >
                <MapPin className="h-5 w-5" />
              </div>
              
              {/* Pin tail */}
              <div 
                className={`absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 transition-colors duration-300 ${
                  isSelected || isHovered 
                    ? "bg-primary" 
                    : "bg-card border-r border-b border-border/50"
                }`} 
              />
            </div>

            {/* Premium Tooltip */}
            {(isSelected || isHovered) && (
              <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-56 rounded-2xl glass-card premium-shadow-lg p-4 text-left animate-in-up border border-border/50">
                <div className="absolute left-1/2 -bottom-2 w-4 h-4 -translate-x-1/2 rotate-45 glass-card border-r border-b border-border/50" />
                <p className="font-semibold text-foreground text-sm truncate">{hospital.name}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {hospital.distance} km away
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">${hospital.price}</span>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50">
                    <span className="text-amber-500">★</span>
                    <span className="text-xs font-medium text-amber-700">{hospital.rating}</span>
                  </div>
                </div>
                {hospital.availableToday && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-accent font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    Available Today
                  </div>
                )}
              </div>
            )}
          </button>
        )
      })}

      {/* Center marker (user location) - Premium style */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          {/* Outer pulse rings */}
          <div className="absolute -inset-4 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-2 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
          
          {/* Inner marker */}
          <div className="relative h-5 w-5 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/40 ring-4 ring-white/80">
            <Navigation className="absolute inset-0 m-auto h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground glass-subtle px-3 py-1.5 rounded-lg">
        Interactive Map View
      </div>
    </div>
  )
}
