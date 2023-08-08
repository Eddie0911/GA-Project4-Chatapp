
import axios from 'axios';
import { UserContextProvider } from './Components/UserContext';
import Routes from './Components/Routes';


function App() {
  axios.defaults.baseURL = 'http://localhost:4040/'
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
        <Routes />
    </UserContextProvider>
  )
}

export default App
