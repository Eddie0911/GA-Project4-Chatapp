import RegisterAndLoginForm from "./Register.jsx";
import {useContext} from "react";
import {UserContext} from "./UserContext.jsx";
import {Chat} from "./Chat.jsx";

export default function Mainpage() {
  const {username, id} = useContext(UserContext);
  console.log(username);
  if (username) {
     return <Chat />;
  }

  return (
    <RegisterAndLoginForm />
  );
}