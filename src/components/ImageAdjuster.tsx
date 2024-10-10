import React, { useState, useEffect } from 'react';
import ImageIcon from '/image-icon.svg';
import cv from "@techstark/opencv-js"

interface ImageAdjusterProps {
  imageFile: File | null;
}

const ImageAdjuster: React.FC<ImageAdjusterProps> = ({ imageFile }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    colorFilter: '',
  });
  const [isAdjusted, setIsAdjusted] = useState(false);


  const availableFilter = ['Sephia', 'Negative', 'Black and White'];

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdjustments((prev) => ({
      ...prev,
      [e.target.name]: Number(e.target.value),
    }));
  };

  const handleColorFilterChange = (filter: string) => {
    setAdjustments((prev) => ({ ...prev, colorFilter: filter }));
  };

  const handleApplyAdjustment = () => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, img.width, img.height);

        try {
          const mat = cv.imread(canvas);

          mat.convertTo(mat, -1, 1 + adjustments.contrast / 100, adjustments.brightness);

          switch (adjustments.colorFilter) {
            case 'Sephia':
              {
                const channels = new cv.MatVector();
                cv.split(mat, channels);
                const r = channels.get(0);
                const g = channels.get(1);
                const b = channels.get(2);

                cv.addWeighted(r, 0.393, g, 0.769, 0, r);
                cv.addWeighted(r, 1, b, 0.189, 0, r);

                cv.addWeighted(r, 0.349, g, 0.686, 0, g);
                cv.addWeighted(g, 1, b, 0.168, 0, g);

                cv.addWeighted(r, 0.272, g, 0.534, 0, b);
                cv.addWeighted(b, 1, b, 0.131, 0, b);

                cv.merge(channels, mat);
                channels.delete();
                r.delete();
                g.delete();
                b.delete();
                break;
              }
            case 'Negative':
              cv.bitwise_not(mat, mat);
              cv.cvtColor(mat, mat, cv.COLOR_RGBA2RGB);
              break;
            case 'Black and White':
              cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
              cv.cvtColor(mat, mat, cv.COLOR_GRAY2RGBA);
              break;
          }

          const outputCanvas = document.createElement('canvas');
          cv.imshow(outputCanvas, mat);
          setImageUrl(outputCanvas.toDataURL());
          setIsAdjusted(true);
          mat.delete();
        } catch (error) {
          console.error('OpenCV error:', error);
        }
      }; img.src = imageUrl;
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'adjusted-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setAdjustments({ brightness: 0, contrast: 0, colorFilter: '' });
    setIsAdjusted(false);
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
    }
  };

  if (!imageUrl) {
    return (
      <div className="my-6 p-4 xl:p-8 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
        <img src={ImageIcon} className="w-16 h-16 text-gray-400 mb-4" alt="Upload icon" />
        <p className="text-gray-600 text-center font-medium">
          No image uploaded yet. <br /> Please upload an image to apply filters.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-center w-full">
      <img
        src={imageUrl}
        alt="Uploaded"
        className="w-full h-auto rounded-lg mb-4 border"
        onClick={() => {
          window.open(imageUrl, '_blank');
        }}
      />
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="brightness"
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            Brightness: {adjustments.brightness}%
          </label>
          <input
            name="brightness"
            type="range"
            id="brightness"
            min="-100"
            max="100"
            value={adjustments.brightness}
            onChange={handleAdjustmentChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contrast"
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            Contrast: {adjustments.contrast}%
          </label>
          <input
            name="contrast"
            type="range"
            id="contrast"
            min="-100"
            max="100"
            value={adjustments.contrast}
            onChange={handleAdjustmentChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Effects:
          </label>
          <div className="flex flex-col gap-4 xl:flex-row">
            {availableFilter.map((item, index) => (
              <button
                key={`${item}-${index}`}
                onClick={() => handleColorFilterChange(item)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${adjustments.colorFilter === item
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } rounded-md text-center shadow`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <hr />
        <div className="flex flex-col gap-4 xl:flex-row xl:gap-8">
          <button
            onClick={handleApplyAdjustment}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:bg-gray-600"
          >
            Apply Adjustment
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white disabled:bg-gray-600"
          >
            Reset Effect
          </button>
          <button
            onClick={handleDownload}
            disabled={!imageUrl || !isAdjusted}
            className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white disabled:bg-gray-600"
          >
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageAdjuster;
