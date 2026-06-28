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
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// Lazy load heavy page components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddProject = lazy(() => import("./pages/AddProject"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Discover = lazy(() => import("./pages/Discover"));
const Analytics = lazy(() => import("./pages/Analytics"));
// Removed Talent
const Settings = lazy(() => import("./pages/Settings"));
const Home = lazy(() => import("./pages/Home"));
const Demo = lazy(() => import("./pages/Demo"));
// Removed ResumeBuilder
const RecruiterResumes = lazy(() => import("./pages/RecruiterResumes"));
const RecruiterJobs = lazy(() => import("./pages/RecruiterJobs"));

const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
const DevelopmentStatus = lazy(() => import("./pages/DevelopmentStatus"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));

// Import individual dashboard components
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const Exams = lazy(() => import("./pages/Exams"));
const SkillTreePage = lazy(() => import("./pages/SkillTreePage"));

const VerificationRequests = lazy(() => import("./pages/VerificationRequests"));
const VerificationPanel = lazy(() => import("./pages/VerificationPanel"));

// Premium loading screen
const LoadingScreen = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
      </div>
      <p className="vp-label-accent animate-pulse">
        Initializing_Protocol...
      </p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Home />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/demo"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Demo />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Login />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Register />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/reset-password/:resettoken"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <StudentDashboard />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/recruiter-dashboard"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <RecruiterDashboard />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/add-project"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <AddProject />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/project/:id"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <ProjectDetails />
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
          path="/discover"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Discover />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Analytics />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/settings"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Settings />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/recruiter-resumes"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <RecruiterResumes />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/recruiter-jobs"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <RecruiterJobs />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/terms"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Terms />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/support"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Support />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/status"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <DevelopmentStatus />
              </PageTransition>
            </Suspense>
          }
        />

        <Route
          path="/verification-requests"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <VerificationRequests />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/verification-panel"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <VerificationPanel />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/skill-tree"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <SkillTreePage />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <About />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Contact />
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

  // ── FIRST-VISIT-ONLY INTRO ──
  const isFirstVisit = !localStorage.getItem("vp-intro-seen");
  const [showIntro, setShowIntro] = useState(isFirstVisit);
  const [isAppVisible, setIsAppVisible] = useState(!isFirstVisit);

  // Global Scroll Logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
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

      {/* ── SCROLL PROGRESS BAR ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left"
        style={{
          scaleX,
          background: "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, white))",
          boxShadow: "0 0 12px var(--vp-glow)",
        }}
      />

      <AnimatePresence>
        {showIntro && (
          <IntroScreen
            key="cinematic-intro"
            onComplete={handleIntroComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExiting && (
          <OutroScreen
            key="system-outro"
            onComplete={handleOutroComplete}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen relative overflow-x-hidden">
        <ArchiveBackground />

        <div
          className={`relative z-10 flex flex-col font-sans transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAppVisible ? "opacity-100 blur-0" : "opacity-0 blur-xl"} min-h-screen`}
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
