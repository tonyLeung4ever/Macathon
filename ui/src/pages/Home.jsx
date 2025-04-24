import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-emerald-100 to-amber-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-32 pb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-emerald-900 mb-4">
              Welcome to Macathon 🌳
            </h1>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              Where ideas grow and flourish like seeds in fertile soil 🌱
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 flex justify-center gap-6"
          >
            <a href="/product" className="px-8 py-3 bg-emerald-700 text-amber-50 rounded-lg hover:bg-emerald-800 transition-colors shadow-md hover:shadow-lg">
              Explore Product 🌿
            </a>
            <a href="/about" className="px-8 py-3 border-2 border-emerald-700 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors">
              About Us 🍃
            </a>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">Sustainable 🌱</h3>
              <p className="text-emerald-600">Growing solutions that last for generations</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">Natural 🌿</h3>
              <p className="text-emerald-600">Rooted in organic, authentic approaches</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">Nurturing 🌳</h3>
              <p className="text-emerald-600">Helping ideas grow and thrive</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home; 