import React from "react";


const Services = () => {

  const services = [
    {
      title: "Industrial",
      description:
        "Industrial development is our main line of business. We do Factory Construction, Warehouse, and others.",
      image: "/assets/services/services_1.png",
    },
    {
      title: "Commercial",
      description:
        "We also provide commercial services like office buildings, residential duplexes, and restaurants.",
      image: "/assets/services/services_2.png",
    },
    {
      title: "Residential",
      description:
        "Residential properties like family homes, condos, cooperatives, duplexes, and townhouses are our focus.",
      image: "/assets/services/services_3.png",
    },
  ];

  return (
    <section className="p-5 bg-gray-100" id="services">
      <div className="container mx-auto mt-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold">Our Excellent Services</h2>
          <p className="text-gray-600 mt-4">
            Check out our best services you can possibly order in building your company. Don't forget to ask via our
            email or customer service if you are interested in using our services.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card bg-white shadow-md rounded-lg overflow-hidden  transform transition-transform duration-300 hover:scale-105"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;