function applyFilters(img: HTMLImageElement, filterFunctions: Array<(data: Uint8ClampedArray) => void>): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  filterFunctions.forEach(filterFunction => filterFunction(data));

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL();
}

export function adjustBrightness(img: HTMLImageElement, brightness: number): (data: Uint8ClampedArray) => void {
  return (data) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + brightness));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
    }
  };
}

export function adjustContrast(img: HTMLImageElement, contrast: number): (data: Uint8ClampedArray) => void {
  return (data) => {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast)); // Contrast factor

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // Adjust red
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // Adjust green
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // Adjust blue
    }
  };
}

export function sephiaFilter(): (data: Uint8ClampedArray) => void {
  return (data) => {
    for (let i = 0; i < data.length; i += 4) {
      const tr = 0.393 * data[i] + 0.769 * data[i + 1] + 0.189 * data[i + 2]; // Red
      const tg = 0.349 * data[i] + 0.686 * data[i + 1] + 0.168 * data[i + 2]; // Green
      const tb = 0.272 * data[i] + 0.534 * data[i + 1] + 0.131 * data[i + 2]; // Blue

      data[i] = Math.min(255, tr);   // Update red
      data[i + 1] = Math.min(255, tg); // Update green
      data[i + 2] = Math.min(255, tb); // Update blue
    }
  };
}

export function negativeFilter(): (data: Uint8ClampedArray) => void {
  return (data) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];     // Invert red
      data[i + 1] = 255 - data[i + 1]; // Invert green
      data[i + 2] = 255 - data[i + 2]; // Invert blue
    }
  };
}

export function blackAndWhiteFilter(): (data: Uint8ClampedArray) => void {
  return (data) => {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // Average of RGB
      data[i] = avg;     // Set red
      data[i + 1] = avg; // Set green
      data[i + 2] = avg; // Set blue
    }
  };
}

export function applyChainedFilters(img: HTMLImageElement, brightness: number, contrast: number, colorEffect: () => (data: Uint8ClampedArray) => void): string {
  const filters = [
    adjustBrightness(img, brightness),
    adjustContrast(img, contrast),
    colorEffect()
  ];
  return applyFilters(img, filters);
}