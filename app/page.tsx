"use client"

import { useState, useMemo } from "react"
import { List, Map, SlidersHorizontal, X, TrendingUp, Shield } from "lucide-react"
import { Header } from "@/components/header"
import { FiltersPanel, type FilterState } from "@/components/filters-panel"
import { HospitalCard, type Hospital } from "@/components/hospital-card"
import { MapView } from "@/components/map-view"
import { BookingModal } from "@/components/booking-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Sample hospital data
const sampleHospitals: Hospital[] = [
  {
    id: "1",
    name: "Metropolitan Medical Center",
    address: "123 Healthcare Blvd, Manhattan",
    distance: 1.2,
    rating: 4.8,
    reviewCount: 324,
    price: 450,
    originalPrice: 550,
    availableToday: true,
    nextSlot: "10:30 AM",
    services: ["MRI Scan", "CT Scan", "X-Ray", "Ultrasound", "Blood Test"],
    verified: true,
  },
  {
    id: "2",
    name: "City General Hospital",
    address: "456 Medical Park, Brooklyn",
    distance: 2.5,
    rating: 4.6,
    reviewCount: 189,
    price: 380,
    availableToday: true,
    nextSlot: "11:00 AM",
    services: ["MRI Scan", "X-Ray", "Blood Test", "ECG"],
    verified: true,
  },
  {
    id: "3",
    name: "Sunrise Diagnostic Center",
    address: "789 Health Ave, Queens",
    distance: 3.8,
    rating: 4.9,
    reviewCount: 567,
    price: 520,
    originalPrice: 600,
    availableToday: false,
    services: ["MRI Scan", "CT Scan", "PET Scan", "Mammography"],
    verified: true,
  },
  {
    id: "4",
    name: "Brooklyn Medical Institute",
    address: "321 Wellness St, Brooklyn",
    distance: 4.2,
    rating: 4.4,
    reviewCount: 142,
    price: 350,
    availableToday: true,
    nextSlot: "2:00 PM",
    services: ["MRI Scan", "X-Ray", "Ultrasound"],
  },
  {
    id: "5",
    name: "Queens Health Center",
    address: "654 Care Drive, Queens",
    distance: 5.1,
    rating: 4.7,
    reviewCount: 298,
    price: 420,
    availableToday: true,
    nextSlot: "3:30 PM",
    services: ["MRI Scan", "CT Scan", "Blood Test", "Allergy Test"],
    verified: true,
  },
  {
    id: "6",
    name: "Premier Radiology",
    address: "987 Imaging Blvd, Manhattan",
    distance: 1.8,
    rating: 4.5,
    reviewCount: 221,
    price: 490,
    availableToday: false,
    services: ["MRI Scan", "CT Scan", "X-Ray", "Fluoroscopy"],
  },
]

