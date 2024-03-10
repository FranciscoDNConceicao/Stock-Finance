import { useState } from "react";

export default function TimeChangedGraph(){
    const [selectedTimeRange, setSelectedTimeRange] = useState('1D');

    const handleTimeRangeClickfunction = (timeRange:string) => {
        console.log(timeRange);
        setSelectedTimeRange(timeRange);
    };
    
    return(
        <div className="w-full relative top-[50px] right-[30px] z-20">
            <div className="flex justify-end">
                <div onClick={() => handleTimeRangeClickfunction('1D')} className={`mr-[2px] text-[11px] text-[white] ${selectedTimeRange === '1D' ? 'bg-secondary-color' : 'bg-background-color'} px-[8px] py-[2px] font-family rounded-[4px] border-[1px] border-[white]`} >
                    1D
                </div>
                <div onClick={() => handleTimeRangeClickfunction('1W')} className={`mr-[2px] text-[11px] text-[white] ${selectedTimeRange === '1W' ? 'bg-secondary-color' : 'bg-background-color'} px-[8px] py-[2px] font-family rounded-[4px] border-[1px] border-[white]`} >
                    1W
                </div>
                <div onClick={() => handleTimeRangeClickfunction('1M')} className={`mr-[2px] text-[11px] text-[white] ${selectedTimeRange === '1M' ? 'bg-secondary-color' : 'bg-background-color'} px-[8px] py-[2px] font-family rounded-[4px] border-[1px] border-[white]`}>
                    1M
                </div>
                <div onClick={() => handleTimeRangeClickfunction('1Y')} className={`mr-[2px] text-[11px] text-[white] ${selectedTimeRange === '1Y' ? 'bg-secondary-color' : 'bg-background-color'} px-[8px] py-[2px] font-family rounded-[4px] border-[1px] border-[white]`} >
                    1Y
                </div>
                <div onClick={() => handleTimeRangeClickfunction('3Y')} className={`mr-[2px] text-[11px] text-[white] ${selectedTimeRange === '3Y' ? 'bg-secondary-color' : 'bg-background-color'} px-[8px] py-[2px] font-family rounded-[4px] border-[1px] border-[white]`} >
                    3Y
                </div>
                <div onClick={() => handleTimeRangeClickfunction('MAX')} className={`mr-[2px] text-[11px] text-[white] ${selectedTimeRange === 'MAX' ? 'bg-secondary-color' : 'bg-background-color'} px-[8px] py-[2px] font-family rounded-[4px] border-[1px] border-[white]`} >
                    MAX
                </div>
            </div>
        </div>
    );
}