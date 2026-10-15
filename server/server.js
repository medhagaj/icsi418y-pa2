require("dotenv").config();
const { MongoClient, ObjectId} = require("mongodb");


const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let usersCollection;
let projectsCollection;
let membershipsCollection;


const client = new MongoClient(process.env.MONGO_URI);
//function to test the connection 
async function connectDatabase() {
    try {
        await client.connect();
        const db = client.db("pa2");
            usersCollection = db.collection("users");
            projectsCollection = db.collection("projects");
            membershipsCollection = db.collection("ProjectMembership");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}
//call the function
connectDatabase()

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

//for signup
app.post("/signup", async (req, res) => {
  try {

    const { f_name, l_name, username, password } = req.body;
    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await usersCollection.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already exists." });
    }

    await usersCollection.insertOne({ f_name, l_name, username, password });
    return res.status(201).json({ message: "User created successfully!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

//for login
app.post("/login", async (req, res) => {
  try {

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});


// GET all registered users (for dropdowns)
app.get('/api/users', async (req, res) => {
  try {
    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

//CREATE a project
app.post('/api/projects', async (req, res) => {
  try{

    const{name, description, status, project_lead_id} = req.body;

    //validate all the fields
    if(!name || !description || !status || !project_lead_id){
      return res.status(400).json({message: 'All fields are required.'});
    } 

    //validate the status values
    if(!['planning , active , completed']){
      return res.status(400).json({message: 'Invalid status value.'});
    } 

    //validate ObjectId format
    if(!ObjectId.isValid(project_lead_id)){
      return res.status(400).json({message: 'Invalid project lead id.'});
    } 

    //verify project lead exists
    const lead = await usersCollection.findOne({ _id: new ObjectId(project_lead_id) });
    if (!lead) {
      return res.status(404).json({ message: 'Project lead does not exist.' });
    }

    //insert project
     const result = await projectsCollection.insertOne({
      name,
      description,
      status,
      project_lead_id: new ObjectId(project_lead_id)
    });

    //auto-add the lead as a member
    await membershipsCollection.insertOne({
      project_id: result.insertedId,
      user_id: new ObjectId(project_lead_id)
    });

    return res.status(201).json({ message: 'Project created successfully!', id: result.insertedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
  
});

//GET all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await projectsCollection.find({}).toArray();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET members of one project
app.get('/api/projects/:projectId/members', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project id.' });
    }

    const memberships = await membershipsCollection
      .find({ project_id: new ObjectId(projectId) })
      .toArray();

    res.json(memberships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ADD a member to a project
app.post('/api/projects/:projectId/members', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required.' });
    }

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: 'Invalid id format.' });
    }

    // Project must exist
    const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project does not exist.' });
    }

    // User must exist
    const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist.' });
    }

    // Duplicate check
    const existing = await membershipsCollection.findOne({
      project_id: new ObjectId(projectId),
      user_id: new ObjectId(user_id)
    });
    if (existing) {
      return res.status(409).json({ message: 'User is already a member of this project.' });
    }

    await membershipsCollection.insertOne({
      project_id: new ObjectId(projectId),
      user_id: new ObjectId(user_id)
    });

    res.status(201).json({ message: 'Member added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// REMOVE a member (non-lead only)
app.delete('/api/projects/:projectId/members/:userId', async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid id format.' });
    }

    const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project does not exist.' });
    }

    // Block removing the project lead
    if (project.project_lead_id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the project lead.' });
    }

    const result = await membershipsCollection.deleteOne({
      project_id: new ObjectId(projectId),
      user_id: new ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Membership not found.' });
    }

    res.json({ message: 'Member removed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});