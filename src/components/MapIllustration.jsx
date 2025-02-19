import React, { useMemo, useEffect } from 'react';

const MapIllustration = ({ 
  title,
  coordinates,
  mapboxToken,
  width = 800,
  height = 200,
  mwidth = 850,
  mheight = 250,
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
  
  useEffect(() => {
	console.log('React Hydration Check: MapIllustration Mounted');
  }, []);

  if (!title || !coordinates || !mapboxToken) {
	console.error('Missing required props:', { title, coordinates, mapboxToken });
	return (
	  <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
		<p className="text-red-500">Error: Missing required props</p>
	  </div>
	);
  }

  const letterPositions = useMemo(() => {
	try {
	  const letters = title.replace(/\s+/g, '').slice(0, 5).toUpperCase();
	  const positions = [];
	  
	  for (let i = 0; i < letters.length; i++) {
		const marginX = width * 0.2;
		const marginY = height * 0.2;
		
		positions.push({
		  letter: letters[i],
		  x: marginX + Math.random() * (width - 2 * marginX),
		  y: marginY + Math.random() * (height - 2 * marginY),
		  rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
		  color: getMidCenturyColor(),
		  scale: 1.5 + Math.random() * 0.8
		});
	  }
	  return positions;
	} catch (error) {
	  console.error('Error generating letter positions:', error);
	  return [];
	}
  }, [title, width, height]);

  function getMidCenturyColor() {
	const colors = [
	  'rgba(230, 0, 0, 0.8)', // Warm red
	  'rgba(0, 0, 0, 0.8)', // White
	  'rgba(255, 255, 255, 0.8)', // Soft teal
	];
	return colors[Math.floor(Math.random() * colors.length)];
  }

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates[1]},${coordinates[0]},${zoom},${bearing},${pitch}/${mwidth}x${mheight}?access_token=${mapboxToken}&layers=settlement-label,place-label`;

  return (
	<div className="relative w-full h-[200px] md:h-[200px] overflow-hidden" data-debug="illustration-mounted">
	  <div className="absolute inset-0">
		<img 
		  src={mapUrl}
		  alt="Monochrome Light Map Without Labels or Pin" 
		  className="w-full h-full object-cover filter brightness-70 grayscale contrast-90"
		  onError={(e) => {
			console.error('Error loading map image:', e);
			e.target.style.display = 'none';
		  }}
		/>
	  </div>

<svg 
		className="absolute inset-0 w-full h-full pointer-events-none"
		viewBox={`0 0 ${width} ${height}`}
		preserveAspectRatio="xMidYMid slice"
	  >
		<defs>
		  {/* Add a filter for rough ink texture */}
		  <filter id="grungeFilter">
			<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="4"/>
		  </filter>
		</defs>
	  
		{letterPositions.map((pos, index) => (
		  <g 
			key={index} 
			transform={`translate(${pos.x},${pos.y}) rotate(${pos.rotation})`}
		  >
			<text
			  className="font-bold"
			  style={{
				fill: pos.color,
				fontSize: `${350 * pos.scale}px`,
				fontFamily: 'Faune, sans-serif',
				opacity: 0.6, // More faded ink effect
				filter: "url(#grungeFilter)", // Apply the rough edges
				mixBlendMode: "multiply", // Makes ink overlays richer
				textRendering: "optimizeSpeed", // Creates a slightly rougher look
				letterSpacing: "-0.02em", // Slight misalignment effect
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
