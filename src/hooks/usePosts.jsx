import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/services/storage";

const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setPosts((await getItem("posts", null)) || []);
      setLoaded(true);
    })();
  }, []);

  const addPost = useCallback(
    (post) => {
      const next = [{ id: Date.now().toString(36), createdAt: Date.now(), ...post }, ...posts];
      setPosts(next);
      setItem("posts", next);
    },
    [posts]
  );

  const updatePost = useCallback(
    (id, patch) => {
      const next = posts.map((p) => (p.id === id ? { ...p, ...patch } : p));
      setPosts(next);
      setItem("posts", next);
    },
    [posts]
  );

  const removePost = useCallback(
    (id) => {
      const next = posts.filter((p) => p.id !== id);
      setPosts(next);
      setItem("posts", next);
    },
    [posts]
  );

  const getPost = useCallback((id) => posts.find((p) => p.id === id) || null, [posts]);

  return (
    <PostsContext.Provider value={{ posts, loaded, addPost, updatePost, removePost, getPost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}
