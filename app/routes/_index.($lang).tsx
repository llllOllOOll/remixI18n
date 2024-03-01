import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, json, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({params}:LoaderFunctionArgs){
 return json({lang:params.lang}) 
}


export default function Index() {
  const {lang} = useLoaderData<typeof loader>()
  return (
    <>
   <h1>RemixI18N</h1> 
   <Link to={`/${lang}/dashboard/home`}>Dashboard</Link> 
   </>
  );
}
