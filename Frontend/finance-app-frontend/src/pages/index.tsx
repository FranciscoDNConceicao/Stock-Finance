import Header from "../components/Header/Header"
import LineGraph from "../components/LineGraph/Linegraph"
import Sidebar from "../components/Sidebar/Sidebar"
import "../style/index.css"
import WalletComponent from "../components/WalletComponent/WalletComponent"
import SeparatorInfo from "../components/SeparatorInfo/SeparatorInfo"
import TableStocks from "../components/TableStocks/Tablestocks"
import { useEffect, useState } from "react"
import { generateCodesGraph, generateDataStockTime } from "../scripts/Stocks/DataStockTime"
import { DataGraph } from "../components/LineGraph/interfaces"
import { TickerActionInt} from "../components/Ticker/Interfaces"
import { generateDataTicket } from "../scripts/Stocks/TickerDataStock"
import TickerAction from "../components/Ticker/Ticker"
import { generateNewsSeparateInfo } from "../scripts/News/SeparatorInfoNews"
import { GridRowParams, GridRowsProp } from "@mui/x-data-grid"
import { stockDataToDatagrid } from "../scripts/Stocks/StockDataGrid"
import { useNavigate } from "../router"


const StocksCode = await generateCodesGraph()
const newsDataForComponent = await generateNewsSeparateInfo()


export default function InitPage(){
    const navigate = useNavigate()
    const [isFixed, setIsFixed] = useState(false);
    const [isLoading, setLoading] = useState(true)
    const [isLoadingTicker, setLoadingTicker] = useState(true)
    const [dataGraph, setDataGraph] = useState<DataGraph>({
        'company_data': null
      });

    const [dataTicker, setDataTicker] = useState<TickerActionInt[] | null>([])
    const [isFirstTime,setIsFirstTime] = useState(true)
    const [rowsGrid, setRowsGrid] = useState<GridRowsProp | null>([])
      
    const fetchDatatoGraph = async (timestamp:string, code:string) => {
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
      console.log(Response.data)
      setDataTicker(Response?.data || null);
      setLoadingTicker(false)
    }

    const nextPageDataGrid = async (initPage:number, endPage:number) => {
      const rowsStock = await stockDataToDatagrid(initPage, endPage)

      setRowsGrid(rowsStock?.data || null)
    }
    useEffect(() => {
      if (isFirstTime) {       


        fetchTickerData() 
        if (StocksCode?.data?.length && StocksCode.data[0].code) {       
          fetchDatatoGraph('1D', StocksCode.data[0].code);
          setIsFirstTime(false);
          
        } 
    }}, [isFirstTime]);

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

    
  const rowclicked = (params: GridRowParams) => {
    navigate('/company/:id', { params: { id: params.id.toString() } });
  }


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
                                categProp={StocksCode?.data || null}
                                hasChoosingCategory={true}
                                extendedVersion={false}
                                timeStampInitial={'1D'}
                            />
                        </div>
                        <div className="h-full w-full row-start-1 col-start-4 row-end-2 col-end-7 bg-secondary-background-color">
                            <WalletComponent WalletData={wallet} />
                        </div>
                        <div className="h-full w-full row-start-2 col-start-4 row-end-3 col-end-7 bg-secondary-background-color" >
                            <SeparatorInfo Data={newsDataForComponent?.data || null }/>
                        </div>
                        <div className="h-full w-full row-start-4 col-start-1 row-end-7 col-end-7 bg-secondary-background-color" >
                            <TableStocks actionNextPage={nextPageDataGrid} rows={rowsGrid} rowClicked={rowclicked}/>
                        </div>
                    </div>
                </div>
            </div>
            
            </div>

    )
}