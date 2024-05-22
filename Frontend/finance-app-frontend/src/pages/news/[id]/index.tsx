import { useEffect, useState } from "react";
import Header from "../../../components/Header/Header";
import NewsProfile from "../../../components/NewsProfile";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useParams } from "../../../router";
import { getAllValuesOfNews } from "../../../scripts/News/SeparatorInfoNews";
import { DataNews } from "../../../components/NewsProfile/interfaces";
import { POST } from "../../../scripts/axios";

export default function NewsPage(){
    const defaultObject:DataNews = {
        'Companies': [],
        'article_url': '',
        'author': '',
        'date_published': '',
        'description': '',
        'image_url': '',
        'publisher': {
            'logo_url': '',
            'name': '',
            'url': ''    
        },
        'title': ''
    }
    
    const [newsRelated, setNewsRelated] = useState<NewsData>({'Related News': []})
    const { id } = useParams('/news/:id')
    const [data, setData] = useState<DataNews>(defaultObject)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getAllData = async (id:string) => {
        const data = await getAllValuesOfNews(id)
        setData(data?.data || defaultObject)
                
        getNewsRelatedRequest()
    }
    const getNewsRelatedRequest = async() => {
        await getNewsRelated()
    }
    const getNewsRelated = async () => {
        
        if(data.Companies.length > 0){
            const dataRequestRelatedNews = {
                'id': id,
                'companies': data.Companies,
                'limit': 10,
                'label': "Related News"
            }
            
            const dataRelatedNews = await POST('http://127.0.0.1:8000/news/get/related/company', dataRequestRelatedNews) as NewsData 

            setNewsRelated(dataRelatedNews)
    
        }

    }
    useEffect(() => {
        setIsLoading(true);
        getAllData(id.toString());
        
        setIsLoading(false);
    }, [id]);
    
    useEffect(() => {
        setIsLoading(true);
        getNewsRelated();
        setIsLoading(false);
    }, [data.Companies]);
    return (
        <div className="bg-background-color h-full ">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
            </div>
            <div className="h-full w-full flex">
                <div className="w-[15%]">
                    <Sidebar />
                </div>
                <div className="w-full">
                    <NewsProfile 
                        data={data}
                        isLoading={isLoading}
                        newsRelated={newsRelated}
                    />
                </div>
            </div>
        </div>
    )
}