import React, { useState} from 'react';
import HomePage from './Components/HomePage';
import FriendsPage from './Components/FriendsPage';





export default function App() {
    const [route, setRoute] = useState('home');
    const [groupId, setGroupId] = useState(null);

    const navigateToDashboard = (id) => {
        setGroupId(id);
        setRoute('friends');
    };
    
    const navigateToHome = () => {
        setGroupId(null);
        setRoute('home');
    }

    const renderContent = () => {
        if (route === 'friends' && groupId) {
            return <FriendsPage navigateHome={navigateToHome} groupId={groupId} />;
        }
        return <HomePage navigateToDashboard={navigateToDashboard} />;
    };

    return (
        <main className="bg-slate-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </main>
    );
}






