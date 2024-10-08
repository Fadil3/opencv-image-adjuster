import React from 'react';
interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className={``}>
      <div className="mb-6">
        <label
          htmlFor="picture"
          className="block text-sm font-medium mb-2 text-gray-300"
        >
          Upload Picture
        </label>
        <input
          id="picture"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold  file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:bg-gradient-to-r hover:file:from-purple-600 hover:file:to-pink-600 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default ImageUploader;
