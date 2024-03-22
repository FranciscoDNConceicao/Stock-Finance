import axios, { Axios, AxiosResponse } from "axios";

interface CompanyData {
    [timestamp: string]: string;
}
export const generateDataStockTime = async (code: string) : Promise<AxiosResponse<CompanyData | null>> => {

    const link = 'http://127.0.0.1:8000/stock/get/';
    try {
        if(link){
            const data = {
                    "stockCode": code,
                    "time": "1D"
                };
            const response: AxiosResponse = await axios.post(link, JSON.stringify(data), {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            console.log(response.data)
            return response;
        }else{
            console.log('Invalid parameter')
            return Promise.reject('Invalid parameter');
        }

    }catch (error){
        console.error('Error during authentication:');
        return Promise.reject(error);
    }
    
};