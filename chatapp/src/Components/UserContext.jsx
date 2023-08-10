import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}){
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    useEffect(()=>{
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
          }
          const token = getCookie('token');
        if(token){
            axios.get('/profile',{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }).then(response =>{
                // console.log(response.data);
                setId(response.data.userId);
                setUsername(response.data.username);
                // console.log(response.data.userId);
                // console.log(response.data.username);
            }).catch(error =>{
                error.status(401).json('where is my token')
            })
        }
        },[])

        const contextValue  = {username,setUsername,id,setId};
    return(
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}

