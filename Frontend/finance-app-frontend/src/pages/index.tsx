import Header from "../components/Header/Header"
import LineGraph from "../components/LineGraph/Linegraph"
import Sidebar from "../components/Sidebar/Sidebar"
import TickerAction from "../components/Ticker/Ticker"
import logoTSLA from "../assets/images/tesla-logo.svg"
import logoGOOGL from "../assets/images/Google-logo.svg"
import logoAPPL from "../assets/images/apple-logo.svg"
import "../style/index.css"
import WalletComponent from "../components/WalletComponent/WalletComponent"
import {news_data} from "../../data/DataInitPage"
import SeparatorInfo from "../components/SeparatorInfo/SeparatorInfo"
import TableStocks from "../components/TableStocks/Tablestocks"
import { useEffect, useState } from "react"
import { generateDataStockTime } from "../scripts/Stocks/DataStockTime"


const data_graph = {
    'TSLA':{
        'image': logoTSLA,
        'company_data': generateDataStockTime('TSLA')
    },
    'GOOGL':{
        'image': logoGOOGL,
        'company_data':  generateDataStockTime('GOOGL')
        
    },
    'APPL':{
        'image': logoAPPL,
        'company_data': generateDataStockTime('APPL')
    }
}
export default function InitPage(){
    const [isFixed, setIsFixed] = useState(false);

    console.log(data_graph)
    useEffect(() => {
        const handleScroll = () => {
            console.log(window.scrollY)
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
    console.log(newsDataForComponent)
    return (
        <div className="bg-background-color h-full">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
                <TickerAction isFixed={isFixed}/>
            </div>
            <div className="h-full w-full flex">
                <div className="w-[15%]">
                    <Sidebar />
                </div>
                <div className="w-full">

                    <div className="grid w-full grid-template-rows-6 grid-cols-6 gap-4 mt-[60px] mb-[60px] px-[10px]">
                        <div className="h-full w-full row-start-1 col-start-1 row-end-4 col-end-4 bg-secondary-background-color border-[1px] border-[white]">
                            <LineGraph 
                                data={data_graph} 
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