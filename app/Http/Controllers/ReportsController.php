<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return inertia('Reports', [
            'ordersReports' => null,
            'productionReports' => null,
        ]);
    }
}
