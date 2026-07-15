<?php

namespace Database\Seeders;

use App\Models\Decision;
use App\Models\DecisionActionItem;
use App\Models\DecisionCategory;
use App\Models\Meeting;
use App\Models\MeetingAgenda;
use App\Models\MeetingAttendee;
use App\Models\User;
use Illuminate\Database\Seeder;

class DecisionHubSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Finance', 'slug' => 'finance'],
            ['name' => 'Sales', 'slug' => 'sales'],
            ['name' => 'Production', 'slug' => 'production'],
            ['name' => 'Marketing', 'slug' => 'marketing'],
            ['name' => 'HR', 'slug' => 'hr'],
            ['name' => 'Procurement', 'slug' => 'procurement'],
            ['name' => 'Customer Service', 'slug' => 'customer-service'],
            ['name' => 'Operations', 'slug' => 'operations'],
        ];

        foreach ($categories as $cat) {
            DecisionCategory::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        $admin = User::where('email', 'admin@dps-erp.com')->first();
        if (! $admin) {
            return;
        }

        $users = User::where('id', '!=', $admin->id)->where('is_active', true)->take(4)->get();

        $meeting = Meeting::firstOrCreate(
            ['number' => 'MTG-2026-0001'],
            [
                'title' => 'Q3 Management Review Meeting',
                'type' => 'management',
                'date' => now()->addDays(3),
                'time' => '10:00:00',
                'venue' => 'Conference Room A',
                'organizer_id' => $admin->id,
                'chairperson_id' => $admin->id,
                'secretary_id' => $users->first()?->id,
                'notes' => 'Quarterly review of operations and strategic decisions.',
                'status' => 'scheduled',
                'created_by' => $admin->id,
            ]
        );

        if ($users->count()) {
            foreach ($users as $user) {
                MeetingAttendee::firstOrCreate(
                    ['meeting_id' => $meeting->id, 'user_id' => $user->id],
                    ['status' => 'present']
                );
            }
        }

        $agenda1 = MeetingAgenda::firstOrCreate(
            ['meeting_id' => $meeting->id, 'title' => 'Finance Report'],
            ['presenter_id' => $users->first()?->id, 'position' => 1]
        );

        $agenda2 = MeetingAgenda::firstOrCreate(
            ['meeting_id' => $meeting->id, 'title' => 'Equipment Purchase Proposal'],
            ['presenter_id' => $admin->id, 'position' => 2]
        );

        $prodCategory = DecisionCategory::where('slug', 'production')->first();

        $decision = Decision::firstOrCreate(
            ['number' => 'DEC-2026-0001'],
            [
                'title' => 'Purchase New Digital Printer',
                'reason' => 'Current printer is too slow and expensive to maintain.',
                'expected_benefits' => "Faster production\nBetter print quality\nReduced maintenance cost",
                'priority' => 'high',
                'budget' => 45000,
                'category_id' => $prodCategory?->id,
                'approved_by' => $admin->id,
                'meeting_id' => $meeting->id,
                'agenda_id' => $agenda2->id,
                'status' => 'approved',
                'created_by' => $admin->id,
            ]
        );

        DecisionActionItem::firstOrCreate(
            ['decision_id' => $decision->id, 'description' => 'Obtain quotations from suppliers'],
            [
                'assigned_to' => $users->first()?->id,
                'department' => 'Procurement',
                'due_date' => now()->addWeek(),
                'priority' => 'high',
                'progress' => 50,
                'status' => 'in_progress',
                'created_by' => $admin->id,
            ]
        );

        DecisionActionItem::firstOrCreate(
            ['decision_id' => $decision->id, 'description' => 'Compare suppliers and present recommendation'],
            [
                'assigned_to' => $admin->id,
                'department' => 'Management',
                'due_date' => now()->addWeeks(2),
                'priority' => 'medium',
                'progress' => 0,
                'status' => 'pending',
                'created_by' => $admin->id,
            ]
        );

        echo "Decision Hub seed data created successfully!\n";
    }
}
