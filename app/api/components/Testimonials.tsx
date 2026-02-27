'use client';

import { useState, useEffect, useRef } from 'react';

// --- DUMMY TESTIMONIALS DATA (Food Category Specific) ---
const testimonialsData = [
  { id: 1, name: 'Priyanshu', handle: '@priyanshu00', text: 'Fun & Foods has the best Fast Food in Rani! The burgers are super juicy and delivery is always on time.', date: '12 Jan 2026', img: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Nikhil Kumar', handle: '@thala07', text: 'Absolutely love their pizzas! The crust is so soft and toppings are fresh. Highly recommend ordering from here.', date: '03 Feb 2026', img: 'https://i.pravatar.cc/150?img=12' },
  { id: 3, name: 'Kunal', handle: '@kunal18', text: 'Bhai maza aa gaya! The Thali was completely authentic and felt like home-cooked food. Best cloud kitchen!', date: '19 Aug 2025', img: 'https://i.pravatar.cc/150?img=13' },
  { id: 4, name: 'Umar Faruk', handle: '@umarfaruk', text: 'Super fast delivery even in Rani Gaov. Food was piping hot when it arrived. Ordering process on WhatsApp is smooth.', date: '23 May 2025', img: 'https://i.pravatar.cc/150?img=14' },
  { id: 5, name: 'Sneha Kapoor', handle: '@neha98', text: 'Great taste and premium packaging. The Chinese platters are just mind-blowing. Will definitely order again.', date: '08 Apr 2025', img: 'https://i.pravatar.cc/150?img=5' },
  { id: 6, name: 'Bhagwan Jha', handle: '@bkjha', text: 'Best catering and daily food service in the area. Food quality never drops. 10/10 service every single time.', date: '07 Dec 2025', img: 'https://i.pravatar.cc/150?img=8' }
];

// NAYA: Scroll Animation ke liye custom component jisse scroll karne par item aaye
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
      { threshold: 0.15 } // Jab 15% card screen par aaye tab animation trigger hoga
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
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* Auto-Scrolling Marquee Animations (Double Direction) */
        @keyframes scrollXLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.5rem)); }
        }
        @keyframes scrollXRight {
          0% { transform: translateX(calc(-50% - 0.5rem)); }
          100% { transform: translateX(0); }
        }
        
        .animate-scroll-left {
          animation: scrollXLeft 30s linear infinite;
          width: max-content;
        }
        .animate-scroll-right {
          animation: scrollXRight 30s linear infinite;
          width: max-content;
        }
        
        .animate-scroll-left:hover, .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* --- NAYA: PREMIUM TESTIMONIALS SECTION --- */}
      <section className="bg-[#0b1120] py-20 sm:py-24 relative overflow-hidden border-t-4 border-slate-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex justify-center">
           <h2 className="text-[12vw] font-black text-white tracking-widest whitespace-nowrap">TESTIMONIAL</h2>
        </div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10 sm:mb-14">
            <ScrollReveal>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Loved By Our Foodies</h3>
              <p className="text-slate-400 font-medium max-w-xl mx-auto text-sm sm:text-base">See what our customers have to say about our premium quality, authentic taste, and lightning-fast delivery.</p>
            </ScrollReveal>
          </div>
          
          {/* FULL WIDTH MARQUEE WRAPPERS */}
          <div className="relative w-full overflow-hidden flex flex-col gap-4 sm:gap-6">
             <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#0b1120] to-transparent z-20 pointer-events-none"></div>
             <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#0b1120] to-transparent z-20 pointer-events-none"></div>
             
             {/* ROW 1: Right to Left */}
             <div className="relative flex group w-full">
               <div className="animate-scroll-left flex gap-4 items-stretch px-4">
                 {[...testimonialsData, ...testimonialsData].map((testimonial, idx) => (
                    <div key={`row1-${idx}`} className="w-[260px] sm:w-[320px] shrink-0 bg-[#151c2f] rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col shadow-xl hover:border-slate-600 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <img src={testimonial.img} alt={testimonial.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-700" />
                        <div>
                          <h4 className="text-white font-bold flex items-center gap-1.5 text-sm sm:text-base">
                            {testimonial.name}
                            <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                            </svg>
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-400">{testimonial.handle}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 flex-grow">"{testimonial.text}"</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{testimonial.date}</p>
                    </div>
                 ))}
               </div>
             </div>

             {/* ROW 2: Left to Right */}
             <div className="relative flex group w-full">
               <div className="animate-scroll-right flex gap-4 items-stretch px-4">
                 {[...testimonialsData, ...testimonialsData].reverse().map((testimonial, idx) => (
                    <div key={`row2-${idx}`} className="w-[260px] sm:w-[320px] shrink-0 bg-[#151c2f] rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col shadow-xl hover:border-slate-600 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <img src={testimonial.img} alt={testimonial.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-700" />
                        <div>
                          <h4 className="text-white font-bold flex items-center gap-1.5 text-sm sm:text-base">
                            {testimonial.name}
                            <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                            </svg>
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-400">{testimonial.handle}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 flex-grow">"{testimonial.text}"</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{testimonial.date}</p>
                    </div>
                 ))}
               </div>
             </div>

          </div>
        </div>
      </section>
    </>
  );
}