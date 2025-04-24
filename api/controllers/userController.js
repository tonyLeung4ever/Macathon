const userModel = require('../models/userModel');

const userController = {
    getAllUsers: (req, res) => {
        const users = userModel.getAll();
        res.json(users);
    },

    getUserById: (req, res) => {
        const user = userModel.getById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    },

    createUser: (req, res) => {
        const newUser = userModel.create(req.body);
        res.status(201).json(newUser);
    },

    updateUser: (req, res) => {
        const updatedUser = userModel.update(parseInt(req.params.id), req.body);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    },

    deleteUser: (req, res) => {
        const deletedUser = userModel.delete(parseInt(req.params.id));
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(deletedUser);
    }
};

module.exports = userController; 