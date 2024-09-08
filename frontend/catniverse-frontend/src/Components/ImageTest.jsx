import React, { useState } from "react";
import axios from "axios";

const ImageTest = () => {
  const [test, setTest] = useState({
    title: "",
    content: "",
  });
  const [image, setImage] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTest({ ...test, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    // setProduct({...product, image: e.target.files[0]})
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "test",
      new Blob([JSON.stringify(test)], { type: "application/json" })
    );

    axios
      .post("http://localhost:8080/api/test/addTest", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("test upload successfully:", response.data);
        alert("test upload successfully");
        setTest({
            title: "",
            content: "",
          });
        setImage(null);          
        
      })
      .catch((error) => {
        console.error("Error upload test:", error);
        alert(error.response.data);
        
      });
  };

  return (
    <div onSubmit={submitHandler}>
      <form>
        <div>
          <label>
            <h6>title</h6>
          </label>
          <input
            type="text"
            value={test.title}
            name="title"
            onChange={handleInputChange}
            id="title"
            required
          />
        </div>
        <div>
          <label>
            <h6>content</h6>
          </label>
          <input
            type="text"
            value={test.content}
            name="content"
            onChange={handleInputChange}
            id="content"
            required
          />
        </div>
        <div>
          <label>
            <h6>Image</h6>
          </label>
          <input type="file"  onChange={handleImageChange} required/>
        </div>

        <div>
          <button type="submit">提交資訊</button>
        </div>
      </form>
    </div>
  );
};
export default ImageTest;
