import React, { useState } from "react";

const articles = [
    {
        id: 1,
        img: "/assets/news/news1.png",
        date: "12",
        month: "Jan",
        title: "Elements of Content in Epoxy Paint",
        description:
            "Epoxy paint and epoxy floor contractor. Have you heard the two terms? And what does that have to do with the construction of existing buildings? Epoxy itself is included in the type of resin...",
        fullDescription:
            "Epoxy paint and epoxy floor contractor. Have you heard the two terms? And what does that have to do with the construction of existing buildings? Epoxy itself is included in the type of resin, which is widely used for coating floors, walls, and other surfaces to provide durability and a polished finish.",
        link: "https://example.com",
    },
    {
        id: 2,
        img: "/assets/news/news2.png",
        date: "12",
        month: "Jan",
        title: "5 Right Steps in Warehouse Planning and Construction",
        description:
            "Planning the construction of a warehouse for both industrial, personal and other goods storage must be done carefully. When the planning is done properly, the construction is...",
        fullDescription:
            "Planning the construction of a warehouse for both industrial, personal and other goods storage must be done carefully. When the planning is done properly, the construction is efficient, cost-effective, and meets the specific needs of the business.",
        link: "https://example.com",
    },
    {
        id: 3,
        img: "/assets/news/news3.png",
        date: "12",
        month: "Jan",
        title: "The Right Solution to Build a Sturdy Type 45 House",
        description:
            "Having a solid home is certainly everyone's dream. How not, the house is a place where the residents can rest and take shelter from the bad weather...",
        fullDescription:
            "Having a solid home is certainly everyone's dream. How not, the house is a place where the residents can rest and take shelter from the bad weather. Building a sturdy Type 45 house requires proper planning, quality materials, and skilled labor.",
        link: "https://example.com",
    },
];

const NewsUpdates = () => {
    const [expandedArticle, setExpandedArticle] = useState(null); // Track which article is expanded

    const handleReadMore = (id) => {
        setExpandedArticle(id); // Expand the selected article
    };

    const handleReadLess = () => {
        setExpandedArticle(null); // Collapse the article
    };

    return (
        <section className="p-5 md:max-w-[1200px] md:mx-auto md:flex md:flex-col" id="Articles">
            <h2 className="text-xl font-bold md:text-4xl md:gap-4 mt-6 md:mt-12">News & Updates</h2>
            <div className="flex flex-wrap lg:gap-14 lg:w-full md:gap-[2rem]   mt-6 md:w-full sm:gap-11 ">
                {articles.map((article) => (
                    <div
                        key={article.id}
                        className="flex flex-col gap-4 w-full md:w-[300px] bg-white shadow-md rounded-lg p-4"
                    >
                        <div className="group overflow-hidden">
                            <img
                                src={article.img}
                                alt=""
                                className="shadow-md w-full h-[200px] object-cover transform transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex gap-4 items-start">
                            <div>
                                <p className="font-bold text-lg leading-none">{article.date}</p>
                                <p className="text-base font-bold">{article.month}</p>
                            </div>
                            <h4 className="font-bold text-sm md:text-md group-hover:text-[#0A72AD] transition-colors duration-300">
                                {article.title}
                            </h4>
                        </div>
                        <div className="text-[#C4C4C4] font-medium text-sm md:text-base group-hover:text-[#888] transition-colors duration-300">
                            <p>
                                {expandedArticle === article.id
                                    ? article.fullDescription // Show full description if expanded
                                    : article.description} {/* Show truncated description */}
                            </p>
                            {expandedArticle === article.id ? (
                                <button
                                    onClick={handleReadLess}
                                    className="text-[#0A72AD] hover:underline mt-2"
                                >
                                    Read Less
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleReadMore(article.id)}
                                    className="text-[#0A72AD] hover:underline mt-2"
                                >
                                    Read More
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default NewsUpdates;