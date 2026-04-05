"use client"

import Link from "next/link"
import { MapPin, Star, Clock, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface Hospital {
  id: string
  name: string
  address: string
  distance: number
  rating: number
  reviewCount: number
  price: number
  originalPrice?: number
  availableToday: boolean
  nextSlot?: string
  services: string[]
  imageUrl?: string
  verified?: boolean
  lat?: number | string
  lon?: number | string
}

interface HospitalCardProps {
  hospital: Hospital
  selectedService?: string
  onViewSlots?: (hospital: Hospital) => void
  onBookNow?: (hospital: Hospital) => void
}

export function HospitalCard({ hospital, selectedService = "MRI Scan", onViewSlots, onBookNow }: HospitalCardProps) {
  return (
    <div className="group relative flex flex-col sm:flex-row gap-5 rounded-2xl glass-card glass-card-hover premium-border p-5 overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Image */}
      <div className="relative h-44 sm:h-auto sm:w-44 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl font-bold bg-gradient-to-br from-primary/30 to-accent/30 bg-clip-text text-transparent">{hospital.name.charAt(0)}</div>
        </div>
        {hospital.verified && (
          <Badge className="absolute top-3 left-3 bg-accent/90 text-accent-foreground text-xs gap-1.5 rounded-lg px-2.5 py-1 shadow-lg backdrop-blur-sm">
            <CheckCircle className="h-3 w-3" /> Verified
          </Badge>
        )}
        {hospital.availableToday && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Available Today
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-between min-w-0">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <Link href={`/hospital/${hospital.id}`} className="group/link inline-flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground truncate group-hover/link:text-primary transition-colors duration-200">{hospital.name}</h3>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{hospital.address}</span>
                <span className="flex-shrink-0 text-border">|</span>
                <span className="flex-shrink-0 font-medium text-foreground/70">{hospital.distance} km</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 px-3 py-1.5 shadow-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-amber-700">{hospital.rating}</span>
              <span className="text-xs text-amber-600/80">({hospital.reviewCount})</span>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-2 mt-4">
            {hospital.services.slice(0, 3).map((service) => (
              <Badge key={service} variant="secondary" className="text-xs font-normal rounded-lg px-2.5 py-1 bg-secondary/70 hover:bg-secondary transition-colors">
                {service}
              </Badge>
            ))}
            {hospital.services.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal rounded-lg px-2.5 py-1 bg-secondary/70">
                +{hospital.services.length - 3} more
              </Badge>
            )}
          </div>

          {/* Availability */}
          {hospital.availableToday && hospital.nextSlot && (
            <div className="flex items-center gap-2 mt-4 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">Next slot:</span>
              <span className="font-medium text-foreground">{hospital.nextSlot}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-5 pt-5 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{selectedService}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">${hospital.price}</span>
              {hospital.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">${hospital.originalPrice}</span>
              )}
              {hospital.originalPrice && (
                <Badge className="bg-accent/10 text-accent text-xs rounded-md px-1.5 py-0.5 font-medium">
                  Save ${hospital.originalPrice - hospital.price}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSlots?.(hospital)}
              className="hidden sm:inline-flex rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
            >
              View Slots
            </Button>
            <Button 
              size="sm" 
              onClick={() => onBookNow?.(hospital)}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02]"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
