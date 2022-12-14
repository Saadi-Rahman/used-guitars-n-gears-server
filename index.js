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

// custom middleware for verifyJWT
function verifyJWT(req, res, next){

    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}


async function run(){
    try{
        // MongoDB collections
        const categoriesCollection = client.db('usedGuitarsNGears').collection('categories');
        const productsCollection = client.db('usedGuitarsNGears').collection('products');
        const bookingsCollection = client.db('usedGuitarsNGears').collection('bookings');
        const usersCollection = client.db('usedGuitarsNGears').collection('users');
        const newProductsCollection = client.db('usedGuitarsNGears').collection('newProducts');

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
        app.get('/bookings', verifyJWT, async(req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'});
            }

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
        });

        // get API to show allUsers data in dashboard page
        app.get('/users', async(req, res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        // get API to check a user isAdmin or not
        app.get('/users/admin/:email', async(req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
          });

        // post API to send users data to MongoDB
        app.post('/users', async(req, res) =>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // put API to change a users' role -------------- verifyAdmin,
        app.put('/users/admin/:id', verifyJWT, async(req, res) =>{
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access!'})
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
              $set: {
                role: 'admin'
              }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
          });

          // get API to show all newProducts on My Products page
          app.get('/newProducts', async(req, res) =>{
            const query = {};
            const newProducts = await newProductsCollection.find(query).toArray();
            res.send(newProducts);
          });

          // post API for newProducts Collection
          app.post('/newProducts', async(req, res) =>{
            const newProduct = req.body;
            const result = await newProductsCollection.insertOne(newProduct);
            res.send(result);
          })

          // delete API for newProducts Collection
          app.delete('/newProducts/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await newProductsCollection.deleteOne(filter);
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