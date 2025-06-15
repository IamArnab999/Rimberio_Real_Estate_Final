import React from "react";
import { Link } from "react-router-dom";
// import how_it_works from "../pages/HowItWorks";
//  import teams from "../pages/Team";

const TeamSection = () => {
    return (
        <section className="p-5 md:max-w-[1200px] md:mx-auto flex flex-col lg:flex-row" id="Team">
            <div className="bg-team-bg-image h-[460px] bg-no-repeat bg-cover flex justify-center items-end mb-20 md:flex-1 md:mr-40 md:flex-col md:h-[500px]">
                <div className="black-grad h-[250px] w-[250px] relative -top-20 flex flex-col p-5 gap-2 items-center md:top-0 md:-right-24">
                    <div className="group overflow-hidden">
                        <img
                            src="/assets/teams/VERT_team_avatar.webp"
                            alt="Teams"
                            className="rounded-full transform transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <h3 className="font-bold text-lg text-white">Dianne Russell</h3>
                    <p className="text-center text-base text-[#E5E5E5] font-medium">
                        More than 20 years of experience in the field of architecture and has worked on projects up to 100+
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 md:justify-center md:flex-1 md:mb-48">
                <h2 className="text-[#242527] font-bold text-xl md:text-3xl">
                    Meet and talk with <br /> our best architects
                </h2>
                <p className="text-[#C4C4C4] font-medium text-base md:w-[400px] md:text-md md:leading-8">
                    All our teams are professional and competent in their fields and will help you realize your dream building with excellent results.
                </p>
                <div className="flex justify-between mt-2 md:self-start md:items-center md:gap-12">
                    <Link to={'/teams'}>
                    <button
                        className="bg-[#0A72AD] text-white py-1.5 px-3 shadow-md shadow-cyan-400 md:py-4 md:px-8 md:text-center transition-transform duration-300 hover:scale-105"
                    >
                        See all teams
                    </button>
                    </Link>
                    <Link to={'/how_it_works'}>
                    <button
                        className="font-bold text-md text-[#242527] flex gap-2 transition-transform duration-300 hover:scale-105"
                    >
                        How it works
                        <img
                            src="/assets/teams/VERT_arrow.webp"
                            className="pt-1 mt-1 transition-transform duration-300 hover:translate-x-2"
                            alt="Arrow"
                        />
                    </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TeamSection;