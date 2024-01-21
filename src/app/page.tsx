"use client";

import { useState, useRef, useEffect } from "react";
import { CSSProperties } from "react";

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

  // const renderBoundingBox = (obj: IdentifiedObject) => {
  //   const isSelected = selectedObject?.label === obj.label;
  //   if (!isSelected || !imageRef.current) return null;

  //   const { x, y } = imageScale;
  //   const { xmin, ymin, xmax, ymax } = obj.box;
  //   const style = {
  //     left: `${xmin * x}px`,
  //     top: `${ymin * y}px`,
  //     width: `${(xmax - xmin) * x}px`,
  //     height: `${(ymax - ymin) * y}px`,
  //     border: '3px solid yellow',
  //     position: 'absolute',
  //     boxShadow: '0 0 10px 5px yellow',
  //     pointerEvents: 'none',
  //   };

  //   return <div key={obj.label} style={style}></div>;
  // };

  const renderBoundingBox = (obj: IdentifiedObject) => {
    const isSelected = selectedObject?.label === obj.label;
    if (!isSelected || !imageRef.current) return null;
  
    const { x, y } = imageScale;
    const { xmin, ymin, xmax, ymax } = obj.box;
    const style: CSSProperties = { // Explicitly defining the type as CSSProperties
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

  // useEffect(() => {
  //   // Function to update scale based on the current image dimensions
  //   const updateScale = () => {
  //     if (imageRef.current) {
  //       const rect = imageRef.current.getBoundingClientRect();
  //       setImageScale({
  //         x: rect.width / imageRef.current.naturalWidth,
  //         y: rect.height / imageRef.current.naturalHeight
  //       });
  //     }
  //   };

  //   window.addEventListener('resize', updateScale);
  //   updateScale();
  //   return () => window.removeEventListener('resize', updateScale);
  // }, [theFile, identifiedObjects]);

  useEffect(() => {
    // Function to update scale based on the current image dimensions
    const updateScale = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setImageScale({
          x: rect.width / imageRef.current.naturalWidth,
          y: rect.height / imageRef.current.naturalHeight
        });
      }
    };

    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, [theFile, identifiedObjects]);




//   return (
//     <main className="font-sans text-center p-6 bg-gradient-to-b from-background-start to-background-end text-foreground min-h-screen">
//       <h1 className="text-4xl font-bold mb-8 text-blue-600">AI Object Identifier</h1>
      
//       <p className="mb-6 text-lg text-gray-200">
//         Upload an image to detect objects. Click on the object names to highlight them.
//       </p>

//       <input
//         type="file"
//         onChange={handleFileChange}
//         accept="image/*"
//         className="mb-4 p-2 border border-blue-400 rounded-lg cursor-pointer"
//       />

//       <div className="flex flex-col md:flex-row justify-start items-start gap-8">
//         <div className="flex-1 min-w-0">
//           {theFile && (
//             <div className="relative w-full max-w-lg mx-auto">
//               <img
//                 ref={imageRef}
//                 src={URL.createObjectURL(theFile)}
//                 alt="Uploaded"
//                 className="w-full max-w-lg h-auto mx-auto shadow-lg rounded-lg"
//                 onLoad={() => identifiedObjects.forEach(obj => renderBoundingBox(obj))}
//               />
//               {selectedObject && renderBoundingBox(selectedObject)}
//             </div>
//           )}
//         </div>

//         {identifiedObjects.length > 0 && (
//           <div className="flex-1 max-w-md">
//             <h2 className="text-2xl font-semibold text-blue-500 mb-3">Identified Objects:</h2>
//             <p className="text-gray-300 mb-4">Click on an object name to highlight it.</p>
//             <div className="flex flex-wrap gap-4 justify-start">
//               {identifiedObjects.map(obj => (
//                 <button
//                   key={obj.label}
//                   onClick={() => selectObject(obj)}
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300"
//                 >
//                   {obj.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }


return (
  <main className="text-center p-6">
    <h1 className="text-4xl font-bold mb-8">AI Object Identifier</h1>
    
    <p className="mb-6 text-lg">
      Upload an image to detect objects. Click on the object names to highlight them.
    </p>

    <input
      type="file"
      onChange={handleFileChange}
      accept="image/*"
      className="mb-4 p-2 border rounded-lg cursor-pointer"
    />

    <div className="flex flex-col md:flex-row justify-start items-start gap-8">
      <div className="flex-1">
        {theFile && (
          <div className="relative w-full max-w-lg mx-auto">
            <img
              ref={imageRef}
              src={URL.createObjectURL(theFile)}
              alt="Uploaded"
              className="w-full h-auto mx-auto shadow-lg rounded-lg"
              onLoad={() => identifiedObjects.forEach(obj => renderBoundingBox(obj))}
            />
            {selectedObject && renderBoundingBox(selectedObject)}
          </div>
        )}
      </div>

      {identifiedObjects.length > 0 && (
        <div className="flex-1 max-w-md">
          <h2 className="text-2xl font-semibold mb-3">Identified Objects:</h2>
          <p className="mb-4">Click on an object name to highlight it.</p>
          <div className="flex flex-wrap gap-4 justify-start">
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
    </div>
  </main>
);
}