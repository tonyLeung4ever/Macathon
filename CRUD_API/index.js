const express = require ('express');
const bodyParser = require ('body-parser');

const myApp = express();
const PORT = 3000;

myApp.use(bodyParser.json());

let users = []; //In-memory db. Let's use local storage maybe? Or postgresql
let idCounter = 1;

//Create
myApp.post('/users', (req, res) => {
    const user = { id: idCounter++, ...req.body};
    users.push(user);
    res.status(201).json(user);
});

//Read/Retrieve all
myApp.get('/users', (req, res) => {
    res.json(users);
});

//Retrieve user by ID
myApp.get('/users:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
});

//Update
myApp.put('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id == req.params.id); 
    if (index == -1) return res.status(404).json({message: 'User not found'});

    users[index] = {id: users[index].id, ...req.body};
    res.json(users[index]);
});

//Delete
myApp.delete('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id == req.params.id);
    if (index === -1) return res.status(404).json({message: 'User not found'});

    const deleted = users.splice(index, 1);
    res.json(deleted[0]);
});

myApp.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




