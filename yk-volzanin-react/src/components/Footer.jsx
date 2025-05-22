function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ textAlign: 'center' }}>
        <p><strong>ООО «УК ВОЛЖАНИН»</strong></p>
        <p>150000, г. Ярославль, пр-кт Машиностроителей, д. 7</p>
        <p>ИНН/КПП 7604112535 / 760401001 &nbsp; ОГРН 1077604021989</p>
        <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
          &copy; 2007 - {new Date().getFullYear()} ООО «УК ВОЛЖАНИН». Все права защищены.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
