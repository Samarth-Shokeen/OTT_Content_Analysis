import { useState } from 'react';
import Navigation from './components/Navigation';
import MoviePredictor from './pages/MoviePredictor';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'predictor' | 'dashboard'>('predictor');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="container mx-auto px-4 py-8">
        {currentPage === 'predictor' ? <MoviePredictor /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;
