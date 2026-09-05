<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;

class MarketingSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::all();
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $campaigns = [
            ['title' => 'New Year Print Promo', 'type' => 'social', 'status' => 'completed', 'start' => -60, 'end' => -30, 'budget' => 1500, 'actual' => 1420],
            ['title' => 'Corporate Branding Email Blast', 'type' => 'email', 'status' => 'completed', 'start' => -45, 'end' => -40, 'budget' => 300, 'actual' => 280],
            ['title' => 'Trade Show Booth - Accra Expo', 'type' => 'event', 'status' => 'completed', 'start' => -20, 'end' => -18, 'budget' => 4000, 'actual' => 4250],
            ['title' => 'Facebook Ads - Custom Apparel', 'type' => 'ad', 'status' => 'active', 'start' => -10, 'end' => 10, 'budget' => 800, 'actual' => 420],
            ['title' => 'Referral Discount Campaign', 'type' => 'other', 'status' => 'active', 'start' => -5, 'end' => 25, 'budget' => 500, 'actual' => 150],
            ['title' => 'Catalogue Reprint & Distribution', 'type' => 'print', 'status' => 'scheduled', 'start' => 5, 'end' => 15, 'budget' => 1200, 'actual' => null],
            ['title' => 'Instagram Product Showcase', 'type' => 'social', 'status' => 'scheduled', 'start' => 8, 'end' => 30, 'budget' => 350, 'actual' => null],
            ['title' => 'Client Appreciation Mailer', 'type' => 'email', 'status' => 'draft', 'start' => 20, 'end' => 25, 'budget' => 200, 'actual' => null],
            ['title' => 'Regional Sales Push - Kumasi', 'type' => 'other', 'status' => 'cancelled', 'start' => -15, 'end' => -1, 'budget' => 900, 'actual' => 120],
        ];

        foreach ($campaigns as $i => $c) {
            $creator = $users[$i % $users->count()];

            Campaign::create([
                'number' => Campaign::nextNumber(),
                'title' => $c['title'],
                'description' => 'Marketing campaign: '.$c['title'],
                'type' => $c['type'],
                'status' => $c['status'],
                'start_date' => now()->addDays($c['start'])->toDateString(),
                'end_date' => now()->addDays($c['end'])->toDateString(),
                'client_id' => $clients->isNotEmpty() && $i % 2 === 0 ? $clients[$i % $clients->count()]->id : null,
                'budget' => $c['budget'],
                'actual_cost' => $c['actual'],
                'assigned_to' => $users[($i + 1) % $users->count()]->id,
                'tags' => ['demo', $c['type']],
                'notes' => null,
                'created_by' => $creator->id,
            ]);
        }
    }
}
