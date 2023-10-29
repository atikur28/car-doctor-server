const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m78kxrk.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const servicesCollection = client.db('carDoctor').collection('services');
    const checkoutCollection = client.db('carDoctor').collection('checkouts');

    app.get('/services', async(req, res) => {
        const cursor = servicesCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
            projection: {service_id: 1, title: 1, img: 1, price: 1, description: 1, facility: 1}
        }
        const result = await servicesCollection.findOne(query, options);
        res.send(result);
    })

    app.get('/checkouts', async (req, res) => {
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const cursor = checkoutCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/checkouts', async (req, res) => {
      const checkout = req.body;
      const result = await checkoutCollection.insertOne(checkout);
      res.send(result)
    })

    app.patch('/checkouts/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedCheckout = req.body;
      const updatedDoc = {
        $set: {
          status: updatedCheckout.status
        },
      };
      const result = await checkoutCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/checkouts/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await checkoutCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car Doctor server in running...');
})

app.listen(port, () => {
    console.log(`Car Doctor server in running on port ${port}`);
})