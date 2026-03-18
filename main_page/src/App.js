import React, { useEffect, useMemo, useState } from 'react';
import SERVER_URL from 'shared_data/react_critical_data.jsx';
import { DevBanner, DevOverlay, DevRibbon, Footer } from 'shared_components';
import HeroSection from './components/portfolio/HeroSection';
import AboutSection from './components/portfolio/AboutSection';
import StackSectionV2 from './components/portfolio/StackSectionV2';
import ProjectSectionGithub from './components/portfolio/ProjectSectionGithub';
import IOSProjects from './components/portfolio/iosProjects';
import { fallbackProfile } from './components/portfolio/constants';
import useTyping from './hooks/useTyping';

function App() {
  const [profile, setProfile] = useState(null);
  const [bannerConfig, setBannerConfig] = useState(null);
  const [overlayConfig, setOverlayConfig] = useState(null);
  const [ribbonConfig, setRibbonConfig] = useState(null);
  const [technologies, setTechnologies] = useState([]);
  const [githubProjects, setGithubProjects] = useState([]);
  const [iosProjects, setIosProjects] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [technologiesLoading, setTechnologiesLoading] = useState(true);
  const [githubProjectsLoading, setGithubProjectsLoading] = useState(true);
  const [iosProjectsLoading, setIosProjectsLoading] = useState(true);

  const typedRole = useTyping(profile?.role_title ? [profile.role_title] : [], 75, 1800);

  useEffect(() => {
    let cancelled = false;

    async function fetchResource(url, onSuccess, onComplete) {
      try {
        const response = await fetch(url);
        if (!response.ok || cancelled) return;
        const data = await response.json();
        if (!cancelled) {
          onSuccess(data);
        }
      } catch (error) {
        // Keep content blank if API is unavailable.
      } finally {
        if (!cancelled && onComplete) {
          onComplete();
        }
      }
    }

    fetchResource(
      `${SERVER_URL}/api/personal_me/profile`,
      (profileData) => {
        if (profileData && typeof profileData === 'object') {
          setProfile(profileData);
        }
      },
      () => setProfileLoading(false)
    );

    fetchResource(`${SERVER_URL}/api/config/announcement?component=banner`, (bannerData) => {
      if (bannerData && typeof bannerData === 'object') {
        setBannerConfig(bannerData);
      }
    });

    fetchResource(`${SERVER_URL}/api/config/announcement?component=overlay`, (overlayData) => {
      if (overlayData && typeof overlayData === 'object') {
        setOverlayConfig(overlayData);
      }
    });

    fetchResource(`${SERVER_URL}/api/config/announcement?component=ribbon`, (ribbonData) => {
      if (ribbonData && typeof ribbonData === 'object') {
        setRibbonConfig(ribbonData);
      }
    });

    fetchResource(
      `${SERVER_URL}/api/personal_me/technologies`,
      (techData) => {
        if (Array.isArray(techData)) {
          setTechnologies(techData);
        }
      },
      () => setTechnologiesLoading(false)
    );

    fetchResource(
      `${SERVER_URL}/api/personal_me/github/projects`,
      (githubProjectsData) => {
        if (Array.isArray(githubProjectsData)) {
          setGithubProjects(githubProjectsData);
        }
      },
      () => setGithubProjectsLoading(false)
    );

    fetchResource(
      `${SERVER_URL}/api/personal_me/github/projects/ios`,
      (iosProjectsData) => {
        if (Array.isArray(iosProjectsData)) {
          setIosProjects(iosProjectsData);
        }
      },
      () => setIosProjectsLoading(false)
    );

    return () => {
      cancelled = true;
    };
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
      {/* <Navbar scrolled={scrolled} links={navLinks} name={profile.full_name || 'Portfolio'} /> */}

      <main className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <HeroSection profile={profile || fallbackProfile} typedRole={typedRole} loading={profileLoading} />
        <AboutSection bio={profile?.bio || ''} loading={profileLoading} />
        <IOSProjects projects={iosProjects} loading={iosProjectsLoading} />
        <ProjectSectionGithub projects={githubProjects} loading={githubProjectsLoading} />
        <StackSectionV2 stack={profile?.tech_stack || []} techMeta={techMeta} loading={technologiesLoading || profileLoading} />
        {/* <ContactSection
          email={profile.email || ''}
          github={profile.github || profile.github_url || ''}
          linkedin={profile.linkedin || profile.linkedin_url || ''}
        /> */}
        <Footer
          fullName={profile?.full_name || 'Baldwin'}
          email={profile?.email || ''}
          github={profile?.github || profile?.github_url || ''}
          linkedin={profile?.linkedin || profile?.linkedin_url || ''}
        />
      </main>
    </div>
  );
}

export default App;
