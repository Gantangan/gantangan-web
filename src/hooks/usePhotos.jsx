import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/services/storage";

const PhotosContext = createContext(null);

export function PhotosProvider({ children }) {
  const [photos, setPhotos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setPhotos((await getItem("photos", null)) || []);
      setLoaded(true);
    })();
  }, []);

  const addPhoto = useCallback(
    (photo) => {
      const next = [{ id: Date.now().toString(36), createdAt: Date.now(), ...photo }, ...photos];
      setPhotos(next);
      return setItem("photos", next);
    },
    [photos]
  );

  const removePhoto = useCallback(
    (id) => {
      const next = photos.filter((p) => p.id !== id);
      setPhotos(next);
      setItem("photos", next);
    },
    [photos]
  );

  return <PhotosContext.Provider value={{ photos, loaded, addPhoto, removePhoto }}>{children}</PhotosContext.Provider>;
}

export function usePhotos() {
  return useContext(PhotosContext);
}
