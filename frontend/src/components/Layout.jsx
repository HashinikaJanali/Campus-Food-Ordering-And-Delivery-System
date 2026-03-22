import Footer from './Footer';
import TopHeader from './TopHeader';
import logoImage from '../assets/logo.png';

const Layout = ({ children }) => {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <TopHeader />

      {/* Main Content */}
      <main className="flex-1 pb-8">
        <div className="w-full">{children}</div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;