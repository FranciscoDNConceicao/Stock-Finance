import Header from "../components/Header/Header"
import LineGraph from "../components/LineGraph/Linegraph"
import Sidebar from "../components/Sidebar/Sidebar"
import TickerAction from "../components/Ticker/Ticker"

import "../style/index.css"

export default function InitPage(){
    return (
        <div className="bg-background-color flex flex-col h-full">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
            </div>
            <div className="flex flex-1 flex-row">
                <div className="h-full w-fit">
                    <Sidebar />
                </div>
                <div>
                    <TickerAction />
                </div>
                <div className="grid w-full grid-template-rows-6 grid-cols-6 gap-4 ml-[20px] mr-[20px] mt-[60px]">
                    <div className="h-full w-full row-start-1 col-start-1 row-end-4 col-end-4 bg-secondary-background-color">
                        <LineGraph />
                    </div>
                    <div className="h-full w-full row-start-1 col-start-4 row-end-2 col-end-7 bg-secondary-background-color">
                        /* Carteira */
                    </div>
                    <div className="h-full w-full row-start-2 col-start-4 row-end-5 col-end-7 bg-secondary-background-color" >
                        /* Noticias */
                    </div>
                    <div className="h-full w-full row-start-5 col-start-1 row-end-7 col-end-7 bg-secondary-background-color" >
                        /* Table */
                    </div>
                </div>
            </div>
            
        </div>
    )
}