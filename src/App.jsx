import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Container, ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/common/Navbar";
import AppRoutes from "./routes/Router";
function App() {
  return <ThemeProvider theme={theme}>
      
      <CssBaseline />
      
      <BrowserRouter>
        
        <AuthProvider>
          
          <Navbar />
          
          <Container maxWidth="xl" sx={{
          mt: {
            xs: 2,
            sm: 3,
            md: 4
          },
          mb: {
            xs: 2,
            sm: 3,
            md: 4
          },
          px: {
            xs: 1,
            sm: 2
          }
        }}>
            
            <AppRoutes />
          </Container>
          <ToastContainer />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>;
}
export default App;
