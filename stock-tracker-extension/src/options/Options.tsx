
import { useState, useEffect } from 'react'
import type { WatchlistItem } from '../types/stock'

function Options() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWatchlist()
  }, [])

  const loadWatchlist = async () => {
    try {
      const result = await chrome.storage.sync.get('watchlist')
      setWatchlist(result.watchlist || [])
    } catch (error) {
      console.error('Failed to load watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const newWatchlist = watchlist.filter(item => item.symbol !== symbol)
      await chrome.storage.sync.set({ watchlist: newWatchlist })
      setWatchlist(newWatchlist)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const clearAll = async () => {
    if (confirm('确定要清空所有自选股票吗？')) {
      try {
        await chrome.storage.sync.set({ watchlist: [] })
        setWatchlist([])
      } catch (error) {
        console.error('Failed to clear watchlist:', error)
      }
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">设置</h1>
        <p className="text-sm text-muted-foreground">管理您的自选股票和扩展设置</p>
      </div>

      <div className="space-y-6">
        {/* 自选股票管理 */}
        <div className="bg-card rounded-lg p-4 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">自选股票管理</h2>
            <button
              onClick={clearAll}
              className="text-sm text-destructive hover:text-destructive/80"
            >
              清空全部
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无自选股票</p>
              <p className="text-sm mt-1">在扩展弹窗中添加股票</p>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((item) => (
                <div key={`${item.symbol}-${item.market}`} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.symbol} · {item.market.toUpperCase()} · {item.type}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromWatchlist(item.symbol)}
                    className="text-sm text-destructive hover:text-destructive/80"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 关于信息 */}
        <div className="bg-card rounded-lg p-4 border">
          <h2 className="text-lg font-semibold mb-2">关于</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>版本：1.0.0</p>
            <p>功能：实时追踪中美股票和基金行情</p>
            <p>数据来源：新浪财经、腾讯财经、Yahoo Finance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options