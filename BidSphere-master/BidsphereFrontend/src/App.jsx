import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Auctions from './pages/Auctions';

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/Register';
import SellerRegister from './pages/SellerRegister';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';

// User & Bidding Pages
import PlaceBid from './pages/PlaceBid';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import Receipt from './pages/Receipt';

// Seller Pages
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AuctionDetails from './pages/AuctionDetails';

function App() {
  return (
    <Router>
      {/* AuthProvider MUST be inside Router because it uses useNavigate */}
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/auctions/:id" element={<AuctionDetails/>}/>
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/seller-register" element={<SellerRegister />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
              
              {/* Auction Bidding Route */}
              <Route path="/place-bid/:id" element={<PlaceBid />} />
              
              {/* User Dashboard & Checkout Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment/:id" element={<Payment />} />
              <Route path="/receipt/:id" element={<Receipt />} />
              
              {/* Seller Routes */}
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/edit-product/:id" element={<EditProduct />} />
              
              {/* Admin Route */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;