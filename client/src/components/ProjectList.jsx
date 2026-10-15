import { useState, useEffect } from "react";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

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

  //Find the readable name of the lead from the users list
  const getLeadName = (leadId) => {
    const lead = users.find((u) => u._id === leadId.toString());
    return lead ? `${lead.f_name} ${lead.l_name} (${lead.username})` : "Unknown";
  };

  return (
    <div>
      <h2>All Projects</h2>
      {message && <p>{message}</p>}
      {projects.length === 0 && <p>No projects yet.</p>}
      {projects.map((p) => (
        <div key={p._id} style={{ border: "1px solid gray", margin: "8px 0", padding: "8px" }}>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <p><strong>Status:</strong> {p.status}</p>
          <p><strong>Project Lead:</strong> {getLeadName(p.project_lead_id)}</p>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;