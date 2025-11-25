import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';


 
const DarkContainer = styled.div`
  background: #000; /* Full black backdrop */
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.25rem;
  position: relative;
  overflow: hidden;
`;

 
const GradientCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px; /* Wider like the reference */
  padding: 4.5rem 3.5rem 5rem; /* Spacious vertical rhythm */
  border-radius: 26px;
  text-align: center;
  color: #fff;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset,
              0 4px 40px -10px rgba(0,72,255,0.6),
              0 0 120px -40px rgba(0,0,0,0.7);
  overflow: hidden;

  /* Multi-layer blue energy gradients */
  background:
    radial-gradient(circle at 78% 12%, rgba(0,99,255,0.85) 0%, rgba(0,60,180,0.55) 25%, rgba(0,25,80,0.35) 40%, rgba(0,8,25,0.1) 60%, rgba(0,0,0,0) 70%),
    radial-gradient(circle at 32% 55%, rgba(0,40,140,0.7) 0%, rgba(0,18,70,0.55) 35%, rgba(0,10,40,0.35) 55%, rgba(0,0,0,0.15) 70%),
    linear-gradient(145deg, #02040a 10%, #01030a 35%, #000 80%);

  &:before, &:after {
    content: '';
    position: absolute;
    pointer-events: none;
    border-radius: inherit;
  }

  /* Subtle soft diffuse aura */
  &:before {
    inset: 0;
    background: radial-gradient(circle at 75% 15%, rgba(0,110,255,0.35), transparent 65%),
                radial-gradient(circle at 30% 60%, rgba(0,70,255,0.18), transparent 70%);
    mix-blend-mode: screen;
    filter: blur(28px);
    opacity: 0.55;
  }

  /* Edge vignette for depth */
  &:after {
    inset: 0;
    background: radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 90%);
  }
`;

 
const Title = styled.h1`
  font-size: clamp(2.6rem, 5.2vw, 3.7rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: .5px;
  margin: 0 0 1.5rem;
  background: linear-gradient(180deg,#fff 0%, #ececec 55%, #d1d1d1 100%);
  -webkit-background-clip: text;
  color: transparent;
`;

 
const Subtitle = styled.p`
  max-width: 640px;
  margin: 0 auto 2.75rem;
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.55;
  color: #b0b0b0;
`;

 
const JoinButton = styled.button`
  position: absolute;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: .25px;
  padding: 0.5rem 1rem 0.55rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fafafa;
  box-shadow: 0 4px 16px -4px rgba(0,80,255,0.6), 0 2px 6px -2px rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: background .35s, box-shadow .35s;

  &:hover {
    background: rgba(255,255,255,0.14);
    box-shadow: 0 6px 22px -6px rgba(0,90,255,0.75);
  }
`;

 
const BookButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.95rem 2.25rem;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(140deg,#0d6efd 0%, #1176ff 45%, #1d5fff 100%);
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 8px 28px -6px rgba(0,110,255,0.6), 0 2px 6px -2px rgba(0,0,0,0.65);
  cursor: pointer;
  transition: box-shadow .35s, transform .25s, background .35s;

  &:hover {
    box-shadow: 0 10px 36px -8px rgba(0,120,255,0.75), 0 4px 14px -4px rgba(0,0,0,0.7);
    transform: translateY(-3px);
    background: linear-gradient(140deg,#1480ff 0%, #1d88ff 50%, #246dff 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 6px 20px -6px rgba(0,110,255,0.6);
  }
`;

 
const WhiteDot = styled.div`
  position: absolute;
  top: 42%;
  left: 13%;
  width: 11px;
  height: 11px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.05), 0 0 18px 4px rgba(255,255,255,0.55);
`;


 

const UniqueOpportunity = () => {
  const navigate = useNavigate();
  return (
     <DarkContainer>
 
      <WhiteDot />
      <GradientCard>
        <JoinButton>
          <span style={{fontSize:'1rem', lineHeight:1, display:'inline-block'}}>•</span>
          <span>Join Us Now</span>
        </JoinButton>
        <Title>
          Ready to find your people?
        </Title>
        <Subtitle>
          Join creators, learners and local communities near you.
        </Subtitle>
        <BookButton onClick={() => navigate('/auth/register')}>Create Your Account</BookButton>
      </GradientCard>
    </DarkContainer>
  );
};

export default UniqueOpportunity;