import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import euclidean_distances
from mannr import mannr as mnr
from rapidfuzz import process, fuzz
import pickle
import os
from typing import List, Dict, Tuple, Optional, Any

FEATURE_COLS = [
    'acousticness', 'duration_ms', 'key', 'mode', 'instrumentalness',
    'track_popularity', 'speechiness', 'time_signature', 'valence',
    'liveness', 'loudness', 'danceability', 'tempo', 'energy'
]
INDEX_DIR = 'recommender_index'
SCALER_PATH = os.path.join(INDEX_DIR, 'scaler.pkl')
TREE_PATH = os.path.join(INDEX_DIR, 'ann_tree.pkl')
LEAF_MEMBERS_PATH = os.path.join(INDEX_DIR, 'leaf_members.pkl')
LEAF_CENTROIDS_PATH = os.path.join(INDEX_DIR, 'leaf_centroids.npy')
INDEX_TO_LEAF_PATH = os.path.join(INDEX_DIR, 'index_to_leaf.pkl')
SONG_DF_PATH = os.path.join(INDEX_DIR, 'songs_df.pkl')
SCALED_FEATURES_PATH = os.path.join(INDEX_DIR, 'scaled_features.npy')

def build_tree_and_index(df_path: str):
    print("Starting index build process...")
    os.makedirs(INDEX_DIR, exist_ok=True)
    # 1. Load and preprocess data
    try:
        song_df = pd.read_csv(df_path, encoding="latin1")
        song_df.columns = [c.lower().replace(' ', '_').replace('(s)', 's') for c in song_df.columns]
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return
    # Rename columns
    column_renames = {
        'danceability_%': 'danceability', 'valence_%': 'valence',
        'energy_%': 'energy', 'acousticness_%': 'acousticness',
        'instrumentalness_%': 'instrumentalness',
        'liveness_%': 'liveness', 'speechiness_%': 'speechiness',
        'artist_name': 'artist'
    }
    if 'artist_name' not in song_df.columns and 'artists_name' in song_df.columns:
        column_renames['artists_name'] = 'artist'
    song_df.rename(columns=column_renames, inplace=True)
    # Fill missing
    for col in ['danceability', 'valence', 'energy', 'acousticness', 'instrumentalness', 'liveness', 'speechiness']:
        if col in song_df.columns:
            song_df[col] = pd.to_numeric(song_df[col], errors='coerce')
            song_df[col] = song_df[col].fillna(song_df[col].median())
    if 'streams' in song_df.columns:
        song_df['streams'] = pd.to_numeric(song_df['streams'], errors='coerce').fillna(0)
        song_df['track_popularity'] = song_df['streams'].rank(pct=True) * 100
    else:
        song_df['track_popularity'] = 50.0
    if 'duration_ms' not in song_df.columns:
        song_df['duration_ms'] = 180000
    if 'time_signature' not in song_df.columns:
        song_df['time_signature'] = 4
    if 'loudness' not in song_df.columns:
        song_df['loudness'] = -5.0
    for col in FEATURE_COLS:
        if col not in song_df.columns:
            song_df[col] = 0.0
        else:
            song_df[col] = pd.to_numeric(song_df[col], errors='coerce').fillna(0)
    scaler = StandardScaler()
    existing_feature_cols = [col for col in FEATURE_COLS if col in song_df.columns]
    scaled_features = scaler.fit_transform(song_df[existing_feature_cols].values)
    print("Building ANN-tree with mannr ...")
    t = mnr.gen_ann_tree(song_df, existing_feature_cols, 15)
    leaves = mnr.find_leaves(t)
    print(f"Tree built with {len(leaves)} leaves.")
    leaf_members = {}
    leaf_centroids_list = []
    for leaf_idx, leaf in enumerate(leaves):
        members = list(leaf.data.index)
        leaf_members[leaf_idx] = members
        if members:
            centroid = scaled_features[members].mean(axis=0)
        else:
            centroid = np.zeros(scaled_features.shape[1])
        leaf_centroids_list.append(centroid)
    leaf_centroids = np.vstack(leaf_centroids_list) if leaf_centroids_list else np.zeros((0, len(existing_feature_cols)))
    index_to_leaf = {}
    for leaf_id, members in leaf_members.items():
        for member_index in members:
            index_to_leaf[member_index] = leaf_id
    with open(SCALER_PATH, 'wb') as f:
        pickle.dump(scaler, f)
    with open(TREE_PATH, 'wb') as f:
        pickle.dump(t, f)
    with open(LEAF_MEMBERS_PATH, 'wb') as f:
        pickle.dump(leaf_members, f)
    np.save(LEAF_CENTROIDS_PATH, leaf_centroids)
    with open(INDEX_TO_LEAF_PATH, 'wb') as f:
        pickle.dump(index_to_leaf, f)
    song_df.to_pickle(SONG_DF_PATH)
    np.save(SCALED_FEATURES_PATH, scaled_features)
    print("Index build complete. All artifacts saved.")

