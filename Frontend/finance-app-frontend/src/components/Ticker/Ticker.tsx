import "../../style/index.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowTrendUp, faArrowTrendDown} from '@fortawesome/free-solid-svg-icons';
import { propsTicker } from "./Interfaces";


export default function TickerAction(props:propsTicker){
    if(!props.data){
        props.data = []
    }
    return (
            <div className={`fixed w-full overflow-hidden h-8 bg-black pl-[100%] z-[100] ${props.isFixed? `fixedElement fixed top-0` : `fixedElement`}`}>
                <div className={`inline-block h-8 leading-[2rem] whitespace-nowrap pr-[100%] box-content text-[white] ${props.isLoading? `` : `ticker`}`}>
                    {props.data.map((item, index) => (
                        <div key={index} className="inline-block px-4 text-[1rem] text-[white] font-semibold">
                            <FontAwesomeIcon 
                            icon={item.discount >= 0 ? faArrowTrendUp : faArrowTrendDown} 
                            className={item.discount >= 0 ? 'text-green-500' : 'text-red-500'}/>
                            <span className="pl-[10px] pr-[10px]">{item.code}</span>
                            <span>{item.discount}%</span>
                        </div>
                    ))}
                </div>
            </div>
    )
}