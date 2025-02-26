const { MongoClient, ObjectId } = require('mongodb');
const express = require("express");
const cors = require('cors');

//////////////////// Database Connection //////////////////////
const URL = "mongodb+srv://Girish:8612@cluster0.3nug5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with actual Atlas URL
const client = new MongoClient(URL);

async function GetConnection() {
    let result = await client.connect();
    let db = result.db("Events");
    return db.collection("RestoDetails");
}

async function GetConnection1() {
    let result = await client.connect();
    return result;
}

//////////////////// Express setup //////////////////////
const eobj = express();
eobj.use(cors({
    origin: 'https://resto-mean.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    headers: ['Content-Type', "Access-Control-Allow-Headers"]
}));
eobj.use(express.json());

const port = process.env.PORT || 3000;
eobj.listen(port, () => console.log(`Server running on port ${port}`));


//////////////////// Controllers //////////////////////
eobj.get('/getData', async (req, res) => {
    try {
        const collection = await GetConnection();
        const data = await collection.find().toArray();
        res.json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Internal Server Error');
    }
});

eobj.post('/postData', async (req, res) => {
    try {
        const collection = await GetConnection();
        const result = await collection.insertOne(req.body);
        res.status(201).json({ message: 'Data inserted successfully!', insertedId: result.insertedId });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Internal Server Error');
    }
});



eobj.delete('/deleteData/:id', async (req, res) => {
  try {
      const id = parseInt(req.params.id, 10); // Convert to number

      if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid ID format' });
      }

      const collection = await GetConnection();
      const result = await collection.deleteOne({ id: id }); // Query by numeric ID

      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'No record found' });
      }

      res.json({ message: 'Record deleted successfully' });
  } catch (err) {
      console.error('Error deleting record:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});




eobj.put('/updateData/:id', async (req, res) => {
  try {
      const collection = await GetConnection();
      const id = parseInt(req.params.id, 10); // Convert string to number

      if (isNaN(id)) {
          return res.status(400).json({ message: 'Invalid ID format' });
      }

      const result = await collection.updateOne({ id: id }, { $set: req.body });

      if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'No record found' });
      }

      res.json({ message: 'Record updated successfully' });
  } catch (err) {
      console.error('Error updating record:', err);
      res.status(500).send('Internal Server Error');
  }
});




eobj.post('/signup', async (req, res) => {
    try {
        const db = (await GetConnection1()).db("Events");
        const result = await db.collection('RestoUserDetails').insertOne(req.body);
        res.status(201).json({ message: 'User registered successfully!', insertedId: result.insertedId });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Internal Server Error');
    }
});

eobj.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const db = (await GetConnection1()).db("Events");
        const user = await db.collection('RestoUserDetails').findOne({ email, password });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        res.json({ message: 'Login successful', name: user.name });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});
