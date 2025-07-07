import './assets/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx'
import Info from './pages/Info.jsx';
import General from './pages/info/General.jsx';
import Reports from './pages/info/Reports.jsx';
import MKD from './pages/info/MKD.jsx';
import Meetings from './pages/info/Meetings.jsx';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/info" element={<Info />} />
            <Route path="/info/general" element={<General />} />
            <Route path="/info/reports" element={<Reports />} />
            <Route path="/info/mkd" element={<MKD />} />
            <Route path="/info/meetings" element={<Meetings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;