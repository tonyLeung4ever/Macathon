import { motion } from 'framer-motion';
import { SparklesIcon, HomeIcon, SunIcon } from '@heroicons/react/24/outline';

// Import the team member photos
import VanamaliPhoto from '../photos/Vanamali Sims.png';
import KrishitaaPhoto from '../photos/Krishitaa Purusothaman.png';
import SkyelarPhoto from '../photos/Skyelar.png';

const About = () => {
  const values = [
    {
      title: "Our Vision 🌱",
      description: "To nurture sustainable growth and positive change in the world.",
      icon: SparklesIcon,
    },
    {
      title: "Our Roots 🌳",
      description: "Grounded in strong values and authentic connections.",
      icon: HomeIcon,
    },
    {
      title: "Our Growth 🌞",
      description: "Continuously evolving while staying true to our core.",
      icon: SunIcon,
    },
  ];

  const team = [
    {
      name: "Vanamali Sims",
      role: "Team Member 1",
      image: VanamaliPhoto,
    },
    {
      name: "Krishitaa Purusothaman",
      role: "Team Member 2",
      image: KrishitaaPhoto,
    },
    {
      name: "Skyelar",
      role: "Team Member 3",
      image: SkyelarPhoto,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-100 to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-emerald-900 mb-6">
              Growing Together 🌱
            </h1>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              We're a team of cultivators, nurturing ideas into reality 🌿
            </p>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 * (index + 1), duration: 0.8 }}
                className="text-center p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow border-2 border-emerald-100"
              >
                <value.icon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-emerald-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-emerald-900">Meet Our Garden Team 🌿</h2>
            <p className="mt-4 text-emerald-700">The cultivators of innovation</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 * (index + 1), duration: 0.8 }}
                className="text-center"
              >
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-lg mx-auto mb-4 object-cover border-2 border-emerald-200 shadow-md"
                  />
                </div>
                <h3 className="text-xl font-semibold text-emerald-800">{member.name}</h3>
                <p className="text-emerald-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About; 