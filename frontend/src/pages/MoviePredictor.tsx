import { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

interface PredictionResult {
  score: number;
  confidence: number;
}

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'TV Movie',
  'Unknown', 'War', 'Western'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// --- Set your backend API URL here ---
const API_BASE_URL = 'https://ott-content-analysis-ojg0.onrender.com';

export default function MoviePredictor() {
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    actor1: '',
    actor2: '',
    actor3: '',
    genres: [] as string[],
    language: 'english',
    releaseMonth: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`Server error: ${errData}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenreChange = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">Movie Score Predictor</h2>
        <p className="text-gray-400 text-lg">
          Enter movie details to predict its potential score
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Movie Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
              placeholder="Enter movie title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Director</label>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
              placeholder="Director name"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {['actor1', 'actor2', 'actor3'].map((actor, i) => (
              <div key={actor}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actor {i + 1}
                </label>
                <input
                  type="text"
                  name={actor}
                  value={(formData as any)[actor]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
                  placeholder={`Actor ${i + 1}`}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Genre (Select multiple)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 bg-black/20 rounded-lg border border-white/10">
              {GENRES.map(genre => (
                <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreChange(genre)}
                    className="w-4 h-4 rounded border-gray-500 text-blue-500"
                  />
                  <span className="text-sm text-gray-300">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Language</label>
            <div className="flex gap-4">
              {['english', 'hindi'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setFormData({ ...formData, language: lang })}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    formData.language === lang
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {lang[0].toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Release Month</label>
            <select
              name="releaseMonth"
              value={formData.releaseMonth}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select month</option>
              {MONTHS.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Predicting...' : 'Predict Score'}
          </button>
        </form>
      </div>

      {/* --- Error Display --- */}
      {error && (
        <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/30 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-500">Error</h3>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Result Display --- */}
      {result && (
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-2xl p-8 border border-blue-500/30">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">Prediction Result</h3>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-gray-400 mb-2">Predicted Score</p>
              <div className="flex items-end space-x-2">
                <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
                  {result.score.toFixed(2)}
                </span>
                <span className="text-3xl text-gray-500 mb-2">/100</span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 mb-2">Confidence Level</p>
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-1000"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <span className="text-white font-semibold">{result.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
