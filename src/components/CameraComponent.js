import React, { useEffect, useState, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import './styles/CameraComponent.css';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp} from 'firebase/firestore';
// import { sources } from 'webpack';
// DO NOT import @babel/core or any Node-only modules here.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const OVERLAY_RATIO = 0.7;   // fraction of the displayed content box side
const OUTPUT_SIZE = 224;
const SIM_THRESHOLD = 0.8; // cosine similarity threshold for "known" vs "unknown"

// Similarity helpers and loader inside the component
const normalizeVector = (arr) => {
    let ss = 0;
    for (let i=0 ; i < arr.length ; i++) ss += arr[i]*arr[i];
    const denom = Math.sqrt(ss) || 1;
    const out = new Array(arr.length);
    for (let i=0 ; i < arr.length ; i++) out[i] = arr[i]/denom;
    return out; 
}

const cosineSim = (a,b) => {
    const n = Math.min(a.length, b.length);
    let dot = 0;
    for (let i=0 ; i < n ; i++) dot += a[i]*b[i];
    return dot;
}


const CameraComponent = function () {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const streamRef = useRef(null);
  const location = useLocation();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictedLabel, setPredictedLabel] = useState('');

  // displayed element size (CSS px)
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });

  const [showLabelModal, setShowLabelModal] = useState(false);
  const [pendingFeatures, setPendingFeatures] = useState(null); // float[] to store if unknown
  const [selectedLabel, setSelectedLabel] = useState('unknown');   // default choice
  const [customLabel, setCustomLabel] = useState('');            // optional new label
  const [saving, setSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState(null);
  const [modalError, setModalError] = useState('');
  
  // Map the element box to the displayed video content (handles letterboxing)
  const getContentBox = () => {
    const video = videoRef.current;

    // element size (safe fallbacks)
    const rectW = (video?.clientWidth ?? viewSize.w) || 0;
    const rectH = (video?.clientHeight ?? viewSize.h) || 0;

    // if intrinsic size not ready, return element box
    if (!video || !video.videoWidth || !video.videoHeight || !rectW || !rectH) {
      return { dispW: rectW, dispH: rectH, offsetX: 0, offsetY: 0 };
    }

    const videoAR = video.videoWidth / video.videoHeight;
    const elemAR = rectW / rectH;

    if (videoAR > elemAR) {
      // Bars top/bottom
      const dispW = rectW;
      const dispH = rectW / videoAR;
      const offsetX = 0;
      const offsetY = (rectH - dispH) / 2;
      return { dispW, dispH, offsetX, offsetY };
    } else {
      // Bars left/right
      const dispH = rectH;
      const dispW = rectH * videoAR;
      const offsetX = (rectW - dispW) / 2;
      const offsetY = 0;
      return { dispW, dispH, offsetX, offsetY };
    }
  };

  useEffect(() => {
    return () => {
        const v = videoRef.current;
        if (v) {
            try { v.pause(); } catch {}
            v.srcObject = null;
        }

        const s = streamRef.current;
        if (s) {
          s.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
    };
  }, [location.pathname]);

  // Start camera and track element size
  useEffect(() => {
    let stream;
    let cancelled = false;

    const updateSize = () => {
      if (videoRef.current) {
        setViewSize({
          w: videoRef.current.clientWidth,
          h: videoRef.current.clientHeight,
        });
      }
    };

    (async () => {
      try {
        const primary = { video: { facingMode: 'environment' }, audio: false };
        const fallback = { video: { facingMode: 'user' }, audio: false };
        try {
          stream = await navigator.mediaDevices.getUserMedia(primary);
        } catch {
          stream = await navigator.mediaDevices.getUserMedia(fallback);
        }

        if(cancelled){
            stream.getTracks().forEach((t) => t.stop());
            return;
        }

        //SAVE te stream so cleanup can stop it
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadedmetadata', updateSize, { once: true });
          window.addEventListener('resize', updateSize);
        }
      } catch (err) {
        setError('Error accessing camera: ' + err.message);
      }
    })();

    return () => {
        cancelled = true;
        window.removeEventListener('resize', updateSize);

        const v = videoRef.current;
        if (v) {
            try { v.pause(); } catch {}
            v.srcObject = null;
        }

        const s = streamRef.current;
        if (s) {
          s.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
    };
  }, []);

  // Load MobileNet once
  useEffect(() => {
    (async () => {
      try {
        modelRef.current = await mobilenet.load();
      } catch (e) {
        setError('Error loading model: ' + (e?.message || e));
      }
    })();
  }, []);

  const captureAndPredict = async () => {
    const video = videoRef.current;
    const model = modelRef.current;
    if (!video || !model) return;

    setIsLoading(true);
    setPredictedLabel('');
    setError('');

    // Ensure video has intrinsic dimensions
    if (!video.videoWidth || !video.videoHeight) {
      await new Promise((resolve) => {
        const handler = () => resolve();
        video.addEventListener('loadedmetadata', handler, { once: true });
      });
    }

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    // Centered overlay crop
    const { dispW, dispH, offsetX, offsetY } = getContentBox();
    const overlaySide = Math.floor(Math.min(dispW, dispH) * OVERLAY_RATIO);

    // Center in element px
    const cxElem = (video.clientWidth || viewSize.w) / 2;
    const cyElem = (video.clientHeight || viewSize.h) / 2;

    // Element -> content px (remove letterboxing)
    const cxContent = Math.min(dispW, Math.max(0, cxElem - offsetX));
    const cyContent = Math.min(dispH, Math.max(0, cyElem - offsetY));

    // Content -> video px (uniform scale)
    const scale = vw / dispW;
    const cropSizeV = Math.floor(overlaySide * scale);
    let sx = Math.floor(cxContent * scale - cropSizeV / 2);
    let sy = Math.floor(cyContent * scale - cropSizeV / 2);

    // Clamp inside video frame
    sx = Math.max(0, Math.min(vw - cropSizeV, sx));
    sy = Math.max(0, Math.min(vh - cropSizeV, sy));

    // Draw to canvas at model input size
    const canvas = canvasRef.current;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    // 9 args for crop + scale
    ctx.drawImage(video, sx, sy, cropSizeV, cropSizeV, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    let features, flat;
    try {
        // 1) Extract features
        features = model.infer(canvas, true);
        flat = features.flatten();
        const featureArray = Array.from(flat.dataSync());

        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features: featureArray }),
        });

        // Defensive parse
        let result = null;
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            try { result = await response.json(); } catch {}
        } else {
            const text = await response.text();
            try { result = JSON.parse(text); } catch {}
        }
        if (!response.ok) {
            const msg = (result && (result.message || result.error)) || 'no body';
            throw new Error(`Server error ${response.status}: ${msg}`);
        }

        const allowed = ['apple', 'pear'];
        const rawLabel = String(result?.label || '').toLowerCase();
        const conf =
            typeof result?.confidence === 'number' ? result.confidence :
            typeof result?.score === 'number' ? result.score :
            typeof result?.probability === 'number' ? result.probability : undefined;
        const THRESHOLD = 0.6;

        // Only accept apple/pear when confident, otherwise treat as unknown and open modal
        const accepted = allowed.includes(rawLabel) && typeof conf === 'number' && conf >= THRESHOLD;
        if (!accepted) {
            setPendingFeatures(featureArray);
            setSelectedLabel('unknown');
            setShowLabelModal(true);
            setIsLoading(false);
            return;
        }
        setPredictedLabel(rawLabel);

    }  catch (e) {
        console.error('Prediction Error:', e);
        setError('Prediction error: ' + (e?.message || e));
    } finally{
        if (features) features.dispose();
        if (flat) flat.dispose();
        setIsLoading(false);
    }
};

  //Save the labeled features to Firestore
  const handleSaveLabeledFeatures = async () => {
    console.log('[handleSaveLabeledFeatures] start');
    setModalError('');
    const label = (customLabel.trim() || selectedLabel || selectedLabel || '').toLowerCase();
    console.log('[handleSaveLabeledFeatures] computed label:', label);

    if(!pendingFeatures?.length){
        setModalError('No features to save.');
        console.warn('[handleSaveLabeledFeatures] aborted : no features');
        return;
    }
  
    try{
        setSaving(true);
        const docRef =  await addDoc(collection(db, 'feedback'), {
            kind : 'feature',
            sources : 'camera',
            label,
            features: pendingFeatures,
            createdAt: serverTimestamp(),
        });
        console.log('Saved labeled features with ID:', docRef.id);
        
        setLastSavedId(docRef.id);
        setSaving(false);
        setShowLabelModal(false);
        setPendingFeatures(null);
        setCustomLabel('');
        setSelectedLabel('unknown');
        setPredictedLabel(label);
    } catch(e){
        console.error('Error saving labeled features:', e);
        setSaving(false);
        setModalError('Error saving labeled features: ' + (e?.message || e));
    }
  };

  const handleCancelModal = () => {
    setShowLabelModal(false);
    setPendingFeatures(null);
    setCustomLabel('');
    setModalError('');
  }

  // Centered overlay style (in element px)
  const { dispW, dispH } = getContentBox();
  const overlaySide = Math.floor(Math.min(dispW || 0, dispH || 0) * OVERLAY_RATIO) || 0;
  const left = (videoRef.current?.clientWidth || viewSize.w || 0) / 2;
  const top = (videoRef.current?.clientHeight || viewSize.h || 0) / 2;

  const overlayStyle = {
    width: `${overlaySide}px`,
    height: `${overlaySide}px`,
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translate(-50%, -50%)',
  };

  
  return (
    <div>
      <h2>Take a Picture</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="camera-frame">
        <video ref={videoRef} autoPlay playsInline className="camera-video" />
        {overlaySide > 0 && <div className="crop-overlay" style={overlayStyle} />}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button type="button" onClick={captureAndPredict} disabled={isLoading} className="button">
          {isLoading ? 'Processing...' : 'Capture & Predict'}
        </button>
      </div>

      {predictedLabel && (
        <p style={{ marginTop: 12 }}>
          Prediction: <strong>{predictedLabel}</strong>
        </p>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {showLabelModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-content">
                <p>Sorry</p>
                <p>Unknown fruit</p>

                <div className="modal-options">
                    <label><input
                        type="radio"
                        name="label"
                        value="apple"
                        checked={selectedLabel === 'apple' && !customLabel}
                        onChange={() => { setSelectedLabel('apple'); setCustomLabel(''); }}
                    /> Apple</label>

                    <label><input
                        type="radio"
                        name="label"
                        value="pear"
                        checked={selectedLabel === 'pear' && !customLabel}
                        onChange={() => { setSelectedLabel('pear'); setCustomLabel(''); }}
                    /> Pear</label>
                
                    {/* ADD: Unknown option */}
                    <label><input
                        type="radio"
                        name="label"
                        value="unknown"
                        checked={selectedLabel === 'unknown' && !customLabel}
                        onChange={() => { setSelectedLabel('unknown'); setCustomLabel(''); }}
                    /> Unknown</label>
                </div>
                {modalError && <p className="modal-error">{modalError}</p>}

                <div className="modal-actions">
                    <button type="button" className="btn btn-primary" onClick={handleSaveLabeledFeatures} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="button secondary" onClick={handleCancelModal} disabled={saving}>
                        Cancel
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
      {lastSavedId && <div className="save-confirmation">Saved to feedback (id : {lastSavedId})</div>}
    </div>
  );
};

export default CameraComponent;