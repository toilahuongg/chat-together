import Button from "@src/Components/Layout/Button";
import SliderRange from "@src/Components/Layout/SliderRange";
import React, { useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";

type TProps = {
  image: string,
  setImage: (value: string) => void,
  cropped: Area | null,
  setCropped: (value: Area) => void,
}
const ChangeAvatar: React.FC<TProps> = ({ image, setImage, cropped, setCropped }) => {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const inputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropped(croppedAreaPixels)
  }, []);

  return (
    <>
      <div style={{ position: "relative", height: "400px", marginBottom: "10px" }}>
        {
          image ? (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropSize={{
                width: 128,
                height: 128
              }}

            />
          ) : 'Please choose image'
        }

      </div>
      <SliderRange
        value={zoom}
        min={1}
        max={3}
        step={0.1}
        onChange={(value) => setZoom(value)}
      />
      <input ref={inputRef} type="file" accept=".jpg,.png" onChange={(e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
          const objectUrl = URL.createObjectURL(file);
          setImage(objectUrl);
        }
      }} hidden />
      <Button variable="primary" onClick={() => inputRef.current?.click()}> Choose image </Button>
    </>
  )
}

export default ChangeAvatar;