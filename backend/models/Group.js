const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: String, required: true },
    splitWith: [{ type: String, required: true }],
}, { _id: false });

const groupSchema = new mongoose.Schema({
    friends: [{ type: String }],
    expenses: [expenseSchema],
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);

module.exports = { Group };
