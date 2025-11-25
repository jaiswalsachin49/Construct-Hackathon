import React from 'react';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

 
const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#fb923c" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="9" r="2.5" stroke="#fdba74" strokeWidth="1.3"/>
  </svg>
);
const ExchangeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M7 10l5-5 5 5M7 14l5 5 5-5" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5v14" stroke="#22d3ee" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
    <path d="M9 12l2 2 4-4" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CommunityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3" stroke="#c4b5fd" strokeWidth="1.4"/>
    <circle cx="15" cy="11" r="2.5" stroke="#a78bfa" strokeWidth="1.4"/>
    <path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6M15 20c0-2.5 2-4 4-4s4 1.5 4 4" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const VerifiedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const GrowthIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 17l6-6 4 4 8-8" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 7h4v4" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FeatureTile = ({ icon, borderColor, title, subtitle, desc, pro }) => (
  <div 
    className="relative rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
    style={{
      background: 'linear-gradient(#0a0f1e, #0a0f1e) padding-box, linear-gradient(180deg, rgba(93,138,255,0.25), rgba(15,34,64,0.4)) border-box',
      border: '1px solid transparent',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.35), 0 12px 28px rgba(0,0,0,0.55), 0 2px 10px rgba(12,36,80,0.5)',
    }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%), #0b1020',
            boxShadow: 'inset 0 0 14px rgba(255,255,255,0.05), 0 6px 16px rgba(0,0,0,0.5)',
            border: `1px solid ${borderColor}`,
          }}
        >
          {icon}
        </div>
        <div className="text-left">
          <h4 className="text-sm font-bold flex items-center gap-2">
            {title} 
            {pro && (
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-700 text-white tracking-wide">
                PRO
              </span>
            )}
          </h4>
          <div className="text-xs text-gray-400">{subtitle}</div>
        </div>
      </div>
      <div className="w-6 h-6 flex items-center justify-center opacity-55 hover:opacity-85 transition-opacity cursor-pointer">
        <ArrowIcon />
      </div>
    </div>
    <div className="text-[13px] text-slate-300 leading-relaxed mt-4">
      {desc}
    </div>
  </div>
);

const Features = () => {
  return (
    <section 
      className="relative text-white min-h-screen w-full px-5 sm:px-8 md:px-10 py-14 md:py-20 flex items-start justify-center overflow-hidden"
      style={{
        background: `
          radial-gradient(1100px 700px at 110% -10%, rgba(59,130,246,0.32), rgba(2,6,23,0) 45%),
          radial-gradient(950px 600px at -10% 5%, rgba(37,99,235,0.23), rgba(2,6,23,0) 50%),
          linear-gradient(180deg, #030712, #020617 60%)
        `,
      }}
    >
 
      <div 
        className="absolute pointer-events-none rounded-[36px]"
        style={{
          top: '70px',
          left: '80px',
          width: '540px',
          height: '300px',
          background: 'radial-gradient(520px 300px at 0% 0%, rgba(59,130,246,0.25), rgba(2,6,23,0) 60%)',
          boxShadow: 'inset 0 0 1px rgba(59,130,246,0.8)',
          filter: 'blur(14px)',
        }}
      />
      <div 
        className="absolute pointer-events-none rounded-[36px]"
        style={{
          top: '70px',
          right: '80px',
          width: '540px',
          height: '300px',
          background: 'radial-gradient(520px 300px at 100% 0%, rgba(59,130,246,0.25), rgba(2,6,23,0) 60%)',
          boxShadow: 'inset 0 0 1px rgba(59,130,246,0.8)',
          filter: 'blur(14px)',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
 
        <div className="mb-6 flex items-center justify-center">
          <span className="inline-flex items-center gap-2.5 px-2.5 py-1.5 font-light rounded-full text-slate-300 bg-slate-900/60 border border-slate-600/60 text-sm">
             Why SkillSwap
          </span>
        </div>

 
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semilight leading-tight">
          Connect, Learn & Grow
          <br />
          <span className="text-white/80">Together In Your Community</span>
        </h2>

    
        <p className="max-w-3xl mx-auto mt-4 text-slate-400 text-base">
          Discover local skill-sharing opportunities and build meaningful connections 
          with people in your neighborhood who share your passions.
        </p>

      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <FeatureTile
            icon={<LocationIcon />}
            borderColor="rgba(255,165,0,0.35)"
            title="Connect Locally"
            subtitle="Nearby Matches"
            desc="Find people near you who share your interests and want to learn what you can teach. Build your local network with verified community members."
            pro
          />
          <FeatureTile
            icon={<ExchangeIcon />}
            borderColor="rgba(56,189,248,0.4)"
            title="Skill Exchange"
            subtitle="Trade & Learn"
            desc="Trade skills and knowledge. Teach what you know, learn what you want. No money involved—just pure skill-sharing and mutual growth."
          />
          <FeatureTile
            icon={<ShieldIcon />}
            borderColor="rgba(74,222,128,0.35)"
            title="Safe Meetups"
            subtitle="Protected Platform"
            desc="Built-in safety features and community reporting to ensure secure connections. Every user is verified for your peace of mind."
          />
          <FeatureTile
            icon={<CommunityIcon />}
            borderColor="rgba(168,85,247,0.35)"
            title="Build Community"
            subtitle="Lasting Bonds"
            desc="Join local communities, share stories, and create lasting friendships. Connect with like-minded individuals in your area."
          />
          <FeatureTile
            icon={<VerifiedIcon />}
            borderColor="rgba(250,204,21,0.45)"
            title="Verified Members"
            subtitle="Trusted Network"
            desc="All members go through our verification process. Meet real people with genuine skills and authentic learning goals in a trusted environment."
            pro
          />
          <FeatureTile
            icon={<GrowthIcon />}
            borderColor="rgba(59,130,246,0.4)"
            title="Track Your Growth"
            subtitle="Progress Insights"
            desc="Monitor your learning journey and teaching impact. Earn badges, track exchanges, and see your community contribution grow over time."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
