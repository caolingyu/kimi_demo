import { useState, useEffect } from "react";
import type { WatchlistItem, StockData } from "../types/stock";
import { stockApi } from "../lib/api/stockApi";

interface UseWatchlistReturn {
  watchlist: WatchlistItem[];
  stocks: StockData[];
  loading: boolean;
  error: string | null;
  addToWatchlist: (item: Omit<WatchlistItem, "addedAt">) => Promise<void>;
  removeFromWatchlist: (symbol: string, market?: string) => Promise<void>;
  updateWatchlistItem: (
    symbol: string,
    updates: Partial<WatchlistItem>
  ) => Promise<void>;
  refreshStocks: () => Promise<void>;
}

export const useWatchlist = (): UseWatchlistReturn => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载自选列表
  useEffect(() => {
    loadWatchlist();
  }, []);

  // 当自选列表变化时，获取股票数据
  useEffect(() => {
    if (watchlist.length > 0) {
      refreshStocks();
    } else {
      setStocks([]);
    }
  }, [watchlist]);

  const loadWatchlist = async () => {
    try {
      const result = await chrome.storage.sync.get("watchlist");
      setWatchlist(result.watchlist || []);
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      setError("加载自选列表失败");
    }
  };

  const saveWatchlist = async (items: WatchlistItem[]) => {
    try {
      console.log("Saving watchlist to storage:", items);
      await chrome.storage.sync.set({ watchlist: items });
      console.log("Watchlist saved successfully");
      setWatchlist(items);
    } catch (error) {
      console.error("Failed to save watchlist:", error);
      setError("保存自选列表失败");
    }
  };

  const addToWatchlist = async (item: Omit<WatchlistItem, "addedAt">) => {
    const newItem: WatchlistItem = {
      ...item,
      addedAt: Date.now(),
    };

    console.log("Adding to watchlist:", newItem);

    const exists = watchlist.some((w) => w.symbol === newItem.symbol);
    if (exists) {
      setError("该股票已在自选列表中");
      console.log("Stock already exists:", newItem.symbol);
      return;
    }

    const newWatchlist = [...watchlist, newItem];
    await saveWatchlist(newWatchlist);
    setError(null);
    console.log("Successfully added to watchlist:", newItem);
  };

  const removeFromWatchlist = async (symbol: string, market?: string) => {
    const newWatchlist = watchlist.filter((item) => {
      if (market) {
        return !(item.symbol === symbol && item.market === market);
      }
      return item.symbol !== symbol;
    });
    await saveWatchlist(newWatchlist);
    console.log("Removed from watchlist:", symbol, market);
  };

  const updateWatchlistItem = async (
    symbol: string,
    updates: Partial<WatchlistItem>
  ) => {
    const newWatchlist = watchlist.map((item) =>
      item.symbol === symbol ? { ...item, ...updates } : item
    );
    await saveWatchlist(newWatchlist);
  };

  const refreshStocks = async () => {
    if (watchlist.length === 0) {
      setStocks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Refreshing stocks for watchlist:", watchlist);
      const symbols = watchlist.map((item) => item.symbol);
      console.log("Symbols to fetch:", symbols);

      const stockData = await stockApi.getStockData(symbols);
      console.log("Stock data received:", stockData);

      if (stockData.length === 0) {
        console.warn("No stock data returned for symbols:", symbols);
      }

      // 合并基金数据
      const fundData = await stockApi.getFundData(
        watchlist.filter((w) => w.type === "fund").map((w) => w.symbol)
      );
      console.log("Fund data received:", fundData);

      const allData = [...stockData, ...fundData];
      console.log("Combined data:", allData);

      console.log("Successfully loaded real data:", allData);
      setStocks(allData);
      if (allData.length === 0) {
        setError("暂无可显示的股票数据");
      } else {
        setError(null); // 清除之前的错误
      }
    } catch (error) {
      console.error("Failed to refresh stocks:", error);
      setError("获取股票数据失败");
    } finally {
      setLoading(false);
    }
  };

  return {
    watchlist,
    stocks,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    refreshStocks,
  };
};
