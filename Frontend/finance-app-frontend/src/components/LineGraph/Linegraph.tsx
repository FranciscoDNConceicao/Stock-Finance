import { LineChart } from "@mui/x-charts";
import TimeChangedGraph from "./Components/TimeChangedGraph";
import "../../style/index.css"
import  { useState, useEffect  } from 'react';
import ChoosingCategory from "./Components/ChoosingCategory";
import { CompanyData, LineGraphProps, StockImage } from "./interfaces";

function isLastGreaterThanLastFour(numbers: number[]): boolean {
    if (numbers.length < 5) return false;

    return numbers[numbers.length - 1] > numbers[0];
}
const valueFormatter = (date: Date) =>
  date.getHours() === 0
    ? date.toLocaleDateString('pt-PT', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',

      })
    : date.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: "2-digit",
      });


export default function LineGraph(props:LineGraphProps){
    
    const [selectedCateg, setSelectCateg] = useState<StockImage>(props.categProp? props.categProp[0] : {'code': '', id: '0' })

    let lenghtData = props.categProp?.length 

    const [index, setIndex] = useState(1)
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [timestampSelected, setTimeStamp] = useState(props.timeStampInitial)

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
    

    const changeStockGraph = (side:string) => {
        if (!lenghtData){
            lenghtData = 0
        }
        if (lenghtData === 0){
            setIndex(0)
        }
        else if (side === 'left') {
            if (index === 0) {
              setIndex(lenghtData - 1);
            } else {
              setIndex(index - 1);
            }
          } else if (side === 'right') {
            if (index === lenghtData - 1) {
              setIndex(0);
            } else {
              setIndex(index + 1);
            }
          }
        setSelectCateg(props.categProp && props.categProp[index] ? props.categProp[index] : { code: '', id: '0' });
        props.changingTimeCateg(timestampSelected, selectedCateg.code)
    };

    const changingTime = (timestamp: string) => {
        setTimeStamp(timestamp)
        props.changingTimeCateg(timestamp, selectedCateg.code)
    }
    
    const timestamps = Object.keys((props.data.company_data ?? {}) as CompanyData);
    const values = Object.values((props.data.company_data ?? {}) as CompanyData);

    const xAxisData = timestamps.map(timestamp => new Date(timestamp));
    const series = values.map(value => parseFloat(value));

    const minYaxis:number = Math.min(...series) - (Math.min(...series) * 0.01)
    const maxYaxis:number = Math.max(...series) + (Math.max(...series) * 0.01)

    const isDown:boolean = isLastGreaterThanLastFour(series)

    return (
       <div className=" bg-secondary-background-color ">
            {props.isLoading && <div className="loader"></div>}
            <TimeChangedGraph 
            changingTimeCateg={changingTime}
            initialTimeStamp={props.timeStampInitial}/>

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
                width={props.extendedVersion? width * 0.75 : (width * 0.42)}
                height={height * 0.50}
                
            >
               
            </LineChart>
            {props.hasChoosingCategory && <ChoosingCategory 
                changeStock={changeStockGraph}
                company={selectedCateg.code}
                idCompany={selectedCateg.id}
            />}
            
       </div> 
    )
}