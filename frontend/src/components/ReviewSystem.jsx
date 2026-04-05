import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewSystem({ restaurantId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          review_id,
          rating,
          comment,
          review_date,
          customers (name)
        `)
        .eq('restaurant_id', restaurantId)
        .order('review_date', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Please login to leave a review' });
      return;
    }

    if (!newReview.comment.trim()) {
      setMessage({ type: 'error', text: 'Please add a comment' });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('reviews')
        .insert([{
          customer_id: user.id,
          restaurant_id: restaurantId,
          rating: newReview.rating,
          comment: newReview.comment
        }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Review submitted successfully!' });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      setMessage({ type: 'error', text: 'Failed to submit review' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-white border-l-4 border-amber-500 pl-3">
          Customer Reviews
        </h3>
        <div className="flex items-center gap-2 text-sm font-bold text-white-500 uppercase tracking-widest">
          <MessageSquare size={16} />
          {reviews.length} Reviews
        </div>
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="glass-card p-6 shadow-md border-white/10">
          <h4 className="font-bold text-white mb-4">Write your review</h4>

          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewReview({ ...newReview, rating: star })}
                className={`transition-all ${star <= newReview.rating ? 'text-amber-500 scale-110' : 'text-slate-600'}`}
              >
                <Star size={24} fill={star <= newReview.rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>

          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            placeholder="Share your experience with this restaurant..."
            className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none text-white placeholder:text-slate-500"
          />

          <div className="mt-4 flex items-center justify-between">
            {message.text && (
              <span className={`text-sm font-bold ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message.text}
              </span>
            )}
            <button
              disabled={submitting}
              className="ml-auto flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
              <Send size={18} />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-amber-500/5 rounded-2xl p-6 text-center border border-amber-500/10">
          <p className="text-amber-500 font-bold">Sign in to share your thoughts!</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="animate-pulse bg-white/5 h-32 rounded-2xl"></div>
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={review.review_id}
              className="glass-card p-6 shadow-sm border-white/10"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                    <User size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{review.customers?.name || 'Anonymous'}</h5>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(review.review_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg text-amber-500 font-bold text-sm border border-amber-500/10">
                  <Star size={14} fill="currentColor" />
                  {review.rating}
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed italic">"{review.comment}"</p>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 font-medium italic italic">No reviews yet. Be the first to leave one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
