const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3nkfm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

	// CREATE: send user input data from server to database. client: Add Spot 
	const AvailableFoodCollection = client.db("FoodSharing").collection("AvailableFoods");
	app.post('/addFoods', async(req,res) => {
		const newFood = req.body;
		console.log(newFood);
		const result = await AvailableFoodCollection.insertOne(newFood);
		res.send(result);
	})

	// READ: get data from db. client: Available Foods
    app.get('/available', async(req,res) => {
		const cursor = AvailableFoodCollection.find();
		const result = await cursor.toArray();
		res.send(result);
	})
	// load single data 
	app.get('/available/:id', async(req,res) => {
		const id = req.params.id;
		const query = {_id: new ObjectId(id)}
		const result = await AvailableFoodCollection.findOne(query);
		res.send(result);
	})
	// update a property in a document: PATCH Update in Available Card's ViewDetails Modal component
	app.patch('/available/:id', async (req, res) => {
		const id = req.params.id;
		const filter = { _id: new ObjectId(id) };  // filter select the particular document that needs to be updated
		const updatedFoods = req.body;
		console.log(updatedFoods);
		const updateDoc = {
			$set: {
				foodStatus : updatedFoods.foodStatus
			}
		};
		const result = await AvailableFoodCollection.updateOne(filter, updateDoc);
		res.send(result);
	})

	// load some data using query parameter
	app.get('/availablebyEmail/:email', async(req,res) => {
		const email = req.params.email;
		console.log(`querying for email', ${email}`);

		let query = {donatorEmail : email};
		const result = await AvailableFoodCollection.find(query).toArray();
		res.send(result);
	})



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  //  await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
	res.send('Food Sharing server is running')
})
app.listen(port, () => {
	console.log(`Food Sharing is running on port ${port}`)
})
