import axios, { AxiosResponse } from "axios";
import { CompanyInfo, LeftOrRightCompany } from "../../components/CompanyProfile/interfaces";
import { NewsCompany } from "../../components/TableNews/interfaces";

export const getAllValuesFromCompany = async (id: string) : Promise<AxiosResponse<CompanyInfo | null>> => {
    console.log('ENTROU EM GET ALL VALUES' + id)
    const link = 'http://127.0.0.1:8000/company/get/all/' + id;
    try {
        if(link){
            const response: AxiosResponse = await axios.get(link, {
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
export const LeftAndRightValues = async () : Promise<AxiosResponse<LeftOrRightCompany | null>> => {
    const link = 'http://127.0.0.1:8000/company/get/random';
    try {
        if(link){
            const response: AxiosResponse = await axios.get(link, {
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
export const getCompanyNews = async (id: string, initPage: number, endPage:number) : Promise<AxiosResponse<NewsCompany[] | null>> => {

    const link = 'http://127.0.0.1:8000/news/perCompany/get';
    try {
        if(link){
            const data = {
                    "id": id,
                    'initPage': initPage,
                    'endPage': endPage,
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
}