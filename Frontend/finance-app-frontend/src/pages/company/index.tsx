import { useState } from "react";
import CompanyProfile from "../../components/CompanyProfile/CompanyProfile";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { DataGraph } from "../../components/LineGraph/interfaces";
import { generateDataStockTime } from "../../scripts/Stocks/DataStockTime";


    

export default function CompanyPage(){

    const [dataGraph, setDataGraph] = useState<DataGraph>({
        'company_data': null
      });
    const [isLoading, setLoading] = useState(true)
    const [FirsTimeRender, setRender] = useState(false)

    const fetchDatatoGraph = async (timestamp:string, code:string) => {
        console.log('ENTROU')
        console.log(timestamp)
        console.log(code)
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
    
    if(!FirsTimeRender){
        fetchDatatoGraph('3Y', 'AAPL')
        setRender(true)
    }
    
    return (
        <div className="bg-background-color h-full">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
            </div>
            <div className="h-full w-full flex">
                <div className="w-[15%]">
                    <Sidebar />
                </div>
                <div className="w-full">
                    <CompanyProfile 
                        dataCompany={
                            {
                                "name": "Apple Inc.",
                                "company": "AAPL",
                                "description":" ",
                                "locate": "us",
                                "address": "ONE APPLE PARK WAY-CUPERTINO-CA",
                                "URL" : "https://www.apple.com",
                                "num_employees": "161000",
                                "sicCode": "3571-ELECTRONIC COMPUTERS",
                                "dateList": "1980-12-12",
                                "highMax":"172,8" ,
                                "currency_name": "usd"
                            }
                        }
                      
                        dataGraph={dataGraph}
                        isLoading={isLoading}
                        changingTimeCateg={fetchDatatoGraph}    
                         />
                </div>
            </div>
        </div>
    )
}