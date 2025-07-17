import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { stockApi } from '../../lib/api/stockApi'
import type { SearchResult } from '../../types/stock'
import { Button } from '../ui/button'
import '../../styles/oil-painting.css'

interface SearchBarProps {
  onAddToWatchlist: (item: SearchResult) => void
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ onAddToWatchlist, className }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const delayDebounce = setTimeout(() => {
      searchStocks()
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const searchStocks = async () => {
    setLoading(true)
    try {
      const searchResults = await stockApi.searchStocks(query)
      setResults(searchResults)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWatchlist = (result: SearchResult) => {
    onAddToWatchlist(result)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 oil-text-secondary w-4 h-4" />
        <input
          type="text"
          placeholder="🔍 搜索股票代码、名称..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="oil-search w-full pl-10 pr-10 py-3 oil-text-primary placeholder:oil-text-secondary focus:outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 oil-text-secondary hover:oil-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 oil-card rounded-lg shadow-lg max-h-64 overflow-y-auto" style={{ zIndex: 10000 }}>
          {loading && (
            <div className="p-4 text-center oil-text-secondary">⏳ 搜索中...</div>
          )}

          {results.map((result) => (
            <div
              key={`${result.symbol}-${result.market}`}
              className="p-4 hover:bg-white/50 cursor-pointer border-b last:border-b-0 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold oil-text-primary truncate">{result.name}</p>
                  <p className="text-sm oil-text-secondary truncate">{result.symbol} · {result.market.toUpperCase()}</p>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('SearchBar: Adding stock:', result)
                    handleAddToWatchlist(result)
                    console.log('SearchBar: Stock added successfully')
                  }}
                  className="oil-button ml-3 flex-shrink-0"
                >
                  ➕ 添加
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && query && !loading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 oil-card rounded-lg shadow-lg p-4 text-center oil-text-secondary" style={{ zIndex: 10000 }}>
          🔍 未找到相关股票
        </div>
      )}
    </div>
  )
}

export default SearchBar