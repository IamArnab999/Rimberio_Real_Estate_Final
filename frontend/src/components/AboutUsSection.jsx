import React from "react";
import { Link } from "react-router-dom";
import PropertySections from "../pages/SeeMore";

const AboutUsSection = () => {
    
    return (
        <section className=" p-4 md:max-w-[1200px] md:mx-auto  -mt-25 "  id="about">
            <div className="flex flex-col gap-2 min-w-[16.25rem] md:flex-1 md:flex-row-reverse mt-16" >
                <div className="group overflow-hidden">
                    <img
                        src="/assets/Others/VERT_Mask_Group.webp"
                        alt="About Us"
                        className="shadow-md w-full md:max-w-[570px] md:border-8 md:border-white flex-1 transform transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="flex flex-col gap-4 flex-1 md:gap-8">
                    <h3 className="font-bold text-lg md:text-4xl md:font-bold">Our Story <br /> Who we are</h3>
                    <p className="font-medium text-base text-[#C4C4C4] md:max-w-[500px]">
                        Established in 1992, PT. Wahana Cipta operates as a General Contracting company with a footprint that we have planted throughout Indonesia.
                        Initially, we focused on construction in the field of residential housing development in Jakarta. As the company grows, now we are present as a reliable...
                    </p>
                    <Link to={'/see_more'}>
                    <button
                        className="bg-[#0A72AD] text-white py-1.5 px-3 self-start shadow-md shadow-cyan-400 transition-transform duration-300 hover:scale-105"
                        
                    >
                        See More
                    </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;