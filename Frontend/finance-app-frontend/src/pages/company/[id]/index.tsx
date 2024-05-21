import { useEffect, useState } from "react";
import CompanyProfile from "../../../components/CompanyProfile/CompanyProfile";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { DataGraph } from "../../../components/LineGraph/interfaces";
import { generateDataStockTime } from "../../../scripts/Stocks/DataStockTime";
import { CompanyInfo, LeftOrRightCompany } from "../../../components/CompanyProfile/interfaces";
import { LeftAndRightValues, getAllValuesFromCompany, getCompanyNews } from "../../../scripts/Company/getCompanyValues";
import { useParams } from "../../../router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { NewsCompanyTable } from "../../../components/TableNews/interfaces";


    

export default  function CompanyPage(){
        

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
      
    const [dataCompanyNews, setDataCompanyNews] = useState<NewsCompanyTable>({'data': [], 'num_Rows': 0})
    const [isLoading, setLoading] = useState(false)
    const [FirsTimeRender, setRender] = useState(false)

    const getAllValuesToPage = async (id:string) => {
        const dataRequestCompany = await getAllValuesFromCompany(id);

        setCompanyData(dataRequestCompany?.data || null)
        if(dataCompany?.code){
            fetchDatatoGraph('3Y', dataCompany?.code || '')
        }
    }
    const getLeftAndRightValues = async (state:string) => {
        setLoading(true)
        if(state === 'left'){
            
            setRightCompany({
                'id': id.toString(),
                'code': dataCompany?.code || '',
                'color': dataCompany?.color || ''
            })
            getAllValuesToPage(leftCompany.id)
            const dataLeftCompany = await LeftAndRightValues();
            setLeftCompany(dataLeftCompany?.data 
                || 
                {'id': '0',
                'code': '',
                'color': 'transparent'})
            
        }else if(state === 'right'){
            console.log("Enter")

            setLeftCompany({
                'id': id.toString(),
                'code': dataCompany?.code || '',
                'color': dataCompany?.color || ''
            })
            console.log(rightCompany.id)
            getAllValuesToPage(rightCompany.id)
            const newdataRightCompany = await LeftAndRightValues();
            
            setRightCompany(newdataRightCompany?.data || {'id': '0','code': '','color': 'transparent'})

        }else{

            const dataLeftCompany = await LeftAndRightValues();
            const dataRightCompany = await LeftAndRightValues();
            setLeftCompany(dataLeftCompany?.data || {'id': '0','code': '','color': 'transparent'})
            setRightCompany(dataRightCompany?.data || {'id': '0','code': '','color': 'transparent'})

        }
        setLoading(false)
        
    }

    const fetchDatatoGraph = async (timestamp:string, code:string) => {

        setDataGraph({
            'company_data': null,
          });
        const Response = await generateDataStockTime(code, timestamp);
        setDataGraph({
            'company_data': Response?.data || null
        });

      };
    
    const changePageNewsStock = async (init:number, end:number, firstRender:boolean) => {
            if(firstRender){
                const data = await getCompanyNews(id || '', init, end)
                setDataCompanyNews(data?.data || {'data': [], 'num_Rows': 0})
            }else{
                const data = await getCompanyNews(id || '', init, end)
                setDataCompanyNews(data?.data || {'data': [], 'num_Rows': 0})                
            }
        
    }

    if(!FirsTimeRender){
        getAllValuesToPage(id)
        getLeftAndRightValues('both')
        setRender(true)
    }
    useEffect(() => {
        if(dataCompany?.code){
            fetchDatatoGraph('3Y', dataCompany?.code || '')
            changePageNewsStock(0, 10, true)
        }
          
    }, [dataCompany]);
    return (
        <div className="bg-background-color h-full ">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
            </div>
            <div className="h-full w-full flex">
                <div className="w-[15%]">
                    <Sidebar />
                </div>
                <div className="flex w-full items-center ml-[10px]">
                    <CompanyProfile
                        dataCompany={dataCompany}
                        dataGraph={dataGraph}
                        isLoading={isLoading}
                        changingTimeCateg={fetchDatatoGraph}  
                        changePageNewsStock={changePageNewsStock}
                        page={0}
                        dataCompanyNews={dataCompanyNews}
                         />
                    <div className={`fixed top-[] left-[95%] h-full ${isLoading? "hidden": ""}`} >
                        <div className="">
                            <div className="flex flex-col items-center cursor-pointer mx-[10px] w-[100px]" onClick={() => getLeftAndRightValues('left')} >
                                <div className={`flex flex-col items-center rounded-[30px] pt-[4px]`}  >
                                    <div>
                                        <img className="min-w-[30px] max-w-[80px] min-h-[25px] max-h-[30px] rounded-md bg-[#FFFBF5] p-[5px]" src={`/images/logos/${leftCompany.code}.png`}  />
                                    </div>
                                    <div  className="text-white">
                                        {leftCompany.code}
                                    </div>
                                </div>
                                <FontAwesomeIcon icon={faPlay} className="mx-[10px] rotate-[270deg] text-[40px] text-white"/>
                            </div>
                            <div className="flex flex-col items-center cursor-pointer mx-[10px] w-[100px]"  onClick={() => getLeftAndRightValues('right')}>
                                <FontAwesomeIcon icon={faPlay} className="rotate-90 text-[40px] text-white"/>
                                <div className={`flex flex-col items-center rounded-[30px] pt-[4px]`}>
                                    <div>
                                        <img className="min-w-[30px] max-w-[80px] min-h-[25px] max-h-[30px]  rounded-md bg-[#FFFBF5] p-[5px]" src={`/images/logos/${rightCompany.code}.png`} />
                                    </div>
                                    <div className="text-white">
                                        {rightCompany.code}
                                    </div>
                                </div>
                            </div> 
                        </div>
                        </div>
                    </div> 
         
                </div>
                
        </div>
    )
}