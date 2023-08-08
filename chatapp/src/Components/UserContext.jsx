import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}){
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    useEffect(()=>{
        const token = localStorage.getItem('jwtToken');

        if(token){
            axios.get('/profile',{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }).then(response =>{
                setId(response.data.userId);
                setUsername(response.data.username);
                console.log(response.data.userId);
                console.log(response.data.username);
            }).catch(error =>{
                error.status(401).json('where is my token')
            })
        }
        },[])
    return(
        <UserContext.Provider value={{username,setUsername,id,setId}}>
            {children}
        </UserContext.Provider>
    )
}