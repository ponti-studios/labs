type Props = {
  alt: string;
  photos: google.maps.places.PlacePhoto[];
};
const PlacePhotos = ({ alt, photos }: Props) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="carousel carousel-center p-4 space-x-4 bg-slate-200 rounded-box h-64">
      {photos.map((photo) => (
        <div key={photo.getUrl()} className="carousel-item">
          <img src={photo.getUrl()} alt={alt} className="rounded-box" />
        </div>
      ))}
    </div>
  );
};

export default PlacePhotos;
