<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Deal;
use App\Models\Proposal;
use App\Models\ProposalFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProposalController extends Controller
{
    public function index(Client $client)
    {
        $proposals = $client->proposals()->with('deal:id,type,stage')->withCount('files')->latest()->get();

        return inertia('CRM/Proposals/Index', [
            'client' => $client,
            'proposals' => $proposals,
        ]);
    }

    public function create(Client $client)
    {
        $deals = $client->deals()->orderBy('created_at', 'desc')->get(['id', 'type', 'stage', 'created_at']);
        $openDeal = $deals->first(fn ($d) => in_array($d->stage, Deal::OPEN_STAGES));

        return inertia('CRM/Proposals/Create', [
            'client' => $client,
            'deals' => $deals,
            'openDealId' => $openDeal?->id,
        ]);
    }

    public function store(Request $request, Client $client)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'status' => 'required|in:draft,sent,accepted,rejected',
            'deal_id' => ['nullable', Rule::exists('deals', 'id')->where('client_id', $client->id)],
        ]);

        $validated['client_id'] = $client->id;
        $validated['created_by'] = $request->user()->id;

        // No deal explicitly chosen? Auto-attach whichever deal is currently
        // open for this client, same convention as Proforma::store.
        if (empty($validated['deal_id'])) {
            $validated['deal_id'] = $client->deals()
                ->whereIn('stage', Deal::OPEN_STAGES)
                ->latest()
                ->value('id');
        }

        $proposal = Proposal::create($validated);

        return redirect()->route('crm.proposals.show', [$client->id, $proposal->id])
            ->with('success', 'Proposal created successfully');
    }

    public function show(Client $client, Proposal $proposal)
    {
        abort_unless($proposal->client_id === $client->id, 404);

        $proposal->load(['deal:id,type,stage', 'files', 'createdBy:id,name']);

        return inertia('CRM/Proposals/Show', [
            'client' => $client,
            'proposal' => $proposal,
        ]);
    }

    public function edit(Client $client, Proposal $proposal)
    {
        abort_unless($proposal->client_id === $client->id, 404);

        $deals = $client->deals()->orderBy('created_at', 'desc')->get(['id', 'type', 'stage', 'created_at']);

        return inertia('CRM/Proposals/Edit', [
            'client' => $client,
            'proposal' => $proposal,
            'deals' => $deals,
        ]);
    }

    public function update(Request $request, Client $client, Proposal $proposal)
    {
        abort_unless($proposal->client_id === $client->id, 404);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'status' => 'required|in:draft,sent,accepted,rejected',
            'deal_id' => ['nullable', Rule::exists('deals', 'id')->where('client_id', $client->id)],
        ]);

        $proposal->update($validated);

        return redirect()->route('crm.proposals.show', [$client->id, $proposal->id])
            ->with('success', 'Proposal updated successfully');
    }

    public function destroy(Client $client, Proposal $proposal)
    {
        abort_unless($proposal->client_id === $client->id, 404);

        foreach ($proposal->files as $file) {
            Storage::disk('public')->delete($file->path);
        }

        $proposal->delete();

        return redirect()->route('crm.proposals.index', $client->id)
            ->with('success', 'Proposal removed successfully');
    }

    public function storeFile(Request $request, Client $client, Proposal $proposal)
    {
        abort_unless($proposal->client_id === $client->id, 404);

        $validated = $request->validate([
            'file' => ['required', 'file', ProposalFile::MIME_RULE, 'max:'.ProposalFile::MAX_KB],
        ]);

        ProposalFile::createFromUpload($validated['file'], [
            'proposal_id' => $proposal->id,
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'File uploaded successfully');
    }

    public function destroyFile(Client $client, Proposal $proposal, ProposalFile $file)
    {
        abort_unless($proposal->client_id === $client->id, 404);
        abort_unless($file->proposal_id === $proposal->id, 404);

        Storage::disk('public')->delete($file->path);
        $file->delete();

        return back()->with('success', 'File removed successfully');
    }
}
