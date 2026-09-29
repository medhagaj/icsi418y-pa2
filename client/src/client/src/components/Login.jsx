//components for login
import {useState} from "react";

function Login() {
//values react can track from the Login button
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");

 //prevent brouwser's normal form submission
     const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    //sending data from react to express
    const response = await fetch(
    "http://localhost:9000/login",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username, password
        })
    }
);

const data = await response.json();
//check if request succeeded
setMessage(data.message);
} catch (err) {
      setMessage("Cannot reach server");
    }
  };


    return (
        <div>
            <h2>Login</h2>
             <form onSubmit={handleSubmit}>


            //username input
            <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
            />

            //password input
            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
            />

                <button type="submit">Login</button>

            </form>
            {message && <p>{message}</p>}

        </div>
    );
}

export default Login;