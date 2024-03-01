import { LoaderFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Locale, getDictionary } from "~/lib/dictionary"

export async function loader({params}:LoaderFunctionArgs){
 const {dashboard:{home}} = await getDictionary(params.lang as Locale)
 return json({home}) 
}


export default function Home(){
    const {home} = useLoaderData<typeof loader>()
    return <h1>{home.title}</h1>
}