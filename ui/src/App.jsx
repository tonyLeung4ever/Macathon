import Users from './pages/Users';

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-800">Macathon</h1>
                </div>
            </nav>
            <main>
                <Users />
            </main>
        </div>
    );
}

export default App;
