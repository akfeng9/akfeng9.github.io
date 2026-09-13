import { HashRouter, Routes, Route } from 'react-router';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Research from './pages/Research';
import Projects from './pages/Projects';
import Courses from './pages/Courses';

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/courses" element={<Courses />} />
        </Routes>
      </main>
    </HashRouter>
  );
}