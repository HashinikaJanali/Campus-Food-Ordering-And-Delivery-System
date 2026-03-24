import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Footer from './Footer';

const AdminSubLayout = ({ children }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            <AdminHeader />
            <main className="flex-1 w-full overflow-y-auto scroll-smooth">
                <div className="min-h-full flex flex-col">
                    <div className="flex-1 px-4 sm:px-8">
                        {children || <Outlet />}
                    </div>
                    <Footer />
                </div>
            </main>
        </div>
    );
};

export default AdminSubLayout;
