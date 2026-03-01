'use client';

import { useState, useEffect, useRef } from 'react';

// --- Types ---
interface ReviewType {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string; 
}

// Scroll Animation Component
function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { threshold: 0.15 } 
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`${className} transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function Testimonial() {
  // --- States ---
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState(5); // Default rating
  const [hoveredRating, setHoveredRating] = useState(0); // Star hover effect ke liye
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews'); 
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) {
      alert('Kripya apna naam aur review zaroor daalein.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, rating: newRating, comment: newComment }),
      });

      if (res.ok) {
        alert('Thank you! Aapka review turant live ho gaya hai. 🎉');
        setShowForm(false);
        setNewName('');
        setNewComment('');
        setNewRating(5);
        setHoveredRating(0);
        
        // Form submit hote hi fresh data laao (Live review instantly dikhane ke liye)
        fetchReviews();
      } else {
        alert('Review submit karne me error aayi. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const marqueeReviews = reviews.length > 0 
    ? [...reviews, ...reviews, ...reviews, ...reviews] 
    : [];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollXLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.5rem)); }
        }
        @keyframes scrollXRight {
          0% { transform: translateX(calc(-50% - 0.5rem)); }
          100% { transform: translateX(0); }
        }
        
        .animate-scroll-left {
          animation: scrollXLeft 40s linear infinite;
          width: max-content;
        }
        .animate-scroll-right {
          animation: scrollXRight 40s linear infinite;
          width: max-content;
        }
        
        .animate-scroll-left:hover, .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}} />

      <section className="bg-[#0b1120] py-20 sm:py-24 relative overflow-hidden border-t-4 border-slate-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex justify-center">
           <h2 className="text-[12vw] font-black text-white tracking-widest whitespace-nowrap">TESTIMONIAL</h2>
        </div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Loved By Our Foodies</h3>
                  <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base">
                    See what our customers have to say about our premium quality, authentic taste, and lightning-fast delivery.
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50 whitespace-nowrap active:scale-95 border border-blue-500"
                >
                  {showForm ? 'Cancel Form' : 'Write a Review ✍️'}
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* ADD REVIEW FORM */}
          {showForm && (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-16 relative z-30">
              <ScrollReveal>
                <div className="bg-[#151c2f] p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <h4 className="font-extrabold text-2xl mb-6 text-white flex items-center gap-2">
                    Share Your Experience
                  </h4>
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Your Name</label>
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                        className="w-full p-3.5 rounded-xl border border-slate-700 bg-[#0b1120] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                        placeholder="E.g. Sanjay Choudhary"
                        required 
                      />
                    </div>
                    
                    {/* Interactive Star Rating */}
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Rate your experience</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <svg 
                              className={`w-10 h-10 ${star <= (hoveredRating || newRating) ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-600'} transition-colors duration-200`} 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        ))}
                        <span className="ml-3 text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                          {newRating === 5 ? 'Excellent!' : newRating === 4 ? 'Very Good' : newRating === 3 ? 'Good' : newRating === 2 ? 'Average' : 'Poor'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Your Review</label>
                      <textarea 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)} 
                        rows={3} 
                        className="w-full p-3.5 rounded-xl border border-slate-700 bg-[#0b1120] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none" 
                        placeholder="Bataiye aapko khana kaisa laga..."
                        required
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full bg-blue-600 text-white font-extrabold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/50 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Submitting...</>
                      ) : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-400 font-medium">Loading amazing reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 max-w-lg mx-auto bg-[#151c2f] rounded-2xl border border-slate-800 m-4">
              <p className="text-2xl mb-2">🤔</p>
              <p className="text-slate-300 font-bold text-lg">No reviews yet.</p>
              <p className="text-slate-500 text-sm mt-1">Be the first to taste and review our food!</p>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden flex flex-col gap-4 sm:gap-6 pt-4">
               <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#0b1120] to-transparent z-20 pointer-events-none"></div>
               <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#0b1120] to-transparent z-20 pointer-events-none"></div>
               
               {/* ROW 1: Right to Left */}
               <div className="relative flex group w-full">
                 <div className="animate-scroll-left flex gap-4 items-stretch px-4">
                   {marqueeReviews.map((testimonial, idx) => (
                      <div key={`row1-${testimonial._id}-${idx}`} className="w-[260px] sm:w-[320px] shrink-0 bg-[#151c2f] rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col shadow-xl hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=1e293b&color=fff`} alt={testimonial.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-700" />
                          <div>
                            <h4 className="text-white font-bold flex items-center gap-1.5 text-sm sm:text-base capitalize">
                              {testimonial.name}
                              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                              </svg>
                            </h4>
                            <div className="flex text-yellow-400 text-[10px] sm:text-xs mt-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < testimonial.rating ? 'opacity-100 drop-shadow-sm' : 'opacity-20'}>⭐</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 flex-grow">"{testimonial.comment}"</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{formatDate(testimonial.createdAt)}</p>
                      </div>
                   ))}
                 </div>
               </div>

               {/* ROW 2: Left to Right */}
               <div className="relative flex group w-full">
                 <div className="animate-scroll-right flex gap-4 items-stretch px-4">
                   {[...marqueeReviews].reverse().map((testimonial, idx) => (
                      <div key={`row2-${testimonial._id}-${idx}`} className="w-[260px] sm:w-[320px] shrink-0 bg-[#151c2f] rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col shadow-xl hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=1e293b&color=fff`} alt={testimonial.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-700" />
                          <div>
                            <h4 className="text-white font-bold flex items-center gap-1.5 text-sm sm:text-base capitalize">
                              {testimonial.name}
                              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                              </svg>
                            </h4>
                            <div className="flex text-yellow-400 text-[10px] sm:text-xs mt-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < testimonial.rating ? 'opacity-100 drop-shadow-sm' : 'opacity-20'}>⭐</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 flex-grow">"{testimonial.comment}"</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{formatDate(testimonial.createdAt)}</p>
                      </div>
                   ))}
                 </div>
               </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}