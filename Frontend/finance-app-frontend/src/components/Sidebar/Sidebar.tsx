import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFire, faWallet, faMoneyBillTransfer, faGear, faRightFromBracket, faStar } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar(){
    return (
        <div className="h-full w-64 bg-secondary-background-color text-primary-color flex flex-col justify-between border-r-[1px] border-[#595959]">
            <div className='"h-full flex flex-col mt-[20px]'>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4 hover:font-bold'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faHouse} /></div>
                    <div><span>Dashboard</span></div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4 hover:font-bold'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faFire} /></div>
                    <div>Trending</div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4 hover:font-bold'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faWallet} /></div>
                    <div>Wallet</div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4 hover:font-bold'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faMoneyBillTransfer} /></div>
                    <div>Moviments</div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4 hover:font-bold'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faStar} /></div>
                    <div>Wishlist</div>
                </div>
            </div>
            
            <div className='flex flex-col'>
                <hr className="h-px my-8 bg-[#595959]-200 ml-[30px] mr-[30px]"></hr>
                <div className='w-full items-center font-family flex text-[19px] font-medium pt-2 pb-4 hover:font-bold'>
                    <FontAwesomeIcon className='w-16 ml-3' icon={faGear} />
                    <span>Settings</span>
                </div>
                <div className='w-full items-center font-family flex text-[19px] font-medium pt-4 pb-4 pb-[40px] hover:font-bold'>
                    <FontAwesomeIcon className='w-16 ml-3' icon={faRightFromBracket} />
                    <span>Log Out</span>
                </div>
            </div>
        </div>
    )
}