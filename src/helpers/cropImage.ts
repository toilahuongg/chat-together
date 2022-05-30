// @ts-nocheck

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
): Promise<any> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // set canvas size to match the bounding box
  canvas.width = 128
  canvas.height = 128

  // draw rotated image
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, 128, 128)

  // As Base64 string
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.addEventListener("load", () => {
          let { result } = reader;
          let croppedImage = new File([result], 'image.jpg', { type: 'image/jpeg' });
          resolve({
            croppedImage,
            width: canvas.width,
            height: canvas.height
          });
      }, false);
    });
  })

  // As a blob
//   return new Promise((resolve, reject) => {
//     canvas.toBlob((file) => {
//       resolve(URL.createObjectURL(file))
//     }, 'image/jpeg')
//   })
}
