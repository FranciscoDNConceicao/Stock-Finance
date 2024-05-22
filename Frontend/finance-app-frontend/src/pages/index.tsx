import Header from "../components/Header/Header"
import LineGraph from "../components/LineGraph/Linegraph"
import Sidebar from "../components/Sidebar/Sidebar"
import "../style/index.css"
import WalletComponent from "../components/WalletComponent/WalletComponent"
import SeparatorInfo from "../components/SeparatorInfo/SeparatorInfo"
import TableStocks from "../components/TableStocks/Tablestocks"
import { useEffect, useState } from "react"
import { generateCodesGraph, generateDataStockTime } from "../scripts/Stocks/DataStockTime"
import { DataGraph, StockImage } from "../components/LineGraph/interfaces"
import { generateDataTicket } from "../scripts/Stocks/TickerDataStock"
import { generateNewsSeparateInfo } from "../scripts/News/SeparatorInfoNews"
import { GridRowParams, GridRowsProp } from "@mui/x-data-grid"
import { useNavigate } from "../router"
import { TickerActionInt } from "../components/Ticker/Interfaces"
import TickerAction from "../components/Ticker/Ticker"
import { POST } from "../scripts/axios"




export default function InitPage(){
    const navigate = useNavigate()
    
    const [isFixed, setIsFixed] = useState(false);
    const [isLoading, setLoading] = useState(true)
    const [isLoadingTicker, setLoadingTicker] = useState(true)
    const [dataGraph, setDataGraph] = useState<DataGraph>({'company_data': null});
    const [newsDataForComponent, setNewsDataForComponent] = useState<NewsData>({'This day': [], 'This Week': [], 'This Year': []}) 
    const [stocksCode, setStocksCode] = useState<StockImage[] >([])
    const [dataTicker, setDataTicker] = useState<TickerActionInt[] | null>([])
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
      setDataTicker(Response?.data || null);
      setLoadingTicker(false)
    }
    
    const fetchDataGraph = async () => {
      const StocksCode = await POST('http://127.0.0.1:8000/company/random/',  {"limit": 20}) as StockImage[]
      setStocksCode(StocksCode)
    }
    const newsSeparateInfo = async () => {
      const newsDataForComponent = await POST('http://127.0.0.1:8000/news/get/essential/SeparatedDate',  {"limit": 6}) as NewsData

      setNewsDataForComponent(newsDataForComponent )
    }
    const nextPageDataGrid = async (initPage:number, endPage:number) => {
      const data = await POST('http://127.0.0.1:8000/stock/select/StockForDataGrid',{"initPage": initPage, "endPage": endPage} ) as GridRowsProp
      
      setRowsGrid(data)
    }

    useEffect(() => {
      
      if (stocksCode && stocksCode?.length > 1) {   
        fetchDatatoGraph('1D', stocksCode[0].code);
        
      }else{
        fetchDataGraph()
      }
    }, [stocksCode])


    useEffect(() => {
      if(dataTicker && dataTicker.length > 0){
        fetchTickerData()
      }
      newsSeparateInfo()
      
    }, [])
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
                                categProp={stocksCode}
                                hasChoosingCategory={true}
                                extendedVersion={false}
                                timeStampInitial={'1D'}
                            />
                        </div>
                        <div className="h-full w-full row-start-1 col-start-4 row-end-2 col-end-7 bg-secondary-background-color">
                            <WalletComponent WalletData={wallet} />
                        </div>
                        <div className="h-full w-full row-start-2 col-start-4 row-end-3 col-end-7 bg-secondary-background-color" >
                            <SeparatorInfo Data={newsDataForComponent} categorieSelected={Object.keys(newsDataForComponent ? newsDataForComponent : {' ': []})[0]}/>
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