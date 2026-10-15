//used to display components
import {useState} from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateProject from "./components/CreateProject";
import ProjectList from "./components/ProjectList";
import ProjectMembers from "./components/ProjectMembers"; 


function App(){

  const [page, setPage] = useState("signup");

  return (
    <div> 
      <h1> Authentication App </h1>

      <div>
        <button onClick = {() => setPage("signup")} >Signup</button>
        <button onClick = {() => setPage("login")} >Login</button>
        <button onClick = {() => setPage("create")} >Create Project</button>
        <button onClick = {() => setPage("projects")} >View Projects</button>
        <button onClick = {() => setPage("members")} >Manage Members</button>
      </div>

      <hr />

      {page === "signup" && <Signup />}
      {page === "login" && <Login />}
      {page === "create" && <CreateProject />}
      {page === "projects" && <ProjectList />}
      {page === "members" && <ProjectMembers />}
    </div>
  );

}
export default App;
