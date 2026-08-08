/**
 * S.A.R.A. — Root Application Component
 *
 * Wraps the router with the AuthProvider for global auth state.
 */

import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
