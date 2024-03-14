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

function getRandomArbitrary(min:number, max:number) {
    return Math.random() * (max - min) + min;
  }
  
  // Populate company_data with random values
  function generateRandomData() {
    const startDate = new Date(2024, 2, 8, 9, 0, 0); // March 8th, 2024 09:00:00
    const endDate = new Date(2024, 2, 9, 5, 47, 45); // March 9th, 2024 05:47:45
    const timestamps = [];
    let currentDate = startDate;
  
    // Generate timestamps
    while (currentDate <= endDate) {
      timestamps.push(currentDate.toISOString());
      currentDate.setHours(currentDate.getHours() + 1); // Increment by 1 hour
    }
    const company_data:{ [key: string]: string } = {};
    for (const timestamp of timestamps) {
        company_data[timestamp] = getRandomArbitrary(10, 30).toFixed(2); // Random value between 10 and 30, rounded to 2 decimal places
    }
  
    return company_data;
  }
export default function InitPage(){
    const data_graph = {
        'TSLA':{
            'image': logoTSLA,
            'company_data': generateRandomData()
        },
        'GOOGL':{
            'image': logoGOOGL,
            'company_data':  generateRandomData()
            
        },
        'APPL':{
            'image': logoAPPL,
            'company_data': generateRandomData()
        }
    }
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
            </div>
            <div className="h-full w-full flex">
                <div className="">
                    <Sidebar />
                </div>
                    <div>
                        <div className="grid w-full grid-template-rows-6 grid-cols-6 gap-4 ml-[20px] mr-[20px] mt-[60px]">
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
                                <TableStocks />
                            </div>
                        </div>
                    </div>
            </div>
            
            </div>

    )
}