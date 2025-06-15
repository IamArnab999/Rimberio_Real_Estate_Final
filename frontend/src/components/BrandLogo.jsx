import React from 'react'

const BrandLogo = () => {
    const logos = [
        "/assets/brand/VERT_logo_1.webp",
        "/assets/brand/VERT_logo_2.webp",
        "/assets/brand/VERT_logo_3.webp",
        "/assets/brand/VERT_logo_4.webp",
        "/assets/brand/VERT_logo_5.webp",
    ];
  return (
      <section className="h-[100px] flex gap-2 flex-row overflow-x-auto overflow-y-hidden items-center p-5 md:max-w-[1200px] md:mx-auto md:justify-between md:h-[200px] md:py-5">
          {logos.map((logo, index) => (
              <div key={index} className="h-20 grid place-content-center min-w-[7.5rem] brand-logo">
                  <img
                      src={logo}
                      alt={`Logo ${index + 1}`}
                      className="md:min-w-[8rem] transform transition-transform duration-300 hover:scale-105"
                  />
              </div>
          ))}
      </section>
  )
}

export default BrandLogo;