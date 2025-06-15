import React from "react";

const projects = [
    { small: "/assets/projects/VERT_project1.webp", big: "/assets/projects_big/VERT_project_big_1.webp", text: "Explore our exciting project details!" },
    { small: "/assets/projects/VERT_project2.webp", big: "/assets/projects_big/VERT_project_big_2.webp", text: "Discover the intricate details of this amazing project!" },
    { small: "/assets/projects/VERT_project3.webp", big: "/assets/projects_big/VERT_project_big_3.webp", text: "Explore this innovative and creative project!" },
    { small: "/assets/projects/VERT_project4.webp", big: "/assets/projects_big/VERT_project_big_4.webp", text: "Discover the details of this amazing project!" },
];

const ProjectsSection = () => {
    return (
        <section className="p-5 flex flex-col  md:max-w-[1200px] md:mx-auto ">
            <h2 className="text-xl font-bold text-[#242527] md:text-4xl">Our collection <br /> of best projects</h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                {projects.map((project, index) => (
                    <div key={index} className="relative group mt-5">
                        <picture className="overflow-hidden block">
                            <source media="(min-width: 768px)" srcSet={project.big} />
                            <source media="(max-width: 800px)" srcSet={project.small} />
                            <img
                                src={project.small}
                                alt="Project Preview"
                                className="md:w-[500px] md:h-[478px] transform transition-transform duration-300 group-hover:scale-105"
                            />
                        </picture>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300  overflow-hidden ">
                            <p className="text-center font-bold text-lg md:text-xl px-4">{project.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProjectsSection;
