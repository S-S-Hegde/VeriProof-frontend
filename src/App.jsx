import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import IntroScreen from "./components/IntroScreen";
import AnimatedBackground from "./components/AnimatedBackground";
import CursorTracker from "./components/CursorTracker";

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
const Support = lazy(() => import("./pages/Support"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const VerificationRequests = lazy(() => import("./pages/VerificationRequests"));
const VerificationPanel = lazy(() => import("./pages/VerificationPanel"));

const LoadingScreen = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="w-10 h-10 border-2 border-ibex-gold/20 border-t-ibex-gold rounded-full animate-spin opacity-80"></div>
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
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Register />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ResumeBuilder />
            </Suspense>
          }
        />
        <Route
          path="/add-project"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <AddProject />
            </Suspense>
          }
        />
        <Route
          path="/project/:id"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ProjectDetails />
            </Suspense>
          }
        />
        <Route path="/discover" element={<Suspense fallback={<LoadingScreen />}><Discover /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<LoadingScreen />}><Analytics /></Suspense>} />
        <Route path="/recruiter/analytics" element={<Suspense fallback={<LoadingScreen />}><Analytics /></Suspense>} />
        <Route path="/talent" element={<Suspense fallback={<LoadingScreen />}><Talent /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<LoadingScreen />}><Settings /></Suspense>} />
        <Route path="/recruiter/resumes" element={<Suspense fallback={<LoadingScreen />}><RecruiterResumes /></Suspense>} />
        <Route path="/recruiter/jobs" element={<Suspense fallback={<LoadingScreen />}><RecruiterJobs /></Suspense>} />
        
        <Route path="/terms" element={<Suspense fallback={<LoadingScreen />}><Terms /></Suspense>} />
        <Route path="/support" element={<Suspense fallback={<LoadingScreen />}><Support /></Suspense>} />
        <Route path="/opportunities" element={<Suspense fallback={<LoadingScreen />}><Opportunities /></Suspense>} />
        <Route path="/verification-requests" element={<Suspense fallback={<LoadingScreen />}><VerificationRequests /></Suspense>} />
        <Route path="/verification-panel" element={<Suspense fallback={<LoadingScreen />}><VerificationPanel /></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
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
          {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
          <AnimatedBackground />
          <div
            className={`min-h-screen flex flex-col font-sans transition-opacity duration-1000 ${showIntro ? "opacity-0" : "opacity-100"}`}
          >
            <Navbar />
            <main className="flex-grow w-full max-w-7xl mx-auto pt-28 pb-8 sm:px-6 lg:px-8 relative z-10 lg:min-h-[60vh]">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
