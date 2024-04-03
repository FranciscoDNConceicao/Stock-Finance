import axios, { Axios, AxiosResponse } from "axios";
import { CompanyData, StockImage } from "../../components/LineGraph/interfaces";


export const generateNewsSeparateInfo = async () : Promise<AxiosResponse<NewsData | null>> => {

    const link = 'http://127.0.0.1:8000/news/get/essential/SeparatedDate';
    try {
        if(link){
            const data = {
                    "limit": 6
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