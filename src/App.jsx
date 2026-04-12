import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import IntroScreen from "./components/IntroScreen";
import ArchiveBackground from "./components/ArchiveBackground";
import CursorTracker from "./components/CursorTracker";
import PageTransition from "./components/PageTransition";

// Lazy load heavy page components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddProject = lazy(() => import("./pages/AddProject"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Discover = lazy(() => import("./pages/Discover"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Talent = lazy(() => import("./pages/Talent"));
const Settings = lazy(() => import("./pages/Settings"));
const Home = lazy(() => import("./pages/Home"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const RecruiterResumes = lazy(() => import("./pages/RecruiterResumes"));
const RecruiterJobs = lazy(() => import("./pages/RecruiterJobs"));

const Terms = lazy(() => import("./pages/Terms"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Support = lazy(() => import("./pages/Support"));
const DevelopmentStatus = lazy(() => import("./pages/DevelopmentStatus"));

// Import individual dashboard components
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));

const VerificationRequests = lazy(() => import("./pages/VerificationRequests"));
const VerificationPanel = lazy(() => import("./pages/VerificationPanel"));

// A simple loading screen for Suspense fallback
const LoadingScreen = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-current border-t-transparent animate-spin opacity-20" />
      <p className="text-current/60 font-mono text-[10px] tracking-widest uppercase animate-pulse">
        Initializing_Archive_Protocol...
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
          path="/talent"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Talent />
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
          path="/resume-builder"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <ResumeBuilder />
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
          path="/opportunities"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <PageTransition>
                <Opportunities />
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
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // Only shows the intro if "introSeen" is NOT in sessionStorage
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem("introSeen"),
  );

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem("introSeen", "true");
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <CursorTracker />

          <AnimatePresence>
            {showIntro && (
              <IntroScreen
                key="cinematic-intro"
                onComplete={handleIntroComplete}
              />
            )}
          </AnimatePresence>

          <div className="min-h-screen relative overflow-x-hidden">
            <ArchiveBackground />

            {/* Let the app fade in softly as the cinematic intro finishes its iris out */}
            <div
              className={`relative z-10 flex flex-col font-sans transition-opacity duration-1000 ${showIntro ? "opacity-0" : "opacity-100"} min-h-screen`}
            >
              <Navbar />
              <main className="flex-grow w-full max-w-7xl mx-auto pt-28 pb-8 sm:px-6 lg:px-8 relative z-10 lg:min-h-[60vh]">
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          </div>

        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
