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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ImageUploader onImageUpload={handleImageUpload} />
        <ImageAdjuster imageFile={uploadedImage} />
      </main>
    </div>
  );
}

export default App;