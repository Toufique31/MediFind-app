"use client"

import { useState } from "react"
import { ChevronDown, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export interface FilterState {
  priceRange: [number, number]
  rating: number
  distance: number
  availableToday: boolean
  insurance: string
}

interface FiltersPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClear: () => void
  className?: string
}

export function FiltersPanel({ filters, onFiltersChange, onClear, className }: FiltersPanelProps) {
  const [priceOpen, setPriceOpen] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(true)
  const [distanceOpen, setDistanceOpen] = useState(true)

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const ratingOptions = [
    { value: 0, label: "Any Rating" },
    { value: 3, label: "3+ Stars" },
    { value: 4, label: "4+ Stars" },
    { value: 4.5, label: "4.5+ Stars" },
  ]

  return (
    <div className={`rounded-2xl glass-card premium-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-all duration-200"
        >
          Clear all
        </Button>
      </div>

      {/* Price Range */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen} className="border-b border-border/50 pb-5 mb-5">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 group">
          <span className="text-sm font-medium text-foreground">Price Range</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${priceOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 animate-in-up">
          <Slider
            value={filters.priceRange}
            min={0}
            max={2000}
            step={50}
            onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-lg bg-secondary/70 text-sm font-medium text-foreground">
              ${filters.priceRange[0]}
            </div>
            <div className="h-px flex-1 mx-3 bg-border/50" />
            <div className="px-3 py-1.5 rounded-lg bg-secondary/70 text-sm font-medium text-foreground">
              ${filters.priceRange[1]}+
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible open={ratingOpen} onOpenChange={setRatingOpen} className="border-b border-border/50 pb-5 mb-5">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 group">
          <span className="text-sm font-medium text-foreground">Rating</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${ratingOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 animate-in-up">
          <div className="flex flex-col gap-1.5">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFilter("rating", option.value)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                  filters.rating === option.value
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {option.value > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                )}
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Distance */}
      <Collapsible open={distanceOpen} onOpenChange={setDistanceOpen} className="border-b border-border/50 pb-5 mb-5">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 group">
          <span className="text-sm font-medium text-foreground">Distance</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${distanceOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 animate-in-up">
          <Slider
            value={[filters.distance]}
            min={1}
            max={50}
            step={1}
            onValueChange={(value) => updateFilter("distance", value[0])}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Within</span>
            <span className="px-3 py-1.5 rounded-lg bg-secondary/70 font-medium text-foreground">{filters.distance} km</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <div className="flex items-center justify-between border-b border-border/50 pb-5 mb-5 py-2">
        <Label htmlFor="available-today" className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${filters.availableToday ? 'bg-accent' : 'bg-muted-foreground/30'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${filters.availableToday ? 'bg-accent' : 'bg-muted-foreground/30'}`}></span>
          </span>
          Available Today
        </Label>
        <Switch
          id="available-today"
          checked={filters.availableToday}
          onCheckedChange={(checked) => updateFilter("availableToday", checked)}
        />
      </div>

      {/* Insurance */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Insurance</Label>
        <Select value={filters.insurance} onValueChange={(value) => updateFilter("insurance", value)}>
          <SelectTrigger className="w-full bg-secondary/50 border-transparent rounded-xl h-11 transition-all duration-200 hover:bg-secondary focus:bg-card focus:border-primary/20">
            <SelectValue placeholder="Select insurance" />
          </SelectTrigger>
          <SelectContent className="glass-card rounded-xl">
            <SelectItem value="any" className="rounded-lg">Any Insurance</SelectItem>
            <SelectItem value="aetna" className="rounded-lg">Aetna</SelectItem>
            <SelectItem value="bluecross" className="rounded-lg">Blue Cross Blue Shield</SelectItem>
            <SelectItem value="cigna" className="rounded-lg">Cigna</SelectItem>
            <SelectItem value="united" className="rounded-lg">United Healthcare</SelectItem>
            <SelectItem value="humana" className="rounded-lg">Humana</SelectItem>
            <SelectItem value="kaiser" className="rounded-lg">Kaiser Permanente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
