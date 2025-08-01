"use client"

import { useState, useEffect } from "react"

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("crypto-watchlist")
    if (saved) {
      setWatchlist(JSON.parse(saved))
    }
  }, [])

  const addToWatchlist = (coinId: string) => {
    const newWatchlist = [...watchlist, coinId]
    setWatchlist(newWatchlist)
    localStorage.setItem("crypto-watchlist", JSON.stringify(newWatchlist))
  }

  const removeFromWatchlist = (coinId: string) => {
    const newWatchlist = watchlist.filter((id) => id !== coinId)
    setWatchlist(newWatchlist)
    localStorage.setItem("crypto-watchlist", JSON.stringify(newWatchlist))
  }

  const isInWatchlist = (coinId: string) => {
    return watchlist.includes(coinId)
  }

  const toggleWatchlist = (coinId: string) => {
    if (isInWatchlist(coinId)) {
      removeFromWatchlist(coinId)
    } else {
      addToWatchlist(coinId)
    }
  }

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
  }
}
