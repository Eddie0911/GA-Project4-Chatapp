module.exports = {
    
    testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  
    
    testEnvironment: "jsdom", 
  
    
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1", 
    },
  
    
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
  
    
    transform: {
      "^.+\\.jsx?$": "babel-jest", 
    },
  
    
    globals: {
      NODE_ENV: "test",
    },
  
    
    reporters: ["default"],
  
    
    testTimeout: 10000, 
  
  
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.js"],
    coverageReporters: ["lcov"],
  };
  
  