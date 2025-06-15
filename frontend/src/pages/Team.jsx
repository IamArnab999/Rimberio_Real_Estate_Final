import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Avatar,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { AnimatePresence, motion } from "framer-motion";

// Member Detail View
const MemberDetail = ({ member }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="mt-20 mb-16 p-16 border rounded-lg bg-white shadow-md"
  >
    <div className="flex flex-col lg:flex-row gap-7 items-start">
      <Avatar
        src={member.img}
        alt={member.name}
        size="xxl"
        className="w-32 h-32 object-cover rounded-full aspect-square mt-8"
        style={{ objectFit: "cover", width: 128, height: 128 }}
      />
      <div className="flex-1 mt-6">
        <Typography variant="h4" className="font-bold mb-2">
          {member.name}
        </Typography>
        <Typography className="text-blue-gray-600 mb-4 font-semibold">
          {member.title}
        </Typography>
        <Typography className="text-gray-700 leading-relaxed mb-4">
          {member.description ||
            "A dedicated professional focused on delivering excellence in their domain."}
        </Typography>

        {/* Experience Section */}
        <Typography className="font-medium text-gray-800 mb-2">
          <strong>Experience:</strong>
        </Typography>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          {(member.experience || []).map((exp, idx) => (
            <li key={idx}>{exp}</li>
          ))}
        </ul>

        {/* Skills & Projects */}
        {member.skills && (
          <>
            <Typography className="font-medium text-gray-800 mb-2">
              <strong>Skills & Projects:</strong>
            </Typography>
            <div className="space-y-4">
              {member.skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">
                      {skill.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Social Icons */}
        <div className="flex gap-5 mt-6">
          {member.socials?.github && (
            <IconButton
              onClick={() =>
                window.open(
                  member.socials.github,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              variant="text"
            >
              <i className="fab fa-github text-xl hover:text-black"></i>
            </IconButton>
          )}
          {member.socials?.instagram && (
            <IconButton
              onClick={() =>
                window.open(
                  member.socials.instagram,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              variant="text"
            >
              <i className="fab fa-instagram text-xl hover:text-pink-500"></i>
            </IconButton>
          )}
          {member.socials?.discord && (
            <IconButton
              onClick={() =>
                window.open(
                  member.socials.discord,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              variant="text"
            >
              <i className="fab fa-discord text-xl hover:text-indigo-600"></i>
            </IconButton>
          )}
          {member.socials?.linkedin && (
            <IconButton
              onClick={() =>
                window.open(
                  member.socials.linkedin,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              variant="text"
            >
              <i className="fab fa-linkedin text-xl hover:text-blue-600"></i>
            </IconButton>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Individual Team Card
const TeamCard = ({ member, isSelected, onSelect }) => {
  return (
    <Card
      className={`rounded-lg cursor-pointer bg-[#FAFAFA] hover:bg-sky-400 hover:shadow-lg transition-all duration-300 ${
        isSelected ? "ring-2 ring-sky-400" : ""
      }`}
      onClick={() => onSelect(member)}
      shadow={false}
    >
      <CardBody className="text-center">
        <Avatar
          src={member.img}
          alt={member.name}
          variant="circular"
          size="xl"
          className="mx-auto mb-7 w-24 h-29 rounded-full object-cover"
        />
        <Typography
          variant="h5"
          color="blue-gray"
          className="!font-medium text-lg"
        >
          {member.name}
        </Typography>
        <Typography
          color="blue-gray"
          className="mb-2 !text-base !font-semibold text-gray-600"
        >
          {member.title}
        </Typography>
      </CardBody>
    </Card>
  );
};

// Team Member Data
const members = [
  {
    img: "/assets/teams/VERT_Ani.webp",
    name: "Anirudha Basu Thakur",
    title: "Full-Stack Software Engineer",
    description: "Experienced in backend systems and microservices.",
    experience: [
      "🌐 Successfully built and deployed robust RESTful APIs leveraging Node.js and the Express.js framework, ensuring efficient data exchange and application functionality.",
      "📊 Proficiently designed, implemented, and managed SQL databases, optimizing data storage and retrieval for various applications.",
      "⚛️ Crafted modern and responsive user interfaces using React, complemented by TailWindCSS for efficient styling and a polished user experience.",
      "🐙 Actively participated in the open-source community on GitHub, contributing code and collaborating on projects, demonstrating strong coding practices and teamwork.",
    ],
    socials: {
      github: "https://github.com/Ani0811/",
      instagram: "https://instagram.com/this_is_ringo_here/",
      discord: "https://discord.com/users/anni7880/",
      linkedin: "https://www.linkedin.com/in/anirudha-basu-thakur-686aa8253/",
    },
    skills: [
      { name: "Node.js", level: 70 },
      { name: "Express.js", level: 70 },
      { name: "SQL", level: 75 },
      { name: "React", level: 80 },
      { name: "TailWindCSS", level: 60 },
      { name: "Java", level: 75 },
      { name: "Python", level: 75 },
      { name: "C#", level: 80 },
    ],
  },
  {
    img: "/assets/teams/VERT_Arnab.webp",
    name: "Arnab Roy",
    title: " MERN Stack Developer and Technical Enthusiast",
    description: "Passionate about crafting intuitive and engaging UI designs.",
    experience: [
      "Developed responsive web interfaces using React js, Tailwind CSS, and Figma, ensuring cross-device compatibility and modern UI design.",

      "Collaborated with backend developers to ensure seamless frontend-backend integration for dynamic content and user authentication.",
      "Developed interactive web applications using React and Node.js.",
      "Implemented Git-based workflows for version control and participated in code reviews during open-source contributions and hackathons.",
    ],
    socials: {
      github: "https://github.com/arnab825",
      instagram: "https://www.instagram.com/rarnab225",
      discord: "http://discordapp.com/users/arnab5666",
      linkedin: "https://www.linkedin.com/in/arnab825",
    },
    skills: [
      { name: "Node JS", level: 90 },
      { name: "Tailwind CSS", level: 85 },
      { name: "Python", level: 75 },
      { name: "MySQL", level: 75 },
      { name: "Azure", level: 70 },
      { name: "React", level: 80 },
    ],
  },
  {
    img: "/assets/teams/VERT_Vasudev.webp",
    name: "Vasudev Sharma",
    title: "UI/UX Designer and Creative Technologist",
    description:
      "Passionate about crafting visually compelling, user-centric digital experiences that balance aesthetics with functionality.",
    experience: [
      "🎨 Designed responsive and accessible user interfaces using Figma, Adobe XD, and Tailwind CSS, ensuring pixel-perfect layouts across devices.",
      "🔍 Conducted user research, usability testing, and heuristic evaluations to inform data-driven design decisions.",
      "🔧 Collaborated with developers to bridge design and code, creating seamless user journeys with tools like React, Framer, and Zeplin.",
      "🚀 Created interactive prototypes and design systems, streamlining workflows for teams and maintaining design consistency.",
      "🌐 Participated in design sprints, open-source UI libraries, and product revamps during internships and hackathons.",
    ],
    socials: {
      github: "https://github.com/vasudevsharma3223",
      instagram: "https://www.instagram.com/vasudev.sharma5",
      discord: "https://discordapp.com/users/876486065576358010",
      linkedin: "https://www.linkedin.com/in/vasudev-sharma-a8b4ab22a",
    },
    skills: [
      { name: "Power BI", level: 90 },
      { name: "SQL", level: 80 },
      { name: "Python", level: 70 },
    ],
  },
  {
    img: "/assets/teams/VERT_Kanti.webp",
    name: "Arnab Kanti Das",
    title: "UI/UX Developer",
    description: "Focuses on human-centered UI development.",
    experience: [
      "Created modern UX flows for fintech apps",
      "Conducted usability testing sessions",
    ],
    socials: {
      github: "https://github.com/IamArnab999",
      instagram: "https://www.instagram.com/heis_kaizen",
      discord: "https://discord.com/users/kantidas",
      linkedin: "https://www.linkedin.com/in/arnab-kanti-das-61b164259",
    },
    skills: [
      { name: "React", level: 80 },
      { name: "UX Design", level: 88 },
      { name: "User Testing", level: 70 },
    ],
  },
];

// Team Section Component
const Team = () => {
  const [selected, setSelected] = useState(null);
  const detailRef = React.useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (selected && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  const handleSelect = (member) => {
    if (selected?.name === member.name) {
      setSelected(null);
    } else {
      setSelected(member);
    }
  };

  return (
    <section className="py-8 px-8 lg:py-18 font-sans">
      <div className="container mx-auto mt-12">
        <div className="mb-12 text-center lg:mb-20">
          <Typography
            variant="h1"
            color="blue-gray"
            className="!text-2xl lg:!text-4xl font-bold uppercase"
          >
            Meet Our Team
          </Typography>
          <Typography
            variant="lead"
            className="mx-auto w-full !text-gray-500 max-w-4xl text-lg mt-6 leading-7 font-medium"
          >
            Meet our dedicated team of professionals ready to serve you with
            excellence.
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member, idx) => (
            <TeamCard
              key={idx}
              member={member}
              isSelected={selected?.name === member.name}
              onSelect={handleSelect}
            />
          ))}
        </div>
        <AnimatePresence>
          {selected && (
            <div ref={detailRef}>
              <MemberDetail member={selected} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Team;
