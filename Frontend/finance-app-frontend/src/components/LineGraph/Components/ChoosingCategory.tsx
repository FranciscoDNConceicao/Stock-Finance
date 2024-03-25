
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
interface ChoosingCategoryProps {
    company:string
    changeStock: (parameter:string) => void
}

export default function ChoosingCategory(props:ChoosingCategoryProps) {

    const buttonclicked = (parameterleftright:string) => {
        props.changeStock(parameterleftright)
    }
    return (
        <div className="w-full flex justify-center text-primary-color py-[20px] bg-background-color">
            <div className="flex items-center cursor-pointer" onClick={() => buttonclicked('left')}>
                <FontAwesomeIcon icon={faPlay} className="rotate-180 text-[35px] text-white"/>
            </div>
            <div className="flex flex-col w-[160px]  mx-[60px] justify-center items-center">
                <img src={`images/logos/${props.company}.png`} alt="Company" className="mb-[10px] min-w-[30px] max-w-[180px] min-h-[50px] max-h-[70px] "/>
                <span className="flex w-full justify-center font-bold text-white">{props.company}</span>
            </div>
            <div className="flex items-center cursor-pointer text-white" onClick={() => buttonclicked('right')}>
                <FontAwesomeIcon icon={faPlay} className="text-[35px]"/>
            </div>
        </div>
    )
}