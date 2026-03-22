import Footer from './Footer';
import TopHeader from './TopHeader';
import logoImage from '../assets/logo.png';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <main className="flex-1 pb-8">
        <div className="w-full">{children}</div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;