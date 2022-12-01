const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rf7qboo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        // MongoDB collections
        const categoriesCollection = client.db('usedGuitarsNGears').collection('categories');
        const productsCollection = client.db('usedGuitarsNGears').collection('products');
        const bookingsCollection = client.db('usedGuitarsNGears').collection('bookings');
        const usersCollection = client.db('usedGuitarsNGears').collection('users');

        // get API to show all categories on the Home page
        app.get('/categories', async(req, res) => {
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });

        // get API to show a specific category on the Categories page
        app.get('/categories/:name', async(req, res) =>{
            const name = req.params.name;
            const query = { category_name: name };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // get API to show all products on the Categories page
        app.get('/products', async(req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // get API to show a specific product and its' info on the productDetails page
        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productsCollection.findOne(query);
            res.send(products);
        });

        // get API to show bookings data on the myOrders page
        app.get('/bookings', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });

        // post API to send bookings data to MongoDB
        app.post('/bookings', async(req, res) =>{
            const booking = req.body
            const result = bookingsCollection.insertOne(booking);
            res.send(result);
        });

        // get API for jwt
        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token});
            }
            res.status(403).send({accessToken: ''});
        })

        // post API to send users data to MongoDB
        app.post('/users', async(req, res) =>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('Used Guitars N Gears API is Running...');
});

app.listen(port, () => {
    console.log(`Used Guitars N Gears Server is running on port: ${port}`);
})
