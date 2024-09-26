import { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageAdjuster from './components/ImageAdjuster';

function App() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-xl w-full mx-4 p-8 rounded-2xl shadow-2xl bg-gray-800 bg-opacity-90 backdrop-blur-md">
        <Header />
        <main className="container mx-auto px-4 py-5">
          <ImageUploader onImageUpload={handleImageUpload} />
          <ImageAdjuster imageFile={uploadedImage} />
        </main>
      </div>
    </div>
  );
}

export default App;
