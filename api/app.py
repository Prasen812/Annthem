
# api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add backend/ to path for import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from spotify_songs_recommendation import MannrRecommender

app = Flask(__name__)
CORS(app)

csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/data/spotify_songs.csv'))

# Load the recommender index at startup
try:
    recommender_instance = MannrRecommender(csv_path)
except Exception as e:
    print("FATAL: Could not initialize mannr recommender.", e)
    recommender_instance = None

@app.route('/api/recommend', methods=['POST'])
def recommend():
    if recommender_instance is None:
        return jsonify({"error": "Recommender service is not available. Please build the index."}), 503
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400
    track_id = data.get('track_id')
    top_k = data.get('top_k', 3)
    if not track_id:
        return jsonify({"error": "'track_id' must be provided"}), 400
    try:
        recommendations = recommender_instance.get_recommendations(track_id, top_k=top_k)
        if not recommendations:
            return jsonify({"message": "No recommendations found.", "recommendations": []})
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error during recommendation: {e}")
        return jsonify({"error": "An internal error occurred."}), 500

if __name__ == '__main__':
    # Use port 5001 to avoid conflict with Next.js dev server
    app.run(debug=True, port=5001)

    