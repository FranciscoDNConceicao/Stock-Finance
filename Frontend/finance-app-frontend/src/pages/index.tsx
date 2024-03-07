import Header from "../components/Header/Header"
import Sidebar from "../components/Sidebar/Sidebar"

import "../style/index.css"

export default function InitPage(){
    return (
        <div className="bg-background-color flex flex-col h-full">
            <div className="h-16">
                <Header />
            </div>
            <div className="flex-1">
                <Sidebar />
            </div>
        </div>
    )
}