import { useState, useRef, useEffect } from "react";

import "../styles/upload.css";

import { auth, db } from "../firebase";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";


const SAMPLE_JD = `We are looking for a Senior Frontend Developer with 3+ years of experience in React.js. The ideal candidate should have strong knowledge of JavaScript (ES6+), CSS, and RESTful APIs. Experience with TypeScript and state management (Redux/Zustand) is a plus. Must be comfortable working in an Agile environment and have excellent communication skills.`;


export default function UploadPanel({ onResults }) {

  const [files, setFiles] = useState([]);

  const [jobDesc, setJobDesc] = useState("");

  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [history, setHistory] = useState([]);

  const fileRef = useRef();


  // =====================================
  // LOAD SCREENING HISTORY
  // =====================================

  useEffect(() => {

    loadHistory();

  }, []);


  const loadHistory = async () => {

    try {

      const user = auth.currentUser;

      if (!user) return;

      // LOCAL CACHE
      const local = localStorage.getItem(
        `history_${user.uid}`
      );

      if (local) {

        setHistory(JSON.parse(local));
      }

      // FIRESTORE
      const q = query(

        collection(db, "screening_history"),

        where("userId", "==", user.uid),

        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()
      }));

      setHistory(data);

      localStorage.setItem(

        `history_${user.uid}`,

        JSON.stringify(data)
      );

    } catch (err) {

      console.log("History load error:", err);
    }
  };


  const addFiles = (incoming) => {

    const valid = Array.from(incoming).filter(

      (f) =>
        f.type === "application/pdf" ||
        f.name.endsWith(".docx") ||
        f.name.endsWith(".doc")
    );

    setFiles((prev) => {

      const names = new Set(prev.map((f) => f.name));

      return [

        ...prev,

        ...valid.filter((f) => !names.has(f.name))
      ];
    });
  };


  const onDrop = (e) => {

    e.preventDefault();

    setDragging(false);

    addFiles(e.dataTransfer.files);
  };


  const removeFile = (name) => {

    setFiles((f) => f.filter((x) => x.name !== name));
  };


  // =====================================
  // ANALYZE RESUMES
  // =====================================

  const analyze = async () => {

    if (!files.length || !jobDesc.trim()) return;

    setLoading(true);

    setProgress(30);

    const formData = new FormData();

    formData.append("job_description", jobDesc);

    files.forEach((file) => {

      formData.append("resumes", file);
    });

    try {

      const response = await fetch(

        "http://127.0.0.1:5000/analyze",

        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {

        throw new Error("Server error");
      }

      const data = await response.json();

      setProgress(100);

      console.log("API Response:", data);

      // SHOW RESULTS
      onResults(data);

      // =====================================
      // SAVE HISTORY
      // =====================================

      const user = auth.currentUser;

      if (user) {

        const historyItem = {

          userId: user.uid,

          email: user.email,

          jobDescription: jobDesc,

          results: data,

          createdAt: Date.now()
        };

        // FIRESTORE SAVE
        await addDoc(

          collection(db, "screening_history"),

          historyItem
        );

        // UPDATE LOCAL HISTORY
        const updatedHistory = [

          historyItem,

          ...history
        ];

        setHistory(updatedHistory);

        // LOCAL CACHE
        localStorage.setItem(

          `history_${user.uid}`,

          JSON.stringify(updatedHistory)
        );
      }

    } catch (error) {

      console.error("Upload failed:", error);

      alert("Failed to analyze resumes.");

    } finally {

      setLoading(false);

      setProgress(0);
    }
  };


  return (

    <div className="upload-panel">

      {/* Resume Upload */}
      <section className="panel-section">

        <div className="section-header">

          <span className="section-num">01</span>

          <div>

            <h2 className="section-title">
              Upload Resumes
            </h2>

            <p className="section-sub">
              PDF or DOCX · Multiple files supported
            </p>

          </div>
        </div>

        <div
          className={`drop-zone ${
            dragging ? "drop-zone--active" : ""
          } ${files.length ? "drop-zone--has-files" : ""}`}

          onDragOver={(e) => {

            e.preventDefault();

            setDragging(true);
          }}

          onDragLeave={() => setDragging(false)}

          onDrop={onDrop}

          onClick={() => fileRef.current.click()}
        >

          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}

            onChange={(e) =>
              addFiles(e.target.files)
            }
          />

          {files.length === 0 ? (

            <div className="drop-idle">

              <div className="drop-icon">📄</div>

              <p className="drop-title">
                Drop resumes here
              </p>

              <p className="drop-hint">
                or click to browse files
              </p>

            </div>

          ) : (

            <div className="drop-files">

              <p className="files-count">

                {files.length} file
                {files.length > 1 ? "s" : ""}
                {" "}ready

              </p>

              <div className="file-list">

                {files.map((f) => (

                  <div
                    key={f.name}
                    className="file-chip"
                  >

                    <span className="file-icon">
                      📎
                    </span>

                    <span className="file-name">
                      {f.name}
                    </span>

                    <button
                      className="file-remove"

                      onClick={(e) => {

                        e.stopPropagation();

                        removeFile(f.name);
                      }}
                    >
                      ×
                    </button>

                  </div>
                ))}
              </div>

              <p className="add-more-hint">
                Click or drop to add more
              </p>

            </div>
          )}
        </div>
      </section>


      {/* Job Description */}
      <section className="panel-section">

        <div className="section-header">

          <span className="section-num">02</span>

          <div>

            <h2 className="section-title">
              Job Description
            </h2>

            <p className="section-sub">
              Paste the full JD for accurate matching
            </p>

          </div>
        </div>

        <div className="jd-area">

          <textarea
            className="jd-textarea"

            placeholder="Paste the job description here — skills, requirements, responsibilities..."

            value={jobDesc}

            onChange={(e) =>
              setJobDesc(e.target.value)
            }

            rows={8}
          />

          <div className="jd-footer">

            <span className="char-count">
              {jobDesc.length} chars
            </span>

            <button
              className="sample-btn"

              onClick={() =>
                setJobDesc(SAMPLE_JD)
              }
            >
              Load Sample JD
            </button>

          </div>
        </div>
      </section>


      {/* Analyze Button */}
      <button
        className={`analyze-btn ${
          loading ? "analyzing" : ""
        }`}

        onClick={analyze}

        disabled={
          loading ||
          !files.length ||
          !jobDesc.trim()
        }
      >

        {loading ? (

          <div className="analyze-progress">

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span>
              Analyzing resumes...
              {Math.floor(progress)}%
            </span>

          </div>

        ) : (

          <>

            <span>⚡</span>

            <span>

              Analyze{" "}

              {files.length > 0
                ? `${files.length} Resume${
                    files.length > 1 ? "s" : ""
                  }`
                : "Resumes"}

            </span>
          </>
        )}
      </button>

    </div>
  );
}