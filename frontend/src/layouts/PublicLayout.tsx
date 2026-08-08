/**
 * PublicLayout — layout for unauthenticated pages (landing, login, register).
 */

import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../components/layout';

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
