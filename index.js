const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const categoriesCollection = client.db('usedGuitarsNGears').collection('categories');
        const productsCollection = client.db('usedGuitarsNGears').collection('products');
        const bookingsCollection = client.db('usedGuitarsNGears').collection('bookings');

        app.get('/categories', async(req, res) => {
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });

        app.get('/categories/:name', async(req, res) =>{
            const name = req.params.name;
            const query = { category_name: name };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        app.get('/products', async(req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productsCollection.findOne(query);
            res.send(products);
        });

        app.get('/bookings', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });

        app.post('/bookings', async(req, res) =>{
            const booking = req.body
            const result = bookingsCollection.insertOne(booking);
            res.send(result);
        });

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
