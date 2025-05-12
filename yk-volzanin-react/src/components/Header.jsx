import { Link } from 'react-router-dom';
import zavolga from '../assets/zavolga.jpg';

function Header() {
  return (
    <header className="header">
      <div class="container header-flex">
        <div class="text-background">
            <h1 class="company-name">Управляющая компания ООО "УК"ВОЛЖАНИН"</h1>
            <p>
                <a href="licens.jpg" target="_blank" class="license-text" rel="noopener noreferrer">
                    Лицензия № 076-000336 действительна до 02.04.2030
                </a>
            </p>
            <nav>
                <Link to="/">Главная</Link> |{" "}
                <Link to="/about">О нас</Link> |{" "}
                <Link to="/contacts">Контакты</Link>
            </nav>
        </div>
    </div>
    </header>
  );
}

export default Header;
