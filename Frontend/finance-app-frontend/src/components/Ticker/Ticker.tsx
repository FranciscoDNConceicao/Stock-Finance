import "../../style/index.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowTrendUp, faArrowTrendDown} from '@fortawesome/free-solid-svg-icons';

const dictExamples = [
    { 'code': "TSLA", 'discount': -2.4 },
    { 'code': "GOOGL", 'discount': 4.6 },
    { 'code': "AMZ", 'discount': 1.4 },
    { 'code': "BCP", 'discount': 0.4 },
    { 'code': "CSCO", 'discount': 3.4 },
    { 'code': "COST", 'discount': 0.4 },
    { 'code': "DDOG", 'discount': -3.4 },
    { 'code': "INTC", 'discount': -5.4 },
    { 'code': "MSFT", 'discount': 5.9 },
    { 'code': "NVDA", 'discount': -2.4},
    { 'code': "SON", 'discount': -2.4},
    { 'code': "WFC", 'discount': -2.4 },
    { 'code': "AAPL", 'discount': 2.3 },
    { 'code': "NFLX", 'discount': 1.8 },
    { 'code': "CRM", 'discount': -0.7 },
    { 'code': "PG", 'discount': -1.9 },
    { 'code': "V", 'discount': 4.1 },
    { 'code': "KO", 'discount': -0.3 },
    { 'code': "PEP", 'discount': 0.6 },
    { 'code': "JNJ", 'discount': -1.5 },
    { 'code': "BA", 'discount': -3.8 },
    { 'code': "DIS", 'discount': 2.9 },
    { 'code': "GS", 'discount': -2.1 },
    { 'code': "JPM", 'discount': -1.2 },
    { 'code': "HD", 'discount': 3.6 }
]

interface propsTicker {
    isFixed:Boolean
}
export default function TickerAction(props:propsTicker){
    
    return (
                <div className={`fixed w-full overflow-hidden h-8 bg-black pl-[100%] z-[100] ${props.isFixed? `fixedElement fixed top-0` : `fixedElement`}`}>
                <div className="inline-block h-8 leading-[2rem] whitespace-nowrap pr-[100%] box-content text-[white] ticker">
                    {dictExamples.map((item, index) => (
                        <div key={index} className="inline-block px-4 text-[1rem] text-[white]">
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