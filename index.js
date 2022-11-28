const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());

const categories = require('./data/categories.json');

app.get('/', (req, res) => {
    res.send('Used Guitars N Gears API is Running...');
});

app.get('/product-categories', (req, res) => {
    res.send(categories);
})


app.listen(port, () => {
    console.log(`Used Guitars N Gears Server is running on port: ${port}`);
})
