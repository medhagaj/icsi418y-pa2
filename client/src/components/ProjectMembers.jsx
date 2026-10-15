import {useState, useEffect} from "react";

function ProjectMembers(){
    const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");

  //load projects and users once
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:9000/api/projects").then((r) => r.json()),
      fetch("http://localhost:9000/api/users").then((r) => r.json()),
    ])
      .then(([projectsData, usersData]) => {
        setProjects(projectsData);
        setUsers(usersData);
      })
      .catch(() => setMessage("Cannot load data"));
  }, []);

  //reload members when a project is selected
   useEffect(() => {
    if (!selectedProjectId) {
      setMemberships([]);
      return;
    }
    fetchMembers();
  }, [selectedProjectId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(
        `http://localhost:9000/api/projects/${selectedProjectId}/members`
      );
      const data = await res.json();
      setMemberships(data);
    } catch (err) {
      setMessage("Cannot load members"); 
    }
};

const getUserName = (userId) => {
    const u = users.find((x) => x._id === userId.toString());
    return u ? `${u.f_name} ${u.l_name} (${u.username})` : "Unknown";
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:9000/api/projects/${selectedProjectId}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: selectedUserId }),
        }
      );
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setSelectedUserId("");
        fetchMembers();  // refresh list
      }
    } catch (err) {
      setMessage("Cannot reach server");
    }
  };

  const handleRemove = async (userId) => {
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:9000/api/projects/${selectedProjectId}/members/${userId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) fetchMembers();  // refresh list
    } catch (err) {
      setMessage("Cannot reach server");
    }
  };

  //find the selected project so we know its lead
   const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const leadId = selectedProject ? selectedProject.project_lead_id.toString() : "";

  return (
    <div>
      <h2>Manage Project Members</h2>

      <label>Select Project: </label>
      <select
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
      >
        <option value="">-- Select Project --</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>
      {selectedProjectId && (
        <>
          <h3>Current Members</h3>
          {memberships.length === 0 && <p>No members yet.</p>}
          <ul>
            {memberships.map((m) => (
              <li key={m._id}>
                {getUserName(m.user_id)}
                {m.user_id.toString() === leadId && " (Project Lead)"}
                {m.user_id.toString() !== leadId && (
                  <button onClick={() => handleRemove(m.user_id)}>Remove</button>
                )}
              </li>
            ))}
          </ul>

          <h3>Add Member</h3>
          <form onSubmit={handleAdd}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.f_name} {u.l_name} ({u.username})
                </option>
              ))}
            </select>
            <button type="submit">Add</button>
          </form>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );

} 

export default ProjectMembers;