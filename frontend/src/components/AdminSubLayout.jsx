import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Footer from './Footer';

const AdminSubLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
            <AdminHeader />
            <main className="flex-1 w-full min-h-screen px-4 sm:px-8">
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default AdminSubLayout;
