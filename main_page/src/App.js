import React, { useEffect, useMemo, useState } from 'react';
import SERVER_URL from 'shared_data/react_critical_data.jsx';
import DevBanner from './components/DevBanner';
import Navbar from './components/portfolio/Navbar';
import HeroSection from './components/portfolio/HeroSection';
import AboutSection from './components/portfolio/AboutSection';
import StackSection from './components/portfolio/StackSection';
import StackSectionV2 from './components/portfolio/StackSectionV2';
import ProjectsSection from './components/portfolio/ProjectsSection';
import ProjectsSectionV2 from './components/portfolio/ProjectsSectionV2';
import ContactSection from './components/portfolio/ContactSection';
import { fallbackProfile, fallbackProjects, navLinks } from './components/portfolio/constants';
import useTyping from './hooks/useTyping';

function App() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [projects, setProjects] = useState(fallbackProjects);
  const [bannerConfig, setBannerConfig] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [technologies, setTechnologies] = useState([]);

  const typedRole = useTyping(profile?.role_title ? [profile.role_title] : [], 75, 1800);

  useEffect(() => {
    async function loadPersonalMe() {
      try {
        const [profileResponse, projectsResponse, bannerResponse, techResponse] = await Promise.all([
          fetch(`${SERVER_URL}/api/personal_me/profile`),
          fetch(`${SERVER_URL}/api/personal_me/projects`),
          fetch(`${SERVER_URL}/api/config/dev-banner`),
          fetch(`${SERVER_URL}/api/personal_me/technologies`)
        ]);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData && typeof profileData === 'object') {
            setProfile((prev) => ({ ...prev, ...profileData }));
          }
        }

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          if (Array.isArray(projectsData)) {
            setProjects(projectsData);
          }
        }

        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json();
          if (bannerData && typeof bannerData === 'object') {
            setBannerConfig(bannerData);
          }
        }
        
        if (techResponse.ok) {
          const techData = await techResponse.json();
          if (Array.isArray(techData)) setTechnologies(techData);
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

  const topProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const topStack = useMemo(() => (profile.tech_stack || []).slice(0, 8), [profile.tech_stack]);
  const techMeta = useMemo(() => {
    return technologies.reduce((acc, t) => {
      acc[t.name] = {
        icon: t.icon_url || t.name.slice(0, 2).toUpperCase(), // fallback to initials
        accent: t.accent_color || 'text-slate-200 border-slate-300/40 bg-slate-200/10'
      };
      return acc;
    }, {});
  }, [technologies]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DevBanner config={bannerConfig} />
      <div className="grid-overlay pointer-events-none fixed inset-0" />
      <Navbar scrolled={scrolled} links={navLinks} name={profile.full_name || 'Portfolio'} />

      <main className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <HeroSection profile={profile} typedRole={typedRole} />
        <AboutSection bio={profile.bio || ''} />
        {/* <StackSection stack={topStack} techMeta={techMeta} /> */}
        <StackSectionV2 stack={profile.tech_stack || []} techMeta={techMeta} />
        {/* <ProjectsSection projects={projects} /> */}
        <ProjectsSectionV2 projects={projects} />
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
