import { useContext, useEffect, useState } from 'react'
import {BsFillSendCheckFill} from 'react-icons/Bs'
import {BsCupStraw} from 'react-icons/Bs';
import { on } from 'ws';
import { Avatar } from './Avatar';
import { UserContext } from './UserContext';

export function Chat(){
    const [ws, setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const [selectedUserId,setSelectedUserId] = useState(null);
    const [newMessageText,setNewMessageText] = useState('');
    const {id} = useContext(UserContext);

    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message',handleMessage)
    },[]);

    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(e){
        const messageData = JSON.parse(e.data);
        if('online' in messageData) {
            showOnlinePeople(messageData.online);
        } else {
            console.log({messageData})
        }
    }

    function sendMessage(ev){
        ev.preventDefault();
        console.log('sending');
        ws.send(JSON.stringify({
                recipient: selectedUserId,
                text: newMessageText,
        }));
        // setNewMessageText('');
    }

    const onlinePplExclOurUser = {...onlinePeople};
    delete onlinePplExclOurUser[id];

    return(
        <div className="flex h-screen">
            <div className="bg-blue-50 w-1/6">
                <div className='text-blue-700 font-bold flex items-center gap-2 p-4'>
                    <BsCupStraw style={{ fontSize:'24px'}}/>
                    <div>
                        <span>BubbleChat</span><br/>
                        <span style={{fontSize:'10px'}}>spill the tea</span>
                    </div>
                </div>
                {Object.keys(onlinePplExclOurUser).map(userId => (
                    <div onClick={()=> setSelectedUserId(userId)} key={userId} 
                    className={'border-b border-gray-100 flex items-center gap-2 cursor-pointer '+(userId === selectedUserId ? 'bg-blue-200' : '')}>
                        {userId === selectedUserId && (
                            <div className='w-1 bg-blue-500 h-12 rounded-r-md'></div>
                        )}
                        <div className='flex gap-2 py-2 pl-4 items-center'>
                            <Avatar username ={onlinePeople[userId]} userId={userId}/>
                            <span className='text-gray-800'>{onlinePeople[userId]}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-100 w-5/6 p-2">
                <div className='flex-grow'>
                    {!selectedUserId && (
                        <div className='flex h-full flex-grow items-center justify-center'>
                            <div className='text-gray-500'>&larr;  Select a person to chat from the sidebar</div>
                        </div>
                    )}
                </div> 
                {!!selectedUserId && (
                <form className='flex gap-2' onSubmit={sendMessage}>
                    <input type="text"
                            value={newMessageText}
                            onChange = {ev => setNewMessageText(ev.target.value)}
                            placeholder="type your message here"
                            className="bg-white flex-grow rounded-sm border p-2"/>
                    <button type='submit' className="bg-blue-500 p-2 text-white rounded-sm">
                        <BsFillSendCheckFill/>
                    </button> 
                </form>  
                )}
            </div>
        </div>
    )
}