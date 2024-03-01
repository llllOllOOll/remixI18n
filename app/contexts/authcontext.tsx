import { createContext, useContext } from "react";

const AuthContext = createContext({})

const AuthProvider = ({children}:{children:React.ReactNode})=>{
  const name = 'Seven - is coding again.'


  return(
    <AuthContext.Provider value={
      {name,
       greeting:'Hello' 
      }}>
        <>
      {children}
        </>
    </AuthContext.Provider>
  ) 
}

const useAuth = ()=>{
    const ctx = useContext(AuthContext)
    return ctx
}

export {AuthProvider, useAuth}
