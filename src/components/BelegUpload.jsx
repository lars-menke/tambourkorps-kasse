import { useRef, useState } from 'react';
import { compressImage } from '../utils/imageUtils';

export default function BelegUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  function handleRemove(e) {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (value) {
    return (
      <div className="beleg-preview">
        <img src={value} alt="Beleg" className="beleg-preview__img" />
        <button type="button" className="beleg-preview__remove" onClick={handleRemove}>
          ✕ Entfernen
        </button>
      </div>
    );
  }

  return (
    <div
      className="beleg-upload"
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {loading ? (
        <span className="beleg-upload__label">Komprimiere…</span>
      ) : (
        <>
          <span className="beleg-upload__icon">📷</span>
          <span className="beleg-upload__label">Beleg fotografieren oder auswählen</span>
          <span className="beleg-upload__hint">max. 1 MB</span>
        </>
      )}
      {error && <span className="beleg-upload__error">{error}</span>}
    </div>
  );
}
