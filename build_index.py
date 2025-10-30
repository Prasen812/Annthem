
# build_index.py
from recommender import build_tree_and_index

if __name__ == "__main__":
    # Path to your CSV file
    # Note: Ensure this CSV file is in the root directory or provide the correct path.
    csv_path = 'spotify_songs.csv'
    build_tree_and_index(csv_path)

    