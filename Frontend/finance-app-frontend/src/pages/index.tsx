import Header from "../components/Header/Header"
import LineGraph from "../components/LineGraph/Linegraph"
import Sidebar from "../components/Sidebar/Sidebar"
import "../style/index.css"
import WalletComponent from "../components/WalletComponent/WalletComponent"
import {news_data} from "../../data/DataInitPage"
import SeparatorInfo from "../components/SeparatorInfo/SeparatorInfo"
import TableStocks from "../components/TableStocks/Tablestocks"
import { useEffect, useState } from "react"
import { generateDataStockTime } from "../scripts/Stocks/DataStockTime"
import { DataGraph } from "../components/LineGraph/interfaces"
import { TickerActionInt} from "../components/Ticker/Interfaces"
import { generateDataTicket } from "../scripts/Stocks/TickerDataStock"
import TickerAction from "../components/Ticker/Ticker"

export default function InitPage(){
    
    const [isFixed, setIsFixed] = useState(false);
    const [isLoading, setLoading] = useState(true)
    const [isLoadingTicker, setLoadingTicker] = useState(true)
    const [dataGraph, setDataGraph] = useState<DataGraph>({
        'company_data': null
      });

    const [dataTicker, setDataTicker] = useState<TickerActionInt[] | null>([])
    const [isFirstTime,setIsFirstTime] = useState(true)

    const StocksCode = [
      { 'code': 'TSLA'},
      { 'code': 'AAPL' },
      { 'code': 'ETSY' },
      { 'code': 'AMZN' },
      { 'code': 'GOOGL' },
      { 'code': 'MSFT'},
      { 'code': 'NFLX' },
      { 'code': 'META'},
      { 'code': 'NVDA' },
      { 'code': 'INTC' },
      { 'code': 'AMD' },
      { 'code': 'PYPL'},
      { 'code': 'SQ' },
      { 'code': 'UBER' },
      { 'code': 'LYFT' },
      { 'code': 'CRM' },
      { 'code': 'BABA' },
      { 'code': 'JD' },
      { 'code': 'TSM' },
      { 'code': 'IBM' },
    ];
    const fetchDatatoGraph = async (timestamp:string, code:string) => {
      console.log('Entrou')
      setDataGraph({
          'company_data': null,
        });
      setLoading(true)
      const Response = await generateDataStockTime(code, timestamp);
      setLoading(false)
      setDataGraph({
          'company_data': Response?.data || null
      });
    };

    const fetchTickerData = async () => {
      setLoadingTicker(true)
      const Response = await generateDataTicket();
      setDataTicker(Response?.data || null);
      setLoadingTicker(false)
    }

    useEffect(() => {
      if (isFirstTime) {       
        fetchTickerData() 
        fetchDatatoGraph('1D',  StocksCode[0].code)

        setIsFirstTime(false);
      }
    }, [isFirstTime]);

    useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY > 60 && !isFixed) {
            setIsFixed(true);
          } else if (window.scrollY <= 60 && isFixed) {
            setIsFixed(false);
          }
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, [isFixed]);

    
    const newsDataForComponent = news_data

    const wallet = {
        'balance': 3824.45,
        'wallet_balance': 2694.32,
        'day_balance': 34.42,
        'total_balance': 593.13
    }
    return (
        <div className="bg-background-color h-full">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
                <TickerAction 
                isFixed={isFixed} 
                data={dataTicker}
                isLoading={isLoadingTicker}
                />
            </div>
            <div className="h-full w-full flex">
                <div className="w-[15%]">
                    <Sidebar />
                </div>
                <div className="w-full">
                    <div className="grid w-full grid-template-rows-6 grid-cols-6 gap-4 mt-[60px] mb-[60px] px-[10px]">
                        <div className="h-full w-full row-start-1 col-start-1 row-end-4 col-end-4 bg-secondary-background-color border-[1px] border-[white]">
                            <LineGraph 
                                changingTimeCateg={fetchDatatoGraph}
                                isLoading={isLoading}
                                data={dataGraph} 
                                categProp={StocksCode}
                            />
                        </div>
                        <div className="h-full w-full row-start-1 col-start-4 row-end-2 col-end-7 bg-secondary-background-color">
                            <WalletComponent WalletData={wallet} />
                        </div>
                        <div className="h-full w-full row-start-2 col-start-4 row-end-3 col-end-7 bg-secondary-background-color" >
                            <SeparatorInfo Data={newsDataForComponent}/>
                        </div>
                        <div className="h-full w-full row-start-4 col-start-1 row-end-7 col-end-7 bg-secondary-background-color" >
                            <TableStocks/>
                        </div>
                    </div>
                </div>
            </div>
            
            </div>

    )
}