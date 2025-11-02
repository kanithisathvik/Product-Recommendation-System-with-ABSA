import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductRecommendationApp from "./ProductRecommendationApp";
import ComparisonPage from "./pages/ComparisonPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import SearchHistoryPage from "./pages/SearchHistoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import { ComparisonProvider } from "./context/ComparisonContext";

function App() {
  return (
    <Router>
      <ComparisonProvider>
        <Routes>
          <Route path="/" element={<ProductRecommendationApp />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/history" element={<SearchHistoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </ComparisonProvider>
    </Router>
  );
}

export default App;
