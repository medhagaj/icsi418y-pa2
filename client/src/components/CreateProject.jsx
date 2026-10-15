import { useState, useEffect } from "react";

function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [projectLeadId, setProjectLeadId] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  // Load users for the dropdown when component mounts
  useEffect(() => {
    fetch("http://localhost:9000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setMessage("Cannot load users"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch("http://localhost:9000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, status, 
          project_lead_id: projectLeadId,}),
        });
        const data = await response.json();
        setMessage(data.message);

if (response.ok) {
        setName("");
        setDescription("");
        setStatus("Planning");
        setProjectLeadId("");
      }
    } catch (err) {
      setMessage("Cannot reach server");
    }
  };

   return (
    <div>
      <h2>Create Project</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project Name"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={projectLeadId}
          onChange={(e) => setProjectLeadId(e.target.value)}
        >
          <option value="">-- Select Project Lead --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.f_name} {u.l_name} ({u.username})
            </option>
          ))}
          </select>
        <button type="submit">Create</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
} //end class

export default CreateProject;