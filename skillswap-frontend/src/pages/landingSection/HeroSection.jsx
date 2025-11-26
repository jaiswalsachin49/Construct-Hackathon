import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Button from '../../components/common/Button'

// Tailwind-first implementation with a dynamic, mouse-following gradient
export default function HeroSection() {
    const ref = useRef(null)
    const navigate = useNavigate()
    const skills = ['Photography', 'Guitar', 'Coding', 'Yoga', 'Cooking', 'Painting', 'Running']

    useEffect(() => {
        const el = ref.current
        if (!el) return

        let rafId = null
        const updateVars = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX
            const clientY = e.touches ? e.touches[0].clientY : e.clientY
            const rect = el.getBoundingClientRect()
            const x = ((clientX - rect.left) / rect.width) * 100
            const y = ((clientY - rect.top) / rect.height) * 100
            if (rafId) cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(() => {
                el.style.setProperty('--x', x + '%')
                el.style.setProperty('--y', y + '%')
            })
        }

        const reset = () => {
            el.style.setProperty('--x', '70%')
            el.style.setProperty('--y', '15%')
        }

        reset()
        el.addEventListener('mousemove', updateVars)
        el.addEventListener('touchmove', updateVars, { passive: true })
        el.addEventListener('mouseleave', reset)
        el.addEventListener('touchend', reset)
        return () => {
            el.removeEventListener('mousemove', updateVars)
            el.removeEventListener('touchmove', updateVars)
            el.removeEventListener('mouseleave', reset)
            el.removeEventListener('touchend', reset)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [])

    return (
        <section
            ref={ref}
            className="relative isolate h-screen overflow-hidden"
            style={{

                backgroundImage:
                    'radial-gradient(1100px 700px at var(--x,70%) var(--y,15%), rgba(37,99,235,0.35), rgba(2,6,23,0.9) 40%), ' +

                    'radial-gradient(1200px 800px at 110% -10%, rgba(37,99,235,0.85), rgba(2,6,23,0.0) 40%), ' +

                    'radial-gradient(900px 700px at -5% 60%, rgba(2, 6, 23, 0.0), rgba(30,58,138,0.65) 10%, rgba(2,6,23,0.0) 50%), ' +

                    'linear-gradient(180deg, rgba(3,6,23,1) 0%, rgba(2,6,23,1) 60%)',
            }}
        >

            <style>{`
        @keyframes xmarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .skills-track { width:200%; display:flex; gap:0.75rem; animation:xmarquee 22s linear infinite; }
      `}</style>
            <div className="absolute inset-x-0 top-0 z-20">
                <nav className="backdrop-blur-xl bg-white/5 border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-0">
                                <div className="w-16 h-16 flex items-center justify-center">
                                    <DotLottieReact src="/logo_final.lottie" loop autoplay className="w-full h-full" />
                                </div>
                                <span className="text-3xl font-extrabold -skew-x-6 tracking-tight bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent -ml-1">
                                    killSwap
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="ghostWarm" className="!text-blue-300 hover:!text-blue-400" onClick={() => navigate('/auth/login')}>
                                    Log In
                                </Button>
                                <Button variant="warm" onClick={() => navigate('/auth/register')}>
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>


            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(0,0,0,0.45),transparent)]" />

            <div className="mx-auto flex max-w-7xl flex-col-reverse items-start gap-10 px-6 pt-36 pb-24 md:flex-row md:items-center md:justify-between lg:px-12 lg:pt-40 lg:pb-24">

                <div className="max-w-2xl">


                    <h1 className="mt-7 text-5xl font-sem leading-[0.95] tracking-tight text-slate-100 sm:text-7xl md:text-8xl lg:text-[99px]">
                        Learn. Teach. <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Connect.</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-base text-slate-300/70 sm:text-lg">
                        Discover people nearby who want to share skills, learn together, and build meaningful real-life connections.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Button size="lg" variant="warm" onClick={() => navigate('/auth/register')}>
                            Get Started Free
                        </Button>
                        <Button size="lg" variant="ghostWarm" className="!text-blue-300 hover:!text-blue-400" onClick={() => navigate('/auth/login')}>
                            Log In
                        </Button>
                        <a href="https://www.producthunt.com/products/skillswap-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-skillswap&#0045;2" target="_blank">
                            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1042858&theme=dark&t=1764186245824" alt="SKILLSWAP - Learn&#0046;Teach&#0046;Connect&#0046; | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
                        </a>
                    </div>


                    <div className="mt-12 w-[60%] overflow-hidden relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent" />
                        <div className="skills-track">
                            {[...skills, ...skills].map((s, i) => (
                                <span
                                    key={i + s}
                                    className="px-4 py-2 text-sm rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-slate-100 whitespace-nowrap hover:bg-white/20 transition"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="relative w-full max-w-2xl self-center md:max-w-3xl lg:max-w-4xl">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-black/60 backdrop-blur-sm">
                        <div className="relative aspect-[30/20] w-full overflow-hidden rounded-lg">
                            <video
                                className="h-full w-full object-cover"
                                src="/herov.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />

                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-0 left-1/2 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                                <div className="absolute inset-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
