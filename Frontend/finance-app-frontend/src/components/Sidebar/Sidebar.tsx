import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFire, faWallet, faMoneyBillTransfer, faGear, faDoorOpen, faStar } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar(){
    return (
        <div className="h-full w-64 bg-secondary-background-color text-primary-color flex flex-col justify-between">
            <div className='flex flex-col mt-[20px]'>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faHouse} /></div>
                    <div><span>Dashboard</span></div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faFire} /></div>
                    <div>Trending</div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faWallet} /></div>
                    <div>Wallet</div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faMoneyBillTransfer} /></div>
                    <div>Moviments</div>
                </div>
                <div className='w-full font-family flex text-[19px] font-medium pt-4 pb-4'>
                    <div><FontAwesomeIcon className='w-16 ml-3' icon={faStar} /></div>
                    <div>Wishlist</div>
                </div>
            </div>
            <div>
                <div>
                    <FontAwesomeIcon icon={faGear} />
                    <span>Settings</span>
                </div>
                <div>
                    <FontAwesomeIcon icon={faDoorOpen} />
                    <span>Log Out</span>
                </div>
            </div>
        </div>
    )
}