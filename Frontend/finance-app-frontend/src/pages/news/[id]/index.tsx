import Header from "../../../components/Header/Header";
import NewsProfile from "../../../components/NewsProfile";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useParams } from "../../../router";

export default function NewsPage(){

    const { id } = useParams('/news/:id')


    return (
        <div className="bg-background-color h-full ">
            <div className="h-16 shadow-[rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;]">
                <Header />
            </div>
            <div className="h-full w-full flex">
                <div className="w-[15%]">
                    <Sidebar />
                </div>
                <div className="">
                    <NewsProfile 
                        data={{
                            'title': 'Earnings Growth & Price Strength Make Agilent Technologies (A) a Stock to Watch',
                            'description':'Stocks dipped modestly following a report indicating a marginal downward revision in the U.S. economic growth rate for the last quarter of the year. This slowdown was attributed to a revision in inventory figures, despite evidence of robust household spending and investment. The announcement precedes the release of the Federal Reserves preferred inflation measure, expected on Thursday morning. Despite a generally downward trend on Wednesday, with all major equity indices in the red, the real estate sector emerged as a notable exception, outperforming other sectors.UnitedHealth Group Inc. (NYSE:UNH) was the major laggard among mega-cap stocks, dipping over 4%, after the Department of Justice initiated an antitrust investigation on the Americas largest health insurer. Meanwhile, both the U.S. dollar and Treasury yields remained relatively stable.Bitcoin (CRYPTO: BTC) stood out as the markets brightest spot, gaining over 7% for the day to break ...Full story available on Benzinga.com',
                            'author':'Zacks Equity Research',
                            'article_url':'https://www.zacks.com/stock/news/2247880/earnings-growth-price-strength-make-agilent-technologies-a-a-stock-to-watch',
                            'date_published':'2024-03-29',
                            'image_url': 'https://cdn.benzinga.com/files/images/story/2024/nyse-ai_0.png?width=1200&height=800&fit=crop',
                            'publisher': {
                                'name': 'Benzinga',
                                'url': 'https://www.benzinga.com/',
                                'logo_url': 'https://s3.polygon.io/public/assets/news/logos/benzinga.svg',
                                'favicon_url': 'https://s3.polygon.io/public/assets/news/favicons/benzinga.ico',
                            },
                            'Companies': [
                                {
                                    'code': 'AAPL',
                                    'id': '3'
                                },
                                {
                                    'code': 'AMZ',
                                    'id': '3'
                                },
                                {
                                    'code': 'GOOGL',
                                    'id': '3'
                                }
                            ]
                        }
                        }
                    />
                </div>
            </div>
        </div>
    )
}