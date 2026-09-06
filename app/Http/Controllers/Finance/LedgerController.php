<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\JournalEntry;
use Illuminate\Http\Request;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $query = JournalEntry::with(['lines.account', 'createdBy', 'reverses', 'reversedBy']);

        if ($request->account_id) {
            $query->whereHas('lines', fn ($q) => $q->where('account_id', $request->account_id));
        }

        if ($request->from) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->to) {
            $query->whereDate('date', '<=', $request->to);
        }

        $entries = $query->orderBy('date', 'desc')->orderBy('id', 'desc')->paginate(25);

        return inertia('Finance/Ledger', [
            'entries' => $entries,
            'filters' => $request->only(['account_id', 'from', 'to']),
        ]);
    }

    public function show(JournalEntry $journalEntry)
    {
        $journalEntry->load(['lines.account', 'createdBy', 'reverses', 'reversedBy']);

        return inertia('Finance/LedgerShow', [
            'entry' => $journalEntry,
        ]);
    }
}
