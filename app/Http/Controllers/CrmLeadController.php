<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class CrmLeadController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'all');

        $query = Client::with('contacts')->orderBy('created_at', 'desc');

        if ($filter === 'lead') {
            $query->where('status', 'lead');
        } elseif ($filter === 'prospect') {
            $query->where('status', 'prospect');
        }

        $clients = $query->paginate(25);
        $stats = [
            'total' => Client::whereIn('status', ['lead', 'prospect'])->count(),
            'leads' => Client::where('status', 'lead')->count(),
            'prospects' => Client::where('status', 'prospect')->count(),
        ];

        return inertia('CRM/Leads', [
            'clients' => $clients,
            'stats' => $stats,
            'currentFilter' => $filter,
        ]);
    }
}
