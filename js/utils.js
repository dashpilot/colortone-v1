// utils.js - Utility functions

/**
 * Set up drag and drop functionality for image uploads
 * @param {Object} appContext - The Alpine.js component context
 */
export function setupDragAndDrop(appContext) {
	const imageArea = document.querySelector('.image-area');

	imageArea.addEventListener('dragover', (e) => {
		e.preventDefault();
		imageArea.classList.add('dragging');
	});

	imageArea.addEventListener('dragleave', () => {
		imageArea.classList.remove('dragging');
	});

	imageArea.addEventListener('drop', (e) => {
		e.preventDefault();
		imageArea.classList.remove('dragging');

		if (e.dataTransfer.files.length) {
			appContext.handleFile(e.dataTransfer.files[0]);
		}
	});
}

/**
 * Create a shader of the given type with the provided source
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source - GLSL source code
 * @returns {WebGLShader} - Compiled shader
 */
export function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}

	console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
	return null;
}

/**
 * Create a program from vertex and fragment shaders
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {WebGLShader} vertexShader - Vertex shader
 * @param {WebGLShader} fragmentShader - Fragment shader
 * @returns {WebGLProgram} - Compiled program
 */
export function createProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();

	// Add error checking before attaching shaders
	if (!vertexShader || !fragmentShader) {
		console.error('Cannot create program: invalid shaders provided');
		return null;
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}

	console.error('Program linking error:', gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
	return null;
}

/**
 * Convert curve points to a texture for WebGL
 * @param {Array} curve - Array of curve control points
 * @returns {Uint8Array} - Texture data for the curve
 */
export function createCurveTexture(curve) {
	const textureData = new Uint8Array(256);

	// Default linear mapping
	if (!curve || curve.length < 2) {
		for (let i = 0; i < 256; i++) {
			textureData[i] = i;
		}
		return textureData;
	}

	// Generate lookup table based on curve control points
	for (let i = 0; i < 256; i++) {
		// Find the segment containing this input value
		let segment = 0;
		while (segment < curve.length - 1 && curve[segment + 1][0] < i) {
			segment++;
		}

		if (segment >= curve.length - 1) {
			// Ensure the output value is clamped to 0-255 range
			textureData[i] = Math.max(0, Math.min(255, Math.round(curve[curve.length - 1][1])));
			continue;
		}

		// Linear interpolation between control points
		const x0 = curve[segment][0];
		const y0 = curve[segment][1];
		const x1 = curve[segment + 1][0];
		const y1 = curve[segment + 1][1];

		const t = (i - x0) / (x1 - x0);
		const interpolatedValue = y0 + t * (y1 - y0);

		// Ensure the output value is clamped to 0-255 range
		textureData[i] = Math.max(0, Math.min(255, Math.round(interpolatedValue)));
	}

	return textureData;
}
