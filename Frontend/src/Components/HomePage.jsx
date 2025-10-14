import React from "react";
import { useState } from "react";
const API_BASE_URL = 'https://expense-tracker-2-vq4x.onrender.com';
const HomePage = ({ navigateToDashboard }) => {
    const [joinId, setJoinId] = useState('');
    const [error, setError] = useState('');

    const handleCreateGroup = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to create group');
            const data = await response.json();
            navigateToDashboard(data._id);
        } catch (err) {
            setError('Could not create a new group. Please try again.');
        }
    };

    const handleJoinGroup = async () => {
        if (!joinId.trim()) {
            setError('Please enter a Group ID.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups/${joinId.trim()}`);
            if (!response.ok) {
                 throw new Error("Group not found");
            }
            navigateToDashboard(joinId.trim());
        } catch (err) {
            setError('Invalid Group ID. Please check and try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text mb-4">
                SplitFair
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-8">
                Create a new group or join an existing one to start splitting expenses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                 <button
                    onClick={handleCreateGroup}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out"
                >
                    Create a New Group
                </button>
                 <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={joinId}
                        onChange={(e) => { setJoinId(e.target.value); setError(''); }}
                        placeholder="Enter Group ID to Join"
                        className="bg-slate-700 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button onClick={handleJoinGroup} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-full transition-colors">
                        Join
                    </button>
                </div>
            </div>
            {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
    );
};
export default HomePage;