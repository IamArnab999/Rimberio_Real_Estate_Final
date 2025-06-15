import React from "react";

const License = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-2 py-8">
      {/* Logo */}
      <img
        src="/assets/Others/logo2.png"
        alt="RIMBERIO Logo"
        className="w-32 h-32 object-contain mb-4 drop-shadow-lg rounded-full"
      />
      {/* Heading */}
      <h1 className="text-xl md:text-3xl font-extrabold text-blue-900 mb-2 text-center tracking-tight">
        Terms of Use & Intellectual Property Notice
      </h1>
      {/* Expensive Property Image */}
      <div className="w-full max-w-2xl flex justify-center my-6">
        <img
          src="/assets/apartment/residence-2219972_1280.jpg"
          alt="Expensive Property"
          className="rounded-2xl shadow-xl w-full h-64 object-cover object-center border-4 border-blue-200"
        />
      </div>
      {/* License Content */}
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 md:p-10 max-w-2xl w-full">
        <p className="mb-4 text-lg text-gray-700">
          <strong className="text-blue-800">RIMBERIO Real Estate Agency</strong>{" "}
          grants you a limited, non-exclusive, non-transferable license to
          access and use this website for personal and non-commercial purposes,
          subject to the following terms:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
          <li>
            <strong>Content Ownership:</strong> All content, images, logos, and
            trademarks on this site are the property of RIMBERIO or its
            licensors. You may not copy, reproduce, or distribute any content
            without written permission.
          </li>
          <li>
            <strong>Permitted Use:</strong> You may view, download, and print
            pages from the website for your own personal use, subject to
            restrictions set in these terms.
          </li>
          <li>
            <strong>Prohibited Use:</strong> You may not:
            <ul className="list-disc pl-6">
              <li>
                Republish material from this website (including republication on
                another website)
              </li>
              <li>Sell, rent, or sub-license material from the website</li>
              <li>
                Show any material from the website in public without attribution
              </li>
              <li>
                Reproduce, duplicate, copy, or otherwise exploit material on
                this website for a commercial purpose
              </li>
            </ul>
          </li>
          <li>
            <strong>Software & APIs:</strong> Any software, code, or APIs
            provided are licensed, not sold. Use is subject to additional terms
            provided with those resources.
          </li>
          <li>
            <strong>Third-Party Content:</strong> Some content may be subject to
            third-party licenses. Please refer to their respective terms.
          </li>
          <li>
            <strong>Changes:</strong> We reserve the right to update this
            license at any time. Continued use of the website constitutes
            acceptance of the new terms.
          </li>
        </ul>
        <p className="mb-2 text-gray-700">
          For questions about licensing or permissions, please contact us at{" "}
          <a
            href="mailto:support_rimberio@outlook.com"
            className="text-blue-600 underline"
          >
            support_rimberio@outlook.com
          </a>
          .
        </p>
        <p className="text-sm text-gray-500 text-right">
          Last updated: June 2025
        </p>
      </div>
    </div>
  );
};

export default License;
