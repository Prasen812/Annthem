
# api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the parent directory to the path to allow importing 'recommender'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from recommender import Recommender

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the recommender index at startup
try:
    recommender_instance = Recommender()
except FileNotFoundError:
    print("FATAL: Could not initialize recommender. Index files are missing.")
    recommender_instance = None

@app.route('/api/recommend', methods=['POST'])
def recommend():
    if recommender_instance is None:
        return jsonify({"error": "Recommender service is not available. Please build the index."}), 503

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    track_id = data.get('track_id')
    features = data.get('features')
    top_k = data.get('top_k', 3)
    
    if not track_id and not features:
        return jsonify({"error": "Either 'track_id' or 'features' must be provided"}), 400

    try:
        recommendations = recommender_instance.get_recommendations(
            track_id=track_id,
            features=features,
            top_k=top_k
        )

        if not recommendations:
            return jsonify({"message": "No recommendations found.", "recommendations": []})

        return jsonify({"recommendations": recommendations})

    except Exception as e:
        print(f"Error during recommendation: {e}")
        return jsonify({"error": "An internal error occurred."}), 500

if __name__ == '__main__':
    # Use port 5001 to avoid conflict with Next.js dev server
    app.run(debug=True, port=5001)

    