import React from 'react';
const designerImage = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const About = () => {
    return (
        <div className="bg-black text-white min-h-screen flex items-center justify-center p-4 sm:p-8 w-full"
            style={{

                backgroundImage:
                    'radial-gradient(1100px 700px at var(--x,70%) var(--y,15%), rgba(37,99,235,0.35), rgba(2,6,23,0.9) 40%), ' +

                    'radial-gradient(1200px 800px at 110% -10%, rgba(37,99,235,0.85), rgba(2,6,23,0.0) 40%), ' +

                    'radial-gradient(900px 700px at -5% 60%, rgba(2, 6, 23, 0.0), rgba(30,58,138,0.65) 10%, rgba(2,6,23,0.0) 50%), ' +

                    'linear-gradient(180deg, rgba(3,6,23,1) 0%, rgba(2,6,23,1) 60%)',
            }}>
            <div className="
       
        border border-gray-800/50
        rounded-xl
        p-6 md:p-10
        shadow-2xl shadow-blue-900/40
        w-full 
        flex flex-col lg:flex-row 
        space-y-6 lg:space-y-0 lg:space-x-12
      ">

                <div className="
          flex-shrink-0
          relative
          w-full lg:w-1/2 
          min-h-[300px] lg:min-h-full
        ">
                    <div className="
            absolute inset-0
            rounded-xl
            overflow-hidden
            shadow-inner-xl shadow-blue-500/20
            after:absolute after:inset-0 after:shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] after:rounded-xl
            "
                        style={{
                            boxShadow: '0 0 50px rgba(0, 0, 0, 0.5), 0 0 10px rgba(70, 130, 180, 0.3)',
                            border: '1px solid rgba(70, 130, 180, 0.2)'
                        }}
                    >
                        <img
                            src={designerImage}
                            alt="People sharing skills and connecting"
                            className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute top-4 left-4 h-3 w-3 bg-white rounded-full opacity-80 border-2 border-black/50"></div>
                        <div className="absolute top-6 left-6 h-1 w-1 bg-white rounded-full opacity-60 border border-black/50"></div>
                    </div>
                </div>


                <div className="w-full lg:w-1/2 flex flex-col justify-center">


                    <div className="flex items-center mb-4 text-sm font-semilight">
                        <span className="
              bg-gray-800/70
              px-3 py-1
              rounded-full
              border border-gray-700
              text-gray-300
            ">
                            Join SkillSwap
                        </span>
                    </div>


                    <h1 className="
            text-4xl sm:text-5xl md:text-5xl lg:text-6xl
            font-semilight
            leading-tight
            mb-4
          ">
                        Share Skills <br />
                        <span className="text-white/90">Build Community</span>
                    </h1>


                    <p className="
            text-gray-400
            mb-8
            text-base
          ">
                        Connect with people nearby to teach what you know and learn what you love. <br />
                        Safe, local skill-sharing platform.
                    </p>


                    <div className="space-y-3 mb-10">
                        <div className="flex items-center text-lg text-gray-300">
                            <span className="text-blue-500 mr-3 text-xl">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            </span>
                            Find local skill partners
                        </div>
                        <div className="flex items-center text-lg text-gray-300">
                            <span className="text-blue-500 mr-3 text-xl">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            </span>
                            Safe and verified meetups
                        </div>
                    </div>


                    <div className="flex items-center justify-start space-x-6">
                        <button className="
              bg-blue-600 hover:bg-blue-700
              text-white
              font-bold
              py-3 px-6
              rounded-lg
              shadow-lg shadow-blue-500/50
              transition duration-300
              text-base
            ">
                            Start Learning
                        </button>

                        <div className="flex flex-col items-center">
                            <div className="text-yellow-400 text-2xl tracking-widest leading-none mb-1">
                                ★★★★★
                            </div>
                            <p className="text-gray-400 text-sm">
                                5K+ Members
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;