import React, { useMemo, useEffect } from 'react';

const MapIllustration = ({ 
  title,
  coordinates,
  mapboxToken,
  width = 800,
  height = 400,
  zoom = 5,
  bearing = 0,
  pitch = 0
}) => {
  useEffect(() => {
	console.log('MapIllustration mounted with props:', {
	  title,
	  coordinates,
	  mapboxToken: mapboxToken ? '[PRESENT]' : '[MISSING]'
	});
  }, []);

  if (!title || !coordinates || !mapboxToken) {
	console.error('Missing required props:', { title, coordinates, mapboxToken });
	return (
	  <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
		<p className="text-red-500">Error: Missing required props</p>
	  </div>
	);
  }

  // Function to restrict rotation to 0, 90, 180, 270 degrees
  function getRandomRotation() {
	const angles = [0, 90, 180, 270];
	return angles[Math.floor(Math.random() * angles.length)];
  }

  // Updated color palette for mid-century modern style
  function getRandomColor() {
	const colors = [
	  '#E63946', // Coral Red
	  '#F4A261', // Warm Orange
	  '#2A9D8F', // Teal
	  '#264653', // Deep Navy
	  '#E9C46A', // Golden Yellow
	];
	return colors[Math.floor(Math.random() * colors.length)];
  }

  // Generate positions and attributes for letters
  const letterPositions = useMemo(() => {
	const letters = title.replace(/\s+/g, '').slice(0, 5).toUpperCase();
	const positions = [];

	for (let i = 0; i < letters.length; i++) {
	  const marginX = width * 0.1;
	  const marginY = height * 0.1;

	  positions.push({
		letter: letters[i],
		x: marginX + Math.random() * (width - 2 * marginX),
		y: marginY + Math.random() * (height - 2 * marginY),
		rotation: getRandomRotation(), // Use only 0, 90, 180, 270
		color: getRandomColor(),
		scale: 1.5 + Math.random(), // Increase letter size
	  });
	}
	return positions;
  }, [title, width, height]);

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[1]},${coordinates[0]},${zoom},${bearing},${pitch}/${width}x${height}?access_token=${mapboxToken}&layers=settlement-label,place-label`;

  return (
	<div className="relative w-full h-full">
	  <div className="absolute inset-0">
		<img 
		  src={mapUrl}
		  alt="Map Illustration" 
		  className="w-full h-full object-cover filter brightness-80 contrast-90"
		  onError={(e) => {
			console.error('Error loading map image:', e);
			e.target.style.display = 'none';
		  }}
		/>
	  </div>

	  <svg 
		className="absolute inset-0 w-full h-full pointer-events-none"
		viewBox={`0 0 ${width} ${height}`}
		preserveAspectRatio="none"
	  >
		{letterPositions.map((pos, index) => (
		  <g 
			key={index} 
			transform={`translate(${pos.x},${pos.y}) rotate(${pos.rotation})`}
		  >
			<text
			  style={{
				fill: pos.color,
				fontSize: `${220 * pos.scale}px`, // Bigger letters
				fontWeight: 'bold',
				fontFamily: 'Futura, sans-serif', // Mid-century typography
				transformOrigin: 'center',
			  }}
			  textAnchor="middle"
			  dominantBaseline="middle"
			>
			  {pos.letter}
			</text>
		  </g>
		))}
	  </svg>
	</div>
  );
};

export default MapIllustration;
