import React, { useEffect, useMemo, useState } from 'react';
import SERVER_URL from 'shared_data/react_critical_data.jsx';
import DevBanner from './components/DevBanner';
import DevOverlay from './components/DevOverlay';
import DevRibbon from './components/DevRibbon';
import Navbar from './components/portfolio/Navbar';
import HeroSection from './components/portfolio/HeroSection';
import AboutSection from './components/portfolio/AboutSection';
import StackSectionV2 from './components/portfolio/StackSectionV2';
import ProjectSectionGithub from './components/portfolio/ProjectSectionGithub';
import ContactSection from './components/portfolio/ContactSection';
import { fallbackProfile, navLinks } from './components/portfolio/constants';
import useTyping from './hooks/useTyping';

function App() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [bannerConfig, setBannerConfig] = useState(null);
  const [overlayConfig, setOverlayConfig] = useState(null);
  const [ribbonConfig, setRibbonConfig] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [technologies, setTechnologies] = useState([]);
  const [githubProjects, setGithubProjects] = useState([]);

  const typedRole = useTyping(profile?.role_title ? [profile.role_title] : [], 75, 1800);

  useEffect(() => {
    async function loadPersonalMe() {
      try {
        const [profileResponse, bannerResponse, overlayResponse, ribbonResponse, techResponse, githubProjectsResponse] =
          await Promise.all([
            fetch(`${SERVER_URL}/api/personal_me/profile`),
            fetch(`${SERVER_URL}/api/config/announcement?component=banner`),
            fetch(`${SERVER_URL}/api/config/announcement?component=overlay`),
            fetch(`${SERVER_URL}/api/config/announcement?component=ribbon`),
            fetch(`${SERVER_URL}/api/personal_me/technologies`),
            fetch(`${SERVER_URL}/api/personal_me/github/projects`)
          ]);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData && typeof profileData === 'object') {
            setProfile((prev) => ({ ...prev, ...profileData }));
          }
        }

        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json();
          if (bannerData && typeof bannerData === 'object') {
            setBannerConfig(bannerData);
          }
        }

        if (overlayResponse.ok) {
          const overlayData = await overlayResponse.json();
          if (overlayData && typeof overlayData === 'object') {
            setOverlayConfig(overlayData);
          }
        }

        if (ribbonResponse.ok) {
          const ribbonData = await ribbonResponse.json();
          if (ribbonData && typeof ribbonData === 'object') {
            setRibbonConfig(ribbonData);
          }
        }

        if (techResponse.ok) {
          const techData = await techResponse.json();
          if (Array.isArray(techData)) {
            setTechnologies(techData);
          }
        }

        if (githubProjectsResponse.ok) {
          const githubProjectsData = await githubProjectsResponse.json();
          if (Array.isArray(githubProjectsData)) {
            setGithubProjects(githubProjectsData);
          }
        }
      } catch (error) {
        // Keep content blank if API is unavailable.
      }
    }

    loadPersonalMe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.14 }
    );

    targets.forEach((target) => {
      target.classList.add('reveal');
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);

  const techMeta = useMemo(() => {
    return technologies.reduce((acc, tech) => {
      acc[tech.name] = {
        icon: tech.icon_url || tech.name.slice(0, 2).toUpperCase(),
        accent: tech.accent_color || 'text-slate-200 border-slate-300/40 bg-slate-200/10'
      };
      return acc;
    }, {});
  }, [technologies]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DevBanner config={bannerConfig} />
      <DevRibbon config={ribbonConfig} />
      <DevOverlay config={overlayConfig} />

      <div className="grid-overlay pointer-events-none fixed inset-0" />
      <Navbar scrolled={scrolled} links={navLinks} name={profile.full_name || 'Portfolio'} />

      <main className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <HeroSection profile={profile} typedRole={typedRole} />
        <AboutSection bio={profile.bio || ''} />
        <StackSectionV2 stack={profile.tech_stack || []} techMeta={techMeta} />
        <ProjectSectionGithub projects={githubProjects} />
        <ContactSection
          email={profile.email || ''}
          github={profile.github || profile.github_url || ''}
          linkedin={profile.linkedin || profile.linkedin_url || ''}
        />
      </main>
    </div>
  );
}

export default App;
