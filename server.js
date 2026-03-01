import express from 'express';

const port = process.env.PORT || 3000;
const App = express();

App.get('/', (req, res) => {
    res.send('welcome to twedrli')
})


App.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})