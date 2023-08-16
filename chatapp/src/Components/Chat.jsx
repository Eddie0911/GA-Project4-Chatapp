import { useContext, useEffect, useState, useRef} from 'react';
import { Avatar } from './Avatar';
import { UserContext } from './UserContext';
import axios from 'axios';
import {uniqBy} from 'lodash';
import  { Contact }  from './Contact';
import Navbar from './Navbar';
import {RiUserSharedFill} from 'react-icons/Ri';
import {IoDocumentAttachSharp} from 'react-icons/io5'
import {BsFillSendCheckFill} from 'react-icons/Bs';
import {BsCupStraw} from 'react-icons/Bs';
import {TiAttachment} from 'react-icons/Ti';
import {MdOutlinePowerSettingsNew} from 'react-icons/Md';
import {MdRefresh} from 'react-icons/Md';


export function Chat(){
    const [ws, setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const [offlinePeople,setOfflinePeople] = useState({});
    const [selectedUserId,setSelectedUserId] = useState(null);
    const [newMessageText,setNewMessageText] = useState('');
    const [messages,setMessages] = useState([]);
    const [messageScroll,setMessageScroll] = useState(false);
    // const [selectedUsername,setSelectedUsername] = useState(null);
    const {username,id,setId,setUsername} = useContext(UserContext);
    
    const divUnderMessages = useRef();

    //TODO Check useEffect 
    useEffect(() => {
        connectToWs();
      }, [selectedUserId]);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('delete', (message)=>{
            console.log({message});
        })
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect.');
                connectToWs();
            }, 1000);
        });
    }


    function showOnlinePeople(peopleArray){
        // console.log(peopleArray);
        const people = {};
        peopleArray
        .forEach(({userId, username}) => {
            // console.log(userId,username,id);
            if(userId && id !== userId){
                people[userId] = username;
                console.log(offlinePeople);
                if(offlinePeople[userId]){
                    let uo = offlinePeople;
                    delete uo[userId];
                    setOfflinePeople({...uo});
                }
            }
        });
        setOnlinePeople(people);
    }

    function handleMessage(e){
        const messageData = JSON.parse(e.data);
        console.log(e,messageData);
        if('online' in messageData) {
            updateOnlinePpl();
            showOnlinePeople(messageData.online);
        } else if ('text' in messageData){
            if(messageData.sender === selectedUserId){
                // setMessages(prev => ([...prev, {...messageData}]));
                updateMessage();
            }
        } else if( 'type' in messageData && messageData.type === 'delete'){
            if(selectedUserId){
            // setMessages(prev => ([...prev, {...messageData}]));
            updateMessage();
            }
        }
    }

    function handleRecall(messageId) {
        axios.delete('/messages/' + messageId)
            .then(res => {
                // updateMessage();
                // setMessages(res.data);
                ws.send(JSON.stringify({
                    type:"delete",
                    text:"delete both sides",
                }))
                setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
            })
            .catch(error => {
                console.error('Error deleting message:', error);
            });
    }


    function sendMessage(ev, file = null) {
        if (ev) ev.preventDefault();
        if (!file && newMessageText.trim() === '') {
          // Empty text input, no action needed
          return;
        }
        ws.send(JSON.stringify({
          recipient: selectedUserId,
          text: newMessageText,
          file,
        }));
        // if (file) {
        //   axios.get('/messages/'+selectedUserId).then(res => {
        //     setMessages(res.data);
        //   });
            // updateMessage();
        // } else {
          setNewMessageText('');
          updateMessage();
        //   setMessages(prev => ([...prev,{
        //     text: newMessageText,
        //     sender: id,
        //     recipient: selectedUserId,
        //     _id: Date.now(),
        //   }]));
        // }
      }

    function sendFile(ev){
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result,
            });
        };
    }

    function logout(){
        axios.post('/logout').then(()=>{
            // ws.send(JSON.stringify({type:'close',text:'closing it'}));
            ws.close();
            setWs(null);
            setId(null);
            setUsername(null);
            setOfflinePeople(offlinePeople => ({ ...offlinePeople, [id]: offlinePeople[id] }));
        });
    }

    const scrollMessages = ()=>{
        const div = divUnderMessages.current;
        console.log(div);
        console.log(divUnderMessages);
        if(div && messageScroll){
            div.scrollIntoView({block:'end'});
            setMessageScroll(false);
        }
    }

    const updateOnlinePpl = () =>{
        axios.get('/people').then(res =>{
            const offlinePeopleArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id));   
            const offlinePeople =  {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p;
                let newOnlinePpl = {...onlinePeople};
                // if(){

                // }
            });
            setOfflinePeople(offlinePeople);
            // setOnlinePeople(onlinePeople.filter((e)=>{
            //     console.log(e);
            //     return !offlinePeople.includes(e._id);
            // }))
        })
    }

    useEffect(() => {
        updateOnlinePpl();
    },[]);

    useEffect(()=>{
        if(messageScroll){
            scrollMessages();
        }
    },[messageScroll]);

    const updateMessage = () =>{
        axios.get('/messages/'+selectedUserId).then(res => {
            setMessages(res.data);
            setMessageScroll(true);
            // scrollMessages();
          });
    }

    useEffect(()=>{
        if (selectedUserId) {
            // axios.get('/messages/'+selectedUserId).then(res => {
            //   setMessages(res.data);
            //   setMessageScroll(true);
            //   scrollMessages();
            // });
            updateMessage();
          }
    },[selectedUserId])

    // const onlinePeople = {...onlinePeople};
    // delete onlinePeople[id];


    const messagesWithOutDupes = uniqBy(messages,'_id');
    // console.log(messagesWithOutDupes);

    const contactTriger = (userId)=>{
        setSelectedUserId(userId);
        setMessageScroll(true);
    }

    return(
        <div className="flex h-screen">
            <div className="bg-blue-50 w-1/6 flex flex-col">
                <div className='flex-grow'>
                    <div className='text-blue-700 font-bold flex items-center gap-2 p-4'>
                        <BsCupStraw style={{ fontSize:'24px'}}/>
                        <div>
                            <span>BubbleChat</span><br/>
                            <span style={{fontSize:'10px'}}>spill the tea</span>
                        </div>
                    </div>
                    <div className='flex'>
                        <div>
                            <Navbar />
                        </div>
                        <div className='w-3/4 font-serif'>
                            {Object.keys(onlinePeople).map(userId => (
                                <Contact id={userId}
                                        key={userId}
                                        online = {true}
                                        username={onlinePeople[userId]}
                                        onClick={()=>contactTriger(userId)}
                                        selected={userId === selectedUserId} />
                                        
                            ))}
                            {Object.keys(offlinePeople).map(userId => (
                                <Contact id={userId}
                                        key={userId}
                                        online = {false}
                                        username={offlinePeople[userId].username}
                                        onClick={()=>contactTriger(userId)}
                                        selected={userId === selectedUserId} />
                                        
                            ))}
                        </div>
                    </div>
                </div>
                <div className='p-3 flex items-center justify-center text-center'>
                    <span className='flex items-center font-serif p-1'><RiUserSharedFill/>{username}</span>
                    <button onClick={logout}
                    className='text-sm bg-blue-300 py-1 px-2 text-gray-600 border rounded-sm'><MdOutlinePowerSettingsNew/></button>
                </div>
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
                            <div className='overflow-y-scroll absolute font-serif top-0 left-0 right-0 bottom-2'>
                                {messagesWithOutDupes.map(message => (
                                    <div key={message._id} className={`flex items-center ${message.sender === id ? 'justify-end' : 'justify-start'}`}>
                                        {message.sender !== id && (
                                            <Avatar username={onlinePeople[selectedUserId] || offlinePeople[selectedUserId].username} online={!offlinePeople[message.sender]} userId={message.sender} />
                                        )}
                                        {message.sender === id && (
                                            <button className='bg-blue-300 border border-b rounded' onClick={() => handleRecall(message._id)}><MdRefresh/></button>
                                        )}
                                        <div key={message._id} className={"text-left inline-block p-2 my-2 m-2 rounded-md text-sm " +(message.sender === id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>
                                            {message.text}
                                            {message.file && (
                                                <div>
                                                    <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + 'uploads/' + message.file}>
                                                        <TiAttachment/>
                                                        {message.file}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        {message.sender === id && (
                                            <Avatar username={username} online={true} userId={message.sender} />  
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
                    <label type='button' className="bg-gray-500 grid place-items-center p-2 text-white rounded-sm">
                        <input type='file' className='hidden' onChange={sendFile}/>
                        <div><IoDocumentAttachSharp/></div>
                    </label>
                    <button type='submit' className="bg-blue-500 p-2 text-white rounded-sm">
                        <BsFillSendCheckFill/>
                    </button> 
                </form>  
                )}
            </div>
        </div>
    )
}