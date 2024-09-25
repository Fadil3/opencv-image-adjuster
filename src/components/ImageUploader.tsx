import React, { useState } from 'react';
interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed p-4 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer text-blue-500 hover:text-blue-600"
      >
        Click to upload
      </label>
      <p className="mt-2 text-sm text-gray-500">or drag and drop your image here</p>
    </div>
  );
};

export default ImageUploader