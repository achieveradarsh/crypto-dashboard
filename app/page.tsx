"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { CoinTable } from "@/components/coin-table"
import { SearchFilters, type FilterOptions } from "@/components/search-filters"
import { Pagination } from "@/components/pagination"
import { useDebounce } from "@/hooks/use-debounce"
import { getCoinsMarkets, type Coin } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const COINS_PER_PAGE = 50

export default function HomePage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    sortBy: "market_cap_rank",
    sortOrder: "asc",
    priceRange: { min: "", max: "" },
    marketCapRange: { min: "", max: "" },
    changeRange: { min: "", max: "" },
  })

  const debouncedSearch = useDebounce(filters.search, 300)

  const fetchCoins = async (page: number) => {
    try {
      setLoading(true)
      const data = await getCoinsMarkets(page, COINS_PER_PAGE)
      setCoins(data)
      // Limit total pages to 20 for free tier (1000 coins total)
      setTotalPages(20)
    } catch (error) {
      console.error("Error fetching coins:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch cryptocurrency data. Please try again.",
        variant: "destructive",
      })
      // If we hit an error, don't update the page
      if (error instanceof Error && error.message.includes("Page limit exceeded")) {
        setCurrentPage(Math.min(currentPage, 20))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoins(currentPage)
  }, [currentPage])

  const filteredCoins = useMemo(() => {
    let filtered = [...coins]

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    }

    // Price range filter
    if (filters.priceRange.min) {
      filtered = filtered.filter((coin) => coin.current_price >= Number.parseFloat(filters.priceRange.min))
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter((coin) => coin.current_price <= Number.parseFloat(filters.priceRange.max))
    }

    // Market cap range filter
    if (filters.marketCapRange.min) {
      filtered = filtered.filter((coin) => coin.market_cap >= Number.parseFloat(filters.marketCapRange.min))
    }
    if (filters.marketCapRange.max) {
      filtered = filtered.filter((coin) => coin.market_cap <= Number.parseFloat(filters.marketCapRange.max))
    }

    // Change range filter
    if (filters.changeRange.min) {
      filtered = filtered.filter(
        (coin) => coin.price_change_percentage_24h >= Number.parseFloat(filters.changeRange.min),
      )
    }
    if (filters.changeRange.max) {
      filtered = filtered.filter(
        (coin) => coin.price_change_percentage_24h <= Number.parseFloat(filters.changeRange.max),
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (filters.sortBy) {
        case "current_price":
          aValue = a.current_price
          bValue = b.current_price
          break
        case "price_change_percentage_24h":
          aValue = a.price_change_percentage_24h
          bValue = b.price_change_percentage_24h
          break
        case "market_cap":
          aValue = a.market_cap
          bValue = b.market_cap
          break
        case "total_volume":
          aValue = a.total_volume
          bValue = b.total_volume
          break
        default:
          aValue = a.market_cap_rank
          bValue = b.market_cap_rank
      }

      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [coins, debouncedSearch, filters])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cryptocurrency Markets</h1>
          <p className="text-muted-foreground">Track live cryptocurrency prices and market data</p>
        </div>

        <SearchFilters filters={filters} onFiltersChange={setFilters} />

        <CoinTable coins={filteredCoins} loading={loading} />

        {!loading && filteredCoins.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </main>
    </div>
  )
}
