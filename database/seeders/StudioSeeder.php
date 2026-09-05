<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\StudioBooking;
use App\Models\StudioResource;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudioSeeder extends Seeder
{
    public function run(): void
    {
        // StudioResource lives in the same file as StudioBooking and isn't in the
        // composer classmap on its own; touching StudioBooking first forces that
        // file to load so StudioResource autoloads correctly.
        class_exists(StudioBooking::class);

        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $resourceDefs = [
            ['name' => 'Main Studio Room', 'type' => 'studio_room'],
            ['name' => 'Photography Room B', 'type' => 'studio_room'],
            ['name' => 'Canon EOS R5', 'type' => 'camera'],
            ['name' => 'Softbox Lighting Kit', 'type' => 'lighting'],
            ['name' => 'Product Display Props', 'type' => 'prop'],
            ['name' => 'Branded Delivery Van', 'type' => 'vehicle'],
        ];

        $resources = collect($resourceDefs)->map(fn ($r) => StudioResource::firstOrCreate(
            ['name' => $r['name']],
            ['type' => $r['type'], 'is_available' => true]
        ));

        $clients = Client::where('is_greylisted', false)->get();

        $bookings = [
            ['title' => 'Product Catalogue Shoot - Kente Line', 'status' => 'completed', 'start' => -10, 'hours' => 4],
            ['title' => 'Corporate Headshots - Tech Solutions Ghana', 'status' => 'completed', 'start' => -5, 'hours' => 3],
            ['title' => 'Brand Video - Social Media Ads', 'status' => 'in_progress', 'start' => 0, 'hours' => 6],
            ['title' => 'New Collection Lookbook Shoot', 'status' => 'confirmed', 'start' => 3, 'hours' => 5],
            ['title' => 'Client Testimonial Recording', 'status' => 'confirmed', 'start' => 6, 'hours' => 2],
            ['title' => 'Event Coverage - Trade Show Prep', 'status' => 'tentative', 'start' => 10, 'hours' => 8],
            ['title' => 'Seasonal Campaign Shoot', 'status' => 'cancelled', 'start' => -2, 'hours' => 4],
        ];

        foreach ($bookings as $i => $b) {
            $creator = $users[$i % $users->count()];
            $start = now()->addDays($b['start'])->setTime(9, 0);

            $booking = StudioBooking::create([
                'booking_reference' => StudioBooking::generateBookingReference(),
                'client_id' => $clients->isNotEmpty() ? $clients[$i % $clients->count()]->id : null,
                'title' => $b['title'],
                'description' => 'Studio session: '.$b['title'],
                'status' => $b['status'],
                'start_datetime' => $start,
                'end_datetime' => $start->copy()->addHours($b['hours']),
                'created_by' => $creator->id,
                'notes' => null,
            ]);

            $booking->resources()->attach($resources[$i % $resources->count()]->id);
            if ($i % 2 === 0) {
                $booking->resources()->attach($resources[($i + 2) % $resources->count()]->id);
            }

            $booking->crew()->attach($users[($i + 1) % $users->count()]->id, ['role_in_shoot' => 'Photographer']);
        }
    }
}
