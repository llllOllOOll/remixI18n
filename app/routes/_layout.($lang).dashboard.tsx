import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Locale, getDictionary } from "~/lib/dictionary";

export async function loader({params}:LoaderFunctionArgs){
 const {dashboard} = await getDictionary(params.lang as Locale)
 return json({dashboard}) 
}

export default function Dashboard(){
  const {dashboard}  = useLoaderData<typeof loader>() 
    return(
        <div>
            <h1>Dashboard</h1>
            <ul>
            {dashboard.menu.map((item, index) => (
                <li key={index}>{item.label}</li>
            ))}
            </ul>
            <div>
                <h2>Content</h2>
                <Outlet/>
            </div>
        </div>
    )
}