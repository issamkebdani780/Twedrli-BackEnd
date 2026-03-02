import express from 'express';
import cors from 'cors';
import productrouter from './router/product.router.js';
import userrouter from './router/user.router.js';
import postrouter from './router/post.router.js';

const port = process.env.PORT || 3000;
const App = express();

App.use(cors());
App.use(express.json());

App.use('/products', productrouter);
App.use('/users', userrouter);
App.use('/posts', postrouter);

App.get('/', (req, res) => {
    res.send('welcome to twedrli')
})


App.listen(port, () => {
    console.log(`server is running on https://twedrliapi.linguaflo.me/`)
})