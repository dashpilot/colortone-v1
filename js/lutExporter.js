// lutExporter.js - Utility for exporting 3D LUT files in .cube format

/**
 * Generate a 3D LUT in .cube format based on the current image processing settings
 * @param {Object} processor - FilmPresetProcessor instance with current settings
 * @param {number} size - Size of the LUT cube (e.g., 17 for a 17x17x17 LUT)
 * @param {string} title - Title/name of the LUT
 * @param {Object} metadata - Additional metadata about preset and LUT used
 * @returns {string} - Complete .cube file content as a string
 */
export function generateCubeLUT(processor, size, title, metadata = {}) {
	// Generate header information
	let cubeFile = `# Created by Filmkit, filmkit.net\n`;
	cubeFile += `# Title: ${title}\n`;
	cubeFile += `# Size: ${size}\n`;

	// Add film stock information if preset is available
	if (metadata.preset) {
		cubeFile += `# Film Stock: ${metadata.preset.brand} ${metadata.preset.name}\n`;
	}

	// Add suitable for information if LUT is available
	if (metadata.lut) {
		cubeFile += `# Suitable For: ${metadata.lut.name}\n`;
	}

	cubeFile += `\n`;
	cubeFile += `LUT_3D_SIZE ${size}\n\n`;

	// Create a small canvas with a single pixel to process each color
	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;
	const ctx = canvas.getContext('2d');

	// Process each point in the 3D grid
	const step = 1.0 / (size - 1);

	for (let b = 0; b < size; b++) {
		const blue = b * step;

		for (let g = 0; g < size; g++) {
			const green = g * step;

			for (let r = 0; r < size; r++) {
				const red = r * step;

				// Create an image with this color
				ctx.fillStyle = `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`;
				ctx.fillRect(0, 0, 1, 1);
				const imgData = ctx.getImageData(0, 0, 1, 1);

				// Process this color through our processor
				const processedColor = processor.processColor([red, green, blue]);

				// Write the processed color to the LUT file
				cubeFile += `${processedColor[0].toFixed(6)} ${processedColor[1].toFixed(6)} ${processedColor[2].toFixed(6)}\n`;
			}
		}
	}

	return cubeFile;
}

/**
 * Export a 3D LUT file and trigger download
 * @param {Object} processor - FilmPresetProcessor instance
 * @param {number} size - Size of the LUT cube
 * @param {string} title - Title of the LUT
 * @param {Object} metadata - Additional metadata about preset and LUT used
 */
export function exportLUT(processor, size, title, metadata = {}) {
	const lutData = generateCubeLUT(processor, size, title, metadata);
	const blob = new Blob([lutData], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = `${title}.cube`;
	a.click();

	URL.revokeObjectURL(url);
}
