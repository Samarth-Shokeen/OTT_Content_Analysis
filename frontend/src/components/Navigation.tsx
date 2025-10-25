import { Film, BarChart3 } from 'lucide-react';

interface NavigationProps {
  currentPage: 'predictor' | 'dashboard';
  onPageChange: (page: 'predictor' | 'dashboard') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bg-black/40 backdrop-blur-lg border-b border-blue-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
              <Film className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
                CineMetrics
              </h1>
              <p className="text-xs text-gray-400">Movie Analytics Platform</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange('predictor')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentPage === 'predictor'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Film className="w-5 h-5" />
              <span>Score Predictor</span>
            </button>

            <button
              onClick={() => onPageChange('dashboard')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentPage === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
