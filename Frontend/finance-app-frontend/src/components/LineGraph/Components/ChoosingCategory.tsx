import logoTSLA from "../../../assets/images/tesla-logo.svg"
import logoGOOGL from "../../../assets/images/Google-logo.svg"
import logoAPPL from "../../../assets/images/apple-logo.svg"
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from "react";


interface ChoosingCategoryProps {
    company:string
    changeStock: (parameter:string) => void
    image:string
}


export default function ChoosingCategory(props:ChoosingCategoryProps) {

    const buttonclicked = (parameterleftright:string) => {
        props.changeStock(parameterleftright)
    }
    return (
        <div className="w-full flex justify-center text-primary-color">
            <div className="flex items-center cursor-pointer" onClick={() => buttonclicked('left')}>
                <FontAwesomeIcon icon={faPlay} className="rotate-180 text-[16px]"/>
            </div>
            <div className="flex flex-col">
                <img src={props.image} alt="Company" className="h-[70px] w-[70px]"/>
                <span className="flex w-full justify-center font-bold">{props.company}</span>
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => buttonclicked('right')}>
                <FontAwesomeIcon icon={faPlay} className="text-[16px]"/>
            </div>
        </div>
    )
}