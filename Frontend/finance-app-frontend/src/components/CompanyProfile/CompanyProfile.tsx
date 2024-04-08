import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CompanyProfileProps } from "./interfaces";
import { faLocationDot, faMapLocationDot, faLink, faCalendarDays, faUsers, faTerminal, faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import LineGraph from "../LineGraph/Linegraph";



export default function CompanyProfile(props: CompanyProfileProps){



    return (
        <div className="flex w-full mt-[100px]">
            <div className="m-[100px] flex flex-col w-full bg-secondary-background-color">
                <div className="flex flex-col w-full justify-center relative mx-[auto] left-0 right-0 top-[-100px] text-center">
                    <div className="flex flex-col items-center ">
                        <div className="border-[9px] border-secondary-background-color rounded-3xl">
                            <img src={`/images/logos/${props.dataCompany.company}.png`}  alt="Company" className="px-[25px] py-[10px] bg-white rounded-3xl min-w-[30px] max-w-[600px] min-h-[70px] max-h-[200px] "></img>
                        </div>
                        <div className="flex flex-col text-white center text-[40px] font-family bolder justify-center ">
                            <div>{props.dataCompany.name}</div>
                            
                        </div>
                        <div className="text-[20px] font-family text-white bg-secondary-color rounded p-[5px]">{props.dataCompany.company}</div>
                    </div>
                </div>
                <div className="w-full flex">
                    <div className="w-[50%] p-[20px] text-white font-family border-r-[2px] border-[grey]">
                        <div className="text-[20px] font-bold">About {props.dataCompany.name} :</div>
                        <div className="font-extralight">Apple is among the largest companies in the world, with a broad portfolio of hardware and software products targeted at consumers and businesses. Apple's iPhone makes up a majority of the firm sales, and Apple's other products like Mac, iPad, and Watch are designed around the iPhone as the focal point of an expansive software ecosystem. Apple has progressively worked to add new applications, like streaming video, subscription bundles, and augmented reality. The firm designs its own software and semiconductors while working with subcontractors like Foxconn and TSMC to build its products and chips. Slightly less than half of Apple's sales come directly through its flagship stores, with a majority of sales coming indirectly through partnerships and distribution.</div>
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
                <div>
                    <LineGraph 
                        data={props.dataGraph}
                        isLoading={props.isLoading}
                        hasChoosingCategory={false} 
                        changingTimeCateg={props.changingTimeCateg} 
                        categProp={[{"code": props.dataCompany.company}]}
                        extendedVersion={true}
                        timeStampInitial={'3Y'}/>
                </div>
            </div>       
        </div>    
    )  
        
}