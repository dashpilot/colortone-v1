// main.js - Main application entry point
import { FilmPresetProcessor } from './filmPresetProcessor.js';
import { presets } from './presets.js';
import { setupDragAndDrop } from './utils.js';
import { exportLUT } from './lutExporter.js';
import { autoBalanceImage } from './autoBalance.js';
import { LutParser } from './lutParser.js';

// Create Alpine data model
window.filmPresetApp = {
	imageLoaded: false,
	isProcessing: false,
	originalImage: null,
	renderedImageSrc: '',
	selectedPreset: null,
	processor: null,
	activeTab: 'adjustments', // Default to adjustments tab
	adjustments: {
		exposure: 0,
		contrast: 0,
		saturation: 0,
		temperature: 0,
		grain: 0,
		vignette: 0,
		lutIntensity: 1.0
	},
	presets: presets,
	selectedLut: null, // Currently selected LUT
	showLutModal: false,
	lutName: 'FilmPreset',
	lutSize: '17',
	// AI Preset properties
	customPresetJson: '',
	customPresetStatus: null,

	init() {
		// Initialize WebGL processor
		this.processor = new FilmPresetProcessor();
		if (!this.processor.isWebGLSupported()) {
			alert('Your browser does not support WebGL, falling back to Canvas processing');
		}

		// Setup drag and drop
		setupDragAndDrop(this);

		// Setup keyboard navigation for presets
		this.setupKeyboardNavigation();
	},

	setupKeyboardNavigation() {
		document.addEventListener('keydown', (event) => {
			if (!this.imageLoaded) return;

			// Only process arrow keys when not typing in an input
			if (
				document.activeElement.tagName === 'INPUT' ||
				document.activeElement.tagName === 'SELECT' ||
				document.activeElement.tagName === 'TEXTAREA'
			) {
				return;
			}

			if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
				// Next preset
				if (this.selectedPreset === null) {
					this.applyPreset(0);
				} else {
					const nextIndex = (this.selectedPreset + 1) % this.presets.length;
					this.applyPreset(nextIndex);
				}
				event.preventDefault();
			} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
				// Previous preset
				if (this.selectedPreset === null) {
					this.applyPreset(this.presets.length - 1);
				} else {
					const prevIndex = (this.selectedPreset - 1 + this.presets.length) % this.presets.length;
					this.applyPreset(prevIndex);
				}
				event.preventDefault();
			}
		});
	},

	triggerFileInput() {
		document.getElementById('file-input').click();
	},

	handleFileUpload(event) {
		const file = event.target.files[0];
		if (file) {
			this.handleFile(file);
		}
	},

	handleFile(file) {
		if (!file.type.match('image.*')) {
			alert('Please select an image file');
			return;
		}

		this.isProcessing = true;
		this.selectedPreset = null;
		this.resetAdjustments();

		const reader = new FileReader();
		reader.onload = async (e) => {
			this.originalImage = e.target.result;

			const img = new Image();
			img.onload = async () => {
				try {
					// Resize large images for better performance
					const MAX_WIDTH = 1920;
					if (img.width > MAX_WIDTH) {
						const scaleFactor = MAX_WIDTH / img.width;
						const newWidth = Math.floor(img.width * scaleFactor);
						const newHeight = Math.floor(img.height * scaleFactor);

						// Show processing state
						this.isProcessing = true;

						// Resize with Pica for higher quality
						const resizedImg = await this.resizeImage(img, newWidth, newHeight);

						// Initialize WebGL with the resized image
						this.processor.initializeWithImage(resizedImg);
						this.renderedImageSrc = this.processor.getOutputImage();
					} else {
						// Use original image if it's small enough
						this.processor.initializeWithImage(img);
						this.renderedImageSrc = this.processor.getOutputImage();
					}
				} catch (error) {
					console.error('Error processing image:', error);
					alert('There was an error processing the image.');
				} finally {
					this.imageLoaded = true;
					this.isProcessing = false;
				}
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	},

	// Resize image using Pica for high-quality resizing
	async resizeImage(img, newWidth, newHeight) {
		// Create source canvas
		const sourceCanvas = document.createElement('canvas');
		sourceCanvas.width = img.width;
		sourceCanvas.height = img.height;
		const sourceCtx = sourceCanvas.getContext('2d');
		sourceCtx.drawImage(img, 0, 0);

		// Create destination canvas
		const destCanvas = document.createElement('canvas');
		destCanvas.width = newWidth;
		destCanvas.height = newHeight;

		// Use Pica for high-quality resizing
		try {
			// Create a Pica instance with high quality options
			const picaOptions = {
				quality: 3, // High quality (0-3)
				alpha: true,
				unsharpAmount: 80,
				unsharpRadius: 0.6,
				unsharpThreshold: 2
			};

			// Resize using Pica
			await window.pica().resize(sourceCanvas, destCanvas, picaOptions);

			// Create a new image from the resized canvas
			const resizedImg = new Image();
			resizedImg.src = destCanvas.toDataURL('image/jpeg', 0.95);

			// Wait for the image to load before returning
			return new Promise((resolve) => {
				resizedImg.onload = () => resolve(resizedImg);
			});
		} catch (error) {
			console.error('Error using Pica for resizing, falling back to canvas:', error);

			// Fallback to simple canvas resize
			const ctx = destCanvas.getContext('2d');
			ctx.drawImage(img, 0, 0, newWidth, newHeight);

			// Create a new image from the resized canvas
			const resizedImg = new Image();
			resizedImg.src = destCanvas.toDataURL('image/jpeg', 0.95);

			// Return a promise that resolves when the image is loaded
			return new Promise((resolve) => {
				resizedImg.onload = () => resolve(resizedImg);
			});
		}
	},

	applyPreset(index) {
		if (!this.imageLoaded) return;

		this.isProcessing = true;
		this.selectedPreset = index;

		// Store the current base corrections (from auto-balance) and LUT intensity
		const currentExposure = this.adjustments.exposure;
		const currentContrast = this.adjustments.contrast;
		const currentSaturation = this.adjustments.saturation;
		const currentLutIntensity = this.adjustments.lutIntensity;

		// Apply preset adjustments
		const preset = this.presets[index].settings;
		this.adjustments = {
			// Preserve auto-balance corrections
			exposure: currentExposure,
			contrast: currentContrast,
			saturation: currentSaturation,

			// Apply preset's creative settings
			temperature: preset.temperature,
			grain: preset.grain,
			vignette: preset.vignette,

			// Preserve LUT intensity
			lutIntensity: currentLutIntensity
		};

		// Process image with preset
		setTimeout(() => {
			// Apply preset with preserved corrections
			this.processor.applyPresetWithCorrections(preset, {
				exposure: currentExposure,
				contrast: currentContrast,
				saturation: currentSaturation
			});
			this.renderedImageSrc = this.processor.getOutputImage();
			this.isProcessing = false;
		}, 50);
	},

	applyAdjustments() {
		if (!this.imageLoaded) return;

		// Immediately update the image during slider movement
		this.isProcessing = true;

		// If a LUT is selected, apply it first, then adjustments
		if (this.selectedLut) {
			this.applyCurrentLut();
		} else {
			this.processor.applyAdjustments(this.adjustments);
			this.renderedImageSrc = this.processor.getOutputImage();
		}

		this.isProcessing = false;
	},

	resetAdjustments() {
		this.adjustments = {
			exposure: 0,
			contrast: 0,
			saturation: 0,
			temperature: 0,
			grain: 0,
			vignette: 0,
			lutIntensity: 1.0
		};

		if (this.imageLoaded) {
			this.selectedPreset = null;
			this.processor.resetAdjustments();
			this.renderedImageSrc = this.processor.getOutputImage();
		}
	},

	saveImage() {
		if (!this.renderedImageSrc) return;

		const link = document.createElement('a');
		link.download = 'film-graded-image.jpg';
		link.href = this.renderedImageSrc;
		link.click();
	},

	openLutExportModal() {
		// If a preset is selected, use its name as default LUT name
		if (this.selectedPreset !== null) {
			const preset = this.presets[this.selectedPreset];
			this.lutName = `${preset.brand}_${preset.name}`.replace(/\s+/g, '_');
		}
		this.showLutModal = true;
	},

	exportLUT() {
		if (!this.processor) return;

		// Show processing indicator
		this.isProcessing = true;

		// Use setTimeout to allow UI to update before starting intensive processing
		setTimeout(() => {
			try {
				const size = parseInt(this.lutSize);
				exportLUT(this.processor, size, this.lutName);
				this.showLutModal = false;
			} catch (error) {
				console.error('Error exporting LUT:', error);
				alert('Failed to export LUT. See console for details.');
			} finally {
				this.isProcessing = false;
			}
		}, 100);
	},

	autoBalance() {
		if (!this.imageLoaded || !this.processor) return;

		this.isProcessing = true;

		// Use setTimeout to allow UI to update before analysis
		setTimeout(() => {
			try {
				// Get auto balance adjustments
				const adjustments = autoBalanceImage(this.processor);

				if (adjustments) {
					// Apply the adjustments to our model
					this.adjustments = {
						...this.adjustments,
						...adjustments
					};

					// Apply to the processor for rendering
					this.processor.applyAdjustments(this.adjustments);
					this.renderedImageSrc = this.processor.getOutputImage();
				}
			} catch (error) {
				console.error('Error auto-balancing image:', error);
			} finally {
				this.isProcessing = false;
			}
		}, 100);
	},

	// LUT-related methods
	triggerLutInput() {
		document.getElementById('lut-file-input').click();
	},

	async handleLutUpload(event) {
		const file = event.target.files[0];
		if (!file) return;

		if (!file.name.toLowerCase().endsWith('.cube')) {
			alert('Please select a .cube LUT file');
			return;
		}

		this.isProcessing = true;

		try {
			// Parse the LUT file
			const lut = await LutParser.parseCubeLUT(file);
			this.selectedLut = lut;

			// Apply the LUT if an image is loaded
			if (this.imageLoaded && this.processor) {
				this.applyCurrentLut();
			}

			// Clear the file input
			event.target.value = '';
		} catch (error) {
			console.error('Error loading LUT:', error);
			alert(`Failed to load LUT: ${error.message}`);
		} finally {
			this.isProcessing = false;
		}
	},

	applyCurrentLut() {
		if (!this.selectedLut || !this.processor) return;

		this.isProcessing = true;

		// Use setTimeout to allow UI to update
		setTimeout(() => {
			try {
				// Convert LUT to texture format
				const lutTexture = LutParser.lutToTexture3D(this.selectedLut);

				console.log('Applying LUT:', {
					lutName: this.selectedLut.name,
					lutSize: this.selectedLut.size,
					dataLength: this.selectedLut.data.length,
					textureSize: lutTexture.size,
					textureDataLength: lutTexture.data.length
				});

				// Apply LUT to processor
				if (this.processor.applyLUT) {
					this.processor.applyLUT(lutTexture);
				} else {
					throw new Error('applyLUT method not found on processor');
				}

				// Apply current adjustments on top of LUT
				this.processor.applyAdjustments(this.adjustments);
				this.renderedImageSrc = this.processor.getOutputImage();
			} catch (error) {
				console.error('Error applying LUT:', error);
				alert(`Failed to apply LUT: ${error.message}`);
			} finally {
				this.isProcessing = false;
			}
		}, 50);
	},

	clearLut() {
		this.selectedLut = null;

		if (this.imageLoaded && this.processor) {
			// Reset to original image and reapply current adjustments
			this.isProcessing = true;

			setTimeout(() => {
				try {
					// Clear LUT from processor (this would need to be implemented)
					if (this.processor.clearLUT) {
						this.processor.clearLUT();
					}

					// Reapply current adjustments
					this.processor.applyAdjustments(this.adjustments);
					this.renderedImageSrc = this.processor.getOutputImage();
				} catch (error) {
					console.error('Error clearing LUT:', error);
				} finally {
					this.isProcessing = false;
				}
			}, 50);
		}
	},

	// AI Preset methods
	applyCustomPreset() {
		if (!this.imageLoaded) {
			this.setCustomPresetStatus('error', 'Please load an image first');
			return;
		}

		if (!this.customPresetJson.trim()) {
			this.setCustomPresetStatus('error', 'Please enter a preset JSON');
			return;
		}

		this.isProcessing = true;
		this.setCustomPresetStatus(null);

		try {
			// Parse JSON
			const presetData = JSON.parse(this.customPresetJson);

			// Validate preset structure
			const validationResult = this.validatePresetData(presetData);
			if (!validationResult.valid) {
				throw new Error(validationResult.error);
			}

			// Store the current LUT intensity to preserve it
			const currentLutIntensity = this.adjustments.lutIntensity;

			// Apply the custom preset
			setTimeout(() => {
				try {
					// Update adjustments with preset settings
					const settings = presetData.settings;
					this.adjustments = {
						exposure: settings.exposure || 0,
						contrast: settings.contrast || 0,
						saturation: settings.saturation || 0,
						temperature: settings.temperature || 0,
						grain: settings.grain || 0,
						vignette: settings.vignette || 0,
						lutIntensity: currentLutIntensity // Preserve LUT intensity
					};

					// Apply the preset with its original basic adjustments
					this.processor.applyPresetWithCorrections(settings, {
						exposure: settings.exposure || 0,
						contrast: settings.contrast || 0,
						saturation: settings.saturation || 0
					});

					// Update the rendered image
					this.renderedImageSrc = this.processor.getOutputImage();

					this.selectedPreset = null; // Clear built-in preset selection

					this.setCustomPresetStatus(
						'success',
						`Applied "${presetData.name || 'Custom Preset'}" successfully!`
					);
				} catch (error) {
					console.error('Error applying custom preset:', error);
					this.setCustomPresetStatus('error', `Failed to apply preset: ${error.message}`);
				} finally {
					this.isProcessing = false;
				}
			}, 50);
		} catch (error) {
			this.isProcessing = false;
			if (error instanceof SyntaxError) {
				this.setCustomPresetStatus('error', 'Invalid JSON format. Please check your syntax.');
			} else {
				this.setCustomPresetStatus('error', error.message);
			}
		}
	},

	validatePresetData(data) {
		// Check if it's an object
		if (!data || typeof data !== 'object') {
			return { valid: false, error: 'Preset must be a JSON object' };
		}

		// Check for required settings object
		if (!data.settings || typeof data.settings !== 'object') {
			return { valid: false, error: 'Preset must have a "settings" object' };
		}

		const settings = data.settings;

		// Validate numeric ranges for basic adjustments
		const numericFields = ['exposure', 'contrast', 'saturation', 'temperature'];
		for (const field of numericFields) {
			if (settings[field] !== undefined) {
				if (typeof settings[field] !== 'number' || settings[field] < -1 || settings[field] > 1) {
					return { valid: false, error: `${field} must be a number between -1 and 1` };
				}
			}
		}

		// Validate effect ranges
		const effectFields = ['grain', 'vignette'];
		for (const field of effectFields) {
			if (settings[field] !== undefined) {
				if (typeof settings[field] !== 'number' || settings[field] < 0 || settings[field] > 1) {
					return { valid: false, error: `${field} must be a number between 0 and 1` };
				}
			}
		}

		// Validate curves if present
		if (settings.curves) {
			if (typeof settings.curves !== 'object') {
				return { valid: false, error: 'curves must be an object' };
			}

			const curveChannels = ['rgb', 'r', 'g', 'b'];
			for (const channel of curveChannels) {
				if (settings.curves[channel]) {
					if (!Array.isArray(settings.curves[channel])) {
						return { valid: false, error: `curves.${channel} must be an array` };
					}

					// Validate curve points - accept both normalized (0-1) and standard (0-255) ranges
					for (const point of settings.curves[channel]) {
						if (!Array.isArray(point) || point.length !== 2) {
							return {
								valid: false,
								error: `Each curve point must be an array of 2 numbers [input, output]`
							};
						}
						if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
							return { valid: false, error: 'Curve points must contain numeric values' };
						}

						// Accept both normalized (0-1) and standard (0-255) ranges
						const isNormalized = point[0] <= 1 && point[1] <= 1;
						const isStandard = point[0] <= 255 && point[1] <= 255;

						if (!isNormalized && !isStandard) {
							return {
								valid: false,
								error: 'Curve point values must be between 0-1 (normalized) or 0-255 (standard)'
							};
						}
						if (point[0] < 0 || point[1] < 0) {
							return { valid: false, error: 'Curve point values cannot be negative' };
						}
					}
				}
			}
		}

		return { valid: true };
	},

	setCustomPresetStatus(type, message) {
		if (type && message) {
			this.customPresetStatus = { type, message };
			// Auto-clear success messages after 3 seconds
			if (type === 'success') {
				setTimeout(() => {
					if (this.customPresetStatus && this.customPresetStatus.type === 'success') {
						this.customPresetStatus = null;
					}
				}, 3000);
			}
		} else {
			this.customPresetStatus = null;
		}
	},

	clearCustomPreset() {
		this.customPresetJson = '';
		this.customPresetStatus = null;
	}
};
