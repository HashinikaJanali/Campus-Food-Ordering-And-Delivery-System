import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';
import Footer from './Footer';

const UserLayout = ({ children, showHeader = true, showFooter = true }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {showHeader && <UserHeader />}
            <main className="flex-1 w-full overflow-y-auto scroll-smooth">
                <div className="min-h-full flex flex-col">
                    <div className="flex-1">
                        {children || <Outlet />}
                    </div>
                    {showFooter && <Footer />}
                </div>
            </main>
        </div>
    );
};

export default UserLayout;
