import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <>
      <style>{`
        @media print {
          .app-shell > header,
          .app-shell > footer {
            display: none !important;
          }

          .app-shell {
            display: block !important;
          }

          .app-shell > main {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
      <div className="app-shell min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
