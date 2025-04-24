import { motion } from 'framer-motion';
import { ChevronRightIcon, SparklesIcon, HomeIcon, SunIcon } from '@heroicons/react/24/outline';

const Product = () => {
  const features = [
    {
      title: "Organic Growth 🌱",
      description: "Naturally evolving solutions for sustainable progress",
      icon: SparklesIcon,
    },
    {
      title: "Deep Roots 🌳",
      description: "Built on strong foundations that last",
      icon: HomeIcon,
    },
    {
      title: "Natural Energy 🌞",
      description: "Powered by sustainable, renewable principles",
      icon: SunIcon,
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
              Our Growing Solution 🌱
            </h1>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto mb-8">
              Watch your ideas take root and flourish with our organic approach 🌿
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-emerald-700 text-amber-50 rounded-lg hover:bg-emerald-800 transition-colors shadow-md hover:shadow-lg">
              Learn More
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 * (index + 1), duration: 0.8 }}
                className="text-center p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow border-2 border-emerald-100"
              >
                <feature.icon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-emerald-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="bg-amber-50 text-emerald-900 py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Grow With Us? 🌱</h2>
          <button className="px-8 py-4 bg-emerald-700 text-amber-50 rounded-lg hover:bg-emerald-800 transition-colors shadow-md hover:shadow-lg">
            Plant Your Seeds Today 🌿
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Product; 