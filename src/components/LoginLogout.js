import FullScreenLoader from "./FullScreenLoader";
import { Button } from "primereact/button";

import { useState } from "react";
import { InputText } from "primereact/inputtext";

import { Card } from 'primereact/card';
import { SUPABASE_KEY, SUPABASE_URL } from "../utils/constants";
const { createClient } = require("@supabase/supabase-js");
import { useNavigate } from "react-router-dom";
export default () => {
  const navigate = useNavigate();
  // Import the Supabase client
  const [isLoading, setIsLoading] = useState(false);
  // Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_KEY' with your Supabase project URL and key
  const supabaseUrl = SUPABASE_URL;
  const supabaseKey = SUPABASE_KEY;

  // Initialize the Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Function to sign up a user
  async function signUpUser(email, password) {
    try {
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("User signed up successfully:", user);
    } catch (error) {
      console.error("Error signing up user:", error.message);
    }
  }

  // Function to log in a user
  async function logInUser(email, password) {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      console.log(user);
      // alert("User logged in successfully:" + JSON.stringify(user));
      navigate("/home")
    } catch (error) {
      alert("Error logging in user:" + error.message);
    }
  }

  // Example usage
  const userEmail = "rvbugs0@gmail.com";
  const userPassword = "password";


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    setIsLoading(true)
    if(username.length<1 || password.length<1){
        

        setTimeout(()=>{
            setIsLoading(false)
            alert("Username & password required.")
        },1000)
        
        return;
    }
    logInUser(userEmail,userPassword)

    
    // Add your login logic here, e.g., calling a login function with username and password
    console.log('Logging in with:', { username, password });
  };


  // Uncomment one of the following lines to either sign up or log in the user
  // signUpUser(userEmail, userPassword);
  // logInUser(userEmail, userPassword);

  return (
   
    <div className="login-container">
<br/>
<br/>
    <Card title="Login">
      
     
      
     
     

    <div className="card flex justify-content-center">
            <span className="p-float-label">
                <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <label htmlFor="username">Username</label>
            </span>
        </div>
    
        
        <div className="card flex justify-content-center">
            <span className="p-float-label">
                <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <label htmlFor="password">Password</label>
            </span>
        </div>
    
      <div>
      <br/>
        <Button onClick={handleLogin}>Login</Button>
      </div>
      </Card>
      <FullScreenLoader isLoading={isLoading} />
    </div>
  );
};
