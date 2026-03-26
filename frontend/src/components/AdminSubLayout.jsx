import { Outlet } from 'react-router-dom';
import Footer from './Footer';

const AdminSubLayout = ({ children, showFooter = true }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
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

export default AdminSubLayout;
