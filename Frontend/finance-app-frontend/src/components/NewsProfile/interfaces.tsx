export interface DataPublisher{
    name: string;
    url: string;
    logo_url: string;
}
export interface CompanyDataNews{
    code:string;
    id:string;
    color:string;
}
export interface DataNews{
    title: string;
    description: string;
    author: string;
    article_url: string;
    date_published: string;
    image_url: string;
    publisher: DataPublisher;
    Companies: CompanyDataNews[];
}
export interface NewsMainProps {
    data: DataNews;
    isLoading: boolean;

}