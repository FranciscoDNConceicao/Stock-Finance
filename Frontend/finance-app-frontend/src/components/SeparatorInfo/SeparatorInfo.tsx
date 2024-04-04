import { useState } from "react";


export default function SeparatorInfo (props:SeparatorInfo) {
    if(!props.Data){
        props.Data = {
            'This day': [],
            'This week': [],
            'This year': []
        }
    }
    const categories = Object.keys(props.Data);
    const [categorieActive, changeCategoryActive] = useState(categories[0])
    const [NewsSelected, changeNewsSelected] = useState(props.Data[categorieActive])
    const CategoryClicked = (category:string) => {
        if(!props.Data){
            changeCategoryActive(category)
            changeNewsSelected([])
        }else{
            changeCategoryActive(category)
            changeNewsSelected(props.Data[category])
        }
        
    }

    return (
        <div className="w-full h-full border-[1px] border-[white] px-[50px] py-[20px]">
            <div className="flex">
                {categories.map((category, index) => (
                    <div
                        onClick={() => CategoryClicked(category)}
                        key={index}
                        className={`text-white font-family text-[17px] cursor-pointer text-bold pr-[10px] px-[10px] py-[2px] mr-[3px] ${
                            category === categorieActive
                                ? "bg-background-color border-x-[1px] border-t-[1px] border-[white] relative z-20 top-[1px]"
                                : "bg-secondary-background-color border-x-[1px] border-t-[1px] border-[white]"
                        }`}
                    >
                        <h2>{category}</h2>
                    </div>
                ))}
            </div>
            <div className="bg-background-color border-[1px] border-[white]">
                {NewsSelected.map((item, index) => (
                    <div className="flex flex-col" key={index} >
                        <div className="p-[10px] flex cursor-pointer hover:bg-secondary-background-color">
                            <div className="h-[60px] w-[100px]">
                                <img src={item.Image} alt="News Image" className="h-[55px] w-[100px]" />
                            </div>
                            <div className="h-full px-[10px] w-full overflow-hidden">
                                <div className="font-family overflow-hidden text-[16px] text-[white] font-thin">{item.Description}</div>
                                <div className="w-full flex justify-between text-[#bdbdbd] font-family overflow-hidden text-[13px] text-[white] font-thin">
                                    <div>{item.Publisher}</div>
                                    <div>{item.Date}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}