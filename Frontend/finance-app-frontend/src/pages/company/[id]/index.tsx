import { useState } from "react";
import CompanyProfile from "../../../components/CompanyProfile/CompanyProfile";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { CompanyData, DataGraph } from "../../../components/LineGraph/interfaces";
import { generateDataStockTime } from "../../../scripts/Stocks/DataStockTime";
import { CompanyInfo, LeftOrRightCompany } from "../../../components/CompanyProfile/interfaces";
import { LeftAndRightValues, getAllValuesFromCompany } from "../../../scripts/Company/getCompanyValues";
import { useParams } from "../../../router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";


    

export default function CompanyPage(){

    const { id } = useParams('/company/:id')
    const [dataCompany, setCompanyData] = useState<CompanyInfo | null>(null)
    const [leftCompany, setLeftCompany] = useState<LeftOrRightCompany>({
        'id': '0',
        'code': '',
        'color': 'transparent'
    })
    const [rightCompany, setRightCompany] = useState<LeftOrRightCompany>({
        'id': '0',
        'code': '',
        'color': 'transparent'
    })
    const [dataGraph, setDataGraph] = useState<DataGraph>({
        'company_data': null
      });
    const [isLoading, setLoading] = useState(true)
    const [FirsTimeRender, setRender] = useState(false)
    
    const getAllValuesToPage = async (id:string) => {
        const dataRequestCompany = await getAllValuesFromCompany(id);
        setCompanyData(dataRequestCompany?.data || null)
    }
    const getLeftAndRightValues = async (state:string) => {
        if(state === 'left'){
            const dataLeftCompany = await LeftAndRightValues();
            console.log('esquerda')
            setLeftCompany(dataLeftCompany?.data || {'id': '0','code': '','color': 'transparent'})
            getAllValuesToPage(dataLeftCompany?.data?.id || '0')
        }else if(state === 'right'){
            const dataRightCompany = await LeftAndRightValues();
            setRightCompany(dataRightCompany?.data || {'id': '0','code': '','color': 'transparent'})
            console.log('direita')
            getAllValuesToPage(dataRightCompany?.data?.id || '0')
        }else{
            console.log('todos')
            const dataLeftCompany = await LeftAndRightValues();
            const dataRightCompany = await LeftAndRightValues();
            setLeftCompany(dataLeftCompany?.data || {'id': '0','code': '','color': 'transparent'})
            getAllValuesToPage(dataLeftCompany?.data?.id || '0')
            setRightCompany(dataRightCompany?.data || {'id': '0','code': '','color': 'transparent'})
            getAllValuesToPage(dataRightCompany?.data?.id || '0')
        }
        
    }

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
        getAllValuesToPage(id)
        getLeftAndRightValues('both')
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
                <div className="flex w-full">
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => {}}>
                        <FontAwesomeIcon icon={faPlay} className="mx-[30px] rotate-180 text-[35px] text-white" onClick={() => getLeftAndRightValues('left')}/>
                        <div>
                            <div>
                                <img className="min-w-[30px] max-w-[130px] min-h-[35px] max-h-[30px] rounded-md bg-[#FFFBF5] p-[5px]" src={`images/logos/${leftCompany.code}.png`} />
                            </div>
                            <div  className="text-white">
                                {leftCompany.code}
                            </div>
                        </div>
                    </div>
                    <CompanyProfile 
                        dataCompany={dataCompany}
                        dataGraph={dataGraph}
                        isLoading={isLoading}
                        changingTimeCateg={fetchDatatoGraph}    
                         />
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => {}}>
                        <FontAwesomeIcon icon={faPlay} className="mx-[30px] text-[40px] text-white" onClick={() => getLeftAndRightValues('right')}/>
                        <div>
                            <div>
                                <img className="min-w-[30px] max-w-[130px] min-h-[35px] max-h-[30px] rounded-md bg-[#FFFBF5] p-[5px]" src={`images/logos/${rightCompany.code}.png`} />
                            </div>
                            <div className="text-white">
                                {rightCompany.code}
                            </div>
                        </div>
                    </div>  
                </div>
            </div>
        </div>
    )
}