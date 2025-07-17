import type { StockData, FundData, SearchResult } from "../../types/stock";

// 股票API客户端
export class StockApiClient {
  private baseUrls = {
    cn: "https://qt.gtimg.cn/q=", // 腾讯财经API
    cnBackup: "https://hq.sinajs.cn", // 备用新浪API
    us: "https://query1.finance.yahoo.com/v8/finance/chart",
    search: "https://smartbox.gtimg.cn/s3/", // 腾讯搜索API
  };

  // 获取股票数据
  async getStockData(symbols: string[]): Promise<StockData[]> {
    if (symbols.length === 0) return [];

    const cnSymbols = symbols.filter((s) => this.isChinaStock(s));
    const usSymbols = symbols.filter((s) => this.isUSStock(s));

    const promises = [
      this.getChinaStockData(cnSymbols),
      this.getUSStockData(usSymbols),
    ];

    const results = await Promise.allSettled(promises);
    const stocks: StockData[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        stocks.push(...result.value);
      }
    });

    return stocks;
  }

  // 获取基金数据
  async getFundData(codes: string[]): Promise<FundData[]> {
    if (codes.length === 0) return [];

    const promises = codes.map((code) => this.getFundInfo(code));
    const results = await Promise.allSettled(promises);
    const funds: FundData[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        funds.push(result.value);
      }
    });

    return funds;
  }

  // 搜索股票/基金
  async searchStocks(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];

    // 如果是6位数字，尝试获取真实股票数据
    if (/^\d{6}$/.test(query)) {
      try {
        // 尝试获取真实股票数据来获取名称
        const stockData = await this.getChinaStockData([query]);
        if (stockData.length > 0 && stockData[0].name !== `股票${query}`) {
          results.push({
            symbol: query,
            name: stockData[0].name,
            type: "stock",
            market: "cn",
          });
        } else {
          // 如果获取失败，使用映射表作为后备
          const stockName = this.getStockNameByCode(query);
          results.push({
            symbol: query,
            name: stockName,
            type: "stock",
            market: "cn",
          });
        }
      } catch (error) {
        // 如果API调用失败，使用映射表
        const stockName = this.getStockNameByCode(query);
        results.push({
          symbol: query,
          name: stockName,
          type: "stock",
          market: "cn",
        });
      }
    }
    // 如果是字母，作为美股处理
    else if (/^[A-Z]{1,5}$/i.test(query.toUpperCase())) {
      results.push({
        symbol: query.toUpperCase(),
        name: query.toUpperCase(),
        type: "stock",
        market: "us",
      });
    }
    // 尝试搜索API
    else {
      try {
        const [cnResults, usResults] = await Promise.allSettled([
          this.searchChinaStocks(query),
          this.searchUSStocks(query),
        ]);

        if (cnResults.status === "fulfilled") {
          results.push(...cnResults.value);
        }
        if (usResults.status === "fulfilled") {
          results.push(...usResults.value);
        }
      } catch (error) {
        console.error("Search API failed:", error);
      }
    }

    return results.slice(0, 10);
  }

  // 根据股票代码获取名称（扩展映射）
  private getStockNameByCode(code: string): string {
    const stockNames: { [key: string]: string } = {
      // 上海主板
      "600000": "浦发银行",
      "600001": "邯郸钢铁",
      "600004": "白云机场",
      "600009": "上海机场",
      "600016": "民生银行",
      "600028": "中国石化",
      "600029": "南方航空",
      "600030": "中信证券",
      "600036": "招商银行",
      "600048": "保利发展",
      "600050": "中国联通",
      "600104": "上汽集团",
      "600276": "恒瑞医药",
      "600519": "贵州茅台",
      "600585": "海螺水泥",
      "600690": "海尔智家",
      "600809": "山西汾酒",
      "600837": "海通证券",
      "600887": "伊利股份",
      "600900": "长江电力",
      "601012": "隆基绿能",
      "601066": "中信建投",
      "601088": "中国神华",
      "601166": "兴业银行",
      "601186": "中国铁建",
      "601288": "农业银行",
      "601318": "中国平安",
      "601328": "交通银行",
      "601398": "工商银行",
      "601628": "中国人寿",
      "601668": "中国建筑",
      "601728": "中国电信",
      "601766": "中国中车",
      "601818": "光大银行",
      "601857": "中国石油",
      "601888": "中国中免",
      "601899": "紫金矿业",
      "601939": "建设银行",
      "601988": "中国银行",
      "603259": "药明康德",
      "603288": "海天味业",

      // 深圳主板
      "000001": "平安银行",
      "000002": "万科A",
      "000063": "中兴通讯",
      "000100": "TCL科技",
      "000166": "申万宏源",
      "000338": "潍柴动力",
      "000568": "泸州老窖",
      "000625": "长安汽车",
      "000651": "格力电器",
      "000725": "京东方A",
      "000858": "五粮液",
      "000876": "新希望",
      "000895": "双汇发展",
      "000977": "浪潮信息",

      // 创业板
      "002001": "新和成",
      "002007": "华兰生物",
      "002027": "分众传媒",
      "002142": "宁波银行",
      "002230": "科大讯飞",
      "002236": "大华股份",
      "002304": "洋河股份",
      "002352": "顺丰控股",
      "002415": "海康威视",
      "002460": "赣锋锂业",
      "002475": "立讯精密",
      "002594": "比亚迪",
      "002714": "牧原股份",

      // 科创板
      "688036": "传音控股",
      "688981": "中芯国际",
    };
    return stockNames[code] || `股票${code}`;
  }

  // 中国股市数据
  private async getChinaStockData(symbols: string[]): Promise<StockData[]> {
    console.log("getChinaStockData called with symbols:", symbols);
    if (symbols.length === 0) {
      console.log("No China symbols to fetch");
      return [];
    }

    // 使用腾讯财经API获取中国股票数据
    const results: StockData[] = [];

    try {
      // 构建腾讯API查询字符串
      const tencentSymbols = symbols.map((symbol) => {
        if (symbol.startsWith("6") || symbol.startsWith("5")) {
          return `sh${symbol}`;
        } else {
          return `sz${symbol}`;
        }
      });

      const url = `${this.baseUrls.cn}${tencentSymbols.join(",")}`;
      console.log("Fetching Tencent stock data from URL:", url);

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://gu.qq.com",
          "Accept-Charset": "utf-8, gbk, gb2312",
        },
      });

      if (!response.ok) {
        throw new Error(`Tencent API HTTP error! status: ${response.status}`);
      }

      // 尝试以GBK编码读取响应
      const buffer = await response.arrayBuffer();
      let text: string;

      try {
        // 先尝试GBK解码
        const decoder = new TextDecoder("gbk");
        text = decoder.decode(buffer);
      } catch (error) {
        // 如果GBK失败，尝试UTF-8
        const decoder = new TextDecoder("utf-8");
        text = decoder.decode(buffer);
      }

      console.log("Tencent API response:", text);

      // 解析腾讯数据
      const lines = text.split("\n").filter((line) => line.trim());

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const symbol = symbols[i];

        if (line && symbol) {
          const stockData = this.parseTencentStockData(line, symbol);
          if (stockData) {
            results.push(stockData);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch China stocks:", error);
      // 如果腾讯API失败，尝试使用新浪API作为备用
      return this.getChinaStockDataFromSina(symbols);
    }

    console.log("China stock data results:", results);
    return results;
  }

  // 使用Yahoo Finance API获取单个股票数据
  private async getYahooStockData(symbol: string): Promise<StockData | null> {
    const url = `${this.baseUrls.cn}/${symbol}`;
    console.log("Fetching Yahoo stock data from URL:", url);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      console.log("Yahoo API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Yahoo API HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Yahoo API response data:", data);

      return this.parseYahooStockData(data, symbol);
    } catch (error) {
      console.error(`Failed to fetch Yahoo stock ${symbol}:`, error);
      return null;
    }
  }

  // 解析Yahoo Finance数据
  private parseYahooStockData(data: any, symbol: string): StockData | null {
    try {
      const result = data?.chart?.result?.[0];
      if (!result) {
        console.warn("No chart result in Yahoo data");
        return null;
      }

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      if (!meta || !quote) {
        console.warn("Missing meta or quote data");
        return null;
      }

      const currentPrice = meta.regularMarketPrice || 0;
      const prevClose = meta.previousClose || 0;
      const change = currentPrice - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      return {
        symbol: symbol.split(".")[0], // 移除.SS/.SZ后缀
        name: meta.longName || meta.shortName || symbol,
        price: currentPrice,
        change,
        changePercent,
        volume: meta.regularMarketVolume || 0,
        open: meta.regularMarketOpen || 0,
        high: meta.regularMarketDayHigh || 0,
        low: meta.regularMarketDayLow || 0,
        prevClose,
        timestamp: Date.now(),
        type: "stock",
        market: "cn",
      };
    } catch (error) {
      console.error("Error parsing Yahoo stock data:", error);
      return null;
    }
  }

  // 美股数据
  private async getUSStockData(symbols: string[]): Promise<StockData[]> {
    if (symbols.length === 0) return [];

    const results: StockData[] = [];

    for (const symbol of symbols) {
      try {
        const stockData = await this.getYahooStockData(symbol);
        if (stockData) {
          stockData.market = "us";
          results.push(stockData);
        }
      } catch (error) {
        console.error(`Failed to fetch US stock ${symbol}:`, error);
      }
    }

    return results;
  }

  // 获取基金信息
  private async getFundInfo(code: string): Promise<FundData> {
    try {
      // 使用Yahoo Finance搜索基金
      const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${code}&quotesCount=1`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      let fundSymbol = code;
      if (searchData.quotes && searchData.quotes.length > 0) {
        fundSymbol = searchData.quotes[0].symbol;
      }

      // 获取基金数据
      const url = `${this.baseUrls.us}/${fundSymbol}?interval=1m`;
      const response = await fetch(url);
      const data = await response.json();

      const stockData = this.parseYahooStockData(data, code);
      if (!stockData) {
        throw new Error("Failed to parse fund data");
      }

      return {
        ...stockData,
        type: "fund",
        netValue: stockData.price,
        accumulatedValue: stockData.price,
        dailyReturn: stockData.changePercent,
      };
    } catch (error) {
      console.error(`Failed to fetch fund ${code} data:`, error);
      // 如果获取失败，返回null而不是假数据
      throw error;
    }
  }

  // 搜索中国股市股票
  private async searchChinaStocks(query: string): Promise<SearchResult[]> {
    try {
      // 使用Sina Finance搜索API
      const url = `https://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&key=${encodeURIComponent(
        query
      )}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://finance.sina.com.cn",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder("gbk");
      const text = decoder.decode(buffer);

      return this.parseSinaSearchData(text);
    } catch (error) {
      console.error("Failed to search China stocks:", error);
      return [];
    }
  }

  // 搜索美股
  private async searchUSStocks(query: string): Promise<SearchResult[]> {
    try {
      // 使用Yahoo Finance搜索API
      const response = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
          query
        )}&quotesCount=5`
      );
      const data = await response.json();

      if (!data.quotes) return [];

      return data.quotes
        .map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.longname || quote.shortname || quote.symbol,
          type: "stock",
          market: "us",
        }))
        .filter((item: SearchResult) => item.symbol && item.name);
    } catch (error) {
      console.error("Failed to search US stocks:", error);
      return [];
    }
  }

  // 解析腾讯股票数据
  private parseTencentStockData(
    line: string,
    symbol: string
  ): StockData | null {
    try {
      console.log("Parsing Tencent data line:", line);

      // 腾讯数据格式: v_sh600000="1~浦发银行~600000~9.44~-0.02~-0.21~22424864~211670895~..."
      const match = line.match(/v_[^=]+=["']([^"']+)["']/);
      if (!match) {
        console.log("No match found for line:", line);
        return null;
      }

      const data = match[1].split("~");
      console.log("Parsed data array:", data);

      if (data.length < 10) {
        console.log("Data array too short:", data.length);
        return null;
      }

      // 优先使用API返回的股票名称，如果为空或乱码则使用映射表
      let name = data[1] || ""; // API返回的股票名称

      // 检查名称是否有效（不为空且不是乱码）
      if (!name || name.trim() === "" || this.isGarbledText(name)) {
        name = this.getStockNameByCode(symbol);
      }

      const currentPrice = parseFloat(data[3]) || 0; // 当前价格
      const change = parseFloat(data[4]) || 0; // 涨跌额
      const changePercent = parseFloat(data[5]) || 0; // 涨跌幅
      const volume = parseInt(data[6]) || 0; // 成交量

      // 腾讯API的高低价位置可能不同，先用当前价格作为默认值
      const high = data[33] ? parseFloat(data[33]) : currentPrice; // 最高价
      const low = data[34] ? parseFloat(data[34]) : currentPrice; // 最低价
      const previousClose = currentPrice - change; // 昨收价

      const result = {
        symbol,
        name,
        price: currentPrice,
        change,
        changePercent,
        volume,
        high,
        low,
        prevClose: previousClose,
        market: "cn" as const,
        type: "stock" as const,
        timestamp: Date.now(),
      };

      console.log("Parsed stock data:", result);
      return result;
    } catch (error) {
      console.error("Failed to parse Tencent stock data:", error);
      return null;
    }
  }

  // 检测文本是否为乱码
  private isGarbledText(text: string): boolean {
    if (!text) return true;

    // 检查是否包含常见的乱码字符
    const garbledPatterns = [
      /[\uFFFD]/g, // 替换字符
      /[��]/g, // 常见乱码
      /^[\x00-\x1F\x7F-\x9F]+$/g, // 控制字符
      /^[?]+$/g, // 全是问号
      /^[\u25CA\u25CB\u25CF\u25D0-\u25FF]+$/g, // 菱形等符号
    ];

    return garbledPatterns.some((pattern) => pattern.test(text));
  }

  // 使用新浪API获取中国股票数据（备用数据源）
  private async getChinaStockDataFromSina(
    symbols: string[]
  ): Promise<StockData[]> {
    console.log("Using Sina API as backup for symbols:", symbols);
    if (symbols.length === 0) return [];

    const results: StockData[] = [];

    try {
      // 构建新浪API查询字符串
      const sinaSymbols = symbols.map((symbol) => {
        if (symbol.startsWith("6") || symbol.startsWith("5")) {
          return `sh${symbol}`;
        } else {
          return `sz${symbol}`;
        }
      });

      const url = `${this.baseUrls.cnBackup}/list=${sinaSymbols.join(",")}`;
      console.log("Fetching Sina stock data from URL:", url);

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://finance.sina.com.cn",
          "Accept-Charset": "utf-8, gbk, gb2312",
        },
      });

      if (!response.ok) {
        throw new Error(`Sina API HTTP error! status: ${response.status}`);
      }

      // 尝试以GBK编码读取响应
      const buffer = await response.arrayBuffer();
      let text: string;

      try {
        // 先尝试GBK解码
        const decoder = new TextDecoder("gbk");
        text = decoder.decode(buffer);
      } catch (error) {
        // 如果GBK失败，尝试UTF-8
        const decoder = new TextDecoder("utf-8");
        text = decoder.decode(buffer);
      }

      console.log("Sina API response:", text);

      // 解析新浪数据
      const lines = text.split("\n").filter((line) => line.trim());

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const symbol = symbols[i];

        if (line && symbol) {
          const stockData = this.parseSinaStockData(line, symbol);
          if (stockData) {
            results.push(stockData);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Sina API:", error);
      // 如果所有API都失败，返回空数组而不是模拟数据
      return [];
    }

    console.log("Sina stock data results:", results);
    return results;
  }

  // 解析新浪股票数据
  private parseSinaStockData(line: string, symbol: string): StockData | null {
    try {
      console.log("Parsing Sina data line:", line);

      // 新浪数据格式: var hq_str_sh600000="浦发银行,9.44,9.46,-0.02,-0.21,9.43,9.44,22424864,211670895,..."
      const match = line.match(/var hq_str_[^=]+=["']([^"']+)["']/);
      if (!match) {
        console.log("No match found for Sina line:", line);
        return null;
      }

      const data = match[1].split(",");
      console.log("Parsed Sina data array:", data);

      if (data.length < 10) {
        console.log("Sina data array too short:", data.length);
        return null;
      }

      // 新浪API数据格式
      let name = data[0] || ""; // 股票名称

      // 检查名称是否有效（不为空且不是乱码）
      if (!name || name.trim() === "" || this.isGarbledText(name)) {
        name = this.getStockNameByCode(symbol);
      }
      const currentPrice = parseFloat(data[3]) || 0; // 当前价格
      const prevClose = parseFloat(data[2]) || 0; // 昨收价
      const change = currentPrice - prevClose; // 涨跌额
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0; // 涨跌幅
      const volume = parseInt(data[8]) || 0; // 成交量
      const high = parseFloat(data[4]) || currentPrice; // 最高价
      const low = parseFloat(data[5]) || currentPrice; // 最低价

      const result = {
        symbol,
        name,
        price: currentPrice,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume,
        high,
        low,
        prevClose,
        market: "cn" as const,
        type: "stock" as const,
        timestamp: Date.now(),
      };

      console.log("Parsed Sina stock data:", result);
      return result;
    } catch (error) {
      console.error("Failed to parse Sina stock data:", error);
      return null;
    }
  }

  // 解析Sina搜索数据
  private parseSinaSearchData(text: string): SearchResult[] {
    try {
      // Sina返回格式: var suggestvalue="[股票代码,股票名称,市场类型,...]|[...]"
      const match = text.match(/var suggestvalue="([^"]+)"/);
      if (!match) return [];

      const dataStr = match[1];
      if (!dataStr.trim()) return [];

      const items = dataStr.split("|");
      const results: SearchResult[] = [];

      items.forEach((item) => {
        const fields = item.split(",");
        if (fields.length >= 3) {
          const symbol = fields[0]; // 股票代码
          const name = fields[1]; // 股票名称
          const type = fields[2]; // 类型：11=股票,12=指数,13=基金,14=债券,15=期货

          // 只返回股票类型
          if (type === "11") {
            results.push({
              symbol,
              name,
              type: "stock",
              market: "cn",
            });
          }
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error("Failed to parse Sina search data:", error);
      return [];
    }
  }

  // 工具方法
  private isChinaStock(symbol: string): boolean {
    return /^\d{6}$/.test(symbol);
  }

  private isUSStock(symbol: string): boolean {
    return /^[A-Z]{1,5}$/.test(symbol);
  }
}

// 创建单例实例
export const stockApi = new StockApiClient();
