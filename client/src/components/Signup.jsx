import { useState } from "react";

function Signup() {
  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ f_name, l_name, username, password }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Cannot reach server");
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={f_name} onChange={(e) => setFName(e.target.value)} placeholder="First Name" />
        <input type="text" value={l_name} onChange={(e) => setLName(e.target.value)} placeholder="Last Name" />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
