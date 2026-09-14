import { HashRouter, Routes, Route } from 'react-router';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Research from './pages/Research';
import Projects from './pages/Projects';
import Courses from './pages/Courses';
import ConstructedCirculationAnalogs from './pages/ConstructedCirculationAnalogs';
import PlanetaryBoundaryLayer from './pages/PlanetaryBoundaryLayer';
import DiurnalCycle from './pages/DiurnalCycle';

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/research/constructed-circulation-analogs" element={<ConstructedCirculationAnalogs />} />
          <Route path="/research/planetary-boundary-layer" element={<PlanetaryBoundaryLayer />} />
          <Route path="/research/diurnal-cycle" element={<DiurnalCycle />} />
        </Routes>
      </main>
    </HashRouter>
  );
}