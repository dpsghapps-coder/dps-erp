<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class ChatSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all()->keyBy('email');
        if ($users->count() < 2) {
            return;
        }

        $byName = fn (string $email) => $users->get($email) ?? $users->first();

        $admin = $byName('admin@dps-erp.com');
        $sarah = $byName('sarah.mensah@dps-erp.com');
        $john = $byName('john.darko@dps-erp.com');
        $fatima = $byName('fatima.ibrahim@dps-erp.com');
        $kofi = $byName('kofi.asante@dps-erp.com');
        $ama = $byName('ama.osei@dps-erp.com');

        // DM: Admin <-> Sarah
        $this->createDm($admin, $sarah, [
            [$admin, 'Hi Sarah, how is the Kente Shirt order coming along?'],
            [$sarah, 'Going well! **Cutting** is done, moving to sewing today.'],
            [$admin, 'Great, keep me posted.'],
        ]);

        // DM: John <-> Fatima
        $this->createDm($john, $fatima, [
            [$fatima, 'Can you review the purchase request for the new fabric batch?'],
            [$john, 'Sure, sending it back with comments by EOD.'],
        ]);

        // DM: Kofi <-> Ama
        $this->createDm($kofi, $ama, [
            [$ama, 'The client asked for a rush delivery on their embroidery order.'],
            [$kofi, "I'll check with production and get back to you."],
            [$ama, 'Thanks!'],
        ]);

        // Group: Production Team
        $members = [$admin, $sarah, $john, $fatima, $kofi, $ama];
        $group = Conversation::create(['type' => 'group', 'name' => 'Production Team', 'created_by' => $admin->id]);

        foreach ($members as $i => $member) {
            $group->participants()->create([
                'user_id' => $member->id,
                'role' => $member->id === $admin->id ? 'admin' : 'member',
                'last_read_at' => $i % 2 === 0 ? now() : now()->subHours(6),
            ]);
        }

        Message::create([
            'conversation_id' => $group->id,
            'user_id' => $admin->id,
            'content' => 'Admin created the group and added Sarah, John, Fatima, Kofi, and Ama.',
            'type' => 'system',
        ]);

        $groupMessages = [
            [$admin, 'Morning team — production board review at 10am.'],
            [$sarah, 'Noted, I have 3 jobs to move to QC before then.'],
            [$john, 'Procurement update: fabric restock arrives tomorrow.'],
            [$fatima, 'Thanks John, that unblocks the polo shirt order.'],
            [$kofi, 'Studio shoot for the new collection is booked for Thursday.'],
            [$ama, 'Will prep the client follow-up list for that.'],
            [$admin, 'Sounds good, thanks everyone.'],
        ];

        $pinnedIndex = 2;
        $deletedIndex = 4;

        foreach ($groupMessages as $i => [$sender, $content]) {
            Message::create([
                'conversation_id' => $group->id,
                'user_id' => $sender->id,
                'content' => $i === $deletedIndex ? 'This message has been deleted.' : $content,
                'type' => 'text',
                'is_deleted' => $i === $deletedIndex,
                'is_pinned' => $i === $pinnedIndex,
                'pinned_at' => $i === $pinnedIndex ? now() : null,
                'read_at' => $i < 5 ? now() : null,
            ]);
        }
    }

    private function createDm(User $a, User $b, array $messages): void
    {
        $conversation = Conversation::create(['type' => 'dm', 'created_by' => $a->id]);

        $conversation->participants()->create(['user_id' => $a->id, 'role' => 'admin', 'last_read_at' => now()]);
        $conversation->participants()->create(['user_id' => $b->id, 'role' => 'member', 'last_read_at' => now()->subHour()]);

        foreach ($messages as [$sender, $content]) {
            Message::create([
                'conversation_id' => $conversation->id,
                'user_id' => $sender->id,
                'content' => $content,
                'type' => 'text',
                'read_at' => now(),
            ]);
        }
    }
}
