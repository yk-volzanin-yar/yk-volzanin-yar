import './assets/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contacts from './pages/Contacts'
import Info from './pages/Info';
import Reports from './pages/info/Reports';
import MKD from './pages/info/MKD';
import Meetings from './pages/info/Meetings';

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