class Recommender:
    def __init__(self):
        self.song_df = None
        self.scaler = None
        self.t = None
        self.leaf_members = None
        self.leaf_centroids = None
        self.index_to_leaf = None
        self.scaled_features = None
        self.leaf_ids = []
        self._load_index()
    def _load_index(self):
        print("Loading recommendation index...")
        try:
            self.song_df = pd.read_pickle(SONG_DF_PATH)
            self.scaled_features = np.load(SCALED_FEATURES_PATH)
            with open(SCALER_PATH, 'rb') as f:
                self.scaler = pickle.load(f)
            with open(TREE_PATH, 'rb') as f:
                self.t = pickle.load(f)
            with open(LEAF_MEMBERS_PATH, 'rb') as f:
                self.leaf_members = pickle.load(f)
            self.leaf_centroids = np.load(LEAF_CENTROIDS_PATH)
            with open(INDEX_TO_LEAF_PATH, 'rb') as f:
                self.index_to_leaf = pickle.load(f)
            self.leaf_ids = list(self.leaf_members.keys())
            print("Index loaded successfully.")
        except FileNotFoundError:
            print("Error: Index files not found. Please run 'build_index.py' first.")
            raise
    def _find_track_by_id(self, track_id: str) -> Optional[int]:
        if 'track_id' not in self.song_df.columns:
            return None
        matches = self.song_df.index[self.song_df['track_id'] == track_id].tolist()
        if matches:
            return matches[0]
        return None
    def get_recommendations(
        self,
        track_id: Optional[str] = None,
        features: Optional[Dict[str, float]] = None,
        top_k: int = 3,
        blend_with_popularity: bool = True,
        alpha: float = 0.7
    ) -> List[Dict[str, Any]]:
        df_index = None
        input_vector_scaled = None
        if track_id:
            df_index = self._find_track_by_id(track_id)
            if df_index is not None:
                input_vector_scaled = self.scaled_features[df_index]
            else:
                print(f"Warning: Track with ID '{track_id}' not found.")
                return [] 
        elif features:
            feature_vector_list = [features.get(col, 0) for col in FEATURE_COLS]
            feature_vector = np.array(feature_vector_list).reshape(1, -1)
            input_vector_scaled = self.scaler.transform(feature_vector)[0]
        else:
            return []
        if input_vector_scaled is None:
            return []
        leaf_id = self.index_to_leaf.get(df_index) if df_index is not None else None
        candidate_indices = []
        if leaf_id is not None and self.leaf_members.get(leaf_id) and len(self.leaf_members.get(leaf_id, [])) >= top_k + 1:
            candidate_indices = self.leaf_members[leaf_id]
        else:
            # fallback, nearest leaf by centroid
            centroid_distances = euclidean_distances(input_vector_scaled.reshape(1,-1), self.leaf_centroids)[0]
            sorted_leaf_indices = np.argsort(centroid_distances)
            for leaf_idx in sorted_leaf_indices:
                sorted_leaf_id = self.leaf_ids[leaf_idx]
                candidate_indices.extend(self.leaf_members.get(sorted_leaf_id, []))
                if len(candidate_indices) >= top_k + 10:
                    break
        if df_index is not None and df_index in candidate_indices:
            candidate_indices = [idx for idx in candidate_indices if idx != df_index]
        if not candidate_indices:
            return []
        candidate_vectors = self.scaled_features[candidate_indices]
        distances = euclidean_distances(input_vector_scaled.reshape(1,-1), candidate_vectors)[0]
        results = []
        for i, original_index in enumerate(candidate_indices):
            row = self.song_df.loc[original_index]
            result_item = {
                "id": row.get('track_id', original_index),
                "title": row.get('track_name', 'Unknown'),
                "artist": row.get('artist', 'Unknown'),
                "distance": float(distances[i]),
                "popularity": row.get('track_popularity', 0)
            }
            results.append(result_item)
        results.sort(key=lambda x: x['distance'])
        if blend_with_popularity:
            max_dist = max(r['distance'] for r in results) if results else 1
            for r in results:
                dist_norm = r['distance'] / max_dist if max_dist > 0 else 0
                pop_norm = r['popularity'] / 100.0
                r['combined_score'] = alpha * dist_norm + (1 - alpha) * (1 - pop_norm)
            results.sort(key=lambda x: x['combined_score'])
        final_recommendations = []
        for r in results[:top_k]:
            final_recommendations.append({
                "id": r['id'],
                "title": r['title'],
                "artist": r['artist'],
                "spotify_id": r['id'],
                "youtube_id": "",
                "thumbnail": "",
                "distance": r['distance'],
                "combined_score": r.get('combined_score', r['distance'])
            })
        return final_recommendations
