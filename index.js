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
 //   await client.connect();

	// CREATE: send user input data from server to database. client: Add food 
	const AvailableFoodCollection = client.db("FoodSharing").collection("AvailableFoods");
	const UsersCollection = client.db("FoodSharing").collection("users");
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

	// load some data using email query parameter. My Request UI
	app.get('/availablebyEmail/:email', async(req,res) => {
		const email = req.params.email;
		console.log(`querying My Request for email', ${email}`);

		let query = {donatorEmail : email};
		const result = await AvailableFoodCollection.find(query).toArray();
		res.send(result);
	})
	// load some data using query parameter. Manage My Foods UI
	app.get('/manageFoodByEmail/:email', async(req,res) => {
		const email = req.params.email;
		console.log(`querying Manage My Food for email', ${email}`);

		let query = {donatorEmail : email};
		const result = await AvailableFoodCollection.find(query).toArray();
		res.send(result);
	})
	// load single data for update api. load data in details page before update
	app.get('/manageFoodByEmail/:email/:id', async(req,res) => {
		const id = req.params.id;
		const query = {_id: new ObjectId(id)}
		const result = await AvailableFoodCollection.findOne(query);
		res.send(result);
		console.log("success in fetch data before update")
	})
	// UPDATE
	app.put('/manageFoodByEmail/:id', async(req,res)=> {
		const id = req.params.id;
		console.log("update api",id);

		const filter = {_id: new ObjectId(id)}
		const options = {upsert: true};
		const updatedFood = req.body;
		const food = {
			$set: {
				foodName : updatedFood.foodName, 
				foodImage : updatedFood.foodImage, 
				foodQuantity : updatedFood.foodQuantity, 
				pickupLocation : updatedFood.pickupLocation, 
				expiredDateTime : updatedFood.expiredDateTime, 
				additionalNotes : updatedFood.additionalNotes, 
				donatorImage : updatedFood.donatorImage, 
				donatorName : updatedFood.donatorName, 
				donatorEmail : updatedFood.donatorEmail, 
				foodStatus : updatedFood.foodStatus
			}
		}
		const result = await AvailableFoodCollection.updateOne(filter,food,options);
		res.send(result);
	})

	// delete api to delete a booking
	app.delete('/available/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: new ObjectId(id) }
		const result = await AvailableFoodCollection.deleteOne(query);
		res.send(result);
	})

	// ************ users api ************ //
	app.post('/users', async(req,res) => {
		const newUser = req.body;
		console.log(newUser);
		const result = await UsersCollection.insertOne(newUser);
		res.send(result);
	})
	app.get('/AllUsers', async(req,res) => {
		const cursor = UsersCollection.find();
		const result = await cursor.toArray();
		res.send(result);
	})

  //  Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
	res.send('Food Sharing server is running')
})
app.listen(port, () => {
	console.log(`Food Sharing is running on port ${port}`)
})
