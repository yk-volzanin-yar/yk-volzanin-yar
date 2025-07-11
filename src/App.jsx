import './assets/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx'
import Info from './pages/Info.jsx';
import General from './pages/info/General.jsx';
import Reports from './pages/info/Reports.jsx';
import Ventilation from './pages/info/Ventilation.jsx';
import Projects from './pages/Projects.jsx';
import Vacancies from './pages/Vacancies.jsx';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/info" element={<Info />} />
            <Route path="/info/general" element={<General />} />
            <Route path="/info/reports" element={<Reports />} />
            <Route path="/info/ventilation" element={<Ventilation />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/vacancies" element={<Vacancies />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;