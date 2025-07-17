// Test script to verify Hong Kong stock data fetching
const { StockApiClient } = require('./dist/lib/api/stockApi.js');

async function testHongKongStockData() {
  const client = new StockApiClient();
  
  // Test with some well-known Hong Kong stocks
  const testSymbols = ['00700', '00005', '09988']; // Tencent, HSBC, Alibaba
  
  console.log('Testing Hong Kong stock data fetching...');
  console.log('Symbols:', testSymbols);
  
  try {
    const results = await client.getStockData(testSymbols);
    
    console.log('\nResults:');
    results.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.name}`);
      console.log(`   Price: ${stock.price}`);
      console.log(`   Change: ${stock.change} (${stock.changePercent}%)`);
      console.log(`   Volume: ${stock.volume}`);
      console.log(`   Market: ${stock.market}`);
      console.log('---');
    });
    
    if (results.length === 0) {
      console.log('No data returned. This might indicate:');
      console.log('1. API access restrictions');
      console.log('2. Invalid symbols');
      console.log('3. Network issues');
    }
    
  } catch (error) {
    console.error('Error testing Hong Kong stock data:', error);
  }
}

testHongKongStockData();