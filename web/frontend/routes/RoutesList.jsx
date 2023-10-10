import React from 'react';
import { Route, Routes } from 'react-router-dom'
import About from '../pages/myPages/About';
import Contact from '../pages/myPages/Contact';
import Home from '../pages/myPages/Home';
import QuoteList from '../pages/myPages/QuoteList';
import FormSetting from '../pages/myPages/FormSetting';
import PricingPlan from '../pages/myPages/PricingPlan';

export default function RoutesList() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quotelist" element={<QuoteList />} />
            <Route path="/templates" element={<FormSetting />} />
            <Route path="/pricingplan" element={<PricingPlan />} />
            {/* <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product" element={<Products />} /> */}
        </Routes>
    );
}
