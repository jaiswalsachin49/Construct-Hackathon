import React from 'react';
import styled from 'styled-components';



const FooterSection = styled.footer`
  position: relative;
  width: 100%;
  min-height: 340px; /* adjust if needed */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(0,70,200,0) 0%, rgba(66, 107, 184, 0.55) 40%, rgba(0,70,200,0) 62%),
    radial-gradient(circle at 55% 8%, rgba(40,70,160,0.55), rgba(20,40,90,0.15) 50%, rgba(0,0,0,0.15) 65%),
    linear-gradient(to bottom, #020304 0%, #02040a 12%, #050a22 40%, #091842 68%, #132a72 100%);
  color: #e5e7eb;
  font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,sans-serif;
  border-top: 1px solid rgba(255,255,255,0.05);
`;


const NoiseLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0.22;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='400' height='400' filter='url(%23noise)' fill='hsla(0,0%,100%,0.35)'/></svg>");
  background-size: 300px 300px;
`;

const TopBar = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.25rem clamp(1.25rem, 4vw, 3.5rem) 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: .4px;
`;

const LinkGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2.75rem;
  flex-wrap: wrap;
`;

const InfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2.25rem;
  flex-wrap: wrap;
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  cursor: pointer;
  position: relative;
  color: #e8e9ec;
  transition: color .35s;

  &:after {
    content: '';
    position: absolute;
    left: 0; bottom: -4px;
    width: 0%; height: 2px;
    background: linear-gradient(90deg,#fff,#4d7dff);
    border-radius: 2px;
    transition: width .4s;
  }
  &:hover { color: #ffffff; }
  &:hover:after { width: 100%; }
`;


const BigWord = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(6rem, 13vw, 9.5rem);
  font-weight: 700;
  letter-spacing: .35rem;
  text-transform: uppercase;
  padding: 0 1.5rem 2.75rem;
  line-height: 0.85;
  user-select: none;
  background: linear-gradient(180deg,#ffffff 0%, #f5f5f5 40%, #d2d2d2 70%, #bfbfbf 100%);
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 6px 16px rgba(0,0,0,0.35)) drop-shadow(0 18px 40px rgba(15,60,140,0.35));
  opacity: 0.92;
`;

const CTAStack = styled.div`
  position: absolute;
  right: clamp(1rem, 3.25vw, 3.5rem);
  bottom: clamp(1.25rem, 3.2vw, 2.75rem);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 3;
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.85rem 1.15rem 0.8rem;
  background: rgba(255,255,255,0.9);
  color: #111827;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 6px 18px -6px rgba(0,40,140,0.45), 0 2px 6px -2px rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  transition: box-shadow .35s, transform .35s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 26px -6px rgba(0,60,180,0.55), 0 4px 10px -2px rgba(0,0,0,0.5);
  }
  &:active { transform: translateY(-1px); }
`;

const MadeBadge = styled(CTAButton)`
  background: rgba(255,255,255,0.95);
  font-weight: 600;
`;

const Dot = styled.span`
  width: 6px; height: 6px; border-radius: 50%; background:#fff; display:inline-block; box-shadow:0 0 0 3px rgba(255,255,255,0.15); margin-right:6px;
`;

const Footer = () => {
    return (
        <FooterSection>
            <NoiseLayer />
            <TopBar>
                <LinkGroup>
                    <span>All copyrights @SkillSwap</span>
                    <FooterLink>Terms and Conditions</FooterLink>
                </LinkGroup>


            </TopBar>
            <BigWord aria-hidden>SkillSwap</BigWord>

        </FooterSection>
    );
};

export default Footer;
