import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import '../styles/PhotoPreview.css';

const PhotoPreview = ({ photo, onBack }) => {
  const [showControls, setShowControls] = useState(true);
  const [filterMode, setFilterMode] = useState('original');
  const [editMode, setEditMode] = useState(null); // brightness, contrast, blur, etc.
  const [editValues, setEditValues] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    vignette: 0
  });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const timeoutRef = useRef(null);

  // Auto-hide controls
  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetTimeout();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTap = () => {
    setShowControls(!showControls);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Animation for controls
  const controlsAnimation = useSpring({
    opacity: showControls ? 1 : 0,
    transform: showControls ? 'translateY(0px)' : 'translateY(20px)',
    config: { tension: 300, friction: 30 }
  });

  const filters = [
    { id: 'original', name: 'Gốc', preview: '⚪' },
    { id: 'vivid', name: 'Sống động', preview: '🌈' },
    { id: 'warm', name: 'Ấm áp', preview: '🧡' },
    { id: 'cool', name: 'Lạnh', preview: '💙' },
    { id: 'dramatic', name: 'Kích thích', preview: '⚫' },
    { id: 'mono', name: 'Đen trắng', preview: '⚪' },
    { id: 'vintage', name: 'Cổ điển', preview: '📻' }
  ];

  const editTools = [
    { id: 'brightness', name: 'Độ sáng', icon: '☀️' },
    { id: 'contrast', name: 'Tương phản', icon: '◐' },
    { id: 'saturation', name: 'Độ bão hòa', icon: '🎨' },
    { id: 'blur', name: 'Làm mờ', icon: '🌫️' },
    { id: 'vignette', name: 'Viền tối', icon: '⭕' }
  ];

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Apply CSS filters
    const filterString = `
      brightness(${editValues.brightness}%) 
      contrast(${editValues.contrast}%) 
      saturate(${editValues.saturation}%)
      blur(${editValues.blur}px)
    `;
    
    ctx.filter = filterString;
    ctx.drawImage(image, 0, 0);
    
    // Apply vignette effect
    if (editValues.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${editValues.vignette / 100})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFilterChange = (filterId) => {
    setFilterMode(filterId);
    
    // Apply filter presets
    switch (filterId) {
      case 'vivid':
        setEditValues(prev => ({ ...prev, saturation: 130, contrast: 110 }));
        break;
      case 'warm':
        setEditValues(prev => ({ ...prev, brightness: 105, saturation: 110 }));
        break;
      case 'cool':
        setEditValues(prev => ({ ...prev, brightness: 95, saturation: 90 }));
        break;
      case 'dramatic':
        setEditValues(prev => ({ ...prev, contrast: 140, brightness: 90, vignette: 30 }));
        break;
      case 'mono':
        setEditValues(prev => ({ ...prev, saturation: 0, contrast: 120 }));
        break;
      case 'vintage':
        setEditValues(prev => ({ ...prev, brightness: 110, contrast: 90, saturation: 80, vignette: 20 }));
        break;
      default:
        setEditValues({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          vignette: 0
        });
    }
  };

  const handleEditChange = (tool, value) => {
    setEditValues(prev => ({ ...prev, [tool]: value }));
  };

  const handleSave = () => {
    // Apply filters to canvas and create download
    applyFilters();
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_photo_${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.9);
  };

  const getImageStyle = () => {
    return {
      filter: `
        brightness(${editValues.brightness}%) 
        contrast(${editValues.contrast}%) 
        saturate(${editValues.saturation}%)
        blur(${editValues.blur}px)
      `,
      position: 'relative'
    };
  };

  return (
    <div className="photo-preview" onClick={handleTap}>
      <div 
        className="photo-container"
        style={{
          position: 'relative',
          background: editValues.vignette > 0 ? 
            `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${editValues.vignette/100}) 100%)` :
            'transparent'
        }}
      >
        <img
          ref={imageRef}
          src={photo.url}
          alt="Captured photo"
          className="preview-image"
          style={getImageStyle()}
          onLoad={() => applyFilters()}
        />
        
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>

      {/* Top Controls */}
      <animated.div style={controlsAnimation} className="preview-top-bar ios-glass-dark">
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="photo-info">
          <span className="photo-date">
            {new Date(photo.timestamp).toLocaleString('vi-VN')}
          </span>
        </div>
        
        <button className="share-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="white" strokeWidth="2"/>
            <polyline points="16,6 12,2 8,6" stroke="white" strokeWidth="2"/>
            <line x1="12" y1="2" x2="12" y2="15" stroke="white" strokeWidth="2"/>
          </svg>
        </button>
      </animated.div>

      {/* Bottom Controls */}
      <animated.div style={controlsAnimation} className="preview-bottom-controls">
        {editMode ? (
          // Edit slider
          <div className="edit-slider-container ios-glass-dark">
            <div className="edit-header">
              <button onClick={() => setEditMode(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2"/>
                </svg>
              </button>
              <span>{editTools.find(t => t.id === editMode)?.name}</span>
              <button onClick={() => setEditValues(prev => ({ ...prev, [editMode]: editMode === 'brightness' || editMode === 'contrast' || editMode === 'saturation' ? 100 : 0 }))}>
                Reset
              </button>
            </div>
            
            <div className="slider-container">
              <input
                type="range"
                min={editMode === 'blur' ? 0 : editMode === 'vignette' ? 0 : 0}
                max={editMode === 'blur' ? 10 : editMode === 'vignette' ? 100 : 200}
                value={editValues[editMode]}
                onChange={(e) => handleEditChange(editMode, parseInt(e.target.value))}
                className="edit-slider"
              />
            </div>
          </div>
        ) : (
          <>
            {/* Filter Strip */}
            <div className="filter-strip">
              <div className="filter-scroll">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`filter-button ${filterMode === filter.id ? 'active' : ''}`}
                    onClick={() => handleFilterChange(filter.id)}
                  >
                    <div className="filter-preview">{filter.preview}</div>
                    <span className="filter-name">{filter.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons ios-glass-dark">
              <button className="action-button">
                <span className="action-icon">❤️</span>
                <span>Yêu thích</span>
              </button>
              
              <div className="edit-tools">
                {editTools.map((tool) => (
                  <button
                    key={tool.id}
                    className="edit-tool-button"
                    onClick={() => setEditMode(tool.id)}
                  >
                    <span>{tool.icon}</span>
                  </button>
                ))}
              </div>
              
              <button className="action-button" onClick={handleSave}>
                <span className="action-icon">💾</span>
                <span>Lưu</span>
              </button>
            </div>
          </>
        )}
      </animated.div>
    </div>
  );
};

export default PhotoPreview;