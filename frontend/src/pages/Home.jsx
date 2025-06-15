import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import Services from "../components/Services";
import BrandLogo from "../components/BrandLogo";
import WhatMakesUsDifferent from "../components/WhatMakeUsDifferent";
import TeamSection from "../components/TeamSection";
import AboutUsSection from "../components/AboutUsSection";
import NewsUpdates from "../components/NewsUpdates";
import ProjectsSection from "../components/ProjectsSection";
import CustomerReview from "../components/CustomerReview";
import ContactForm from "../components/ContactForm";
import ScrollButton from "../components/ScrollButton";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import CookieConsent from "../components/CookieConsent";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Show toast if just logged in (e.g., after Google sign-in)
    if (location.state?.justLoggedIn) {
      toast.success("Logged in successfully");
      // Remove the state so the toast doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }

    // Check if there's a scrollTo state passed via navigation
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100); // Delay to ensure DOM is ready
      }
    }
    console.log("Home loaded");
  }, [location]);

  return (
    <>
      <HeroSection />
      <BrandLogo />
      <div id="services">
        <Services />
      </div>
      <WhatMakesUsDifferent />
      <TeamSection />
      <div id="about">
        <AboutUsSection />
      </div>

      <NewsUpdates />
      <ProjectsSection />
      <CustomerReview />
      <div id="contact">
        <ContactForm />
      </div>
      <ScrollButton />
      <CookieConsent />
    </>
  );
};

export default Home;
