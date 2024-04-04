import logoimage from '../../assets/images/stock-finance-high-resolution-logo-reducted.png'
export default function Header(){
    return (
        <div className="h-full bg-secondary-background-color flex border-b-[1px] border-[#595959]">
            <div className="h-full ml-10 flex justify-center items-center"> 
                <img src={logoimage} alt="Logo Image for Finance Stock" className="h-5 "/>
            </div>
        </div>
    )
}