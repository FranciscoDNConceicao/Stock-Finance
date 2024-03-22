import { LineChart } from "@mui/x-charts";
import TimeChangedGraph from "./Components/TimeChangedGraph";
import "../../style/index.css"
import React, { useState, useEffect  } from 'react';
import ChoosingCategory from "./Components/ChoosingCategory";
import { CompanyData, DataGraph } from "../../pages";


interface LineGraphProps {
    data: DataGraph;
}
function isLastGreaterThanLastFour(numbers: number[]): boolean {
    
    const lastNumber = numbers[numbers.length - 1];
    console.log(lastNumber)
    const maxArray = Math.max(...numbers);

    console.log(maxArray)
    console.log(lastNumber)
    return lastNumber === maxArray;
}
const valueFormatter = (date: Date) =>
  date.getHours() === 0
    ? date.toLocaleDateString('pt-PT', {
        month: '2-digit',
        day: '2-digit',
      })
    : date.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: "2-digit",
      });


export default function LineGraph(props:LineGraphProps){
    const lenghtData = Object.keys(props.data).length

    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {setWidth(window.innerWidth);};
        const handleResizeHeight = () => {setHeight(window.innerHeight);};
        window.addEventListener('resize', handleResize);
        window.addEventListener('resize', handleResizeHeight);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    const [index, setIndex] = useState(0)

    const changeStockGraph = (side:string) => {
        if (side === 'left') {
            if ((index - 1) == -1){
                setIndex(lenghtData - 1);
            }else{
                setIndex(prevIndex => prevIndex - 1);
            }
        } else if (side === 'right') {
            if ((index + 1) == lenghtData){
                setIndex(0);
            }else{
                setIndex(prevIndex => prevIndex + 1);
            }
        }
    }
    console.log(props.data)
    const symbol:string = Object.keys(props.data)[index];
    console.log(symbol)
    const timestamps = Object.keys((props.data[symbol].company_data ?? {}) as CompanyData);
    const values = Object.values((props.data[symbol].company_data ?? {}) as CompanyData);

    const xAxisData = timestamps.map(timestamp => new Date(timestamp));
    const series = values.map(value => parseFloat(value));

    const minYaxis:number = Math.min(...series) - (Math.min(...series) * 0.1)
    const maxYaxis:number = Math.max(...series) + (Math.max(...series) * 0.1)

    const isDown:boolean = isLastGreaterThanLastFour(series)
    return (
       <div className=" bg-secondary-background-color ">
            <TimeChangedGraph />
            <LineChart
                sx={{
                    "& .MuiChartsAxis-bottom": {
                        stroke: "white",
                        fill: "white",
                        labelStyle: "Roboto",
                    },
                    "& .MuiChartsAxis-left": {
                        stroke: "white",
                        fill: "white",
                        fontFamily: "Roboto",
                    },
                    "& .MuiChartsAxis-line":{
                        stroke: "white",
                    },
                    "& .MuiChartsAxis-tick":{
                        stroke: "white",
                    },
                    "& .MuiChartsAxis-tickLabel":{
                        fill: "white !important",
                    },
                    "& .MuiAreaElement-root": {
                        fill: isDown ? "#232d23 !important" : "#4a2323 !important "
                    },
                    "& .MuiLineElement-root": {
                        stroke: isDown ? "green !important" : "red !important "
                    }
                }}
                xAxis={[{
                    data: xAxisData,
                    scaleType: 'time',
                    valueFormatter,
                    tickMinStep: 3600 * 1000 * 3
                    
                }]}
                yAxis={[{
                    min: minYaxis,
                    max: maxYaxis,
                }]}
                series={[
                    { 
                        data: series,
                        area: true,
                        showMark: false,
                        
                    }
                ]}
                width={width * 0.42}
                height={height * 0.57}
            />
            <ChoosingCategory 
                changeStock={changeStockGraph}
                company={symbol}
                image={props.data[symbol].image}
            />
       </div> 
    )
}