import Header from "../components/Header/Header"
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
            </div>
            
        </div>
    )
}