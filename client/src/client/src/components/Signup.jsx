//component for signup 
import {useState} from "react";

function Signup() {
    //values react can track from the Signup button
    const [f_name, setf_name] = useState("");
    const [l_name, setl_name] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    //prevent brouwser's normal form submission
     const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    //sending data from react to express
    const response = await fetch(
    "http://localhost:9000/signup",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            f_name, l_name, username, password
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

    //when pressed on Sign Up, returns
    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>


            <input
                type="text"
                value={f_name}
                onChange={(event) => setFname(event.target.value)}
                placeholder="First Name"
            />

            <input
                type="text"
                value={l_name}
                onChange={(event) => setLname(event.target.value)}
                placeholder="Last Name"
            />

            <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
            />

            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
            />

                <button type="submit">Sign Up</button>

            </form>
            <p>{message}</p>

        </div>
    );

}

export default Signup;