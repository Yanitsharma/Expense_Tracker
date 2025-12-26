import React from "react";
import { useState ,useEffect} from "react";
const API_BASE_URL = 'http://localhost:2000';
const FriendsPage = ({ navigateHome, groupId }) => {
  const ArrowRightIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg> );

const XCircleIcon = () => ( 
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400 hover:text-red-400 cursor-pointer transition-colors">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg> 
);
  const ArrowLeftIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> );




  const UserPlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg> );


  const DollarSignIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> );

  
  const CalculatorIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="12" y1="10" x2="12" y2="18"></line><line x1="8" y1="10" x2="8" y2="18"></line></svg> );
  
    const [friends, setFriends] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [newFriendName, setNewFriendName] = useState('');
    const [friendError, setFriendError] = useState('');
    const [expenseError, setExpenseError] = useState('');
    const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', paidBy: '', splitWith: [] });
    const [settlements, setSettlements] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
                if (!response.ok) throw new Error('Could not fetch group data.');
                const data = await response.json();
                setFriends(data.friends);
                setExpenses(data.expenses);
            } catch (error) {
                console.error(error);
                navigateHome(); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchGroupData();
    }, [groupId, navigateHome]);

    const handleAddFriend = async () => {
        if (!newFriendName.trim()) {
            setFriendError('Friend name cannot be empty.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/friends`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFriendName.trim() }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to add friend');
            }
            const data = await response.json();
            setFriends(data.friends); 
            setNewFriendName('');
            setFriendError('');
        } catch (error) {
            setFriendError(error.message);
        }
    };
    
    const handleAddExpense = async () => {
        const { description, amount, paidBy, splitWith } = expenseForm;
        if (!description.trim() || !amount || !paidBy || splitWith.length === 0) {
            setExpenseError('Please fill all fields and select friends to split with.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...expenseForm, amount: parseFloat(amount) }),
            });
            if (!response.ok) throw new Error('Failed to add expense');
            const data = await response.json();
            setExpenses(data.expenses); 
            setExpenseForm({ description: '', amount: '', paidBy: '', splitWith: [] });
            setExpenseError('');
            setSettlements(null); 
        } catch (error) {
            setExpenseError('An error occurred. Please try again.');
        }
    };
    
    const handleExpenseFormChange = (e) => {
        const { name, value } = e.target;
        setExpenseForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSplitWithChange = (friend) => {
        setExpenseForm(prev => {
            const newSplitWith = prev.splitWith.includes(friend)
                ? prev.splitWith.filter(f => f !== friend)
                : [...prev.splitWith, friend];
            return { ...prev, splitWith: newSplitWith };
        });
    };
    const handleDeleteFriend = async (friendToDelete) => {
    
    if (!window.confirm(`Are you sure you want to remove ${friendToDelete}?.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/friends`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: friendToDelete }),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to delete friend');
        }
        const data = await response.json();
        
        setFriends(data.friends);
        setExpenses(data.expenses);
        setSettlements(null); 
        setFriendError('');
    } catch (error) {
        setFriendError(error.message);
    }
};
    
    const calculateSettlements = () => {
        if (expenses.length === 0) return;

        // 1. Calculate Net Balances for everyone
        const balances = friends.reduce((acc, friend) => ({ ...acc, [friend]: 0 }), {});
        
        expenses.forEach(({ amount, paidBy, splitWith }) => {
            balances[paidBy] += amount;
            const share = amount / splitWith.length;
            splitWith.forEach(friend => { balances[friend] -= share; });
        });

        // 2. Convert balances to an array of objects and filter out those with ~0 balance
        // Structure: [ { name: 'Alice', amount: -50 }, { name: 'Bob', amount: 100 }, ... ]
        let people = Object.keys(balances)
            .map(name => ({ name, amount: balances[name] }))
            .filter(p => Math.abs(p.amount) > 0.01); // Filter out settled people

        // 3. Sort people by amount: Ascending (Debtors -> Creditors)
        people.sort((a, b) => a.amount - b.amount);


        console.time('Settlement Calculation Time');
        const transactions = [];
        let left = 0;                 // Pointer to the biggest debtor (Most negative)
        let right = people.length - 1; // Pointer to the biggest creditor (Most positive)

        // 4. Two Pointers Loop
        while (left < right) {
            const debtor = people[left];
            const creditor = people[right];

            // Determine the amount to settle:
            // It is the minimum of |debtor's debt| and |creditor's credit|
            const amountToSettle = Math.min(Math.abs(debtor.amount), creditor.amount);

            if (amountToSettle > 0.01) {
                transactions.push({ 
                    from: debtor.name, 
                    to: creditor.name, 
                    amount: amountToSettle 
                });
            }

            // Update internal balances after this transaction
            debtor.amount += amountToSettle;   // Debtor pays, balance goes up (closer to 0)
            creditor.amount -= amountToSettle; // Creditor gets paid, balance goes down (closer to 0)

            // 5. Move Pointers if settled
            // Check if debtor is settled (close to 0)
            if (Math.abs(debtor.amount) < 0.01) {
                left++;
            }
            // Check if creditor is settled (close to 0)
            if (Math.abs(creditor.amount) < 0.01) {
                right--;
            }
        }
        console.timeEnd('Settlement Calculation Time');

        // 6. Map transactions back to your existing UI structure
        const finalSettlements = friends.reduce((acc, f) => ({ ...acc, [f]: { owes: [], owedBy: [] } }), {});
        
        transactions.forEach(({ from, to, amount }) => {
            finalSettlements[from].owes.push({ name: to, amount });
            finalSettlements[to].owedBy.push({ name: from, amount });
        });

        setSettlements(finalSettlements);
    };

    if (isLoading) {
        return <div className="text-center p-10 text-xl">Loading Group Data...</div>;
    }

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
                <button onClick={navigateHome} className="flex items-center text-slate-300 hover:text-white transition-colors p-2 rounded-md -ml-2">
                    <ArrowLeftIcon />
                    Back to Home
                </button>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-slate-400 text-sm">Group ID (share with friends):</p>
                    <input
                        type="text"
                        readOnly
                        value={groupId}
                        className="bg-slate-700 text-purple-300 font-mono rounded px-2 py-1 text-sm w-full sm:w-64 text-center sm:text-left"
                        onFocus={(e) => e.target.select()}
                    />
                </div>
            </div>
            
            <h1 className="text-4xl font-bold text-center">Expense Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center"><UserPlusIcon /> Add Friends</h2>
                        <div className="flex gap-2">
                            <input type="text" value={newFriendName} onChange={(e) => { setNewFriendName(e.target.value); setFriendError(''); }} onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()} placeholder="Enter friend's name" className="flex-grow bg-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                            <button onClick={handleAddFriend} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Add</button>
                        </div>
                        {friendError && <p className="text-red-400 mt-2 text-sm">{friendError}</p>}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {friends.map(f => (
                           <div key={f} className="bg-slate-600 text-sm rounded-full px-3 py-1 flex items-center gap-2">
                            <span key={f} className="bg-slate-600 text-sm rounded-full px-3 py-1">{f}</span>
                             <button onClick={() => handleDeleteFriend(f)} title={`Remove ${f}`}>
                <XCircleIcon />
            </button>
            </div>
                            
                        ))}

                        </div>
                    </div>
                     <hr className="border-slate-600" />
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center"><DollarSignIcon /> Add an Expense</h2>
                        {friends.length < 2 ? <p className="text-slate-400">Add at least two friends to start adding expenses.</p> : (
                        <div className="space-y-4">
                            <input type="text" name="description" value={expenseForm.description} onChange={handleExpenseFormChange} placeholder="Expense Description (e.g., Dinner)" className="w-full bg-slate-700 rounded-md p-2"/>
                            <div className="flex gap-4">
                               <input type="number" name="amount" value={expenseForm.amount} onChange={handleExpenseFormChange} placeholder="Amount" className="w-1/2 bg-slate-700 rounded-md p-2" min="0"/>
                               <select name="paidBy" value={expenseForm.paidBy} onChange={handleExpenseFormChange} className="w-1/2 bg-slate-700 rounded-md p-2">
                                   <option value="">Who paid?</option>
                                   {friends.map(f => <option key={f} value={f}>{f}</option>)}
                               </select>
                            </div>
                            <div>
                                <h3 className="mb-2 font-medium">Split with:</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {friends.map(f => (
                                        <label key={f} className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${expenseForm.splitWith.includes(f) ? 'bg-purple-600' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                            <input type="checkbox" checked={expenseForm.splitWith.includes(f)} onChange={() => handleSplitWithChange(f)} className="form-checkbox h-4 w-4 text-purple-600 bg-slate-800 border-slate-500 rounded focus:ring-purple-500" />
                                            <span>{f}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleAddExpense} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Add Expense</button>
                            {expenseError && <p className="text-red-400 mt-2 text-sm">{expenseError}</p>}
                        </div>
                        )}
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                     <h2 className="text-2xl font-semibold mb-4">Expense Log</h2>
                     <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {expenses.length === 0 ? <p className="text-slate-400">No expenses added yet.</p> : (
                            [...expenses].reverse().map(exp => (
                                <div key={exp._id || exp.id} className="bg-slate-700 p-3 rounded-md">
                                    <p className="font-bold">{exp.description} - ${parseFloat(exp.amount).toFixed(2)}</p>
                                    <p className="text-sm text-slate-300">Paid by {exp.paidBy}</p>
                                    <p className="text-xs text-slate-400">Split with: {exp.splitWith.join(', ')}</p>
                                </div>
                            ))
                        )}
                     </div>
                     {expenses.length > 0 && !settlements && (
                        <button onClick={calculateSettlements} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center text-lg">
                            <CalculatorIcon /> Settle Up
                        </button>
                    )}
                </div>
            </div>

            {settlements && (
                 <div className="mt-8">
                    <h2 className="text-3xl font-bold text-center mb-6">Final Settlements</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(settlements).map(([friend, data]) => (
                            <div key={friend} className="bg-slate-800 p-5 rounded-lg shadow-xl border border-slate-700">
                                <h3 className="text-2xl font-semibold text-purple-400 mb-4 text-center">{friend}</h3>
                                {data.owes.length === 0 && data.owedBy.length === 0 ? <p className="text-center text-slate-400">Is all settled up!</p> : (
                                    <div className="space-y-4">
                                        {data.owes.map(debt => (
                                            <div key={debt.name} className="flex items-center justify-between bg-red-900/50 p-3 rounded-md">
                                                <span className="text-red-300">Owes</span>
                                                <div className="flex items-center gap-2 font-mono">
                                                   <span>${debt.amount.toFixed(2)}</span><ArrowRightIcon /><span>{debt.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {data.owedBy.map(credit => (
                                            <div key={credit.name} className="flex items-center justify-between bg-green-900/50 p-3 rounded-md">
                                                <span className="text-green-300">Is owed</span>
                                                <div className="flex items-center gap-2 font-mono">
                                                   <span>${credit.amount.toFixed(2)}</span><span className="text-slate-400">from</span><span>{credit.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </div>
    );
};
export default FriendsPage;