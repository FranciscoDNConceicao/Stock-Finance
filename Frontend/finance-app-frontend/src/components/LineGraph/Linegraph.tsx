import { LineChart } from "@mui/x-charts";
import Box from '@mui/material/Box';
import TimeChangedGraph from "./TimeChangedGraph";
import "../../style/index.css"

const datetime_action = [
    new Date(2023,3,8,9,47,45),
    new Date(2023,3,8,10,14,53),
    new Date(2023,3,8,11,47,45),
    new Date(2023,3,8,12,47,45),
    new Date(2023,3,8,13,47,45),
    new Date(2023,3,8,14,47,45),
    new Date(2023,3,8,15,47,45),
    new Date(2023,3,8,16,47,45),
    new Date(2023,3,8,17,47,45),
    new Date(2023,3,8,18,47,45),
    new Date(2023,3,8,19,47,45),
    new Date(2023,3,8,20,47,45),
    new Date(2023,3,8,21,47,45),
    new Date(2023,3,8,22,47,45),
    new Date(2023,3,8,23,47,45),
    new Date(2023,3,9,0,47,45),
    new Date(2023,3,9,1,47,45),
    new Date(2023,3,9,2,47,45),
    new Date(2023,3,9,3,47,45),
    new Date(2023,3,9,4,47,45),
    new Date(2023,3,9,5,47,45)
]
const y = [
    "20.45", "23.45", "22.45", "21.45", "17.45", "18.45", "15.45", "16.45", "13.45", "14.45",
    "13.45", "12.45", "11.45", "10.45", "13.45", "10.45", "24.45", "26.45", "5.45", "4.45", "3.45"
];
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


export default function LineGraph(){

    
    return (
       <Box className="h-full w-full bg-secondary-background-color border-[1px] border-[white]">
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
                        fill: "url('#gradient-graph')"
                    },
                    "& .MuiLineElement-root": {
                        stroke:"rgb(49, 70, 255) !important"
                    }
                }}
                xAxis={[{
                    data: datetime_action,
                    scaleType: 'time',
                    valueFormatter,
                    tickMinStep: 3600 * 1000 * 3
                  }]}

                series={[
                    { 
                        data: y.map(value => parseFloat(value)),
                        area: true,
                        showMark: false
                    }
                ]}
                width={800}
                height={500}
                
            />
            <TimeChangedGraph />
       </Box> 
    )
}