// filmPresetProcessor.js - WebGL-based image processing for film presets
import { createShader, createProgram, createCurveTexture } from './utils.js';

// Vertex shader source - positions and texture coordinates
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    // Flip the Y coordinate to fix the upside-down image
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
  }
`;

// Fragment shader source - image processing
const fragmentShaderSource = `
  precision mediump float;
  
  uniform sampler2D u_image;
  uniform sampler2D u_rCurve;
  uniform sampler2D u_gCurve;
  uniform sampler2D u_bCurve;
  uniform sampler2D u_rgbCurve;
  uniform sampler2D u_lutTexture;
  uniform bool u_useLut;
  uniform float u_lutSize;
  uniform float u_lutIntensity;
  uniform float u_exposure;
  uniform float u_contrast;
  uniform float u_saturation;
  uniform float u_temperature;
  uniform float u_grain;
  uniform float u_vignette;
  uniform vec2 u_resolution;
  uniform float u_randomSeed;
  
  varying vec2 v_texCoord;
  
  // Pseudo-random number generator
  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // 3D LUT lookup function (simplified)
  vec3 sampleLUT(vec3 color, sampler2D lutTexture, float lutSize) {
    // Clamp input color to [0,1] range
    color = clamp(color, 0.0, 1.0);
    
    // Scale color to LUT coordinate space (0 to lutSize-1)
    vec3 scaledColor = color * (lutSize - 1.0);
    
    // Get the integer and fractional parts for interpolation
    vec3 coord0 = floor(scaledColor);
    vec3 coord1 = min(coord0 + 1.0, lutSize - 1.0);
    vec3 f = scaledColor - coord0;
    
    // Convert 3D coordinates to 2D texture coordinates
    // Layout: each z-slice is arranged horizontally, so texture is (size*size) x size
    float texWidth = lutSize * lutSize;
    float texHeight = lutSize;
    
    // Get the 8 corner coordinates for trilinear interpolation
    // Convert 3D coordinates to 2D texture coordinates inline
    vec2 c000 = vec2((coord0.x + coord0.z * lutSize + 0.5) / texWidth, (coord0.y + 0.5) / texHeight);
    vec2 c001 = vec2((coord0.x + coord1.z * lutSize + 0.5) / texWidth, (coord0.y + 0.5) / texHeight);
    vec2 c010 = vec2((coord0.x + coord0.z * lutSize + 0.5) / texWidth, (coord1.y + 0.5) / texHeight);
    vec2 c011 = vec2((coord0.x + coord1.z * lutSize + 0.5) / texWidth, (coord1.y + 0.5) / texHeight);
    vec2 c100 = vec2((coord1.x + coord0.z * lutSize + 0.5) / texWidth, (coord0.y + 0.5) / texHeight);
    vec2 c101 = vec2((coord1.x + coord1.z * lutSize + 0.5) / texWidth, (coord0.y + 0.5) / texHeight);
    vec2 c110 = vec2((coord1.x + coord0.z * lutSize + 0.5) / texWidth, (coord1.y + 0.5) / texHeight);
    vec2 c111 = vec2((coord1.x + coord1.z * lutSize + 0.5) / texWidth, (coord1.y + 0.5) / texHeight);
    
    // Sample the 8 corners
    vec3 v000 = texture2D(lutTexture, c000).rgb;
    vec3 v001 = texture2D(lutTexture, c001).rgb;
    vec3 v010 = texture2D(lutTexture, c010).rgb;
    vec3 v011 = texture2D(lutTexture, c011).rgb;
    vec3 v100 = texture2D(lutTexture, c100).rgb;
    vec3 v101 = texture2D(lutTexture, c101).rgb;
    vec3 v110 = texture2D(lutTexture, c110).rgb;
    vec3 v111 = texture2D(lutTexture, c111).rgb;
    
    // Trilinear interpolation
    vec3 v00 = mix(v000, v001, f.z);
    vec3 v01 = mix(v010, v011, f.z);
    vec3 v10 = mix(v100, v101, f.z);
    vec3 v11 = mix(v110, v111, f.z);
    
    vec3 v0 = mix(v00, v01, f.y);
    vec3 v1 = mix(v10, v11, f.y);
    
    return mix(v0, v1, f.x);
  }
  
  void main() {
    vec2 texCoord = v_texCoord;
    vec4 color = texture2D(u_image, texCoord);
    
    // Apply exposure
    color.rgb = color.rgb * pow(2.0, u_exposure);
    
    // Apply contrast
    vec3 factor = vec3(1.0 + u_contrast);
    color.rgb = (color.rgb - 0.5) * factor + 0.5;
    
    // Apply temperature adjustment
    if (u_temperature > 0.0) {
      // Warm (increase red, slight increase in green)
      color.r += u_temperature * 0.12;
      color.g += u_temperature * 0.06;
    } else {
      // Cool (increase blue)
      color.b += abs(u_temperature) * 0.12;
    }
    
    // Apply saturation
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(luminance), color.rgb, 1.0 + u_saturation);
    
    // Apply LUT if enabled
    if (u_useLut) {
      vec3 originalColor = color.rgb;
      vec3 lutResult = sampleLUT(originalColor, u_lutTexture, u_lutSize);
      // Fallback to original color if LUT result is invalid (all zeros or NaN)
      if (length(lutResult) > 0.001) {
        // Blend between original and LUT result based on intensity
        color.rgb = mix(originalColor, lutResult, u_lutIntensity);
      }
    }
    
    // Apply curves
    float r = color.r * 255.0;
    float g = color.g * 255.0;
    float b = color.b * 255.0;
    
    // Apply RGB curve first
    float r1 = texture2D(u_rgbCurve, vec2(r / 255.0, 0.5)).r;
    float g1 = texture2D(u_rgbCurve, vec2(g / 255.0, 0.5)).r;
    float b1 = texture2D(u_rgbCurve, vec2(b / 255.0, 0.5)).r;
    
    // Then apply individual channel curves
    color.r = texture2D(u_rCurve, vec2(r1, 0.5)).r;
    color.g = texture2D(u_gCurve, vec2(g1, 0.5)).r;
    color.b = texture2D(u_bCurve, vec2(b1, 0.5)).r;
    
    // Apply grain
    if (u_grain > 0.0) {
      float noise = rand(texCoord * u_randomSeed) - 0.5;
      color.rgb += vec3(noise * u_grain * 0.1);
    }
    
    // Apply vignette
    if (u_vignette > 0.0) {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(texCoord, center);
      float vignette = smoothstep(0.5, 0.75, dist);
      color.rgb = mix(color.rgb, color.rgb * (1.0 - vignette * u_vignette), u_vignette);
    }
    
    gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), color.a);
  }
