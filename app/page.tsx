"use client";

import { useState } from "react";
import Nav from "@/components/nav";
import Hero from "@/components/hero";
import StackStrip from "@/components/stack-strip";
import FeaturedSpotlight from "@/components/featured-spotlight";
import CategoryGrid from "@/components/category-grid";
import TrendingSection from "@/components/trending-section";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { getCounts } from "@/lib/resources";

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const counts = getCounts();

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main>
        <Hero onSearchOpen={() => setSearchOpen(true)} totalCount={82} />
        <StackStrip />
        <FeaturedSpotlight />
        <CategoryGrid counts={counts} />
        <TrendingSection />
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
