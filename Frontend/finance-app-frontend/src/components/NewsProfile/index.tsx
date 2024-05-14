import { NewsMainProps } from "./interfaces";

export default function NewsProfile(props:NewsMainProps){
    return (
        <div className="text-white font-family">
            <div>
                <div>
                    {props.data.Companies.map((item, index) => (
                        <div key={item.id}>{item.code}</div>
                    ))}
                </div>
                <div>
                    <h1>{props.data.title}</h1>
                </div>
                <div>
                    
                </div>
            </div>
        </div>
    )
}