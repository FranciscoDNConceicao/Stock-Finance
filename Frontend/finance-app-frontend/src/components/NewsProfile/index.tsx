import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NewsMainProps } from "./interfaces";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import SeparatorInfo from "../SeparatorInfo/SeparatorInfo";
import { useNavigate } from "../../router";

export default function NewsProfile(props:NewsMainProps){
    const navigate = useNavigate()
    if(props.isLoading ){
        return (
            <div className=" w-full h-full flex justify-center py-[465px]">
                <div className="loader-full text-white relative top-[50%] "></div>
            </div>
        )
    }    
    
    const CompanyClicked = (id:string) => {
        navigate('/company/:id', { params: { id: id }, replace: true });
        window.scrollTo(0, 0);
    }
    return (
        <div className="text-white font-family m-[40px] text-[15px] bg-secondary-background-color p-[30px] rounded-lg border-[3px]">
            <div className="flex flex-col"> 
                <div className="flex overflow-x-auto">
                    {props.data.Companies.map((item, index) => (
                        
                        <div className={`px-[10px] py-[3px] m-[5px] cursor-pointer rounded-3xl ${index > 20 ? "hidden":""}  ` } style={{ backgroundColor: `#${item.color}`}} onClick={() => CompanyClicked(item.id)} key={item.id}>{item.code}</div>
                    ))}
                </div>
                <div>
                    <div className="text-[50px]">
                        {props.data.title}
                    </div>
                    <div className="flex font-extralight">
                        <div className="pr-[3px]">
                            {props.data.author}
                        </div> -
                        <div className="pl-[3px]">
                            {props.data.date_published}
                        </div>
                       
                    </div>
                    <a href={props.data.article_url}>
                            <FontAwesomeIcon icon={faLink} className="pr-[2px]"/>{props.data.article_url}
                    </a>
                </div>
                <div className="flex">
                    <div className="w-[50%]">
                        <div className="flex justify-center py-[40px]">
                            <img src={props.data.image_url} className="min-w-[200px] max-w-[900px] min-h-[300px] max-h-[400px]" />
                        </div>
                        <div className="text-[17px] flex justify-center font-light">
                            <div className="w-[80%]">
                                <div className="font-bold">More about:</div>
                                {props.data.description}
                            </div>
                            
                        </div>
                        <div className="flex my-[20px] justify-center">
                                <div className="flex flex-col border-[3px] rounded-lg h-fit">
                                    <div className="flex justify-center bg-white py-[5px]"><img className="min-w-[30px] max-w-[130px] min-h-[35px] max-h-[30px]" src={props.data.publisher.logo_url}/></div>
                                    <div className="flex justify-center">{props.data.publisher.name}</div>
                                    <a href={props.data.publisher.url} className="flex justify-center px-[15px] pb-[3px]">{props.data.publisher.url}</a>
                                </div>
                        </div>
                    </div>
                    <div className="py-[50px] px-[30px] w-[50%]">
                        <SeparatorInfo 
                        categorieSelected={Object.keys(props.newsRelated ? props.newsRelated : {' ': []})[0]}
                        Data={props.newsRelated? props.newsRelated : {'': []}}/>
                    </div>
                </div>
            </div>
        </div>
    )
}