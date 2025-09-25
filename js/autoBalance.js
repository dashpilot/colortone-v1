// autoBalance.js - Automatic image balancing algorithms

/**
 * Analyze image data and compute optimal adjustments for flat/log footage
 * @param {ImageData} imageData - Image data to analyze
 * @returns {Object} - Optimal adjustment values
 */
export function analyzeImage(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const pixelCount = width * height;

    // Sample pixels (analyze every nth pixel to improve performance)
    const sampleRate = Math.max(1, Math.floor(pixelCount / 10000));
    let samples = [];

    for (let i = 0; i < data.length; i += sampleRate * 4) {
        if (i < data.length) {
            samples.push({
                r: data[i] / 255,
                g: data[i + 1] / 255,
                b: data[i + 2] / 255,
            });
        }
    }

    // Calculate luminance and color stats
    let luminances = [];
    let saturationValues = [];
    let totalR = 0,
        totalG = 0,
        totalB = 0;

    samples.forEach((pixel) => {
        // Calculate luminance (perceived brightness)
        const luma = 0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b;
        luminances.push(luma);

        // Calculate saturation
        const max = Math.max(pixel.r, pixel.g, pixel.b);
        const min = Math.min(pixel.r, pixel.g, pixel.b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        saturationValues.push(saturation);

        // Track color totals
        totalR += pixel.r;
        totalG += pixel.g;
        totalB += pixel.b;
    });

    // Sort for percentile calculations
    luminances.sort((a, b) => a - b);
    saturationValues.sort((a, b) => a - b);

    // Get stats from the luminance values
    const averageLuma = luminances.reduce((sum, val) => sum + val, 0) / luminances.length;
    const medianLuma = luminances[Math.floor(luminances.length / 2)];
    const perc5Luma = luminances[Math.floor(luminances.length * 0.05)];
    const perc95Luma = luminances[Math.floor(luminances.length * 0.95)];
    const lumaRange = perc95Luma - perc5Luma;

    // Get stats from saturation values
    const averageSaturation = saturationValues.reduce((sum, val) => sum + val, 0) / saturationValues.length;

    // Calculate color balance
    const sampleCount = samples.length;
    const avgR = totalR / sampleCount;
    const avgG = totalG / sampleCount;
    const avgB = totalB / sampleCount;
    const avgAll = (avgR + avgG + avgB) / 3;

    // Detect log/flat characteristics
    const isLogLike = lumaRange < 0.5 && averageSaturation < 0.3;

    // Compute optimal adjustments based on image analysis
    let adjustments = {
        exposure: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
    };

    // Exposure: aim for a median luminance around 0.45-0.5
    const targetMedianLuma = 0.45;
    adjustments.exposure = Math.log2((targetMedianLuma + 0.05) / (medianLuma + 0.05));

    // Contrast: based on the luminance range - stronger for flat footage
    if (isLogLike) {
        const targetLumaRange = 0.7;
        adjustments.contrast = targetLumaRange / lumaRange - 1;
        adjustments.contrast = Math.min(0.6, Math.max(0, adjustments.contrast));
    } else {
        // For normal footage, slightly increase contrast
        adjustments.contrast = Math.min(0.2, Math.max(0, 0.7 - lumaRange));
    }

    // Saturation: boost more for log footage
    if (isLogLike) {
        const targetSaturation = 0.4;
        adjustments.saturation = targetSaturation / (averageSaturation + 0.1) - 1;
        adjustments.saturation = Math.min(0.5, Math.max(0, adjustments.saturation));
    } else {
        // For normal footage, only slight increase if needed
        adjustments.saturation = Math.min(0.2, Math.max(0, 0.3 - averageSaturation));
    }

    // Temperature: analyze color balance
    const colorBalanceOffset = (avgB - avgR) / avgAll;
    adjustments.temperature = -colorBalanceOffset * 0.3;
    adjustments.temperature = Math.min(0.3, Math.max(-0.3, adjustments.temperature));

    // Limit adjustments to reasonable ranges
    adjustments.exposure = Math.min(1, Math.max(-1, adjustments.exposure));

    // Round values to two decimal places
    for (const key in adjustments) {
        adjustments[key] = Math.round(adjustments[key] * 100) / 100;
    }

    return adjustments;
}

/**
 * Apply auto balancing to an image using the FilmPresetProcessor
 * @param {FilmPresetProcessor} processor - The processor instance
 * @returns {Object} - The applied adjustments
 */
export function autoBalanceImage(processor) {
    // Get the image data
    const canvas = document.createElement('canvas');
    const img = processor.getCurrentImage();

    if (!img) {
        console.error('No image available for auto balancing');
        return null;
    }

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Downscale for analysis if the image is large
    const maxAnalysisSize = 800;
    let analysisCanvas = canvas;

    if (canvas.width > maxAnalysisSize || canvas.height > maxAnalysisSize) {
        const scale = maxAnalysisSize / Math.max(canvas.width, canvas.height);
        analysisCanvas = document.createElement('canvas');
        analysisCanvas.width = Math.round(canvas.width * scale);
        analysisCanvas.height = Math.round(canvas.height * scale);
        const analysisCtx = analysisCanvas.getContext('2d');
        analysisCtx.drawImage(canvas, 0, 0, analysisCanvas.width, analysisCanvas.height);
    }

    // Analyze the image
    const imageData = analysisCanvas.getContext('2d').getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);

    const adjustments = analyzeImage(imageData);

    // Return the adjustments
    return adjustments;
}
