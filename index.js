const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use (cors());
app.use (express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.el4loe4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    const serviceCollection = client.db("GeniusCar").collection("Services");
    const orderCollection = client.db('GeniusCar').collection('Orders');
    
    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const result = await serviceCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //Orders API
      app.get('/orders', async(req, res) =>{
        let query = {};
        if(req.query.email){
          query = {
            email:req.query.email 
          }
        }
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      });
   

    app.post('/orders', async(req, res) =>{
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.patch('/orders/:id', async(req, res) =>{
      const id = req.params.id;
      const status = req.body.status
      const query = {_id: new ObjectId(id) }
      const updatedDoc = {
        $set : {
          status :status
        }
      }
      const result = await orderCollection.updateOne(query, updatedDoc)
      res.send(result)
    });

    app.delete('/orders/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id) }
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error (uncomment if desired)
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Genius Car Server is running");
});

app.listen(port, () => {
  console.log(`Genius Car Server is running on port ${port}`);
});
