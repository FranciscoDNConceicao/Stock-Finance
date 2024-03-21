import axios, { AxiosResponse } from "axios";

interface CompanyData {
    [timestamp: string]: string;
}
export const generateDataStockTime = async (code: string): Promise<CompanyData> => {

    const link = '127.0.0.1:8000/stock/get/stock/get/';

    try {
        if(link){
            const data = {
                    "stockCode": code,
                    "time": "1D"
                };
            console.log('COMECOUUU')
            const response: AxiosResponse = await axios.post(link, JSON.stringify(data), {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            console.log('ENTROUUUUU')
            console.log(response)
            return response
            
        }else{
            console.log('Invalid parameter')
        }

    }catch (error){
        console.error('Error during authentication:');
    }
};