
import React, { useState, useEffect } from 'react';
import { useOpenCV } from '../hooks/useOpenCV';
import { applyChainedFilters, blackAndWhiteFilter, negativeFilter, sephiaFilter } from '../utils/imageProcessing';

interface ImageAdjusterProps {
  imageFile: File | null;
}

const ImageAdjuster: React.FC<ImageAdjusterProps> = ({ imageFile }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState({ brightness: 0, contrast: 0, colorFilter: "" });
  const [prevAdjustments, setPrevAdjustments] = useState({ brightness: 0, contrast: 0, colorFilter: "" });
  const [isAdjusted, setIsAdjusted] = useState(false);

  const openCVLoaded = useOpenCV();

  const availableFilter = ['Sephia', "Negative", "Black and White"]

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdjustments(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));
  };

  const handleColorFilterChange = (filter: string) => {
    setAdjustments(prev => ({ ...prev, colorFilter: filter }));
  };

  const handleApplyAdjustment = () => {
    if (openCVLoaded && imageUrl) {
      const img = new Image();
      img.onload = () => {
        const colorEffectFunction = getColorEffect(adjustments.colorFilter);
        const adjustedImageUrl = applyChainedFilters(img, adjustments.brightness, adjustments.contrast, colorEffectFunction);

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
      link.download = 'adjusted-image.png'; // Specify the download file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getColorEffect = (filterName: string) => {
    switch (filterName) {
      case "Sephia":
        return sephiaFilter;
      case "Negative":
        return negativeFilter;
      case "Black and White":
        return blackAndWhiteFilter;
      default:
        return () => (data: Uint8ClampedArray) => data;
    }
  };

  const handleReset = () => {
    setAdjustments({ brightness: 0, contrast: 0, colorFilter: "" });
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }

  if (!imageUrl) {
    return <div className="text-center mt-4">No image uploaded</div>;
  }

  return (
    <div className="mt-4 flex items-center justify-center">
      <img src={imageUrl} alt="Uploaded" className="mx-auto w-[6/12] h-auto mb-4" />
      <div className="flex flex-col">
        <div className="flex mb-4">
          <label htmlFor="brightness" className="mr-2">Brightness:</label>
          <input
            name='brightness'
            type="range"
            id="brightness"
            min="-100"
            max="100"
            value={adjustments.brightness}
            onChange={handleAdjustmentChange}
            className="w-full"
          />
          <span className="ml-2">{adjustments.brightness}</span>
        </div>
        <div className="flex mb-4">
          <label htmlFor="contrast" className="mr-2">Contrast:</label>
          <input
            name='contrast'
            type="range"
            id="contrast"
            min="-100"
            max="100"
            value={adjustments.contrast}
            onChange={handleAdjustmentChange}
            className="w-full"
          />
          <span className="ml-2">{adjustments.contrast}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span>Effects:</span>
          <div className="flex gap-4">
            {availableFilter.map((item, index) =>
              <button key={`${item}-${index}`} onClick={() => handleColorFilterChange(item)} className={`px-4 py-2 font-semibold ${adjustments.colorFilter === item ? 'bg-slate-400 text-white' : "bg-none border-2"} rounded-md text-center`}>{item}</button>
            )}
          </div>
        </div>
        <div className="flex gap-8">
          <button
            onClick={handleApplyAdjustment}
            disabled={!openCVLoaded}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Apply Adjustment
          </button>
          <button
            onClick={handleReset}
            disabled={!openCVLoaded}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!imageUrl || !isAdjusted} // Enable only if adjustments have been applied
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
};


export default ImageAdjuster