import { useEffect, useState } from "react";
import CompanyProfile from "../../../components/CompanyProfile/CompanyProfile";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { DataGraph } from "../../../components/LineGraph/interfaces";
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
        fetchDatatoGraph('3Y', dataCompany?.code || '')
    }
    const getLeftAndRightValues = async (state:string) => {
        if(state === 'left'){
            setRightCompany({
                'id': id.toString(),
                'code': dataCompany?.code || '',
                'color': dataCompany?.color || ''
            })
            getAllValuesToPage(leftCompany?.id || '0')
            const dataLeftCompany = await LeftAndRightValues();
            setLeftCompany(dataLeftCompany?.data 
                || 
                {'id': '0',
                'code': '',
                'color': 'transparent'})
            
            
        }else if(state === 'right'){
            setLeftCompany({
                'id': id.toString(),
                'code': dataCompany?.code || '',
                'color': dataCompany?.color || ''
            })
            getAllValuesToPage(rightCompany?.id || '0')
            const newdataRightCompany = await LeftAndRightValues();
            setRightCompany(newdataRightCompany?.data || {'id': '0','code': '','color': 'transparent'})
        }else{
            const dataLeftCompany = await LeftAndRightValues();
            const dataRightCompany = await LeftAndRightValues();
            setLeftCompany(dataLeftCompany?.data || {'id': '0','code': '','color': 'transparent'})
            setRightCompany(dataRightCompany?.data || {'id': '0','code': '','color': 'transparent'})
        }
        
    }

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
    
    if(!FirsTimeRender){
        getAllValuesToPage(id)
        getLeftAndRightValues('both')
        setRender(true)
    }
    useEffect(() => {
        fetchDatatoGraph('3Y', dataCompany?.code || '')
    }, [dataCompany]);
    return (
        <div className="bg-background-color h-full">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
            </div>
            <div className="h-full w-full flex">
                <div className="w-[15%]">
                    <Sidebar />
                </div>
                {<div className="flex w-full items-center">
                    <div className="flex flex-col items-center cursor-pointer mx-[10px] w-[100px]" >
                        <FontAwesomeIcon icon={faPlay} className="mx-[10px] rotate-180 text-[35px] text-white" onClick={() => getLeftAndRightValues('left')}/>
                        <div className={`flex flex-col items-center rounded-[30px] pt-[4px]`}>
                            <div>
                                <img className="min-w-[30px] max-w-[80px] min-h-[25px] max-h-[30px] rounded-md bg-[#FFFBF5] p-[5px]" src={`/images/logos/${leftCompany.code}.png`}  />
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
                    <div className="flex flex-col items-center cursor-pointer mx-[10px] w-[100px]" >
                        <FontAwesomeIcon icon={faPlay} className=" text-[40px] text-white" onClick={() => getLeftAndRightValues('right')}/>
                        <div className={`flex flex-col items-center rounded-[30px] pt-[4px]`}>
                            <div>
                                <img className="min-w-[30px] max-w-[80px] min-h-[25px] max-h-[30px]  rounded-md bg-[#FFFBF5] p-[5px]" src={`/images/logos/${rightCompany.code}.png`} />
                            </div>
                            <div className="text-white">
                                {rightCompany.code}
                            </div>
                        </div>
                    </div>  
    </div>}
            </div>
        </div>
    )
}