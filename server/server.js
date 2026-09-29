require("dotenv").config();
const { MongoClient } = require("mongodb");


const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let usersCollection;


const client = new MongoClient(process.env.MONGO_URI);
//function to test the connection 
async function connectDatabase() {
    try {
        await client.connect();
        const db = client.db("pa2");
            usersCollection = db.collection("users");
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


app.listen(9000, () => {
    console.log("Server running on port 9000");
});