const defaultFilters: FilterState = {
  priceRange: [0, 2000],
  rating: 0,
  distance: 50,
  availableToday: false,
  insurance: "any",
}

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [searchService, setSearchService] = useState("MRI Scan")
  const [searchLocation, setSearchLocation] = useState("New York, NY")
  const [sortBy, setSortBy] = useState("relevance")
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [bookingHospital, setBookingHospital] = useState<Hospital | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleSearch = (service: string, location: string) => {
    setSearchService(service || "MRI Scan")
    setSearchLocation(location || "New York, NY")
  }

  const filteredHospitals = useMemo(() => {
    let result = sampleHospitals.filter((hospital) => {
      if (hospital.price < filters.priceRange[0] || hospital.price > filters.priceRange[1]) {
        return false
      }
      if (filters.rating > 0 && hospital.rating < filters.rating) {
        return false
      }
      if (hospital.distance > filters.distance) {
        return false
      }
      if (filters.availableToday && !hospital.availableToday) {
        return false
      }
      return true
    })

    switch (sortBy) {
      case "price-low":
        result = result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result = result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result = result.sort((a, b) => b.rating - a.rating)
        break
      case "distance":
        result = result.sort((a, b) => a.distance - b.distance)
        break
      default:
        break
    }

    return result
  }, [filters, sortBy])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) count++
    if (filters.rating > 0) count++
    if (filters.distance < 50) count++
    if (filters.availableToday) count++
    if (filters.insurance !== "any") count++
    return count
  }, [filters])

  const handleViewSlots = (hospital: Hospital) => {
    setBookingHospital(hospital)
  }

  const handleBookNow = (hospital: Hospital) => {
    setBookingHospital(hospital)
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <Header onSearch={handleSearch} />

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Search Summary */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {searchService}
            </h1>
            <span className="text-3xl font-light text-muted-foreground">in</span>
            <span className="text-3xl font-bold text-foreground tracking-tight">{searchLocation}</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span>{filteredHospitals.length} hospitals found</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Verified providers</span>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 glass-card premium-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden rounded-xl border-border/80 hover:border-primary/30 transition-all duration-200">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 rounded-full p-0 text-xs bg-primary">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm p-0 glass">
                <SheetHeader className="p-5 border-b border-border/50">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="p-5">
                  <FiltersPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClear={() => setFilters(defaultFilters)}
                    className="border-0 p-0 bg-transparent backdrop-blur-none"
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="hidden items-center gap-2 sm:flex">
                {filters.availableToday && (
                  <Badge variant="secondary" className="gap-1.5 rounded-lg px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    Available Today
                    <button
                      onClick={() => setFilters({ ...filters, availableToday: false })}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.rating > 0 && (
                  <Badge variant="secondary" className="gap-1.5 rounded-lg px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                    {filters.rating}+ Stars
                    <button
                      onClick={() => setFilters({ ...filters, rating: 0 })}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Select */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 rounded-xl bg-secondary/50 border-transparent hover:bg-secondary transition-all duration-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="glass-card rounded-xl">
                <SelectItem value="relevance" className="rounded-lg">Relevance</SelectItem>
                <SelectItem value="price-low" className="rounded-lg">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="rounded-lg">Price: High to Low</SelectItem>
                <SelectItem value="rating" className="rounded-lg">Highest Rated</SelectItem>
                <SelectItem value="distance" className="rounded-lg">Nearest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex rounded-xl glass-subtle premium-border p-1">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className={`h-9 px-4 rounded-lg transition-all duration-200 ${viewMode === "list" ? "shadow-sm" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === "map" ? "secondary" : "ghost"}
                size="sm"
                className={`h-9 px-4 rounded-lg transition-all duration-200 ${viewMode === "map" ? "shadow-sm" : ""}`}
                onClick={() => setViewMode("map")}
              >
                <Map className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Map</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden w-80 flex-shrink-0 lg:block">
            <div className="sticky top-28">
              <FiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClear={() => setFilters(defaultFilters)}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {viewMode === "list" ? (
              <div className="flex flex-col gap-5">
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((hospital, index) => (
                    <div 
                      key={hospital.id} 
                      className="animate-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <HospitalCard
                        hospital={hospital}
                        selectedService={searchService}
                        onViewSlots={handleViewSlots}
                        onBookNow={handleBookNow}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl glass-card premium-border py-20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 mb-6">
                      <span className="text-4xl">🏥</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No hospitals found</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Try adjusting your filters or search for a different service.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setFilters(defaultFilters)}
                      className="rounded-xl border-border/80 hover:border-primary/30 transition-all duration-200"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[600px] lg:h-[calc(100vh-260px)] rounded-2xl overflow-hidden glass-card premium-border">
                <MapView
                  hospitals={filteredHospitals}
                  selectedHospital={selectedHospital}
                  onSelectHospital={setSelectedHospital}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {bookingHospital && (
        <BookingModal
          hospital={bookingHospital}
          service={searchService}
          isOpen={!!bookingHospital}
          onClose={() => setBookingHospital(null)}
        />
      )}
    </div>
  )
}
