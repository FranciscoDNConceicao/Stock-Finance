import { GridRowsProp } from "@mui/x-data-grid";
import axios, { AxiosResponse } from "axios";

export const stockDataToDatagrid = async (init: number, end:number) : Promise<AxiosResponse<GridRowsProp | null>> => {

    const link = 'http://127.0.0.1:8000/stock/select/StockForDataGrid';
    try {
        if(link){

            const data = {
                    "initPage": init,
                    "endPage": end
                
                };
            const response: AxiosResponse = await axios.post(link, JSON.stringify(data), {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            return response;
        }else{
            console.log('Invalid parameter')
            return Promise.reject('Invalid parameter');
        }
    }catch (error){
        console.error('Error');
        return Promise.reject(error);
    }
    
};