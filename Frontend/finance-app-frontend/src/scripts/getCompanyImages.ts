import axios, { AxiosResponse } from "axios";

export const generateCompanyLogos = async (code: string) : Promise<AxiosResponse<string>> => {

    const link = 'http://127.0.0.1:8000/company/logo/get/';
    try {
        if(link){
            const data = {
                    "stockCode": code,
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
        console.error('Error during authentication:');
        return Promise.reject(error);
    }
    
};