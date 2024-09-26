import React, { useState, useEffect } from 'react';
import ImageIcon from '/image-icon.svg';
import { useOpenCV } from '../hooks/useOpenCV';
import {
  applyChainedFilters,
  blackAndWhiteFilter,
  negativeFilter,
  sephiaFilter,
} from '../utils/imageProcessing';

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
  const [prevAdjustments, setPrevAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    colorFilter: '',
  });
  const [isAdjusted, setIsAdjusted] = useState(false);

  const openCVLoaded = useOpenCV();

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
    if (openCVLoaded && imageUrl) {
      const img = new Image();
      img.onload = () => {
        const colorEffectFunction = getColorEffect(adjustments.colorFilter);
        const adjustedImageUrl = applyChainedFilters(
          img,
          adjustments.brightness,
          adjustments.contrast,
          colorEffectFunction
        );

        if (JSON.stringify(adjustments) !== JSON.stringify(prevAdjustments)) {
          setImageUrl(adjustedImageUrl);
          setPrevAdjustments(adjustments);
          setIsAdjusted(true);
        }
      };
      img.src = imageUrl;
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

  const getColorEffect = (filterName: string) => {
    switch (filterName) {
      case 'Sephia':
        return sephiaFilter;
      case 'Negative':
        return negativeFilter;
      case 'Black and White':
        return blackAndWhiteFilter;
      default:
        return () => (data: Uint8ClampedArray) => data;
    }
  };

  const handleReset = () => {
    setAdjustments({ brightness: 0, contrast: 0, colorFilter: '' });
    setPrevAdjustments({ brightness: 0, contrast: 0, colorFilter: '' });
    setIsAdjusted(false)
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  };

  if (!imageUrl) {
    return (
      <div className="my-6 p-4 xl:p-8 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
        <img src={ImageIcon} className="w-16 h-16 text-gray-400 mb-4" />
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
            htmlFor="brightness"
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
                className={`px-4 py-2 rounded-md text-sm font-medium ${adjustments.colorFilter === item ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 '} rounded-md text-center shadow`}
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
            disabled={!openCVLoaded}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:bg-gray-600"
          >
            Apply Adjustment
          </button>
          <button
            onClick={handleReset}
            disabled={!openCVLoaded}
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
