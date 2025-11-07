<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    /**
     * Store or update a rating for a tool.
     */
    public function store(Request $request, $toolId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $tool = Tool::findOrFail($toolId);
        
        // Users cannot rate their own tools
        if ($tool->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot rate your own tool'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Create or update rating
            $rating = Rating::updateOrCreate(
                [
                    'tool_id' => $toolId,
                    'user_id' => $request->user()->id,
                ],
                [
                    'rating' => $request->rating,
                ]
            );

            // Update tool's average rating
            $this->updateToolRating($tool);

            // Create notification for tool owner (only for new ratings)
            if ($rating->wasRecentlyCreated) {
                \App\Services\NotificationService::createRatingNotification(
                    $tool,
                    $request->user(),
                    $request->rating
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Rating submitted successfully',
                'rating' => $rating,
                'tool' => $tool->fresh(['ratings']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to submit rating',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a rating.
     */
    public function destroy($ratingId)
    {
        $rating = Rating::findOrFail($ratingId);

        // Only the rating owner can delete it
        if ($rating->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $tool = $rating->tool;
            $rating->delete();

            // Update tool's average rating
            $this->updateToolRating($tool);

            DB::commit();

            return response()->json([
                'message' => 'Rating deleted successfully',
                'tool' => $tool->fresh(['ratings']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete rating',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's rating for a specific tool.
     */
    public function getUserRating($toolId)
    {
        $rating = Rating::where('tool_id', $toolId)
            ->where('user_id', auth()->id())
            ->first();

        return response()->json([
            'rating' => $rating,
        ]);
    }

    /**
     * Update tool's average rating and count.
     */
    private function updateToolRating(Tool $tool)
    {
        $stats = $tool->ratings()
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_ratings')
            ->first();

        $tool->update([
            'average_rating' => $stats->avg_rating ?? 0,
            'ratings_count' => $stats->total_ratings ?? 0,
        ]);
    }
}
