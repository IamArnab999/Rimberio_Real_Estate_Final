import React from "react";
import { Link } from "react-router-dom";
import { animateValue } from "../working/number";
import { useEffect } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  useEffect(() => {
    // Ensure the animation runs after the component is mounted and elements are in the DOM
    animateValue("clients", 0, 950, 2000);
    animateValue("projects", 0, 300, 2000);
    animateValue("awards", 0, 25, 2000);
  }, []); 
  return (
    <section className="black-grad" >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-white flex flex-col gap-4 md:flex-row md:items-end md:gap-10 max-w-[1200px] mx-auto"
        id="home"
      >
        {/* Hero Text Section */}
        <div className="flex flex-col pt-20 px-5 gap-2 md:pb-20" >
          <h1 className="text-3xl font-medium md:text-4xl">
            We Provide <br /> Architectural Design <br /> & Construction
          </h1>

          <p className="text-[#C4C4C4] text-md font-medium md:w-[450px] ">
            <br /> <br />
            A global real estate platform, redefining customer engagement with property discovery and investment,
            focusing on innovation and seamless user experiences.
          </p>
          <Link to={"/discover"}>
            <button className="self-start text-base font-semibold py-2 bg-blue-500 px-3 mt-5 md:py-4 md:px-5 shadow-md shadow-cyan-400">
              Discover More
            </button>
          </Link>

          <div className="md:flex mt-8 justify-between  md:pt-6 flex">
            {[
              { id: "clients", label: "Happy Clients" },
              { id: "projects", label: "Amazing Projects" },
              { id: "awards", label: "Award Winnings" }
            ].map((item) => (
              <div key={item.id} className="md:flex md:flex-col">
                <h3 className="font-bold text-xl" id={item.id}>0 <span className="text-blue-500 font-bold text-2xl">+</span></h3>
                <p className="font-semibold text-base">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div>
          <div className="flex justify-end -mt-32">
            <picture>
              <source media="(min-width: 765px)" srcSet="/assets/Others/VERT_big_hero_image.webp" />
              <source media="(max-width: 768px)" srcSet="/assets/Others/VERT_hero_building.webp" />
              <img src="/VERT_hero_building.webp" alt="Small building" className="md:w-[500px] mt-11" />
            </picture>
          </div>

          <section className="blue-grad-2 p-5 text-white gap-12 flex-col md:flex ">
            <div className="flex justify-between gap-8">
              <div>
                <div className="flex items-baseline">
                  <h2 className="font-bold text-3xl">25</h2>
                  <h2 className="font-medium text-lg ml-1">Years</h2>
                </div>
                <h3 className="font-semibold text-xl -mt-3">Operated</h3>
              </div>
              <p className="text-sm md:max-w-[400px]">
                As a trusted general project that has been operating for 25 years, our commitment is always to prioritize our client satisfaction.
              </p>     
            </div>
          </section>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
