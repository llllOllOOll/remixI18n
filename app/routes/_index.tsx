/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { MetaFunction } from "@remix-run/node";
import { useAuth } from "~/contexts/authcontext";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  //@ts-expect-error
  const {greeting} = useAuth() 
  return (
    <>
   <h1>Test</h1> 
   <h2>{greeting}</h2>
   </>
  );
}
