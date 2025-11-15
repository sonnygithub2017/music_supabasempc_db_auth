import { supabase } from '@/utils/supabase';

/**
 * Get the like count for a specific track (from user_track_likes table)
 * @param trackId - The unique identifier of the track
 * @returns The like count (0 if track has no likes)
 */
export async function getTrackLikeCount(trackId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_track_likes')
      .select('*', { count: 'exact', head: true })
      .eq('track_id', trackId);

    if (error) {
      console.error('Error fetching like count:', error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error('Error fetching like count:', error);
    return 0;
  }
}

/**
 * Get like counts for multiple tracks in a single query (from user_track_likes table)
 * @param trackIds - Array of track IDs
 * @returns Map of trackId to likeCount
 */
export async function getTrackLikeCounts(trackIds: string[]): Promise<Map<string, number>> {
  const likeCountsMap = new Map<string, number>();

  if (trackIds.length === 0) {
    return likeCountsMap;
  }

  try {
    const { data, error } = await supabase
      .from('user_track_likes')
      .select('track_id')
      .in('track_id', trackIds);

    if (error) {
      console.error('Error fetching like counts:', error);
      // Return map with all zeros on error
      trackIds.forEach(id => likeCountsMap.set(id, 0));
      return likeCountsMap;
    }

    // Initialize all tracks with 0 likes
    trackIds.forEach(id => likeCountsMap.set(id, 0));

    // Count likes per track
    if (data) {
      data.forEach((row) => {
        const currentCount = likeCountsMap.get(row.track_id) ?? 0;
        likeCountsMap.set(row.track_id, currentCount + 1);
      });
    }

    return likeCountsMap;
  } catch (error) {
    console.error('Error fetching like counts:', error);
    // Return map with all zeros on error
    trackIds.forEach(id => likeCountsMap.set(id, 0));
    return likeCountsMap;
  }
}

/**
 * Toggle like for a track (requires authenticated user)
 * @param trackId - The unique identifier of the track
 * @param userId - The user ID (must be authenticated)
 * @param trackName - The name of the track (optional, for database records)
 * @param artistName - The name of the artist (optional, for database records)
 * @returns Object with isLiked boolean and new like count
 */
export async function toggleTrackLike(
  trackId: string,
  userId: string,
  trackName?: string,
  artistName?: string
): Promise<{ isLiked: boolean; likeCount: number }> {
  try {
    // Check if user already liked this track
    const { data: existingLike, error: checkError } = await supabase
      .from('user_track_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single();

    let isLiked = false;

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected if not liked
      console.error('Error checking existing like:', checkError);
      throw checkError;
    }

    if (existingLike) {
      // Unlike: Delete the like
      const { error: deleteError } = await supabase
        .from('user_track_likes')
        .delete()
        .eq('user_id', userId)
        .eq('track_id', trackId);

      if (deleteError) {
        console.error('Error deleting like:', deleteError);
        throw deleteError;
      }
      isLiked = false;
    } else {
      // Like: Insert new like
      const insertData: {
        user_id: string;
        track_id: string;
        track_name?: string;
        artist_name?: string;
      } = {
        user_id: userId,
        track_id: trackId,
      };

      if (trackName !== undefined) {
        insertData.track_name = trackName;
      }
      if (artistName !== undefined) {
        insertData.artist_name = artistName;
      }

      const { error: insertError } = await supabase
        .from('user_track_likes')
        .insert(insertData);

      if (insertError) {
        console.error('Error inserting like:', insertError);
        throw insertError;
      }
      isLiked = true;
    }

    // Get updated like count
    const likeCount = await getTrackLikeCount(trackId);

    return { isLiked, likeCount };
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Check if a track is liked by a specific user
 * @param trackId - The unique identifier of the track
 * @param userId - The user ID
 * @returns True if the track is liked by the user, false otherwise
 */
export async function isTrackLikedByUser(trackId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_track_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found, track is not liked
        return false;
      }
      console.error('Error checking if track is liked:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if track is liked:', error);
    return false;
  }
}

/**
 * Get all tracks liked by a user
 * @param userId - The user ID
 * @returns Array of liked track IDs
 */
export async function getUserLikedTracks(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_track_likes')
      .select('track_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user liked tracks:', error);
      return [];
    }

    return data?.map(row => row.track_id) ?? [];
  } catch (error) {
    console.error('Error fetching user liked tracks:', error);
    return [];
  }
}

/**
 * @deprecated Use toggleTrackLike instead. This function is kept for backward compatibility.
 * Increment like count for a track by 1 (anonymous likes - deprecated)
 */
export async function incrementTrackLike(
  trackId: string,
  trackName?: string,
  artistName?: string
): Promise<number> {
  console.warn('incrementTrackLike is deprecated. Use toggleTrackLike with authenticated users instead.');

  try {
    // First, get current like count
    const currentCount = await getTrackLikeCount(trackId);

    // Increment by 1
    const newCount = currentCount + 1;

    // Prepare upsert data
    const upsertData: {
      track_id: string;
      like_count: number;
      updated_at: string;
      track_name?: string;
      artist_name?: string;
    } = {
      track_id: trackId,
      like_count: newCount,
      updated_at: new Date().toISOString()
    };

    // Update track_name and artist_name if provided
    if (trackName !== undefined) {
      upsertData.track_name = trackName;
    }
    if (artistName !== undefined) {
      upsertData.artist_name = artistName;
    }

    // Use upsert to insert or update (old table for backward compatibility)
    const { data, error } = await supabase
      .from('track_likes')
      .upsert(upsertData, {
        onConflict: 'track_id'
      })
      .select('like_count')
      .single();

    if (error) {
      console.error('Error incrementing like:', error);
      throw error;
    }

    return data?.like_count ?? newCount;
  } catch (error) {
    console.error('Error incrementing like:', error);
    throw error;
  }
}

