import axios, { AxiosResponse } from "axios";
import { CompanyData, StockImage } from "../../components/LineGraph/interfaces";


export const generateDataStockTime = async (code: string, datetime:string) : Promise<AxiosResponse<CompanyData | null>> => {

    const link = 'http://127.0.0.1:8000/stock/get/';
    try {
        if(link){
            const data = {
                    "stockCode": code,
                    "time": datetime
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

export const generateCodesGraph = async () : Promise<AxiosResponse<StockImage[] | null>> => {

    const link = 'http://127.0.0.1:8000/company/random/';
    try {
        if(link){

            const data = {
                "limit": 20,
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
