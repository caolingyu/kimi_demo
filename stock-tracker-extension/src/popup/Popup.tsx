import { useState, useEffect } from 'react'
import { RefreshCw, Settings, Bug, X } from 'lucide-react'
import StockCard from '../components/stock-card/StockCard'
import StockDetail from '../components/stock-detail/StockDetail'
import SearchBar from '../components/search/SearchBar'
import { useWatchlist } from '../hooks/useWatchlist'
import { Button } from '../components/ui/button'
import { stockApi } from '../lib/api/stockApi'
import type { SearchResult, StockData } from '../types/stock'
import '../styles/oil-painting.css'

function Popup() {
  const {
    watchlist,
    stocks,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    refreshStocks
  } = useWatchlist()

  const [showSearch, setShowSearch] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const [settingsMode, setSettingsMode] = useState(false)

  useEffect(() => {
    console.log('Stocks updated:', stocks)
  }, [stocks])

  useEffect(() => {
    console.log('Initial load, watchlist:', watchlist)
    if (watchlist.length > 0) {
      refreshStocks()
    }
  }, [watchlist])

  const handleAddToWatchlist = async (result: SearchResult) => {
    console.log('Adding stock:', result)
    await addToWatchlist({
      symbol: result.symbol,
      name: result.name,
      type: result.type,
      market: result.market,
      group: '默认分组'
    })
    setShowSearch(false)
    // 立即刷新数据
    await refreshStocks()
    console.log('Stock added and refreshed, current stocks:', stocks)
  }


  const handleToggleSettings = () => {
    setSettingsMode(!settingsMode)
    setShowSearch(false) // 关闭搜索模式
  }

  const handleRemoveStock = async (symbol: string, market: string) => {
    console.log('Removing stock:', symbol, market)
    await removeFromWatchlist(symbol, market)
    await refreshStocks()
  }

  const handleDebugAPI = async () => {
    setDebugInfo('正在测试API...')
    try {
      let debugLog = '测试开始:\n'

      // 测试中国股票搜索
      debugLog += '1. 测试搜索功能...\n'
      const searchResults = await stockApi.searchStocks('600000')
      console.log('Search results:', searchResults)
      debugLog += `   搜索结果: ${searchResults.length} 条\n`
      if (searchResults.length > 0) {
        debugLog += `   第一个结果: ${JSON.stringify(searchResults[0])}\n`
      }

      // 测试获取中国股票数据
      debugLog += '2. 测试中国股票数据获取...\n'
      try {
        const stockData = await stockApi.getStockData(['600000', '000001'])
        console.log('Stock data:', stockData)
        debugLog += `   中国股票数据: ${stockData.length} 条\n`
        if (stockData.length > 0) {
          debugLog += `   第一个股票: ${JSON.stringify(stockData[0])}\n`
        } else {
          debugLog += '   ❌ 中国股票数据为空\n'
        }
      } catch (cnError) {
        console.error('China stock error:', cnError)
        debugLog += `   ❌ 中国股票获取失败: ${cnError instanceof Error ? cnError.message : String(cnError)}\n`
      }

      // 测试美股数据
      debugLog += '3. 测试美股数据获取...\n'
      try {
        const usStockData = await stockApi.getStockData(['AAPL'])
        console.log('US stock data:', usStockData)
        debugLog += `   美股数据: ${usStockData.length} 条\n`
        if (usStockData.length > 0) {
          debugLog += `   第一个股票: ${JSON.stringify(usStockData[0])}\n`
        }
      } catch (usError) {
        console.error('US stock error:', usError)
        debugLog += `   ❌ 美股获取失败: ${usError instanceof Error ? usError.message : String(usError)}\n`
      }

      debugLog += '\n详细信息请查看控制台'
      setDebugInfo(debugLog)
    } catch (error) {
      console.error('Debug API error:', error)
      setDebugInfo(`API测试失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="flex flex-col h-screen oil-painting-bg">
      {/* Header */}
      <div className="p-4 border-b oil-card m-2 mb-0 rounded-b-none">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold oil-text-primary">
            {settingsMode ? '🎨 管理股票' : '📈 自选股票'}
          </h1>
          <div className="flex space-x-2">
            {!settingsMode && (
              <>
                <Button
                  className="oil-button"
                  variant="ghost"
                  size="sm"
                  onClick={refreshStocks}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin oil-shimmer' : ''}`} />
                </Button>
                <Button
                  className="oil-button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDebugAPI}
                  title="调试API"
                >
                  <Bug className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              className="oil-button"
              variant="ghost"
              size="sm"
              onClick={handleToggleSettings}
              title={settingsMode ? '退出设置' : '设置'}
            >
              {settingsMode ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {!settingsMode && (
          <>
            <Button
              className="oil-button w-full"
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? '🔍 关闭搜索' : '➕ 添加股票'}
            </Button>

            {showSearch && (
              <div className="mt-2 oil-card rounded-md shadow-lg z-10">
                <SearchBar onAddToWatchlist={handleAddToWatchlist} />
              </div>
            )}
          </>
        )}

        {settingsMode && (
          <div className="text-sm oil-text-secondary text-center py-3 oil-card rounded-lg mx-2">
            🗑️ 点击股票卡片右上角的删除按钮来移除股票
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 mx-2 oil-card bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <div className="p-3 mx-2 oil-card bg-yellow-50 border-l-4 border-yellow-400 text-sm rounded-lg">
          <pre className="whitespace-pre-wrap text-xs oil-text-secondary">🔧 {debugInfo}</pre>
        </div>
      )}

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {stocks.length === 0 && !loading && (
          <div className="text-center py-8 oil-card mx-2 rounded-lg">
            <div className="oil-text-secondary">
              <p className="text-lg mb-2">
                {watchlist.length === 0 ? '📊 暂无自选股票' : '⏳ 正在加载数据...'}
              </p>
              <p className="text-sm">
                {watchlist.length === 0 ? '点击上方"添加股票"开始关注您的投资组合' : '请稍候...'}
              </p>
            </div>
          </div>
        )}

        {stocks.map((stock) => (
          <StockCard
            key={`${stock.symbol}-${stock.market}`}
            stock={stock}
            onClick={() => {
              if (!settingsMode) {
                console.log('Clicked stock:', stock)
                setSelectedStock(stock)
              }
            }}
            showDeleteButton={settingsMode}
            onDelete={() => handleRemoveStock(stock.symbol, stock.market)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 oil-card m-2 mt-0 rounded-t-none text-center text-xs oil-text-secondary">
        📈 共 {stocks.length} 只股票 · 实时更新
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetail
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  )
}

export default Popup