// lutParser.js - Parse .cube LUT files
export class LutParser {
	static async parseCubeLUT(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const content = e.target.result;
					const lut = this.parseCubeContent(content, file.name);
					resolve(lut);
				} catch (error) {
					reject(new Error(`Failed to parse LUT file: ${error.message}`));
				}
			};

			reader.onerror = () => {
				reject(new Error('Failed to read LUT file'));
			};

			reader.readAsText(file);
		});
	}

	static parseCubeContent(content, filename) {
		const lines = content
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line);

		// Use filename without extension as the display name
		let title = filename.replace(/\.cube$/i, '');
		let domainMin = [0, 0, 0];
		let domainMax = [1, 1, 1];
		let size = 33; // Default size
		let lutData = [];

		let dataStarted = false;

		for (let line of lines) {
			// Skip comments
			if (line.startsWith('#')) continue;

			// Skip title parsing - we'll use filename instead
			if (line.startsWith('TITLE')) {
				continue;
			}

			// Parse domain min
			if (line.startsWith('DOMAIN_MIN')) {
				const values = line.substring(10).trim().split(/\s+/);
				domainMin = values.slice(0, 3).map((v) => parseFloat(v));
				continue;
			}

			// Parse domain max
			if (line.startsWith('DOMAIN_MAX')) {
				const values = line.substring(10).trim().split(/\s+/);
				domainMax = values.slice(0, 3).map((v) => parseFloat(v));
				continue;
			}

			// Parse LUT size
			if (line.startsWith('LUT_3D_SIZE')) {
				size = parseInt(line.substring(11).trim());
				continue;
			}

			// Check for data start
			if (!dataStarted && /^[\d\.\-\s]+$/.test(line)) {
				dataStarted = true;
			}

			// Parse data
			if (dataStarted) {
				const values = line.split(/\s+/).filter((v) => v);
				if (values.length >= 3) {
					lutData.push([parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2])]);
				}
			}
		}

		// Validate LUT data
		const expectedSize = size * size * size;
		if (lutData.length !== expectedSize) {
			throw new Error(`Invalid LUT data: expected ${expectedSize} entries, got ${lutData.length}`);
		}

		return {
			name: title,
			filename: filename,
			size: size,
			domainMin: domainMin,
			domainMax: domainMax,
			data: lutData
		};
	}

	// Convert LUT to texture data for WebGL
	static lutToTexture3D(lut) {
		const size = lut.size;
		const data = new Float32Array(size * size * size * 4); // RGBA

		for (let i = 0; i < lut.data.length; i++) {
			const [r, g, b] = lut.data[i];
			const baseIndex = i * 4;

			data[baseIndex] = r; // R
			data[baseIndex + 1] = g; // G
			data[baseIndex + 2] = b; // B
			data[baseIndex + 3] = 1; // A
		}

		return {
			data: data,
			size: size
		};
	}
}
