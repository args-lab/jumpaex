import axios from 'axios';

const INDODAX_API_URL = 'https://indodax.com/api';
const pairsEndpoint = `${INDODAX_API_URL}/pairs`;
const tickerAllEndpoint = `${INDODAX_API_URL}/ticker_all`;

// Interface for the data from /api/pairs
interface Pair {
    id: string;
    symbol: string;
    base_currency: string;
    traded_currency: string;
    traded_currency_unit: string;
    description: string;
    ticker_id: string;
    volume_precision: number;
    price_precision: number;
    price_round: number;
    pricescale: number;
    trade_min_base_currency: number;
    trade_min_traded_currency: string;
    has_memo: boolean;
    memo_name: boolean;
    has_payment_id: boolean;
    trade_fee_percent: number;
    url_logo: string;
    url_logo_png: string;
    is_maintenance: number; // 0 or 1
}

// Interface for individual ticker data in /api/ticker_all
interface Ticker {
    high: string;
    low: string;
    last: string;
    buy: string;
    sell: string;
    server_time: number;
    // Dynamic volume keys, e.g., vol_btc, vol_idr, and other potential string keys
    [key: string]: string | number; // Allow any string key for dynamic properties
}

// Interface for the `tickers` object in /api/ticker_all response
interface MarketPrices {
    [ticker_id: string]: Ticker;
}

// Interface for the full response of /api/ticker_all
interface MarketPricesApiResponse {
    tickers: MarketPrices;
}

// Interface for the final merged data structure
interface FinalPairInfo {
    base_currency: string;
    description: string;
    ticker_id: string;
    url_logo: string;
    high?: string;
    low?: string;
    last?: string;
    buy?: string;
    sell?: string;
    vol_base_currency?: string;
    vol_traded_currency?: string;
}

async function fetchPairs(): Promise<Pair[]> {
    try {
        const response = await axios.get<Pair[]>(pairsEndpoint);
        return response.data;
    } catch (error) {
        console.error('Error fetching pairs:', error);
        throw error;
    }
}

async function fetchMarketPrices(): Promise<MarketPrices> {
    try {
        const response = await axios.get<MarketPricesApiResponse>(tickerAllEndpoint);
        return response.data.tickers;
    } catch (error) {
        console.error('Error fetching market prices:', error);
        throw error;
    }
}

async function getPairsWithPrices(): Promise<FinalPairInfo[]> {
    try {
        const [pairsData, marketPricesData] = await Promise.all([fetchPairs(), fetchMarketPrices()]);
        
        const finalData: FinalPairInfo[] = pairsData.map(pair => {
            const marketData = marketPricesData[pair.ticker_id] || null;
            
            const volBaseKey = `vol_${pair.base_currency}`;
            const volTradedKey = `vol_${pair.traded_currency}`;

            return {
                base_currency: pair.base_currency,
                description: pair.description,
                ticker_id: pair.ticker_id,
                url_logo: pair.url_logo,
                high: marketData?.high,
                low: marketData?.low,
                last: marketData?.last,
                buy: marketData?.buy,
                sell: marketData?.sell,
                vol_base_currency: marketData ? String(marketData[volBaseKey] || '') : undefined,
                vol_traded_currency: marketData ? String(marketData[volTradedKey] || '') : undefined,
            };
        });

        return finalData;
    } catch (error) {
        console.error('Error fetching pairs with prices:', error);
        throw error;
    }
}

// Example usage
getPairsWithPrices()
    .then(data => {
        console.log('Merged Pairs with Market Prices:', JSON.stringify(data, null, 2));
    })
    .catch(error => {
        console.error('Error:', error);
    });
