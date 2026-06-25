import React, { useState, useEffect } from 'react';
import { Search, Filter, Image as ImageIcon, AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/analysis/history');
      setHistory(response.data.history);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (analysisData) => {
    navigate('/dashboard/analysis', { state: { analysisData } });
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevent card click
    setDeleteModal({ isOpen: true, id, error: null });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, error: null }));
      await axios.delete(`/analysis/history/${deleteModal.id}`);
      setHistory(history.filter(item => item._id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, error: null });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setDeleteModal(prev => ({ ...prev, error: "Session expired! Please log out and log back in." }));
      } else {
        setDeleteModal(prev => ({ ...prev, error: "Failed to delete history record." }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background text-primaryText">
        <Loader2 size={48} className="text-accent animate-spin" />
      </div>
    );
  }

  const aiDetectedCount = history.filter(item => item.ai_result?.label === 'artificial').length;

  return (
    <div className="w-full min-h-full p-10 bg-background text-primaryText">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analysis History</h1>
        <p className="text-secondaryText">View and manage your previous image analyses</p>
      </div>

      {/* Search and Stats Section */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-8">
        
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryText" size={20} />
            <input 
              type="text" 
              placeholder="Search by filename..."
              className="w-full bg-sidebar border-none rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 text-primaryText placeholder:text-secondaryText"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-sidebar rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Filter size={20} />
            <span className="font-medium">All Results</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border rounded-2xl p-6">
            <h4 className="text-sm text-secondaryText mb-2">Total Analyses</h4>
            <p className="text-3xl font-bold">{history.length}</p>
          </div>
          <div className="border border-border rounded-2xl p-6">
            <h4 className="text-sm text-secondaryText mb-2">AI Detected</h4>
            <p className="text-3xl font-bold text-red-500">{aiDetectedCount}</p>
          </div>
          <div className="border border-border rounded-2xl p-6">
            <h4 className="text-sm text-secondaryText mb-2">Authentic</h4>
            <p className="text-3xl font-bold text-green-500">{history.length - aiDetectedCount}</p>
          </div>
        </div>

      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {history.length === 0 ? (
          <div className="col-span-full py-12 text-center text-secondaryText">
            No analyses found. Upload an image to get started.
          </div>
        ) : (
          history.map((item) => {
            const isAI = item.ai_result?.label === 'artificial';
            let dateObj = new Date(item.created_at);
            if (isNaN(dateObj.getTime())) dateObj = new Date();
            const date = dateObj.toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            });
            return (
              <div 
                key={item._id} 
                onClick={() => handleCardClick(item)}
                className="bg-card rounded-3xl p-4 shadow-sm border border-border group hover:border-accent/50 transition-colors cursor-pointer"
              >
                <div className="w-full aspect-square bg-sidebar rounded-2xl flex items-center justify-center relative mb-4 overflow-hidden">
                  <img 
                    src={`${API_BASE}/api/analysis/image/${item.saved_filename}`} 
                    alt={item.original_filename} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-card shadow-sm
                    ${isAI ? 'text-red-500 border border-red-200 dark:border-red-900' : 'text-green-500 border border-green-200 dark:border-green-900'}`}
                  >
                    {isAI ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                    {isAI ? 'AI' : 'Real'}
                  </div>
                </div>
                <div className="px-2 flex justify-between items-start">
                  <div className="overflow-hidden pr-2">
                    <h4 className="font-semibold truncate" title={item.original_filename}>{item.original_filename}</h4>
                    <p className="text-sm text-secondaryText mt-1">Analyzed on {date}</p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteClick(e, item._id)}
                    className="p-2 flex-shrink-0 text-secondaryText hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border mx-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Delete Analysis</h3>
            <p className="text-secondaryText mb-6">
              Are you sure you want to permanently delete this analysis? This action cannot be undone.
            </p>
            
            {deleteModal.error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
                {deleteModal.error}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="px-6 py-3 rounded-xl font-medium text-secondaryText hover:bg-sidebar transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-6 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default History;
