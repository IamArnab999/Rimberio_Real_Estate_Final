import React, { useState } from "react";

const investors = [
  {
    img: "https://randomuser.me/api/portraits/women/76.jpg",
    name: "Priya Mehra",
    title: "Angel Investor, Fintech Innovator",
    achievements: [
      "Invested in 20+ high-growth startups",
      "Featured in Forbes 30 Under 30",
      "Raised $50M+ in funding rounds",
    ],
    email: "priya.mehra@gmail.com",
  },
  {
    img: "https://randomuser.me/api/portraits/men/69.jpg",
    name: "Rahul Verma",
    title: "Venture Capitalist, Real Estate Specialist",
    achievements: [
      "Portfolio valued at $200M+",
      "Speaker at Global Investment Summit 2024",
      "Mentor to 10+ unicorn founders",
    ],
    email: "rahul.verma@gmail.com",
  },
  {
    img: "https://randomuser.me/api/portraits/women/2.jpg",
    name: "Sonia Kapoor",
    title: "Private Equity Partner",
    achievements: [
      "Closed 15+ major real estate deals",
      "Awarded 'Investor of the Year' 2023",
      "Board member at 5 international firms",
    ],
    email: "sonia.kapoor@gmail.com",
  },
  {
    img: "https://randomuser.me/api/portraits/men/45.jpg",
    name: "Amit Singh",
    title: "Serial Entrepreneur & Investor",
    achievements: [
      "Founded and exited 3 tech startups",
      "Angel investor in 12+ companies",
      "TEDx Speaker on investment trends",
    ],
    email: "amit.singh@gmail.com",
  },
];

const Investors = () => {
  const [selected, setSelected] = useState(null);

  const handleContact = (email) => {
    window.location.href = `mailto:${email}?subject=Business Inquiry from Fellow Investor`;
  };

  return (
    <section className="py-10 px-2 min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl md:text-3xl font-extrabold text-blue-900 text-center mb-8 tracking-tight">
          Connect with Leading Investors
        </h1>
        <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore our network of accomplished investors. Click on a card to view
          achievements and send a business inquiry email directly to your fellow
          investor.
        </p>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {investors.map((inv, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 md:p-6 flex flex-col items-center cursor-pointer border-2 border-transparent hover:border-blue-300 ${
                selected === idx ? "ring-2 ring-blue-400" : ""
              }`}
              onClick={() => setSelected(selected === idx ? null : idx)}
            >
              <img
                src={inv.img}
                alt={inv.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover mb-3 md:mb-4 border-4 border-blue-100 shadow"
              />
              <h2 className="text-lg md:text-xl font-bold text-blue-800 mb-1 text-center">
                {inv.name}
              </h2>
              <p className="text-blue-600 font-medium mb-2 text-center text-sm md:text-base">
                {inv.title}
              </p>
              {selected === idx && (
                <div className="w-full mt-2">
                  <h3 className="font-semibold text-gray-700 mb-1 text-center text-sm md:text-base">
                    Key Achievements:
                  </h3>
                  <ul className="list-disc pl-5 mb-3 text-gray-600 text-xs md:text-sm">
                    {inv.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact(inv.email);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 mt-2 text-xs md:text-base"
                  >
                    Contact via Business Inquiry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Investors;
