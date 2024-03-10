import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faArrowTrendDown, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

interface WalletData{
    balance: number;
    wallet_balance: number;
    day_balance: number;
    total_balance: number;
}
interface WalletComponentprops {
    WalletData: WalletData
}

export default function WalletComponent (props:WalletComponentprops){
    const [eyeClosed, functionEyeClosed] = useState(true)
    
    const hiddenBalance = () => {
        functionEyeClosed(!eyeClosed)

    }

    return( 
        <div className="h-full flex justify-between w-full bg-secondary-background-color border-[1px] border-[white] px-[40px]">
            <button>
                <FontAwesomeIcon onClick={hiddenBalance} icon={eyeClosed ? faEye : faEyeSlash} className='text-primary-color text-[22px]'/>
            </button>
            <div className="flex flex-col text-[white] font-family justify-center h-full w-full pl-[30px]">
                <span className={`font-bold ${eyeClosed ? 'blur-none' : 'blur-md'}`}>{props.WalletData.balance} €</span>
                <span className="font-extralight" >Account Balance</span>
            </div>
            <div className="flex flex-col text-[white] font-family justify-center h-full w-full pl-[30px]">
                <span className={`font-bold ${eyeClosed ? 'blur-none' : 'blur-md'}`}>{props.WalletData.wallet_balance} €</span>
                <span className="font-extralight" >Wallet Balance</span>
            </div>
            <div className="  flex flex-col text-[white] font-family justify-center h-full w-full pl-[30px]">
                <span className={`${eyeClosed ? 'blur-none' : 'blur-md'} ${props.WalletData.day_balance > 0 ? 'text-[#52cc45]' : 'text-[red]' } font-bold`}>{props.WalletData.day_balance > 0 ? '+' : ''}{props.WalletData.day_balance} €</span>
                <span className="font-extralight" >Day +/-</span>
            </div>
            <div className="flex flex-col text-[white] font-family justify-center h-full w-full pl-[30px]">
                <span className={`font-bold ${eyeClosed ? 'blur-none' : 'blur-md'}`}> <FontAwesomeIcon icon={props.WalletData.day_balance > 0 ? faArrowTrendUp : faArrowTrendDown} className={`${props.WalletData.day_balance > 0 ? 'text-[#52cc45]' : 'text-[red]'} ${eyeClosed ? 'blur-none' : 'blur-md'}`}/> {props.WalletData.total_balance} € </span>
                <span className="font-extralight" >Total LP</span>
            </div>
        </div>
    )
}