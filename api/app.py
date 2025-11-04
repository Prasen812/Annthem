
# api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from rapidfuzz import process, fuzz
import pandas as pd
import threading

# Add backend/ to path for import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from spotify_songs_recommendation import MannrRecommender

app = Flask(__name__)
CORS(app)

csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/data/spotify_songs.csv'))

# Counter file for user additions
ADD_COUNTER_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../recommender_index', 'user_add_count.txt'))

# Per-user library (appends go here)
USER_LIBRARY_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/data/user_library.csv'))

# helper to increment and read counter
def _increment_add_count() -> int:
    os.makedirs(os.path.dirname(ADD_COUNTER_PATH), exist_ok=True)
    count = 0
    if os.path.exists(ADD_COUNTER_PATH):
        try:
            with open(ADD_COUNTER_PATH, 'r', encoding='utf-8') as f:
                count = int(f.read().strip() or 0)
        except Exception:
            count = 0
    count += 1
    with open(ADD_COUNTER_PATH, 'w', encoding='utf-8') as f:
        f.write(str(count))
    return count

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


@app.route('/api/add-song', methods=['POST'])
def add_song():
    """Add a song by fuzzy-searching the existing CSV and appending it to the CSV DB.
    Will trigger a full index rebuild every 3 additions.
    Payload: { "query": "song name or artist - title" }
    """
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' in payload"}), 400
    query = data['query'].strip()
    if not query:
        return jsonify({"error": "Empty query"}), 400

    # Load CSV and search for best match on track_name and artist
    try:
        df = pd.read_csv(csv_path, encoding='latin1')
    except Exception as e:
        print("Error reading CSV in add_song:", e)
        return jsonify({"error": "Could not read song DB"}), 500

    # prepare candidate strings
    def make_label(row):
        name = str(row.get('track_name', ''))
        artist = str(row.get('artist', '')) if 'artist' in row else ''
        return f"{name} - {artist}" if artist else name

    candidates = df.apply(make_label, axis=1).tolist()
    if not candidates:
        return jsonify({"error": "No candidates in CSV"}), 500

    match = process.extractOne(query, candidates, scorer=fuzz.token_sort_ratio)
    if not match:
        return jsonify({"error": "No match found"}), 404
    label, score, idx = match
    # threshold can be tuned
    if score < 60:
        return jsonify({"error": "No sufficiently similar match found", "score": score}), 404

    row = df.iloc[idx]
    track_id = row.get('track_id') if 'track_id' in row else None
    track_name = row.get('track_name') if 'track_name' in row else None
    if track_id is None or pd.isna(track_id) or track_name is None or pd.isna(track_name):
        return jsonify({"error": "Matched row lacks required track_id/track_name"}), 500

    # Check if already present in user library (avoid duplicate there)
    try:
        if os.path.exists(USER_LIBRARY_PATH):
            user_df = pd.read_csv(USER_LIBRARY_PATH, encoding='latin1')
        else:
            user_df = pd.DataFrame(columns=df.columns)
    except Exception as e:
        print("Could not read user library, proceeding to create new one:", e)
        user_df = pd.DataFrame(columns=df.columns)

    if 'track_id' in user_df.columns and track_id in user_df['track_id'].values:
        return jsonify({"message": "Track already in user library", "track_id": track_id, "track_name": track_name, "score": int(score)})

    # Append row to user library CSV
    try:
        pd.DataFrame([row]).to_csv(USER_LIBRARY_PATH, mode='a', header=not os.path.exists(USER_LIBRARY_PATH), index=False, encoding='latin1')
    except Exception as e:
        print("Failed to append to user library CSV:", e)
        return jsonify({"error": "Failed to append to user library"}), 500

    # increment counter and rebuild index every 3 additions
    try:
        count = _increment_add_count()
    except Exception as e:
        print("Failed to update add counter:", e)
        count = -1

    # Rebuild index on multiples of 3 — do in background thread to avoid blocking long requests
    if count > 0 and count % 3 == 0:
        try:
            # import build function from top-level recommender module
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
            import recommender as recmod

            # create a merged CSV combining master + user library so the index covers both
            merged_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../recommender_index/merged_songs.csv'))
            try:
                if os.path.exists(USER_LIBRARY_PATH):
                    master = pd.read_csv(csv_path, encoding='latin1')
                    userlib = pd.read_csv(USER_LIBRARY_PATH, encoding='latin1')
                    merged = pd.concat([master, userlib], ignore_index=True)
                else:
                    merged = pd.read_csv(csv_path, encoding='latin1')
                os.makedirs(os.path.dirname(merged_path), exist_ok=True)
                merged.to_csv(merged_path, index=False, encoding='latin1')
            except Exception as e:
                print("Failed to create merged CSV:", e)
                merged_path = csv_path

            def _rebuild():
                try:
                    recmod.build_tree_and_index(merged_path)
                except Exception as e:
                    print("Background rebuild failed:", e)

            t = threading.Thread(target=_rebuild, daemon=True)
            t.start()
        except Exception as e:
            print("Failed to start rebuild thread:", e)

    return jsonify({"message": "Track added to DB and library", "track_id": track_id, "track_name": track_name, "score": int(score), "add_count": count})

if __name__ == '__main__':
    # Use port 5001 to avoid conflict with Next.js dev server
    app.run(debug=True, port=5001)

    