"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, Check, Calendar, Clock, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Hospital } from "./hospital-card"

interface BookingModalProps {
  hospital: Hospital
  service?: string
  isOpen: boolean
  onClose: () => void
}

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
]

export function BookingModal({ hospital, service = "MRI Scan", isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [patientName, setPatientName] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  if (!isOpen) return null

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1)
    const days: (Date | null)[] = []
    const firstDay = date.getDay()

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    while (date.getMonth() === month) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }

    return days
  }

  const calendarDays = getDaysInMonth(currentMonth, currentYear)

  const isDateSelectable = (date: Date) => {
    return date >= today
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setBookingError(null)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId: hospital.id,
          serviceName: service,
          date: selectedDate!.toISOString().split("T")[0],
          time: selectedTime,
          patientName,
          patientEmail,
          patientPhone,
          price: hospital.price,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBookingId(data.bookingId)
        setStep(4)
      } else {
        setBookingError("Booking failed. Please try again.")
      }
    } catch {
      setBookingError("Booking failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              step > s
                ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-lg shadow-accent/20"
                : step === s
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step > s ? <Check className="h-5 w-5" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${step > s ? "bg-accent" : "bg-muted"}`}
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl glass-card premium-shadow-lg max-h-[90vh] overflow-y-auto animate-in-up">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border/50 glass p-5 rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {step === 4 ? "Booking Confirmed!" : "Book Appointment"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{hospital.name}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-xl hover:bg-muted transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {step < 4 && renderStepIndicator()}

          {/* Step 1: Select Date */}
          {step === 1 && (
            <div className="animate-in-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Select Date</h3>
              </div>

              <div className="rounded-2xl glass-card premium-border p-5">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="font-semibold text-foreground">
                    {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((date, index) => (
                    <button
                      key={index}
                      disabled={!date || !isDateSelectable(date)}
                      onClick={() => date && setSelectedDate(date)}
                      className={`aspect-square rounded-xl text-sm font-medium transition-all duration-200 ${
                        !date
                          ? ""
                          : !isDateSelectable(date)
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : selectedDate?.toDateString() === date.toDateString()
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                          : "hover:bg-muted text-foreground hover:scale-105"
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!selectedDate}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 px-8"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Time */}
          {step === 2 && (
            <div className="animate-in-up">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Select Time</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5 ml-[52px]">
                {selectedDate && formatDate(selectedDate)}
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-xl px-3 py-3.5 text-sm font-medium transition-all duration-200 ${
                      selectedTime === time
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                        : "glass-card premium-border hover:border-primary/30 text-foreground hover:scale-[1.02]"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="rounded-xl border-border/80 hover:border-primary/30"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!selectedTime}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 px-8"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Details */}
          {step === 3 && (
            <div className="animate-in-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Patient Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="mt-2 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-card focus:border-primary/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="mt-2 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-card focus:border-primary/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-foreground text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="mt-2 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-card focus:border-primary/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="mt-6 rounded-2xl glass-card premium-border p-5">
                <h4 className="font-semibold text-foreground mb-4">Booking Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-foreground font-medium">{service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground font-medium">{selectedDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="text-foreground font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border/50">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${hospital.price}</span>
                  </div>
                </div>
              </div>

              {bookingError && (
                <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600">
                  {bookingError}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="rounded-xl border-border/80 hover:border-primary/30"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!patientName || !patientEmail || !patientPhone || isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 px-8"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8 animate-in-up">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/80 shadow-xl shadow-accent/30">
                <Sparkles className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Booking Confirmed!</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Your appointment has been successfully booked. A confirmation email has been sent to {patientEmail}.
              </p>

              <div className="rounded-2xl glass-card premium-border p-5 text-left mb-8">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hospital</span>
                    <span className="text-foreground font-semibold">{hospital.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-foreground">{service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="text-foreground">
                      {selectedDate?.toLocaleDateString()} at {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border/50">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="text-foreground font-mono bg-muted px-2 py-0.5 rounded-md">{bookingId}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onClose} 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
