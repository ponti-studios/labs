type Props = {
  alt: string;
  photos: google.maps.places.PlacePhoto[];
};
const PlacePhotos = ({ alt, photos }: Props) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="flex overflow-x-auto w-full rounded border-2 border-secondary">
      {photos.map((photo) => (
        <img
          key={photo.getUrl()}
          src={photo.getUrl()}
          alt={alt}
          className="w-[300px] h-[300px] object-cover object-top"
        />
      ))}
    </div>
  );
};

export default PlacePhotos;
