// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "@/lib/react-router-dom";
// import { HelmetProvider } from "react-helmet-async";
// import Navbar from "./components/Navbar/Navbar";
// import Footer from "./components/Footer/Footer";
// import UserInfoPopup from "./components/UserInfoPopup/UserInfoPopup";

// // Import Pages
// import Home from "./pages/Home/Home";
// import Listings from "./pages/Listings/Listings";
// import AboutUs from "./pages/AboutUs/AboutUs";
// import Contact from "./pages/Contact/Contact";
// import Careers from "./pages/Careers/Careers";
// import SpaceCalculator from "./pages/SpaceCalculator/SpaceCalculator";
// import Admin from "./pages/Admin/Admin";
// // import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
// import RERARegistration from "./pages/RERA/RERARegistration";
// import LeadsManagement from "./pages/Admin/LeadsManagement/LeadsManagement";
// import ContentManagementPage from "./pages/Admin/ContentManagement/ContentManagementPage"; // Add this import
// import DetailedReport from "./pages/DetailedReport/DetailedReport";
// import InsightsReports from "./pages/InsightsReports/InsightsReports";
// import SubscriptionsManagement from "./pages/Admin/SubscriptionManagement/SubscriptionManagement";
// import CityListings from "./pages/CityListings/CityListings";
// import "./App.css"; // Import the CSS file for styling

// function App() {
//   return (
//     <HelmetProvider>
//       <div className="App">
//         <Router>
//           {/* <UserInfoPopup delay={10000} /> */}
//           <Navbar />
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/space-calculator" element={<SpaceCalculator />} />
//             <Route path="/listings" element={<Listings />} />
//             <Route path="/:listingSlug" element={<CityListings />} />
//             <Route path="/locations/:city" element={<CityListings />} />
//             <Route path="/aboutus" element={<AboutUs />} />
//             <Route path="/contact" element={<Contact />} />
//             <Route path="/careers" element={<Careers />} />
//             <Route path="/admin" element={<Admin />} />
//             <Route path="/content/:slug" element={<DetailedReport />} />
//             <Route path="/insights-reports" element={<InsightsReports />} />
//             <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//             <Route path="/rera-registration" element={<RERARegistration />} />
//             <Route path="/admin/leads" element={<LeadsManagement />} />
//             <Route
//               path="/admin/subscriptions"
//               element={<SubscriptionsManagement />}
//             />
//             <Route path="/admin/content" element={<ContentManagementPage />} />
//           </Routes>
//           <Footer />
//         </Router>
//       </div>
//     </HelmetProvider>
//   );
// }

// export default App;
