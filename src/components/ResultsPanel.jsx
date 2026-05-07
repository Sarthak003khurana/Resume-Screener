import "../styles/results.css";

export default function ResultsPanel({ results }) {

  if (!results || results.length === 0) {
    return (
      <div className="results-panel">
        <h2>No results yet</h2>

        <p>
          Upload resumes and analyze them to see results.
        </p>
      </div>
    );
  }

  return (

    <div className="results-panel">

      <h2>Candidate Results</h2>

      <div className="results-list">

        {results.map((candidate, index) => (

          <div
            key={index}
            className="result-card"
          >

            {/* NAME */}
            <h3 className="candidate-name">
              {candidate.name}
            </h3>

            {/* SCORES */}
            <div className="score-grid">

              <div className="score-box">
                <span>Total Score</span>
                <strong>
                  {candidate.score}/10
                </strong>
              </div>

              <div className="score-box">
                <span>Skill Score</span>
                <strong>
                  {candidate.skill_score}
                </strong>
              </div>

              <div className="score-box">
                <span>Semantic Score</span>
                <strong>
                  {candidate.semantic_score}
                </strong>
              </div>

            </div>

            {/* SKILLS */}
            <div className="skills-section">

              <h4>Matched Skills</h4>

              <div className="skills-wrap">

                {candidate.matched_skills.length > 0 ? (

                  candidate.matched_skills.map(
                    (skill, i) => (

                      <span
                        key={i}
                        className="skill-tag"
                      >
                        {skill}
                      </span>

                    )
                  )

                ) : (

                  <span className="no-skills">
                    No matching skills
                  </span>

                )}

              </div>

            </div>

            {/* AI ANALYSIS */}
            <div className="ai-analysis">

              <h4>AI Analysis</h4>

              <p>
                {candidate.ai_analysis}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}