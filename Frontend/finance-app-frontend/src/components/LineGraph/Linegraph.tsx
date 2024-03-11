import { LineChart } from "@mui/x-charts";
import Box from '@mui/material/Box';
import TimeChangedGraph from "./Components/TimeChangedGraph";
import "../../style/index.css"
import React, { useState, useEffect  } from 'react';
import ChoosingCategory from "./Components/ChoosingCategory";

interface CompanyData {
    [timestamp: string]: string;
}
interface GraphData {
    [symbol: string]: {
        image: string;
        company_data: CompanyData;
    };
}
interface LineGraphProps {
    data: GraphData;
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
    const symbol:string = Object.keys(props.data)[index];
    console.log(symbol)
    const timestamps = Object.keys(props.data[symbol].company_data);
    const values = Object.values(props.data[symbol].company_data);

    // Formatting timestamps into Date objects
    const xAxisData = timestamps.map(timestamp => new Date(timestamp));
    // Parsing values to numbers
    const series = values.map(value => parseFloat(value));

    return (
       <Box className="h-full w-full bg-secondary-background-color ">
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
                        fill: "rgb(87, 100, 213) !important"
                    },
                    "& .MuiLineElement-root": {
                        stroke:"white !important"
                    }
                }}
                xAxis={[{
                    data: xAxisData,
                    scaleType: 'time',
                    valueFormatter,
                    tickMinStep: 3600 * 1000 * 3
                  }]}

                series={[
                    { 
                        data: series,
                        area: true,
                        showMark: false
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
       </Box> 
    )
}