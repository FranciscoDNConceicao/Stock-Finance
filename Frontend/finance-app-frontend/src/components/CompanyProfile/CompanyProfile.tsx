import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CompanyProfileProps } from "./interfaces";
import { faLocationDot, faMapLocationDot, faLink, faCalendarDays, faUsers, faTerminal, faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import LineGraph from "../LineGraph/Linegraph";
import TableNews from "../TableNews/TableNews";




export default function CompanyProfile(props: CompanyProfileProps){

    if (!props.dataCompany){
        return(
            <h1>404 NOT FOUND</h1>
        )
    }
    const ChangePageNewsStock = async (init: number, end:number) => { 
        await props.changePageNewsStock(init, end, false);
    }
        
    const color = "#" + props.dataCompany.color
    if(props.isLoading){
        return(
            <div className=" w-full h-full m-auto">
                <div className="loader-full text-white relative top-[50%] "></div>
            </div>
        )

    }
    return (
        <div className="flex w-full mt-[100px] ml-[50px] mr-[100px]">
            {props.isLoading && <div className="loader"></div>}
            <div className={`my-[100px] flex flex-col w-full bg-secondary-background-color `} style={{ border: `5px solid ${color}`}}>
                <div className="flex flex-col w-full justify-center relative mx-[auto] left-0 right-0 top-[-100px] text-center">
                    <div className="flex flex-col items-center ">
                        <div className={`rounded-[13px]`} style={{ border: `5px solid ${color}`}}>
                            <img src={`/images/logos/${props.dataCompany.code}.png`}  alt="Company" className="px-[25px] py-[10px] bg-white rounded-[10px] min-w-[30px] max-w-[1000px] h-[150px] "></img>
                        </div>
                        <div className="flex flex-col text-white center text-[40px] font-family bolder justify-center ">
                            <div>{props.dataCompany.name}</div>
                            
                        </div>
                        <div className={`text-[20px] font-family text-white rounded p-[5px]`} style={{ backgroundColor: `${color}`}}>{props.dataCompany.code}</div>
                    </div>
                </div>
                <div className="mb-[40px]">
                    <LineGraph 
                        data={props.dataGraph}
                        isLoading={false}
                        hasChoosingCategory={false} 
                        changingTimeCateg={props.changingTimeCateg} 
                        categProp={[{"code": props.dataCompany.code}]}
                        extendedVersion={true}
                        timeStampInitial={'3Y'}/>
                </div>
                <div className="w-full flex">
                    <div className="w-[50%] p-[20px] text-white font-family border-r-[2px] border-[grey]">
                        <div className="text-[20px] font-bold">About {props.dataCompany.name} :</div>
                        <div className="font-extralight">{props.dataCompany.description}</div>
                    </div>
                    <div className="w-[50%] p-[20px] text-white font-family">
                        <div className="flex">
                            <div className="text-[18px] pb-[3px] pr-[4px]"><FontAwesomeIcon icon={faLocationDot} className="pr-[2px]"/>Locate:</div>
                            <div className="text-[18px] font-extralight">{props.dataCompany.locate}</div>
                        </div>
                        <div className="flex">
                            <div className="text-[18px] pb-[3px] pr-[4px]"><FontAwesomeIcon icon={faMapLocationDot} className="pr-[2px]"/>Address:</div>
                            <div className="text-[18px] font-extralight">{props.dataCompany.address}</div>
                        </div>
                        <div className="flex">
                            <div className="text-[18px] pb-[3px] pr-[4px]"><FontAwesomeIcon icon={faLink} className="pr-[2px]"/>URL: </div>
                            <div className="text-[18px] font-extralight"><a href={`${props.dataCompany.URL}`} target="blank">{props.dataCompany.URL}</a></div>
                        </div>
                        <div className="flex">
                            <div className="text-[18px] pb-[3px] pr-[4px]"><FontAwesomeIcon icon={faCalendarDays} className="pr-[2px]"/>List Date:</div>
                            <div className="text-[18px] font-extralight">{props.dataCompany.dateList}</div>
                        </div>
                        <div className="flex">
                            <div className="text-[18px] pb-[3px] pr-[4px]"><FontAwesomeIcon icon={faUsers} className="pr-[2px]"/>Number of Employees:</div>
                            <div className="text-[18px] font-extralight">{props.dataCompany.num_employees} employees</div>
                        </div>
                        <div className="flex">
                            <div className="text-[18px] pb-[3px] pr-[4px]"><FontAwesomeIcon icon={faTerminal} className="pr-[2px]"/>SIC Code/Description:</div>
                            <div className="text-[18px] font-extralight">{props.dataCompany.sicCode}</div>
                        </div>
                        <div className="flex">
                            <div className="text-[18px] pb-[3px] pr-[4px]"><FontAwesomeIcon icon={faArrowTrendUp}  className="pr-[2px]"/>Max:</div>
                            <div className="text-[18px] font-extralight">{props.dataCompany.highMax}</div>
                        </div>
                    </div>
                </div>
                <div className="w-full"> 
                    <TableNews 
                        dataTable={props.dataCompanyNews}
                        color={props.dataCompany.color}
                        pageChange={ChangePageNewsStock}
                        page={props.page}
                        rowperPage={10}
                    />
                </div>
            </div>       

        </div>    
    )  
        
}