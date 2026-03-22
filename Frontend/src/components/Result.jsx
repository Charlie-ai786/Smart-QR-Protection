import React from "react";
import { motion } from "framer-motion";
import ResultDashboard from "./ResultDashboard";

/**
 * Result View Component
 * A simple wrapper for the ResultDashboard to fit the state flow.
 */
const Result = ({ results, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ResultDashboard 
        results={results} 
        onReset={onReset} 
      />
    </motion.div>
  );
};

export default Result;