`;

export class FilmPresetProcessor {
	constructor() {
		this.canvas = document.createElement('canvas');
		this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true });
		this.currentImage = null;
		this.currentPreset = null;
		this.program = null;
		this.textures = {};
		this.buffers = {};
		this.currentLut = null;
		this.useLut = false;
		this.currentAdjustments = {
			exposure: 0,
			contrast: 0,
			saturation: 0,
			temperature: 0,
			grain: 0,
			vignette: 0,
			lutIntensity: 1.0
		};

		if (this.gl) {
			this.initializeWebGL();
		}
	}

	isWebGLSupported() {
		return this.gl !== null;
	}

	initializeWebGL() {
		const gl = this.gl;

		// Create shaders and program
		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
		this.program = createProgram(gl, vertexShader, fragmentShader);

		// Look up uniforms and attributes
		this.locations = {
			position: gl.getAttribLocation(this.program, 'a_position'),
			texCoord: gl.getAttribLocation(this.program, 'a_texCoord'),
			imageTexture: gl.getUniformLocation(this.program, 'u_image'),
			rCurve: gl.getUniformLocation(this.program, 'u_rCurve'),
			gCurve: gl.getUniformLocation(this.program, 'u_gCurve'),
			bCurve: gl.getUniformLocation(this.program, 'u_bCurve'),
			rgbCurve: gl.getUniformLocation(this.program, 'u_rgbCurve'),
			lutTexture: gl.getUniformLocation(this.program, 'u_lutTexture'),
			useLut: gl.getUniformLocation(this.program, 'u_useLut'),
			lutSize: gl.getUniformLocation(this.program, 'u_lutSize'),
			lutIntensity: gl.getUniformLocation(this.program, 'u_lutIntensity'),
			exposure: gl.getUniformLocation(this.program, 'u_exposure'),
			contrast: gl.getUniformLocation(this.program, 'u_contrast'),
			saturation: gl.getUniformLocation(this.program, 'u_saturation'),
			temperature: gl.getUniformLocation(this.program, 'u_temperature'),
			grain: gl.getUniformLocation(this.program, 'u_grain'),
			vignette: gl.getUniformLocation(this.program, 'u_vignette'),
			resolution: gl.getUniformLocation(this.program, 'u_resolution'),
			randomSeed: gl.getUniformLocation(this.program, 'u_randomSeed')
		};

		// Create buffers for the rectangle
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([
				-1,
				-1, // bottom left
				1,
				-1, // bottom right
				-1,
				1, // top left
				1,
				1 // top right
			]),
			gl.STATIC_DRAW
		);
		this.buffers.position = positionBuffer;

		const texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([
				0,
				0, // bottom left
				1,
				0, // bottom right
				0,
				1, // top left
				1,
				1 // top right
			]),
			gl.STATIC_DRAW
		);
		this.buffers.texCoord = texCoordBuffer;

		// Create textures for curves
		this.textures.rCurve = this.createLookupTexture();
		this.textures.gCurve = this.createLookupTexture();
		this.textures.bCurve = this.createLookupTexture();
		this.textures.rgbCurve = this.createLookupTexture();

		// Use default linear curves
		const defaultCurve = createCurveTexture();
		this.updateCurveTexture(this.textures.rCurve, defaultCurve);
		this.updateCurveTexture(this.textures.gCurve, defaultCurve);
		this.updateCurveTexture(this.textures.bCurve, defaultCurve);
		this.updateCurveTexture(this.textures.rgbCurve, defaultCurve);
	}

	createLookupTexture() {
		const gl = this.gl;
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Set parameters for the texture
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		return texture;
	}

	updateCurveTexture(texture, data) {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 256, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
	}

	initializeWithImage(image) {
		const gl = this.gl;

		// Store the current image
		this.currentImage = image;

		// Set canvas size to match image
		this.canvas.width = image.width;
		this.canvas.height = image.height;

		// Create a texture for the image
		if (!this.textures.image) {
			this.textures.image = gl.createTexture();
		}

		gl.bindTexture(gl.TEXTURE_2D, this.textures.image);

		// Set parameters for the texture
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		// Upload the image data to the texture
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		// Reset adjustments
		this.resetAdjustments();

		// Render the image
		this.render();
	}

	/**
	 * Get the current image being processed
	 * @returns {HTMLImageElement} - The current image
	 */
	getCurrentImage() {
		return this.currentImage;
	}

	resetAdjustments() {
		this.currentAdjustments = {
			exposure: 0,
			contrast: 0,
			saturation: 0,
			temperature: 0,
			grain: 0,
			vignette: 0,
			lutIntensity: 1.0
		};

		// Reset curves to linear
		const defaultCurve = createCurveTexture();
		this.updateCurveTexture(this.textures.rCurve, defaultCurve);
		this.updateCurveTexture(this.textures.gCurve, defaultCurve);
		this.updateCurveTexture(this.textures.bCurve, defaultCurve);
		this.updateCurveTexture(this.textures.rgbCurve, defaultCurve);

		this.currentPreset = null;

		if (this.currentImage) {
			this.render();
		}
	}

	applyPreset(preset) {
		this.currentPreset = preset;

		// Apply preset adjustments
		this.currentAdjustments = {
			exposure: preset.exposure,
			contrast: preset.contrast,
			saturation: preset.saturation,
			temperature: preset.temperature,
			grain: preset.grain,
			vignette: preset.vignette,
			lutIntensity: this.currentAdjustments.lutIntensity // Preserve LUT intensity
		};

		// Apply curves
		if (preset.curves) {
			if (preset.curves.rgb) {
				this.updateCurveTexture(this.textures.rgbCurve, createCurveTexture(preset.curves.rgb));
			}

			if (preset.curves.r) {
				this.updateCurveTexture(this.textures.rCurve, createCurveTexture(preset.curves.r));
			}

			if (preset.curves.g) {
				this.updateCurveTexture(this.textures.gCurve, createCurveTexture(preset.curves.g));
			}

			if (preset.curves.b) {
				this.updateCurveTexture(this.textures.bCurve, createCurveTexture(preset.curves.b));
			}
		}

		this.render();
	}

	/**
	 * Apply a preset while preserving specified base corrections
	 * @param {Object} preset - The preset to apply
	 * @param {Object} corrections - Base corrections to preserve (exposure, contrast, saturation)
	 * @param {number} intensity - Intensity of the preset effect (0-1)
	 */
	applyPresetWithCorrections(preset, corrections, intensity = 1.0) {
		this.currentPreset = preset;

		// Apply preset adjustments but preserve corrections, with intensity blending
		this.currentAdjustments = {
			// Use preserved correction values
			exposure: corrections.exposure || 0,
			contrast: corrections.contrast || 0,
			saturation: corrections.saturation || 0,

			// Blend preset values for creative settings based on intensity
			temperature: (preset.temperature || 0) * intensity,
			grain: (preset.grain || 0) * intensity,
			vignette: (preset.vignette || 0) * intensity,
			lutIntensity: this.currentAdjustments.lutIntensity // Preserve LUT intensity
		};

		// Apply curves with intensity blending
		if (preset.curves) {
			if (preset.curves.rgb) {
				const blendedCurve = this.blendCurveWithIntensity(preset.curves.rgb, intensity);
				this.updateCurveTexture(this.textures.rgbCurve, createCurveTexture(blendedCurve));
			}

			if (preset.curves.r) {
				const blendedCurve = this.blendCurveWithIntensity(preset.curves.r, intensity);
				this.updateCurveTexture(this.textures.rCurve, createCurveTexture(blendedCurve));
			}

			if (preset.curves.g) {
				const blendedCurve = this.blendCurveWithIntensity(preset.curves.g, intensity);
				this.updateCurveTexture(this.textures.gCurve, createCurveTexture(blendedCurve));
			}

			if (preset.curves.b) {
				const blendedCurve = this.blendCurveWithIntensity(preset.curves.b, intensity);
				this.updateCurveTexture(this.textures.bCurve, createCurveTexture(blendedCurve));
			}
		} else {
			// Reset to linear curves when no preset curves
			const linearCurve = [
				[0, 0],
				[128, 128],
				[255, 255]
			];
			this.updateCurveTexture(this.textures.rgbCurve, createCurveTexture(linearCurve));
			this.updateCurveTexture(this.textures.rCurve, createCurveTexture(linearCurve));
			this.updateCurveTexture(this.textures.gCurve, createCurveTexture(linearCurve));
			this.updateCurveTexture(this.textures.bCurve, createCurveTexture(linearCurve));
		}

		this.render();
	}

	applyAdjustments(adjustments) {
		this.currentAdjustments = { ...adjustments };

		// If we had a preset applied, we're modifying it now
		if (this.currentPreset) {
			// Keep the curves from the preset
		} else {
			// Reset curves to linear if no preset is active
			const defaultCurve = createCurveTexture();
			this.updateCurveTexture(this.textures.rCurve, defaultCurve);
			this.updateCurveTexture(this.textures.gCurve, defaultCurve);
			this.updateCurveTexture(this.textures.bCurve, defaultCurve);
			this.updateCurveTexture(this.textures.rgbCurve, defaultCurve);
		}

		this.render();
	}

	render() {
		if (!this.currentImage) return;

		const gl = this.gl;
		const program = this.program;
		const locations = this.locations;

		// Set viewport and clear
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Use our program
		gl.useProgram(program);

		// Set up the position buffer
		gl.enableVertexAttribArray(locations.position);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
		gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0);

		// Set up the texCoord buffer
		gl.enableVertexAttribArray(locations.texCoord);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoord);
		gl.vertexAttribPointer(locations.texCoord, 2, gl.FLOAT, false, 0, 0);

		// Set the image texture
		gl.uniform1i(locations.imageTexture, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textures.image);

		// Set the curve textures
		gl.uniform1i(locations.rgbCurve, 1);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.textures.rgbCurve);

		gl.uniform1i(locations.rCurve, 2);
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.textures.rCurve);

		gl.uniform1i(locations.gCurve, 3);
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.textures.gCurve);

		gl.uniform1i(locations.bCurve, 4);
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, this.textures.bCurve);

		// Set LUT texture and uniforms
		gl.uniform1i(locations.useLut, this.useLut);
		if (this.useLut && this.textures.lut) {
			gl.uniform1i(locations.lutTexture, 5);
			gl.activeTexture(gl.TEXTURE5);
			gl.bindTexture(gl.TEXTURE_2D, this.textures.lut);
			gl.uniform1f(locations.lutSize, this.currentLut.size);
			gl.uniform1f(locations.lutIntensity, this.currentAdjustments.lutIntensity);
		}

		// Set adjustment uniforms
		gl.uniform1f(locations.exposure, this.currentAdjustments.exposure);
		gl.uniform1f(locations.contrast, this.currentAdjustments.contrast);
		gl.uniform1f(locations.saturation, this.currentAdjustments.saturation);
		gl.uniform1f(locations.temperature, this.currentAdjustments.temperature);
		gl.uniform1f(locations.grain, this.currentAdjustments.grain);
		gl.uniform1f(locations.vignette, this.currentAdjustments.vignette);

		// Set resolution uniform for effects that need pixel dimensions
		gl.uniform2f(locations.resolution, this.canvas.width, this.canvas.height);

		// Set a random seed for grain
		gl.uniform1f(locations.randomSeed, Math.random());

		// Draw the rectangle
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	getOutputImage() {
		return this.canvas.toDataURL('image/jpeg', 0.95);
	}

	/**
	 * Process a single color through the current adjustments
	 * Used for LUT generation
	 * @param {Array} color - RGB color as array of values 0-1
	 * @returns {Array} - Processed RGB color as array of values 0-1
	 */
	processColor(color) {
		const gl = this.gl;

		// Create a tiny temporary canvas with just this color
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = 1;
		tempCanvas.height = 1;
		const ctx = tempCanvas.getContext('2d');
		ctx.fillStyle = `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`;
		ctx.fillRect(0, 0, 1, 1);

		// Create a temporary texture
		const tempTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tempTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);

		// Save current texture
		const originalTexture = this.textures.image;
		this.textures.image = tempTexture;

		// Set small canvas size
		const originalWidth = this.canvas.width;
		const originalHeight = this.canvas.height;
		this.canvas.width = 1;
		this.canvas.height = 1;

		// Render
		this.render();

		// Read pixel
		const pixel = new Uint8Array(4);
		gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

		// Restore original texture and canvas size
		this.textures.image = originalTexture;
		this.canvas.width = originalWidth;
		this.canvas.height = originalHeight;

		// Cleanup
		gl.deleteTexture(tempTexture);

		// Return normalized RGB values
		return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255];
	}

	// LUT-related methods
	applyLUT(lutTextureData) {
		if (!this.gl || !lutTextureData) return;

		const gl = this.gl;
		const { data, size } = lutTextureData;

		// Create 2D texture from 3D LUT data
		// We'll arrange the 3D LUT as a 2D texture with slices side by side
		const lutTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, lutTexture);

		// Convert 3D LUT data to 2D texture layout
		const textureWidth = size * size;
		const textureHeight = size;

		// Convert float data to UNSIGNED_BYTE (0-255) for better compatibility
		const textureData = new Uint8Array(textureWidth * textureHeight * 4);

		// Rearrange data: for each z-slice, copy the x-y plane
		for (let z = 0; z < size; z++) {
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const sourceIndex = ((z * size + y) * size + x) * 4;
					const targetX = z * size + x;
					const targetY = y;
					const targetIndex = (targetY * textureWidth + targetX) * 4;

					// Convert from float [0,1] to byte [0,255]
					textureData[targetIndex] = Math.round(
						Math.min(255, Math.max(0, data[sourceIndex] * 255))
					); // R
					textureData[targetIndex + 1] = Math.round(
						Math.min(255, Math.max(0, data[sourceIndex + 1] * 255))
					); // G
					textureData[targetIndex + 2] = Math.round(
						Math.min(255, Math.max(0, data[sourceIndex + 2] * 255))
					); // B
					textureData[targetIndex + 3] = 255; // A
				}
			}
		}

		// Upload texture data
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			textureWidth,
			textureHeight,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			textureData
		);

		// Set texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// Store the LUT texture and enable LUT usage
		this.textures.lut = lutTexture;
		this.currentLut = { size, data };
		this.useLut = true;

		console.log('LUT applied:', { size, textureWidth, textureHeight, dataLength: data.length });

		// Re-render with the new LUT
		this.render();
	}

	clearLUT() {
		if (this.textures.lut) {
			this.gl.deleteTexture(this.textures.lut);
			delete this.textures.lut;
		}

		this.currentLut = null;
		this.useLut = false;

		// Re-render without LUT
		this.render();
	}

	/**
	 * Blend a curve with linear based on intensity
	 * @param {Array} curve - Original curve points
	 * @param {number} intensity - Blend intensity (0-1)
	 * @returns {Array} - Blended curve points
	 */
	blendCurveWithIntensity(curve, intensity) {
		if (!curve || intensity === 1.0) return curve;
		if (intensity === 0.0)
			return [
				[0, 0],
				[128, 128],
				[255, 255]
			]; // Linear curve

		// Blend each point between linear and the original curve
		return curve.map(([input, output]) => {
			const linearOutput = input; // Linear curve: output = input
			const blendedOutput = linearOutput + (output - linearOutput) * intensity;
			return [input, Math.round(Math.max(0, Math.min(255, blendedOutput)))];
		});
	}
}
