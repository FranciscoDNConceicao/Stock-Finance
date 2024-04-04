import axios, { AxiosResponse } from "axios";
import { TickerActionInt } from "../../components/Ticker/Interfaces";


export const generateDataTicket = async () : Promise<AxiosResponse<TickerActionInt[] | null>> => {
    const link = 'http://127.0.0.1:8000/company/ticker';
    try {

        const response: AxiosResponse = await axios.get(link, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        return response.data

    }catch (error){
        console.error('Error during authentication:');
        return Promise.reject(error);
    }
    
};