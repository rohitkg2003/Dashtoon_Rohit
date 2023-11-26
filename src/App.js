// src/App.js
import React, { useState } from 'react';
import './App.css';

const API_URL = "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud";
const API_KEY = "VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM";

function App() {
  const [numPanel, setNumPanel] = useState(0);
  const [comicText, setComicText] = useState(Array(numPanel).fill([]));
  const [annotationPanelText, setAnnotationPanelText] = useState(Array(numPanel).fill([]));
  const [comicImages, setComicImages] = useState(Array(numPanel).fill(null));
  const [loading, setLoading] = useState(false);


  const handleInputChange = (index, value) => {
    const newText = [...comicText];
    newText[index] = value;
    setComicText(newText);
  };

  const handleAnnotationChange = (index, value) => {
    const newAnnotationText = [...annotationPanelText];
    newAnnotationText[index] = value;
    setAnnotationPanelText(newAnnotationText);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const images = await Promise.all(
        comicText.map(async (text, index) => {
          if (!text) {
            return { imageUrl: null, annotation: "Write some text instead of generating an image." };
          }

          const data = { inputs: text };
          const response = await query(data);

          if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            return { imageUrl, annotation: annotationPanelText[index] };
          } else {
            console.error(`Error for Panel ${index + 1}: ${response.statusText}`);
            return { imageUrl: null, annotation: `Error: ${response.statusText}` };
          }
        })
      );

      setComicImages(images);
    } catch (error) {
      console.error('Error:', error.message);
      // Handle API errors and update UI accordingly
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnotherComic = () => {
    setComicText(Array(numPanel).fill(''));
    setAnnotationPanelText(Array(numPanel).fill(''));
    setComicImages(Array(numPanel).fill(null));
  };


  const handlePanelNumberChange = (e) => {
    const value = e.target.value.trim(); // Trim any leading/trailing spaces
    const num = value !== '' ? parseInt(value, 10) : 0;
    if (!isNaN(num) && num <= 10) {
      setNumPanel(num);
      setComicText(Array(num).fill(''));
      setAnnotationPanelText(Array(num).fill(''));
      setComicImages(Array(num).fill(null));
    }
    if(num > 10) alert('Please enter number less than 11');
  };

  const query = async (data) => {
    try {
      const response = await fetch(
        API_URL,
        {
          headers: {
            "Accept": "image/png",
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok || !response.size) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error in query function:', error.message);
      throw error;
    }
  };

  return (
    <div className="App">

      <nav className="navbar">
        <div className="navbar-left">
          <h1>Imaginative Comics</h1>
        </div>
        <div className = "navbar-right">
          <button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Generating...' : 'Make Comic'}
          </button>
          <button type="button" onClick={handleGenerateAnotherComic}>
            Make New Comic
          </button>
        </div>
      </nav>
      <div className = "number-panel">
        <div style ={{fontSize: "1.2em", marginBottom : "4px", color :"black"}}>Number of Panel</div>
          <textarea
            type="number"
            id="panelNumber"
            name="panelNumber"
            value={numPanel}
            onChange={handlePanelNumberChange}
          />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {comicText.map((text, index) => (
          <div key={index} className="panel-inputs">
            <div className ="panel-text">
              <div style = {{color:"white", marginBottom : "0.5em"}}>{`Panel ${index + 1}: `}</div>
              <textarea value = {text} onChange = {(e) => handleInputChange(index,e.target.value)}/>
            </div>
            <div className="annotation-text">
              <div style = {{color:"white", marginBottom : "0.5em"}}>{`Speech bubbles ${index + 1}: `}</div>
              <textarea value={annotationPanelText[index]} onChange = {(e) => handleAnnotationChange(index,e.target.value)}></textarea>
            </div>
          </div>
        ))}
      </form>
      {loading && <div className="loader"></div>}
      <div className="comic-display">
        {comicImages.map((panel, index) => (
          panel && (
            <div key={index} className="comic-panel">
              {panel.imageUrl ? (
                <img src={panel.imageUrl} alt={`Create more ${index + 1}`} />
              ) : (
                <div className="default-text">{panel.annotation}</div>
              )}
              <div className="annotation">{panel.annotation}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default App;

