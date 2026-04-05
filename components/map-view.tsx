"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Hospital } from "./hospital-card"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"

interface MapViewProps {
  hospitals: Hospital[]
  selectedHospital?: Hospital | null
  onSelectHospital?: (hospital: Hospital | null) => void
  onClose?: () => void
}

const containerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 22.5744,
  lng: 88.3629,
}

const silverStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
]

const LoadingSpinner = () => (
  <div className="flex h-full w-full items-center justify-center bg-muted/20">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

export function MapView({ hospitals, selectedHospital, onSelectHospital, onClose }: MapViewProps) {
  // SVG string for the blue dot user marker
  const userMarkerIcon = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%233b82f6' stroke='white' stroke-width='3'/%3E%3C/svg%3E"

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-secondary via-secondary to-muted">
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="rounded-xl glass-card premium-border px-4 py-2 pointer-events-auto">
          <span className="text-sm font-medium text-foreground">{hospitals.length} hospitals in view</span>
        </div>
        {onClose && (
          <Button variant="outline" size="icon" onClick={onClose} className="h-9 w-9 rounded-xl glass-card border-border/50 bg-background/50 backdrop-blur-sm pointer-events-auto">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="absolute inset-0">
        <LoadScript 
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}
          loadingElement={<LoadingSpinner />}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
            options={{
              styles: silverStyle,
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {/* User Location Marker */}
            <Marker 
              position={defaultCenter}
              icon={{
                url: userMarkerIcon
              }}
              zIndex={50}
            />

            {/* Hospital Markers */}
            {hospitals.map((hospital) => {
              if (hospital.lat === undefined || hospital.lon === undefined) return null

              return (
                <Marker
                  key={hospital.id}
                  position={{ lat: Number(hospital.lat), lng: Number(hospital.lon) }}
                  onClick={() => onSelectHospital?.(hospital)}
                  animation={selectedHospital?.id === hospital.id ? 1 : undefined}
                />
              )
            })}

            {/* Selected Hospital InfoWindow */}
            {selectedHospital && selectedHospital.lat !== undefined && selectedHospital.lon !== undefined && (
              <InfoWindow
                position={{ lat: Number(selectedHospital.lat), lng: Number(selectedHospital.lon) }}
                onCloseClick={() => onSelectHospital?.(null)}
              >
                <div className="p-2 min-w-[200px] text-zinc-900">
                  <h3 className="font-bold text-base mb-1 pr-4">{selectedHospital.name}</h3>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm">Distance: <span className="font-medium">{selectedHospital.distance} km</span></p>
                    <p className="text-sm">Price: <span className="font-medium">₹{selectedHospital.price}</span></p>
                    <p className="text-sm">Rating: ⭐ <span className="font-medium">{selectedHospital.rating}</span></p>
                  </div>
                  <Link href={`/hospital/${selectedHospital.id}`} className="block mt-4">
                    <Button 
                      onClick={() => onSelectHospital?.(null)} 
                      className="w-full" 
                      size="sm"
                    >
                      Book Now
                    </Button>
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  )
}
