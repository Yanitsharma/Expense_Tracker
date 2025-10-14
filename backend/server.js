const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { Group } = require('./models/Group');

const app = express();
const PORT = process.env.PORT || 2000;


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));



app.get('/api/groups/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json(group);
    } catch (error) {
        console.error("Error fetching group:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


app.post('/api/groups', async (req, res) => {
    try {
        const newGroup = new Group({
            friends: ['Alice', 'Bob'], 
            expenses: [],
        });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/groups/:id/friends', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Friend name is required' });
        }
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        if (group.friends.map(f => f.toLowerCase()).includes(name.toLowerCase())) {
            return res.status(400).json({ message: 'Friend already exists' });
        }

        group.friends.push(name);
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


app.post('/api/groups/:id/expenses', async (req, res) => {
    try {
        const { description, amount, paidBy, splitWith } = req.body;
        
        if (!description || !amount || !paidBy || !splitWith || splitWith.length === 0) {
            return res.status(400).json({ message: 'All expense fields are required' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const newExpense = { description, amount, paidBy, splitWith, id: new mongoose.Types.ObjectId() };
        group.expenses.push(newExpense);
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});
app.delete('/api/groups/:id/friends', async (req, res) => {
    try {
        const { name: friendToDelete } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        
        const friendIndex = group.friends.indexOf(friendToDelete);
        if (friendIndex > -1) {
            group.friends.splice(friendIndex, 1);
        } else {
             return res.status(404).json({ message: 'Friend not found in this group.' });
        }

        
        group.expenses = group.expenses
           
            .map(expense => {
                expense.splitWith = expense.splitWith.filter(member => member !== friendToDelete);
                return expense;
            })
           
            .filter(expense => expense.paidBy !== friendToDelete)
          
            .filter(expense => expense.splitWith.length > 0); 

        await group.save();    
        res.json(group); 
    } catch (error) {
        console.error("Error deleting friend:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
