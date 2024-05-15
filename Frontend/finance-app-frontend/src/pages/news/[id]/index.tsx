import { useEffect, useState } from "react";
import Header from "../../../components/Header/Header";
import NewsProfile from "../../../components/NewsProfile";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useParams } from "../../../router";
import { getAllValuesOfNews } from "../../../scripts/News/SeparatorInfoNews";
import { DataNews } from "../../../components/NewsProfile/interfaces";

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
    const { id } = useParams('/news/:id')
    const [data, setData] = useState<DataNews>(defaultObject)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getAllData = async (id:string) => {
        const data = await getAllValuesOfNews(id)
        setData(data?.data || defaultObject)
    }

    useEffect( () => {
        setIsLoading(true)
        getAllData(id.toString())
        setIsLoading(false)
    }, []);

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
                    />
                </div>
            </div>
        </div>
    )
}