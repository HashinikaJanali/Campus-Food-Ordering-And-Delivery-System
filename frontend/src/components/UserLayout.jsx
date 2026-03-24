import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';
import Footer from './Footer';

const UserLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
            <UserHeader />
            <main className="flex-1 w-full min-h-screen">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default UserLayout;
