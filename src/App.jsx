import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/common/Navbar';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/Router';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <AppRoutes />
          </main>
        </div>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
