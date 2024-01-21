"use client";

import { useState, useRef, useEffect } from "react";

interface IdentifiedObject {
  label: string;
  score: number;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

export default function Home() {
  const [theFile, setTheFile] = useState<File | undefined>(undefined);
  const [identifiedObjects, setIdentifiedObjects] = useState<IdentifiedObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<IdentifiedObject | undefined>(undefined);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageScale, setImageScale] = useState({ x: 1, y: 1 });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTheFile(file);
    setSelectedObject(undefined); // Clear selected object when a new file is uploaded
    setIdentifiedObjects([]); // Clear identified objects as well

    const image = new Image();
    image.onload = () => {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      imageRef.current && setImageScale({
        x: imageRef.current.offsetWidth / naturalWidth,
        y: imageRef.current.offsetHeight / naturalHeight,
      });
    };
    image.src = URL.createObjectURL(file);

    await callApiToIdentifyObjects(file);
  };

  const callApiToIdentifyObjects = async (file: File) => {
    const formData = new FormData();
    formData.append("theImage", file);

    try {
      const response = await fetch("/api", { method: "POST", body: formData });
      if (response.ok) {
        const result = await response.json();
        setIdentifiedObjects(result.body);
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const selectObject = (obj: IdentifiedObject) => {
    setSelectedObject(obj);
  };

  const renderBoundingBox = (obj: IdentifiedObject) => {
    const isSelected = selectedObject?.label === obj.label;
    if (!isSelected || !imageRef.current) return null;

    const { x, y } = imageScale;
    const { xmin, ymin, xmax, ymax } = obj.box;
    const style = {
      left: `${xmin * x}px`,
      top: `${ymin * y}px`,
      width: `${(xmax - xmin) * x}px`,
      height: `${(ymax - ymin) * y}px`,
      border: '3px solid yellow',
      position: 'absolute',
      boxShadow: '0 0 10px 5px yellow',
      pointerEvents: 'none',
    };

    return <div key={obj.label} style={style}></div>;
  };

//   return (
//     <main className="font-sans text-center p-6 bg-gradient-to-b from-background-start to-background-end text-foreground">
//       <h1 className="text-3xl font-bold mb-6">Object Identifier</h1>

//       <p className="mb-4 text-lg">
//         Welcome to the Object Identifier! Upload an image to detect objects. Click on the object names below the image to highlight them in the image.
//       </p>

//       <input
//         type="file"
//         onChange={handleFileChange}
//         accept="image/*"
//         className="mb-4 p-2 border border-gray-300 rounded-md"
//       />

//       <div className="relative mx-auto w-full max-w-3xl mb-4">
//         {theFile && (
//           <img
//             ref={imageRef}
//             src={URL.createObjectURL(theFile)}
//             alt="Uploaded"
//             className="w-full h-auto"
//             onLoad={() => identifiedObjects.forEach(obj => renderBoundingBox(obj))}
//           />
//         )}
//         {selectedObject && renderBoundingBox(selectedObject)}
//       </div>

//       {identifiedObjects.length > 0 && (
//         <div className="mb-4">
//           <h2 className="text-xl font-semibold">Identified Objects:</h2>
//           <p>Click on an object name to highlight it in the image.</p>
//         </div>
//       )}

//       <div className="flex justify-center flex-wrap gap-2">
//         {identifiedObjects.map(obj => (
//           <button
//             key={obj.label}
//             onClick={() => selectObject(obj)}
//             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           >
//             {obj.label}
//           </button>
//         ))}
//       </div>
//     </main>
//   );
// }

return (
  <main className="font-sans text-center p-6 bg-gradient-to-b from-background-start to-background-end text-foreground min-h-screen">
    <h1 className="text-4xl font-bold mb-8 text-blue-600">AI Object Identifier</h1>
    
    <p className="mb-6 text-lg text-gray-200">
      Discover objects in your images. Upload an image and click on identified object names to highlight them.
    </p>

    <div className="mb-6">
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="mb-4 p-3 border border-blue-400 rounded-lg cursor-pointer"
      />
    </div>

    <div className="relative mx-auto w-full max-w-4xl mb-8">
      {theFile && (
        <img
          ref={imageRef}
          src={URL.createObjectURL(theFile)}
          alt="Uploaded"
          className="w-full h-auto rounded-lg shadow-lg"
          onLoad={() => identifiedObjects.forEach(obj => renderBoundingBox(obj))}
        />
      )}
      {selectedObject && renderBoundingBox(selectedObject)}
    </div>

    {identifiedObjects.length > 0 && (
      <div className="mb-4 text-left mx-auto w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-blue-500 mb-3">Identified Objects:</h2>
        <p className="text-gray-300 mb-4">Click on an object name to highlight it.</p>
        <div className="flex justify-center flex-wrap gap-4">
          {identifiedObjects.map(obj => (
            <button
              key={obj.label}
              onClick={() => selectObject(obj)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300"
            >
              {obj.label}
            </button>
          ))}
        </div>
      </div>
    )}
  </main>
);
}

