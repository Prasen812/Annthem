from recommender import build_tree_and_index
import os

if __name__ == "__main__":
    csv_path = os.path.join('src', 'data', 'spotify_songs.csv')
    build_tree_and_index(csv_path)
