import React, { useContext, useEffect, useState, useCallback } from "react";
import { getFirestore, getDocs, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, app, auth } from "./FirebaseConfig";
import { AuthContext } from "./AuthProvider";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const LandingPage = () => {
  // Firestore Data
  const db = getFirestore(app);
  const { currentUser } = useContext(AuthContext);

  // Fetch Posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Post Creation
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Other logic
  const [needsRegister, setNeedsRegister] = useState(false);
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Image Upload
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Login Handling
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } catch (error) {
      alert(error.message);
    }
  }, []);

  // Sign Up Handling
  const handleSignUp = useCallback(async (event) => {
    event.preventDefault();
    const { email, password } = event.target.elements;
    try {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
    } catch (error) {
      alert(error.message);
    }
  }, []);

  // Post Creation Handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (image) {
      try {
        setLoading(true);
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);

        const request = {
          title: title,
          description: description,
          imageURL: url,
          date: new Date().toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          poster: currentUser.email,
        };

        const docRef = await addDoc(collection(db, "posts"), request);
        setPosts((posts) => [...posts, request]);
        setTitle("");
        setDescription("");
        setImage(null);
      } catch (error) {
        console.error("Error submitting post:", error);
        alert("Error submitting post. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetching of Posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const temporaryArr = [];
        querySnapshot.forEach((doc) => {
          temporaryArr.push(doc.data());
        });
        console.log(temporaryArr);
        setPosts(temporaryArr);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [db]);

  // Render data
  return (
    <div>
      {/* Form Box at the Top */}
      <div className="form-box">
        {currentUser ? (
          <>
            {/* Create a Post */}
            <form className="app-form" onSubmit={handleSubmit}>
              <p>📕Post</p>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {" "}
                  <label htmlFor="title">Title:</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label htmlFor="upload">Image:</label>
                  <input id="upload" type="file" onChange={handleImageChange} />
                  <label htmlFor="caption">Caption:</label>
                  <input
                    id="caption"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <br />
                  <button type="submit">Submit</button>
                </>
              )}
              <br />
            </form>
            <button onClick={() => signOut(auth)}>Sign Out</button>
          </>
        ) : needsRegister ? (
          <>
            {/* Register Account */}
            <form className="app-form" onSubmit={handleSignUp}>
              <p>🪄 Register</p>
              <label htmlFor="title">Email:</label>
              <input
                name="email"
                id="email"
                type="email"
                // onChange={(e) => setTitle(e.target.value)}
              />
              <label htmlFor="title">Password:</label>
              <input
                name="password"
                id="password"
                type="password"
                // onChange={(e) => setTitle(e.target.value)}
              />
              <button type="submit">Submit</button>
              <br />
            </form>
            <button onClick={() => setNeedsRegister(false)}>
              Back to Login
            </button>
          </>
        ) : (
          <>
            {/* Login Account */}
            <form className="app-form" onSubmit={handleLogin}>
              <p>💻 Login</p>
              <label htmlFor="email">Email:</label>
              <input name="email" id="email" type="email" />
              <label htmlFor="password">Password:</label>
              <input name="password" id="password" type="password" />
              <button type="submit">Submit</button>
              <br />
            </form>
            <button onClick={() => setNeedsRegister(true)}>Register</button>
          </>
        )}
      </div>
      {/* Render Posts */}
      <div className="posts-container">
        {sortedPosts.map((post, idx) => (
          <div className="post" key={idx}>
            <span className="post-title">📝 {post.title}</span>
            <img className="post-image" src={post.imageURL} alt="post-name" />

            <span className="post-description"> {post.description}</span>
            <span className="post-title">
              ✏️ {post.poster} on {post.date.toString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
