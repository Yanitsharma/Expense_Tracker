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
        console.log("New group created with ID:", newGroup._id);
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

        // Check if friend exists in the group first
        if (!group.friends.includes(friendToDelete)) {
            return res.status(404).json({ message: 'Friend not found in this group.' });
        }

        // ======================================================
        // 1. SAFETY CHECK: CALCULATE BALANCE
        // ======================================================
        let balance = 0;

        group.expenses.forEach(expense => {
            // Case A: They paid for something (They are owed money +)
            if (expense.paidBy === friendToDelete) {
                balance += expense.amount;
            }

            // Case B: They were part of a split (They owe money -)
            if (expense.splitWith.includes(friendToDelete)) {
                const share = expense.amount / expense.splitWith.length;
                balance -= share;
            }
        });

        // Check if balance is non-zero (using 0.01 to handle tiny decimal errors)
        if (Math.abs(balance) > 0.01) {
            const formattedBalance = Math.abs(balance).toFixed(2);
            const statusMsg = balance > 0 ? "is owed" : "owes";
            
            // Return 400 Bad Request - STOP HERE
            return res.status(400).json({ 
                message: `Cannot remove ${friendToDelete}. They ${statusMsg} $${formattedBalance}. Please settle up expenses involving them first.` 
            });
        }

        // ======================================================
        // 2. IF BALANCE IS 0, PROCEED WITH DELETION
        // ======================================================

        // Remove from friends array
        const friendIndex = group.friends.indexOf(friendToDelete);
        group.friends.splice(friendIndex, 1);

        // Clean up expenses
        // Even though balance is 0, we still clean up the records so their name 
        // doesn't appear in the "splitWith" arrays anymore.
        group.expenses = group.expenses
            // Step A: Remove friend from 'splitWith' arrays of existing expenses
            .map(expense => {
                expense.splitWith = expense.splitWith.filter(member => member !== friendToDelete);
                return expense;
            })
            // Step B: Remove expenses paid by this friend (though balance is 0, cleaning up history)
            .filter(expense => expense.paidBy !== friendToDelete)
            // Step C: Remove expenses that now have 0 people splitting them
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
