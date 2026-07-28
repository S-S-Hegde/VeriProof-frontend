import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState, Suspense, lazy, useEffect } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SkillTreeProvider } from "./context/SkillTreeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import IntroScreen from "./components/IntroScreen";
import OutroScreen from "./components/OutroScreen";
import ArchiveBackground from "./components/ArchiveBackground";
import CursorTracker from "./components/CursorTracker";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

// Lazy load heavy page components with mapped refactored names
const UserAuthentication = lazy(() => import("./pages/UserAuthentication"));
const InitializeProfile = lazy(() => import("./pages/InitializeProfile"));
const PasswordRecovery = lazy(() => import("./pages/PasswordRecovery"));
const PassphraseReset = lazy(() => import("./pages/ResetPassword"));
const RoleBasedRouter = lazy(() => import("./pages/RoleBasedRouter"));
const CandidateEvidenceSubmit = lazy(
  () => import("./pages/CandidateEvidenceSubmit"),
);
const ArtifactInspector = lazy(() => import("./pages/ArtifactInspector"));
const InvestigatorSearchHub = lazy(
  () => import("./pages/InvestigatorSearchHub"),
);
const CandidateSkillAnalytics = lazy(
  () => import("./pages/CandidateSkillAnalytics"),
);
const SystemConfiguration = lazy(() => import("./pages/Settings"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const BulkScreening = lazy(() => import("./pages/BulkScreening"));
const JobRolesManager = lazy(() => import("./pages/JobRolesManager"));

const TermsPage = lazy(() => import("./pages/TermsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

const CandidateHub = lazy(() => import("./pages/StudentDashboard"));
const InvestigatorHub = lazy(() => import("./pages/InvestigatorHub"));
const Exams = lazy(() => import("./pages/Exams"));
const DynamicSkillGraph = lazy(() => import("./pages/DynamicSkillGraph"));

const CandidateVerificationRequests = lazy(
  () => import("./pages/VerificationRequests"),
);
const InvestigatorJobFlow = lazy(() => import("./pages/VerificationPanel"));

// Premium loading screen
const LoadingScreen = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
      </div>
      <p className="vp-label-accent animate-pulse">Initializing_Protocol...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Access Domain */}
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <LandingPage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/home"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <HomePage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <AboutPage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <ContactPage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/support"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <SupportPage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <TermsPage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/status"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <RoadmapPage />
              </PageTransition>
            </Suspense>
          }
        />

        {/* Authentication Domain */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <UserAuthentication />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <InitializeProfile />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <PasswordRecovery />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/reset-password/:resettoken"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <PassphraseReset />
              </PageTransition>
            </Suspense>
          }
        />

        {/* Core Router */}
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <RoleBasedRouter />
              </PageTransition>
            </Suspense>
          }
        />

        {/* Candidate Domain */}
        <Route
          path="/student-dashboard"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <CandidateHub />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/add-project"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <CandidateEvidenceSubmit />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <CandidateSkillAnalytics />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/skill-tree"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <DynamicSkillGraph />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/exams"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Exams />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/verification-requests"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <CandidateVerificationRequests />
              </PageTransition>
            </Suspense>
          }
        />

        {/* Investigator Domain */}
        <Route
          path="/recruiter-dashboard"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <InvestigatorHub />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/discover"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <InvestigatorSearchHub />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/bulk-screening"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <BulkScreening />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/recruiter-jobs"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <JobRolesManager />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/verification-panel"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <InvestigatorJobFlow />
              </PageTransition>
            </Suspense>
          }
        />

        {/* Core Shared Domain */}
        <Route
          path="/project/:id"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <ArtifactInspector />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <SystemConfiguration />
              </PageTransition>
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { isExiting, setIsExiting, logout } = useAuth();

  const isFirstVisit = !localStorage.getItem("vp-intro-seen");
  const [showIntro, setShowIntro] = useState(isFirstVisit);
  const [isAppVisible, setIsAppVisible] = useState(!isFirstVisit);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const handleIntroComplete = () => {
    localStorage.setItem("vp-intro-seen", "true");
    setShowIntro(false);
    setTimeout(() => setIsAppVisible(true), 300);
  };

  const handleOutroComplete = () => {
    logout();
    setIsExiting(false);
    window.location.href = "/login";
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <CursorTracker />

      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left"
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, white))",
          boxShadow: "0 0 12px var(--vp-glow)",
        }}
      />

      <AnimatePresence>
        {showIntro && (
          <IntroScreen key="cinematic-intro" onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExiting && (
          <OutroScreen key="system-outro" onComplete={handleOutroComplete} />
        )}
      </AnimatePresence>

      <div className="min-h-screen relative overflow-x-hidden">
        <ArchiveBackground />

        <div
          className={`relative z-10 flex flex-col font-sans transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isAppVisible ? "opacity-100 blur-0" : "opacity-0 blur-xl"
          } min-h-screen`}
        >
          <Navbar />
          <main className="flex-grow w-full mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
            {isAppVisible && <AnimatedRoutes />}
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SkillTreeProvider>
          <AppContent />
        </SkillTreeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
