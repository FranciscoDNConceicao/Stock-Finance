
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from '../../../router';

interface ChoosingCategoryProps {
    company:string
    idCompany:string
    changeStock: (parameter:string) => void
}

export default function ChoosingCategory(props:ChoosingCategoryProps) {
    const navigate = useNavigate()
    const buttonclicked = (parameterleftright:string) => {
        props.changeStock(parameterleftright)
    }

    console.log(props.idCompany)
    const companyclicked = () => {
        console.log(props.idCompany)
        navigate('/company/:id', { params: { id: props.idCompany.toString() } });
    }
    return (
        <div className="w-full flex cursor-pointer justify-center text-primary-color py-[20px] px-[40px]">
            <div className="flex items-center cursor-pointer" onClick={() => buttonclicked('left')}>
                <FontAwesomeIcon icon={faPlay} className="rotate-180 text-[35px] text-white"/>
            </div>
            <div className="flex flex-col w-full mx-[60px] justify-center items-center cursor-pointer" onClick={() => companyclicked()}>
                <img src={`images/logos/${props.company}.png`} alt="Company" className="mb-[10px] min-w-[30px] max-w-[600px] min-h-[70px] max-h-[70px] bg-[#FFFBF5] p-[10px] rounded-md" />
                <span className="flex w-full justify-center font-bold text-white">{props.company}</span>
            </div>
            <div className=" flex cursor-pointer items-center cursor-pointer text-white" onClick={() => buttonclicked('right')}>
                <FontAwesomeIcon icon={faPlay} className="text-[35px]"/>
            </div>
        </div>
    )
}