const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());

const categories = require('./data/categories.json');
const products = require('./data/products.json');


app.get('/', (req, res) => {
    res.send('Used Guitars N Gears API is Running...');
});


app.get('/product-categories', (req, res) => {
    res.send(categories);
});


app.get('/category/:id', (req, res) => {
    const id = req.params.id;
    const category_products = products.filter( p => p.category_id === id);
    res.send(category_products);
})


app.get('/products/:id', (req, res) => {
    const id = req.params.id;
    const selectedProduct = products.find( p => p._id === id);
    res.send(selectedProduct);
})


app.listen(port, () => {
    console.log(`Used Guitars N Gears Server is running on port: ${port}`);
})
