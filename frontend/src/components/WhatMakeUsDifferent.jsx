import React from "react";

const WhatMakesUsDifferent = () => {
    const features = [
        {
            img: "/assets/makesus/VERT_make_us_1.webp",
            title: "Experienced",
            description:
                "Our experience of 25 years of building and making achievements in the world of development",
        },
        {
            img: "/assets/makesus/VERT_make_us_2.webp",
            title: "Competitive Price",
            description:
                "The prices we offer you are very competitive without reducing the quality of the company's work in the slightest",
        },
        {
            img: "/assets/makesus/VERT_make_us_3.webp",
            title: "On Time",
            description:
                "We prioritize the quality of our work and finish it on time",
        },
        {
            img: "/assets/makesus/VERT_make_us_4.webp",
            title: "Best Materials",
            description:
                "The material determines the building itself so we recommend that you use the best & quality materials in its class.",
        },
    ];

    return (
        <section className="p-5 lg:max-w-[1200px] lg:mx-auto">
            {/* Section Header */}
            <div className="flex flex-col gap-2 lg:gap-4">
                <div className="h-1 w-[90px] blue-grad lg:h-2"></div>
                <div className="lg:flex lg:justify-between lg:items-center">
                    <h2 className="font-bold text-xl lg:text-4xl">
                        What Makes Us <br /> Different?
                    </h2>
                    <p className="font-medium text-base text-[#C4C4C4] lg:max-w-[561px] lg:text-lg">
                        Check out our best services you can possibly order in building your company and don't forget to ask via our
                        email or our customer service if you are interested in using our services
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 gap-8 mt-10 text-center lg:grid-cols-4 lg:gap-12 lg:mt-20">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="what-makes-us-section flex flex-col gap-2 items-center lg:items-start lg:text-start"
                    >
                        <div className="group overflow-hidden">
                            <img
                                src={feature.img}
                                alt={feature.title}
                                className="transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <h3 className="font-bold text-lg mt-2">{feature.title}</h3>
                        <p className="font-medium text-base text-[#C4C4C4] min-h-[4.5rem]">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhatMakesUsDifferent;