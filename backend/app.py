from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import traceback
import numpy as np

# import resume analysis logic
from resume_engine import analyze_resumes


# CREATE FLASK APP
app = Flask(__name__)

# ENABLE CORS
CORS(app)


# CONVERT NUMPY TYPES
def convert_numpy(obj):

    if isinstance(obj, dict):
        return {
            k: convert_numpy(v)
            for k, v in obj.items()
        }

    elif isinstance(obj, list):
        return [
            convert_numpy(i)
            for i in obj
        ]

    elif isinstance(obj, tuple):
        return tuple(
            convert_numpy(i)
            for i in obj
        )

    elif isinstance(obj, np.generic):
        return obj.item()

    return obj


# TEST ROUTE
@app.route("/")
def home():

    return "Resume Screening API is running"


# ANALYZE ROUTE
@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        # GET JOB DESCRIPTION
        job_description = request.form.get(
            "job_description"
        )

        # GET RESUME FILES
        resumes = request.files.getlist(
            "resumes"
        )

        # VALIDATION
        if not job_description:

            return jsonify({
                "error": "Job description required"
            }), 400

        if not resumes:

            return jsonify({
                "error": "No resumes uploaded"
            }), 400

        print("Starting analysis...")

        # ANALYZE RESUMES
        results = analyze_resumes(
            job_description,
            resumes
        )

        # FIX NUMPY TYPES
        results = convert_numpy(results)

        print("Analysis completed")

        return jsonify(results)

    except Exception as e:

        print("\n========== FLASK ERROR ==========\n")

        traceback.print_exc()

        print("\n================================\n")

        return jsonify({

            "error": "Resume analysis failed",

            "details": str(e)

        }), 500


# RUN SERVER
if __name__ == "__main__":

    app.run(
        debug=False,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )