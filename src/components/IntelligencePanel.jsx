import "../styles/intelligence.css";

export default function IntelligencePanel({ results }) {

  if (!results || results.length === 0) {

    return (

      <div className="intel-panel">

        <h3>AI Recommendation</h3>

        <p className="intel-empty">
          Upload resumes to see hiring recommendations.
        </p>

      </div>

    );
  }

  const topCandidate = results[0];

  // SCORES
  const totalScore = Number(
    topCandidate.score ?? 0
  );

  const skillScore = Number(
    topCandidate.skill_score ?? 0
  );

  const semanticScore = Number(
    topCandidate.semantic_score ?? 0
  );

  // SKILLS
  const skills = topCandidate.matched_skills ?? [];

  // FULL AI ANALYSIS
  const aiAnalysis =
    topCandidate.ai_analysis ??
    "No AI analysis available.";

  // SHORT AI POINTERS
  const shortPoints = aiAnalysis
    .split("\n")
    .filter(
      line =>
        line.trim() !== "" &&
        line.length > 15
    )
    .slice(0, 3);

  return (

    <div className="intel-panel">

      <h3>AI Recommendation</h3>

      <div className="intel-card">

        {/* BADGE */}
        <div className="intel-badge">
          Top Candidate
        </div>

        {/* NAME */}
        <h2 className="intel-name">
          {topCandidate.name || "Candidate"}
        </h2>

        {/* TOTAL SCORE */}
        <div className="intel-main-score">

          <span>
            Overall Match
          </span>

          <strong>
            {totalScore.toFixed(1)} / 10
          </strong>

        </div>

        {/* SCORE GRID */}
        <div className="intel-score-grid">

          <div className="intel-score-box">

            <span>Skill Score</span>

            <strong>
              {skillScore.toFixed(1)}
            </strong>

          </div>

          <div className="intel-score-box">

            <span>Semantic Score</span>

            <strong>
              {semanticScore.toFixed(1)}
            </strong>

          </div>

        </div>

        {/* SKILLS */}
        <div className="intel-section">

          <h4>Matched Skills</h4>

          <div className="intel-skills">

            {skills.length > 0 ? (

              skills.slice(0,8).map((skill,i)=>(

                <span
                  key={i}
                  className="intel-tag"
                >
                  {skill}
                </span>

              ))

            ) : (

              <span className="intel-empty-skills">
                No matching skills found
              </span>

            )}

          </div>

        </div>

        {/* SHORT AI SUMMARY */}
        <div className="intel-ai-box">

          <h4>Key Insights</h4>

          <ul className="intel-points">

            {shortPoints.map((point, index) => (

              <li key={index}>
                {point.replaceAll("*", "")}
              </li>

            ))}

          </ul>

        </div>

      </div>

    </div>
  );
}