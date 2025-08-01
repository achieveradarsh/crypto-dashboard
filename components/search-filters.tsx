"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export interface FilterOptions {
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
  priceRange: {
    min: string
    max: string
  }
  marketCapRange: {
    min: string
    max: string
  }
  changeRange: {
    min: string
    max: string
  }
}

interface SearchFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const updateRangeFilter = (
    rangeKey: "priceRange" | "marketCapRange" | "changeRange",
    field: "min" | "max",
    value: string,
  ) => {
    onFiltersChange({
      ...filters,
      [rangeKey]: {
        ...filters[rangeKey],
        [field]: value,
      },
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      sortBy: "market_cap_rank",
      sortOrder: "asc",
      priceRange: { min: "", max: "" },
      marketCapRange: { min: "", max: "" },
      changeRange: { min: "", max: "" },
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.priceRange.min || filters.priceRange.max) count++
    if (filters.marketCapRange.min || filters.marketCapRange.max) count++
    if (filters.changeRange.min || filters.changeRange.max) count++
    return count
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search cryptocurrencies..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market_cap_rank">Rank</SelectItem>
            <SelectItem value="current_price">Price</SelectItem>
            <SelectItem value="price_change_percentage_24h">24h Change</SelectItem>
            <SelectItem value="market_cap">Market Cap</SelectItem>
            <SelectItem value="total_volume">Volume</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortOrder} onValueChange={(value: "asc" | "desc") => updateFilter("sortOrder", value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Asc</SelectItem>
            <SelectItem value="desc">Desc</SelectItem>
          </SelectContent>
        </Select>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>Filter cryptocurrencies by price, market cap, and performance</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Price Range (USD)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => updateRangeFilter("priceRange", "min", e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => updateRangeFilter("priceRange", "max", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Market Cap Range</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min (e.g., 1000000)"
                    type="number"
                    value={filters.marketCapRange.min}
                    onChange={(e) => updateRangeFilter("marketCapRange", "min", e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.marketCapRange.max}
                    onChange={(e) => updateRangeFilter("marketCapRange", "max", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">24h Change Range (%)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min (e.g., -10)"
                    type="number"
                    value={filters.changeRange.min}
                    onChange={(e) => updateRangeFilter("changeRange", "min", e.target.value)}
                  />
                  <Input
                    placeholder="Max (e.g., 10)"
                    type="number"
                    value={filters.changeRange.max}
                    onChange={(e) => updateRangeFilter("changeRange", "max", e.target.value)}
                  />
                </div>
              </div>

              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
