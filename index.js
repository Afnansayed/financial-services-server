const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.Port || 5000;

//require('crypto').randomBytes(64).toString('hex')
//middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_NAME);

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.khblnbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const usersCollection = client.db('easyPay').collection('users');

     //jwt api
     app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.DB_KEY, { expiresIn: '1h' });
      res.send({ token });
    })

    app.post('/users', async (req,res) => {
      const { name, pin, mobileNumber, email,role } = req.body;
      const hashedPin = await bcrypt.hash(pin, 10);
      const newUser = {
        name,
        pin: hashedPin,
        mobileNumber,
        email,
        role,
        status: 'pending', // Initial status is pending
        balance: 0, // Initial balance
      };
          const result = await usersCollection.insertOne(newUser);


          res.send(result);
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/',  (req,res) => {
      res.send('Financial Services server is running');
})

app.listen(port,() => {
     console.log(`Financial services server is running on port ${port}`)
})
