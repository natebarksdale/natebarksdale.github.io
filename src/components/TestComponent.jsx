import React, { useEffect } from 'react';

const TestComponent = () => {
  useEffect(() => {
	console.log('✅ React Component Mounted!');
  }, []);

  return <div className="bg-green-200 p-4 text-black">Hello from React!</div>;
};

export default TestComponent;
