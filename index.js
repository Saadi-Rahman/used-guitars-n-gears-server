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

// const categories = require('./data/categories.json');
// const products = require('./data/products.json');

async function run(){
    try{
        const categoriesCollection = client.db('usedGuitarsNGears').collection('categories');
        const productsCollection = client.db('usedGuitarsNGears').collection('products');

        app.get('/categories', async(req, res) => {
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });

        app.get('/category/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const category = await categoriesCollection.findOne(query);
            res.send(category);
        });

        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productsCollection.findOne(query);
            res.send(products);
        });

    }
    finally{

    }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('Used Guitars N Gears API is Running...');
});


// app.get('/product-categories', (req, res) => {
//     res.send(categories);
// });


// app.get('/category/:id', (req, res) => {
//     const id = req.params.id;
//     const category_products = products.filter( p => p.category_id === id);
//     res.send(category_products);
// })


// app.get('/products/:id', (req, res) => {
//     const id = req.params.id;
//     const selectedProduct = products.find( p => p._id === id);
//     res.send(selectedProduct);
// })


app.listen(port, () => {
    console.log(`Used Guitars N Gears Server is running on port: ${port}`);
})
