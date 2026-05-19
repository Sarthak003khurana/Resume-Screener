import { useEffect, useState } from "react";

import { auth, db } from "../firebase";

import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import "../styles/pastscreenings.css";


export default function PastScreenings() {

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    loadHistory();

  }, []);


  const loadHistory = async () => {

    try {

      const user = auth.currentUser;

      if (!user) {

        setLoading(false);

        return;
      }

      // FIRESTORE QUERY
      const q = query(

        collection(db, "screening_history"),

        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()
      }));


      // SORT LATEST FIRST
      data.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      setHistory(data);

    } catch (err) {

      console.log(
        "History Error:",
        err
      );

    } finally {

      setLoading(false);
    }
  };


  // LOADING STATE
  if (loading) {

    return (

      <div className="past-screenings-page">

        <h1>Past Screenings</h1>

        <p>Loading screenings...</p>

      </div>
    );
  }


  return (

    <div className="past-screenings-page">

      {/* HEADER */}
      <div className="page-header">

        <h1>Past Screenings</h1>

        <p>
          View all previously analyzed resumes
        </p>

      </div>


      {/* EMPTY STATE */}
      {

        history.length === 0 ? (

          <div className="empty-history">

            <p>
              No screening history found.
            </p>

          </div>

        ) : (

          history.map((item, index) => (

            <div
              key={index}
              className="screening-card"
            >

              {/* TOP */}
              <div className="screening-top">

                <h2>

                  Screening #{index + 1}

                </h2>

                <span className="screening-date">

                  {

                    new Date(
                      item.createdAt
                    ).toLocaleString()

                  }

                </span>

              </div>


              {/* JOB DESCRIPTION */}
              <div className="jd-section">

                <h3>
                  Job Description
                </h3>

                <div className="jd-preview">

                  {item.jobDescription}

                </div>

              </div>


              {/* CANDIDATES */}
              <div className="candidate-section">

                <h3>

                  Candidates Analyzed (
                  {item.results?.length || 0}
                  )

                </h3>


                <div className="candidate-grid">

                  {

                    item.results?.map(
                      (candidate, i) => (

                        <div
                          key={i}
                          className="candidate-card"
                        >

                          {/* HEADER */}
                          <div className="candidate-header">

                            <h4>

                              {candidate.name}

                            </h4>

                            <span className="candidate-score">

                              {candidate.score}/10

                            </span>

                          </div>


                          {/* DETAILS */}
                          <div className="candidate-details">

                            <p>

                              <strong>
                                Skill Score:
                              </strong>{" "}

                              {candidate.skill_score}

                            </p>

                            <p>

                              <strong>
                                Semantic Score:
                              </strong>{" "}

                              {candidate.semantic_score}

                            </p>

                          </div>


                          {/* SKILLS */}
                          <div className="skills-section">

                            <strong>
                              Matched Skills:
                            </strong>

                            <div className="skills-wrap">

                              {

                                candidate.matched_skills?.map(

                                  (skill, idx) => (

                                    <span
                                      key={idx}
                                      className="skill-tag"
                                    >

                                      {skill}

                                    </span>
                                  )
                                )
                              }

                            </div>

                          </div>


                          {/* AI ANALYSIS */}
                          <div className="ai-analysis">

                            <strong>
                              AI Analysis:
                            </strong>

                            <p>

                              {candidate.ai_analysis}

                            </p>

                          </div>

                        </div>
                      )
                    )
                  }

                </div>

              </div>

            </div>
          ))
        )
      }

    </div>
  );
}