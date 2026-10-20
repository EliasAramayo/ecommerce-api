import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthProvider';
import LoginPage from './modules/auth/pages/LoginPage';
import Dashboard from './modules/templates/components/Dashboard';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import ListOrdersPage from './modules/orders/pages/ListOrdersPage';
import HomeAdmin from './modules/home/pages/HomeAdmin.jsx';
import Home from './modules/home/pages/Home.jsx';
import ListProductsAdminPage from './modules/products/pages/ListProductsAdminPage.jsx';
import CreateProductPage from './modules/products/pages/CreateProductPage';
import CartPage from './modules/cart/pages/CartPage.jsx';
import EditProductPage from './modules/products/pages/EditProductPage.jsx';
import RegisterPage from './modules/auth/pages/RegisterPage.jsx';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <><Outlet /></>,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/cart',
          element: <CartPage />,
        },
      ],
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/register',
      element: <RegisterPage />,
    },
    {
      path: '/admin',
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,         
          element: <HomeAdmin />,     
        },
        {
          path: 'home',
          element: <HomeAdmin />,
        },
        {
          path: 'products',
          element: <ListProductsAdminPage />,
        },
        {
          path: 'products/create',
          element: <CreateProductPage />,
        },
        {
          path: 'products/edit/:id',
          element: <EditProductPage />,
        },
        {
          path: 'orders',
          element: <ListOrdersPage />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
