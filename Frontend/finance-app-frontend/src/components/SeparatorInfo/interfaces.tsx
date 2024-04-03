interface NewsItem {
    Image: string;
    Description: string;
    Publisher: string;
    Date: string;

}
interface NewsData{
    [category : string] : NewsItem[]
}
interface SeparatorInfo{
    Data: NewsData | null;
}