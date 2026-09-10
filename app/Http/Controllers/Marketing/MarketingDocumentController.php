<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\MarketingDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MarketingDocumentController extends Controller
{
    public function index()
    {
        $documents = MarketingDocument::with('campaign')
            ->orderByDesc('created_at')
            ->get();

        $campaigns = Campaign::orderByDesc('start_date')->get(['id', 'number', 'title']);

        return inertia('Marketing/Documents/Index', [
            'documents' => $documents,
            'campaigns' => $campaigns,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'campaign_id' => 'nullable|exists:campaigns,id',
            'file' => ['required', 'file', MarketingDocument::MIME_RULE, 'max:'.MarketingDocument::MAX_KB],
        ]);

        MarketingDocument::createFromUpload($request->file('file'), [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'campaign_id' => $validated['campaign_id'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Document uploaded successfully');
    }

    public function update(Request $request, MarketingDocument $document)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'campaign_id' => 'nullable|exists:campaigns,id',
        ]);

        $document->update($validated);

        return back()->with('success', 'Document updated successfully');
    }

    public function destroy(MarketingDocument $document)
    {
        Storage::disk('public')->delete($document->path);
        $document->delete();

        return back()->with('success', 'Document removed successfully');
    }
}
