"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react"
import { Header } from "@/components/header"
import { BookingModal } from "@/components/booking-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HospitalDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [hospital, setHospital] = useState<any>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [currentDateIndex, setCurrentDateIndex] = useState(0)
  const [availableToday, setAvailableToday] = useState(false)
  const [nextSlot, setNextSlot] = useState<string | null>(null)

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setError(null)
        setHospital(null)
        setIsLoading(true)

        const res = await fetch(`/api/hospitals/${id}`)

        if (res.status === 404) {
          setHospital(null)
          setError(null)
          return
        }

        if (!res.ok) {
          setError("Failed to load hospital data. Please try again.")
          setHospital(null)
          return
        }

        const data = await res.json()
        setHospital(data)
        if (data?.services && data.services.length > 0) {
          setSelectedService(data.services[0])
        }
      } catch (err) {
        console.error("Failed to fetch hospital:", err)
        setError("Failed to load hospital data. Please try again.")
        setHospital(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHospital()
  }, [id])

  useEffect(() => {
    if (selectedDate && selectedService) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const dateString = `${year}-${month}-${day}`

      fetch(`/api/hospitals/${id}/slots?service=${selectedService.name}&date=${dateString}`)
        .then((res) => res.json())
        .then((data) => {
          setSlots(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          console.error("Failed to fetch slots:", err)
          setSlots([])
        })
    } else {
      setSlots([])
    }
  }, [selectedDate, selectedService, id])

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]
        const res = await fetch(`/api/hospitals/${id}/slots?date=${today}`)
        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
          setAvailableToday(true)
          setNextSlot(data[0]) // first available slot
        } else {
          setAvailableToday(false)
          setNextSlot(null)
        }
      } catch (error) {
        console.error("Failed to fetch slots", error)
        setAvailableToday(false)
        setNextSlot(null)
      }
    }

    fetchSlots()
  }, [id])

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  const formatDayName = (date: Date) => {
    if (date.toDateString() === new Date().toDateString()) return "Today"
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  const hospitalObj = {
    id: hospital?.id,
    name: hospital?.name,
    address: hospital?.address,
    distance: hospital?.distance,
    rating: hospital?.rating,
    reviewCount: hospital?.reviews?.length || 0,
    price: selectedService?.price,
    originalPrice: selectedService?.originalPrice,
    availableToday,
    nextSlot: nextSlot || undefined,
    services: hospital?.services?.map((s: any) => s.name) || [],
    verified: hospital?.verified,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-32 bg-muted rounded"></div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded-xl"></div>
                <div className="h-96 bg-muted rounded-xl"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-96 bg-muted rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-destructive text-lg">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </main>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground text-lg">Hospital not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search results
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hospital Header */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Hospital Image */}
                <div className="relative h-40 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                    <div className="text-5xl font-bold text-primary/20">
                      {hospital?.name?.charAt(0)}
                    </div>
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">{hospital?.name}</h1>
                        {hospital?.verified && (
                          <Badge className="bg-accent text-accent-foreground gap-1">
                            <CheckCircle className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mt-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{hospital?.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-lg font-semibold text-amber-700">{hospital?.rating || "N/A"}</span>
                      {hospital?.reviews && (
                        <span className="text-sm text-amber-600">({hospital?.reviews?.length || 0})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    {hospital?.hours?.weekdays && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Open: {hospital.hours.weekdays}</span>
                      </div>
                    )}
                    {hospital?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{hospital.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">{hospital?.description}</p>

              {/* Insurance */}
              {hospital?.insurances && hospital.insurances.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Accepted Insurance</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hospital.insurances.map((insurance: string) => (
                      <Badge key={insurance} variant="secondary" className="text-xs">
                        {insurance}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="services" className="rounded-xl border border-border bg-card">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                <TabsTrigger
                  value="services"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Services & Prices
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Reviews ({hospital?.reviews?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="p-6">
                <div className="space-y-3">
                  {hospital?.services?.map((service: any) => (
                    <button
                      key={service.name}
                      onClick={() => {
                        setSelectedService(service);
                        setSelectedTime(null);
                        setSlots([]);
                      }}
                      className={`w-full flex items-center justify-between rounded-lg border p-4 transition-colors text-left ${
                        selectedService?.name === service.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">Duration: {service.duration || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-foreground">${service.price}</span>
                          {service.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${service.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  {(!hospital?.services || hospital.services.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No services available</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <div className="space-y-6">
                  {hospital?.reviews?.map((review: any) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {review.author?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{review.author}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < (review.rating || 0)
                                          ? "fill-amber-400 text-amber-400"
                                          : "fill-muted text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!hospital?.reviews || hospital.reviews.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No reviews yet</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">Book Appointment</h3>
              {selectedService ? (
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedService.name} - ${selectedService.price}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Please select a service</p>
              )}

              {/* Date Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Select Date</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCurrentDateIndex(Math.max(0, currentDateIndex - 1))}
                      disabled={currentDateIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCurrentDateIndex(Math.min(dates.length - 4, currentDateIndex + 1))}
                      disabled={currentDateIndex >= dates.length - 4}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {dates.slice(currentDateIndex, currentDateIndex + 4).map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime(null) // Reset time when date changes
                      }}
                      className={`flex flex-col items-center rounded-lg border p-2 transition-colors ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xs">{formatDayName(date)}</span>
                      <span className="text-lg font-semibold">{date.getDate()}</span>
                      <span className="text-xs text-muted-foreground">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <span className="text-sm font-medium text-foreground mb-3 block">Select Time</span>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((timeString) => (
                      <button
                        key={timeString}
                        onClick={() => setSelectedTime(timeString)}
                        className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                           selectedTime === timeString
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {timeString}
                      </button>
                    ))}
                    {slots.length === 0 && (
                      <p className="col-span-3 text-sm text-center text-muted-foreground py-2 border rounded-lg border-dashed">
                        No available slots
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="rounded-lg bg-muted p-4 mb-4">
                <div className="space-y-2 text-sm">
                  {selectedService && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service</span>
                        <span className="text-foreground">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="text-foreground">{selectedService.duration || "N/A"}</span>
                      </div>
                    </>
                  )}
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">{selectedDate.toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="text-foreground">{selectedTime}</span>
                    </div>
                  )}
                  {selectedService && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-bold text-primary">${selectedService.price}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setBookingOpen(true)}
                disabled={!selectedDate || !selectedTime || !selectedService}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          hospital={hospitalObj}
          service={selectedService.name}
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  )
}
