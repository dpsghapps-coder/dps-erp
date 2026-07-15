<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Models\DecisionReview;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'decision_id' => 'required|exists:decisions,id',
            'rating' => 'required|integer|min:1|max:5',
            'notes' => 'nullable|string',
            'lessons_learned' => 'nullable|string',
        ]);

        DecisionReview::create([
            'decision_id' => $validated['decision_id'],
            'rating' => $validated['rating'],
            'notes' => $validated['notes'] ?? null,
            'lessons_learned' => $validated['lessons_learned'] ?? null,
            'reviewed_by' => auth()->id(),
        ]);

        return back()->with('success', 'Review submitted');
    }

    public function update(Request $request, DecisionReview $review)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'notes' => 'nullable|string',
            'lessons_learned' => 'nullable|string',
        ]);

        $review->update($validated);

        return back()->with('success', 'Review updated');
    }
}
