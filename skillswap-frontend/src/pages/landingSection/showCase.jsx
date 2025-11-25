import React from 'react';
import { useNavigate } from 'react-router-dom';

// Showcase / Hero Section matching provided UI
// Uses TailwindCSS utility classes; complex gradients done via inline style.
// Images use Unsplash sample URLs; replace with your own as needed.

const imagesRow1 = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpbGx8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1483639130939-150975af84e5?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1556711905-b3f402e1ff80?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1675434301763-594b4d0c5819?q=80&w=1752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const imagesRow2 = [
  'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1675434301763-594b4d0c5819?q=80&w=1752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const Showcase = () => {
  const navigate = useNavigate();
  return (
    <section className="relative w-full min-h-screen bg-black text-white flex flex-col items-center justify-start pt-20 pb-24 overflow-hidden">
 
         <style>{`
           @keyframes marquee-right {
             0% { transform: translateX(-50%); }
             100% { transform: translateX(0); }
           }
			       @keyframes marquee-left {
				       0% { transform: translateX(0); }
				       100% { transform: translateX(-50%); }
			       }
			       .marquee-row {
				       display: flex;
				       gap: 2rem;
				       width: max-content;
			       }
			       .marquee-outer {
				       overflow: hidden;
				       width: 100%;
			       }
			       .marquee-top {
				       animation: marquee-right 18s linear infinite;
			       }
			       .marquee-bottom {
				       animation: marquee-left 20s linear infinite;
			       }
		       `}</style>
      
      <div
        className="pointer-events-none absolute top-28 left-[140px] hidden lg:block w-[320px] h-[180px]"
        style={{
          background:
            'linear-gradient(150deg, rgba(0,28,74,0.85), rgba(0,17,40,0.4) 70%, rgba(0,0,0,0))',
          boxShadow:
            'inset 0 0 0 1px rgba(0,102,255,0.35), 0 20px 50px -15px rgba(0,60,180,0.55)',
          clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)',
          borderRadius: '28px',
          opacity: 0.85,
        }}
      />
      <div
        className="pointer-events-none absolute top-28 right-[140px] hidden lg:block w-[320px] h-[180px]"
        style={{
          background:
            'linear-gradient(210deg, rgba(0,28,74,0.85), rgba(0,17,40,0.4) 70%, rgba(0,0,0,0))',
          boxShadow:
            'inset 0 0 0 1px rgba(0,102,255,0.35), 0 20px 50px -15px rgba(0,60,180,0.55)',
          clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
          borderRadius: '28px',
          opacity: 0.85,
        }}
      />

 
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-6">
        <div className="flex items-center gap-2 rounded-xl bg-[#0d1422] border border-white/10 px-4 py-2 mb-6 text-sm font-medium shadow">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          SkillSwap
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] leading-tight font-medium tracking-wide mb-2">
          Swap Skills. Grow Faster.
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-[2.2rem] leading-tight font-medium text-gray-300 mb-6">
          Peer-to-Peer Learning Powered by Communities
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-xl mb-6 leading-relaxed">
          Exchange what you know for what you want to learn. Join niche communities, earn badges for real progress, drop a wave to connect, and build meaningful collaborations through chat & shared projects.
        </p>
        <button
          className="group relative inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-sm font-semibold shadow-lg transition"
        >
          <span className="relative z-10 flex items-center gap-2" onClick={() => navigate('/auth/register')}>
            Explore Communities
          </span>
          <span
            className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition"
          />
        </button>
      </div>

 
      <div className="relative z-10 mt-14 w-full flex flex-col gap-10 items-center">
          <div className="marquee-outer" style={{ width: '60%', margin: '0 auto' }}>
           <div className="marquee-row marquee-top">
             {imagesRow1.map((src, i) => (
               <div
                 key={`r1a-${i}`}
                 className="group relative rounded-2xl overflow-hidden bg-[#070b12] border border-white/10 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.65)] transition min-w-[320px] mx-2"
                 style={{ height: 260, width: 340 }}
               >
                 <img
                   src={src}
                   alt="Skill sharing inspiration visual"
                   className="h-full w-full object-cover object-center brightness-90 group-hover:brightness-100 transition duration-300"
                   loading="lazy"
                 />
                 <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
               </div>
             ))}
             {imagesRow1.map((src, i) => (
              <div
               key={`r1b-${i}`}
                className="group relative rounded-2xl overflow-hidden bg-[#070b12] border border-white/10 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.65)] transition min-w-[320px] mx-2"
                style={{ height: 260, width: 340 }}
              >
                <img
                  src={src}
                 alt="Skill sharing inspiration visual duplicate"
                  className="h-full w-full object-cover object-center brightness-90 group-hover:brightness-100 transition duration-300"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </div>
             ))}
          </div>
        </div>
 
        <div className="marquee-outer" style={{ width: '60%', margin: '0 auto' }}>
          <div className="marquee-row marquee-bottom">
            {[...imagesRow2, ...imagesRow2].map((src, i) => (
              <div
                key={`r2-${i}`}
                className="group relative rounded-2xl overflow-hidden bg-[#070b12] border border-white/10 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.65)] transition min-w-[320px] mx-2"
                style={{ height: 260, width: 340 }}
              >
                <img
                  src={src}
                  alt="Community learning showcase image"
                  className="h-full w-full object-cover object-center brightness-90 group-hover:brightness-100 transition duration-300"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
