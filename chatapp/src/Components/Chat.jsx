import { useContext, useEffect, useState, useRef} from 'react'
import {BsFillSendCheckFill} from 'react-icons/Bs'
import {BsCupStraw} from 'react-icons/Bs';
import { on } from 'ws';
import { Avatar } from './Avatar';
import { UserContext } from './UserContext';
import axios from 'axios';
import {uniqBy} from 'lodash';

export function Chat(){
    const [ws, setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const [selectedUserId,setSelectedUserId] = useState(null);
    const [newMessageText,setNewMessageText] = useState('');
    const [messages,setMessages] = useState([]);
    const {username,id} = useContext(UserContext);
    const divUnderMessages = useRef();

    //TODO Check useEffect 
    useEffect(() => {
        connectToWs();
      }, [selectedUserId]);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect.');
                connectToWs();
            }, 1000);
        });
    }

    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(e){
        const messageData = JSON.parse(e.data);
        // console.log(e,messageData);
        if('online' in messageData) {
            showOnlinePeople(messageData.online);
        } else if ('text' in messageData){
            setMessages(prev => ([...prev, {...messageData}]))
        }
    }

    function sendMessage(ev){
        ev.preventDefault();
        console.log('sending');
        if(newMessageText.trim() !== ''){
            ws.send(JSON.stringify({
                    recipient: selectedUserId,
                    text: newMessageText,
            }));
            setNewMessageText('');
            setMessages(prev => ([...prev,{
                text: newMessageText,
                sender:id,
                recipient: selectedUserId,
                _id: Date.now(),
            }]));
        }
    }

    useEffect(()=>{
        const div = divUnderMessages.current;
        if(div){
            div.scrollIntoView({behavior:'smooth',block:'end'});
        }
    },[messages]);

    useEffect(()=>{
        if (selectedUserId) {
            axios.get('/messages/'+selectedUserId).then(res => {
              setMessages(res.data);
            });
          }
    },[selectedUserId])

    const onlinePplExclOurUser = {...onlinePeople};
    delete onlinePplExclOurUser[id];


    const messagesWithOutDupes = uniqBy(messages,'_id');

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
                    {/* {!!selectedUserId && (
                        <div>
                            {messagesWithOutDupes.map(message =>
                                <div className={'' + (message.sender === id ? 'text-right' : 'text-left')}>
                                    sender:{message.sender}<br/>
                                    my id: {id}<br/>
                                    <Avatar username={username} userId={message.sender}/>
                                   {message.text}
                                </div>
                            )}
                        </div>
                            )} */}
                    {!!selectedUserId && (
                        <div className='relative h-full'>
                            <div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2'>
                                {messagesWithOutDupes.map(message => (
                                    <div key={message._id} className={`flex items-center ${message.sender === id ? 'justify-end' : 'justify-start'}`}>
                                        {message.sender !== id && (
                                            <Avatar username={onlinePeople[message.sender]} userId={message.sender} />
                                        )}
                                        <div key={message._id} className={"text-left inline-block p-2 my-2 m-2 rounded-md text-sm " +(message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                                            {message.text}
                                        </div>
                                        {message.sender === id && (
                                            <Avatar username={username} userId={message.sender} />
                                        )}
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
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