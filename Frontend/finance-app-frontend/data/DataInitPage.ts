import billgatesImage from '../src/assets/images/NewsImages/bill-gates.png'
import bitCoinImage from '../src/assets/images/NewsImages/Bitcoin-newsa.png'
import coppeZambiaImage from '../src/assets/images/NewsImages/coppe-zambia-news.png'
import holyGrailImage from '../src/assets/images/NewsImages/holy-grail.png'
import keyWarmingImages from '../src/assets/images/NewsImages/key-warming-news.png'
import microsoftImages from '../src/assets/images/NewsImages/microsoft-news.png'
import northSeaImages from '../src/assets/images/NewsImages/north-sea-news.png'
import nvideaImages from '../src/assets/images/NewsImages/nvidea-news.png'
import pfizerImages from '../src/assets/images/NewsImages/pfizer-news.png'
import warreBuffetImages from '../src/assets/images/NewsImages/warrenBuffet-news.png'
import bankceoImages from '../src/assets/images/NewsImages/bank-ceo-Image.png'
import japanGlobalMarketsImage from '../src/assets/images/NewsImages/japan_global-markets.png'
import { GridRowsProp } from '@mui/x-data-grid'
import logoTSLA from "../src/assets/images/tesla-logo.svg"
import logoGOOGL from "../src/assets/images/Google-logo.svg"
import logoAPPL from "../src/assets/images/apple-logo.svg"
import logoAmazon from "../src/assets/images/amazonIcon.png"
import logoBCP from "../src/assets/images/BCPlogo.png"
import logoCisco from "../src/assets/images/ciscoLogo.png"
import logoDatadog from "../src/assets/images/dataDogInc.png"


export const news_data = {
    "This day": [
        {
            'Image': bitCoinImage,
            'Description': "Bitcoin rockets to record high as investors cheer ETFs; analysts say, 'it's just getting started'",
        },
        {
            'Image': nvideaImages,
            'Description': "Nvidia's terrible Friday gives traders a preview of what a momentum unwind would look like",
        },
        {
            'Image': pfizerImages,
            'Description': "Pfizer is betting on cancer drugs to turn business around after Covid decline - here's what to know",
        },
        {
            'Image': warreBuffetImages,
            'Description': "Warren Buffett calls margin of safety the cornerstone of investment success. Here's what it means",
        },
    ],
    'This week': [
        {
            'Image': japanGlobalMarketsImage ,
            'Description': "Japan's market is hitting record highs. What to know about the rally and how to play it Japan's market is hitting record highs."
        },
        {
            'Image': microsoftImages,
            'Description': "Microsoft says a Russian hacking group is still trying to crack into its systems"
        },
        {
            'Image': billgatesImage,
            'Description': "Bill Gates-backed startup confident it can unearth more buried treasure after a historic copper find"
        },
        {
            'Image': bankceoImages,
            'Description': "Bank CEO shrugs off U.S. war on 'woke' capital, says ESG investing is good for business"
        },
    ],
    'This month': [
        {
            'Image': northSeaImages,
            'Description': "The North Sea could become a 'central storage camp' for carbon waste. Not everyone likes the idea"
        },
        {
            'Image': keyWarmingImages,
            'Description': "World surpasses key warming threshold across an entire year for the first time"
        },
        {
            'Image': coppeZambiaImage,
            'Description': "Bill Gates- and Jeff Bezos-backed startup discovers large-scale copper deposit in Zambia"
        },
        {
            'Image': holyGrailImage,
            'Description': "'The holy grail': Startup backed by a Nobel laureate vying for a breakthrough on hydrogen storage"
        },
    ]
}

export const dataRowsTable:GridRowsProp = [
    {
        id: 1,
        icon:logoTSLA,
        stockName:"Tesla",
        code:"TSLA",
        unit: "USD",
        priceLast:"299.29",
        percentage:"0.39",
        priceHigh:"1503.62",
        lastUpdate: new Date(2024, 3, 17),
        
    },
    {
        id: 2,
        icon:logoGOOGL,
        stockName:"Alphabet Inc",
        code: "GOOGL",
        unit: "USD",
        priceLast: "141.24",
        percentage: "0.04",
        priceHigh: "153.78",
        lastUpdate: new Date(2024, 3, 17),
        
    },{
        id: 3,
        icon:logoAPPL,
        stockName:"Apple Inc",
        code: "AAPL",
        unit: "USD",
        priceLast: "172.56",
        percentage: "-0.06",
        priceHigh: "199,62",
        lastUpdate: new Date(2024, 3, 17),
        
    },{
        id: 4,
        icon:logoAmazon,
        stockName: "Amazon.com Inc",
        code: "AMZ",
        unit: "USD",
        priceLast: "160.50",
        percentage: "0.10",
        priceHigh: "180.14",
        lastUpdate: new Date(2024, 3, 17)
    },{
        id: 5,
        icon: logoBCP,
        stockName: "Banco Comercial Portugues SA",
        code: "BCP",
        unit: "EUR",
        priceLast: "0.2765",
        percentage: "0.00",
        priceHigh: "0.3343",
        lastUpdate: new Date(2024, 3, 17),
        
    },{
        id: 6,
        icon: logoCisco,
        stockName: "Cisco Systems",
        code: "CSCO",
        unit: "USD",
        priceLast: "48.93",
        percentage: "0.00",
        priceHigh: "58.18",
        lastUpdate: new Date(2024, 3, 17),
        
        
    },{
        id: 7,
        icon: logoDatadog,
        stockName: "Datadog Inc",
        code:  "DDOG",
        unit: "USD",
        priceLast: "120.43",
        percentage: "0.01",
        priceHigh: "138.61",
        lastUpdate: new Date(2024, 3, 17),
        
    }
]