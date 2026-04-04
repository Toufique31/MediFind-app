"use client"

import { useState } from "react"
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

// Sample data
const hospitalData = {
  id: "1",
  name: "Metropolitan Medical Center",
  address: "123 Healthcare Blvd, Manhattan, New York, NY 10001",
  distance: 1.2,
  rating: 4.8,
  reviewCount: 324,
  phone: "+1 (212) 555-0123",
  email: "info@metropolitanmedical.com",
  website: "www.metropolitanmedical.com",
  verified: true,
  description:
    "Metropolitan Medical Center is a leading healthcare facility providing comprehensive diagnostic and treatment services. With state-of-the-art equipment and experienced medical professionals, we ensure the highest quality of care for all our patients.",
  hours: {
    weekdays: "8:00 AM - 8:00 PM",
    saturday: "9:00 AM - 5:00 PM",
    sunday: "10:00 AM - 4:00 PM",
  },
  services: [
    { name: "MRI Scan", price: 450, originalPrice: 550, duration: "45 min" },
    { name: "CT Scan", price: 380, duration: "30 min" },
    { name: "X-Ray", price: 120, duration: "15 min" },
    { name: "Ultrasound", price: 200, duration: "30 min" },
    { name: "Blood Test", price: 80, duration: "15 min" },
    { name: "ECG", price: 150, duration: "20 min" },
    { name: "Mammography", price: 280, duration: "30 min" },
    { name: "Bone Density Scan", price: 320, duration: "30 min" },
  ],
  reviews: [
    {
      id: "r1",
      author: "Sarah M.",
      avatar: null,
      rating: 5,
      date: "2 days ago",
      comment:
        "Excellent service! The staff was very professional and the facility is clean and modern. My MRI results came back quickly.",
    },
    {
      id: "r2",
      author: "James L.",
      avatar: null,
      rating: 4,
      date: "1 week ago",
      comment:
        "Good experience overall. Wait time was reasonable and the technicians were knowledgeable. Would recommend.",
    },
    {
      id: "r3",
      author: "Emily R.",
      avatar: null,
      rating: 5,
      date: "2 weeks ago",
      comment:
        "The booking process was seamless and the staff made me feel comfortable during my scan. Very happy with the service.",
    },
  ],
  insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "United Healthcare", "Humana"],
}

const timeSlots = [
  { time: "9:00 AM", available: true },
  { time: "9:30 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: false },
  { time: "2:00 PM", available: true },
  { time: "2:30 PM", available: true },
  { time: "3:00 PM", available: true },
  { time: "3:30 PM", available: false },
  { time: "4:00 PM", available: true },
  { time: "4:30 PM", available: true },
]

export default function HospitalDetailPage() {
  const params = useParams()
  const [selectedService, setSelectedService] = useState(hospitalData.services[0])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [currentDateIndex, setCurrentDateIndex] = useState(0)

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

  const hospital = {
    id: hospitalData.id,
    name: hospitalData.name,
    address: hospitalData.address,
    distance: hospitalData.distance,
    rating: hospitalData.rating,
    reviewCount: hospitalData.reviewCount,
    price: selectedService.price,
    originalPrice: selectedService.originalPrice,
    availableToday: true,
    nextSlot: "10:30 AM",
    services: hospitalData.services.map((s) => s.name),
    verified: hospitalData.verified,
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
                      {hospitalData.name.charAt(0)}
                    </div>
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">{hospitalData.name}</h1>
                        {hospitalData.verified && (
                          <Badge className="bg-accent text-accent-foreground gap-1">
                            <CheckCircle className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mt-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{hospitalData.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-lg font-semibold text-amber-700">{hospitalData.rating}</span>
                      <span className="text-sm text-amber-600">({hospitalData.reviewCount})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Open: {hospitalData.hours.weekdays}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{hospitalData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">{hospitalData.description}</p>

              {/* Insurance */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Accepted Insurance</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hospitalData.insurances.map((insurance) => (
                    <Badge key={insurance} variant="secondary" className="text-xs">
                      {insurance}
                    </Badge>
                  ))}
                </div>
              </div>
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
                  Reviews ({hospitalData.reviewCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="p-6">
                <div className="space-y-3">
                  {hospitalData.services.map((service) => (
                    <button
                      key={service.name}
                      onClick={() => setSelectedService(service)}
                      className={`w-full flex items-center justify-between rounded-lg border p-4 transition-colors text-left ${
                        selectedService.name === service.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">Duration: {service.duration}</p>
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
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <div className="space-y-6">
                  {hospitalData.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {review.author.charAt(0)}
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
                                        i < review.rating
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
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">Book Appointment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedService.name} - ${selectedService.price}
              </p>

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
                      onClick={() => setSelectedDate(date)}
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
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                          !slot.available
                            ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                            : selectedTime === slot.time
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="rounded-lg bg-muted p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-foreground">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">{selectedService.duration}</span>
                  </div>
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
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-bold text-primary">${selectedService.price}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setBookingOpen(true)}
                disabled={!selectedDate || !selectedTime}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        hospital={hospital}
        service={selectedService.name}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  )
}
