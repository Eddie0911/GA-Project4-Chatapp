import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

  async function checkUsernameExists(username){
    if(username === ''){
      return;
    }
      try{
        const respone = await axios.get(`api/check-username/${username}`);
        setIsUsernameTaken(respone.data.exists);
      } catch(error){
        console.log(error);
        return false;
      }
    }
  
  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === 'register' ? 'register' : 'login';
    if (isLoginOrRegister === 'register'){
      await checkUsernameExists(username);
    } 
    // else {
    //   await checkUsernameExists(username);
    // }
    const form = ev.target;
    const formData = new FormData(form);

    const data = {
      username:formData.get("username"),
      password:formData.get("password"),
    }
    try{
    const response = await axios.post(url,data);
    setLoggedInUsername(username);
    setId(response.data._id);
    } catch(error){
      const input = document.getElementById('unique');
      input.focus();
    }
  }
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input value={username} id="unique"
               onChange={ev => {setUsername(ev.target.value)
                checkUsernameExists(ev.target.value)
              }}
               type="text" placeholder="username" name="username" required
               className="block w-full rounded-sm p-2 mb-2 border" />
               {isLoginOrRegister == 'register' && isUsernameTaken && <p className="text-red-500">Username is already taken.</p>}
               {isLoginOrRegister == 'login' && !isUsernameTaken && username != '' &&(
                <p className="text-red-500">Username not found. Consider registering.</p>
                )}
        <input value={password}
               onChange={ev => setPassword(ev.target.value)}
               type="password"
               placeholder="password"
               name="password"
               required
               className="block w-full rounded-sm p-2 mb-2 border" />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              Dont have an account?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

