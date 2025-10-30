
# test_recommender.py
import unittest
import os
from recommender import Recommender, build_tree_and_index

class TestRecommender(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Build the index once for all tests."""
        cls.csv_path = 'spotify_songs.csv'
        if not os.path.exists('recommender_index'):
            print("Test setup: Building index for testing...")
            build_tree_and_index(cls.csv_path)
        cls.recommender = Recommender()

    def test_01_recommendation_with_valid_track_id(self):
        """Test 1: track_id exists -> returns 3 recs."""
        # Find a valid track_id from the dataset
        sample_track_id = self.recommender.song_df['track_id'].iloc[0]
        
        recommendations = self.recommender.get_recommendations(track_id=sample_track_id, top_k=3)
        
        print(f"\nTest 1 Recommendations for track_id '{sample_track_id}': {recommendations}")
        
        self.assertIsNotNone(recommendations)
        self.assertEqual(len(recommendations), 3)
        self.assertTrue(all('id' in rec for rec in recommendations))
        # Ensure the input track is not in the recommendations
        self.assertNotIn(sample_track_id, [rec['id'] for rec in recommendations])

    def test_02_recommendation_with_features(self):
        """Test 2: track_id missing but features provided -> returns 3 recs."""
        # Use features from a sample track
        sample_features = self.recommender.song_df.loc[10, self.recommender.scaler.feature_names_in_].to_dict()

        recommendations = self.recommender.get_recommendations(features=sample_features, top_k=3)
        
        print(f"\nTest 2 Recommendations for features: {recommendations}")

        self.assertIsNotNone(recommendations)
        self.assertEqual(len(recommendations), 3)
        self.assertTrue(all('title' in rec for rec in recommendations))

    def test_03_recommendation_with_neighbor_expansion(self):
        """Test 3: track_id in tiny leaf -> neighbor expansion used -> returns 3 recs."""
        # Find a leaf with few members to force neighbor expansion
        small_leaf_id = None
        for leaf_id, members in self.recommender.leaf_members.items():
            if 1 < len(members) < 4:
                small_leaf_id = leaf_id
                break
        
        if small_leaf_id is None:
            self.skipTest("Could not find a sufficiently small leaf to test neighbor expansion.")

        # Get a track from that small leaf
        df_index_in_small_leaf = self.recommender.leaf_members[small_leaf_id][0]
        track_id_in_small_leaf = self.recommender.song_df.loc[df_index_in_small_leaf, 'track_id']

        recommendations = self.recommender.get_recommendations(track_id=track_id_in_small_leaf, top_k=3)
        
        print(f"\nTest 3 Recommendations with neighbor expansion for track '{track_id_in_small_leaf}': {recommendations}")
        
        self.assertIsNotNone(recommendations)
        self.assertEqual(len(recommendations), 3)
        # Check that recommendations are not just from the same small leaf
        recs_in_small_leaf = [rec for rec in recommendations if self.recommender.index_to_leaf.get(self.recommender._find_track_by_id(rec['id'])) == small_leaf_id]
        self.assertLess(len(recs_in_small_leaf), 3, "Neighbor expansion should have pulled songs from other leaves.")


if __name__ == '__main__':
    unittest.main()

    