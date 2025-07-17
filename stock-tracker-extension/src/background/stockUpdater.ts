import type { StockData, WatchlistItem } from '../types/stock'

export class StockUpdater {
  private cache = new Map<string, { data: StockData; timestamp: number }>()
  private cacheTtl = 5 * 60 * 1000 // 5分钟缓存

  async updateAll(): Promise<{ 
    stocks: StockData[]
    hasAlerts: boolean
    alerts: Array<{ symbol: string; message: string }> 
  }> {
    try {
      const watchlist = await this.getWatchlist()
      const symbols = watchlist.map(item => item.symbol)
      
      if (symbols.length === 0) {
        return { stocks: [], hasAlerts: false, alerts: [] }
      }

      const stocks = await this.fetchStockData(symbols)
      const alerts = await this.checkAlerts(stocks)
      
      // 缓存数据
      stocks.forEach(stock => {
        this.cache.set(stock.symbol, {
          data: stock,
          timestamp: Date.now()
        })
      })

      // 保存到本地存储
      await chrome.storage.local.set({
        stockData: stocks,
        lastUpdate: Date.now()
      })

      return {
        stocks,
        hasAlerts: alerts.length > 0,
        alerts
      }
    } catch (error) {
      console.error('Failed to update stocks:', error)
      throw error
    }
  }

  private async getWatchlist(): Promise<WatchlistItem[]> {
    const result = await chrome.storage.sync.get('watchlist')
    return result.watchlist || []
  }

  private async fetchStockData(symbols: string[]): Promise<StockData[]> {
    // 使用实际的stockApi来获取股票数据
    const { stockApi } = await import('../lib/api/stockApi')
    return await stockApi.getStockData(symbols)
  }


  private async checkAlerts(stocks: StockData[]): Promise<Array<{ symbol: string; message: string }>> {
    const watchlist = await this.getWatchlist()
    const alerts: Array<{ symbol: string; message: string }> = []

    for (const stock of stocks) {
      const item = watchlist.find(w => w.symbol === stock.symbol)
      if (!item?.alert) continue

      if (stock.price >= item.alert.high) {
        alerts.push({
          symbol: stock.symbol,
          message: `${stock.name} 达到提醒价格 ${item.alert.high}`
        })
      }

      if (stock.price <= item.alert.low) {
        alerts.push({
          symbol: stock.symbol,
          message: `${stock.name} 低于提醒价格 ${item.alert.low}`
        })
      }
    }

    return alerts
  }

  invalidateCache(): void {
    this.cache.clear()
  }

  getCachedData(symbol: string): StockData | null {
    const cached = this.cache.get(symbol)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.cacheTtl) {
      this.cache.delete(symbol)
      return null
    }
    
    return cached.data
  }
}