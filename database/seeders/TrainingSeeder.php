<?php

namespace Database\Seeders;

use App\Models\EmployeeTraining;
use App\Models\TrainingModule;
use App\Models\User;
use Illuminate\Database\Seeder;

class TrainingSeeder extends Seeder
{
    public function run(): void
    {
        $createdBy = User::whereHas('role', fn ($q) => $q->where('name', 'admin'))->value('id')
            ?? User::query()->value('id');

        if (! $createdBy) {
            return;
        }

        $users = User::where('is_active', true)->pluck('id')->all();

        $modules = [
            ['title' => 'Fire and Health Safety', 'category' => 'Safety'],
            ['title' => 'Data Security and File Management', 'category' => 'IT & Security'],
            ['title' => 'Basic Money Management', 'category' => 'Finance'],
            ['title' => 'Marketing Fundamentals', 'category' => 'Marketing'],
            ['title' => 'Customer Service Standards', 'category' => 'Customer Service'],
            ['title' => 'Quality Assurance and Proofing', 'category' => 'Quality'],
            ['title' => 'Software and RIP Optimization', 'category' => 'Technical'],
            ['title' => 'Hardware and Equipment Operation', 'category' => 'Technical'],
            ['title' => 'Control of Substances Hazardous to Health', 'category' => 'Safety'],
        ];

        foreach ($modules as $index => $moduleData) {
            $module = TrainingModule::firstOrCreate(
                ['title' => $moduleData['title']],
                [
                    'description' => 'Training content coming soon.',
                    'category' => $moduleData['category'],
                    'due_date' => now()->addDays(14 + $index * 3),
                    'passing_score' => 70,
                    'sort_order' => $index,
                    'is_active' => true,
                    'created_by' => $createdBy,
                ]
            );

            if ($module->quizQuestions()->count() === 0) {
                $questions = [
                    [
                        'question' => "[Sample question] Which of these best reflects good practice for {$moduleData['title']}?",
                        'options' => ['Option A (placeholder)', 'Option B (placeholder) — correct', 'Option C (placeholder)'],
                        'correct_option' => 1,
                    ],
                    [
                        'question' => '[Sample question] What should you do if you are unsure about a procedure covered in this training?',
                        'options' => ['Guess and continue', 'Ask a supervisor or refer to the guide', 'Ignore it'],
                        'correct_option' => 1,
                    ],
                    [
                        'question' => '[Sample question] How often should this training be reviewed?',
                        'options' => ['Never', 'Only when something goes wrong', 'Periodically, as scheduled by management'],
                        'correct_option' => 2,
                    ],
                ];

                foreach ($questions as $qIndex => $q) {
                    $module->quizQuestions()->create([
                        'question' => $q['question'],
                        'options' => $q['options'],
                        'correct_option' => $q['correct_option'],
                        'sort_order' => $qIndex,
                    ]);
                }
            }

            // Mock completion data: mark roughly half the active users as having
            // taken this training (mix of pass/fail) so admin views aren't empty.
            foreach ($users as $userIndex => $userId) {
                if ($userIndex % 2 !== $index % 2) {
                    continue;
                }

                $passed = ($userIndex + $index) % 3 !== 0;

                EmployeeTraining::firstOrCreate(
                    ['training_module_id' => $module->id, 'user_id' => $userId],
                    [
                        'status' => $passed ? 'completed' : 'failed',
                        'quiz_score' => $passed ? 80 + (($userIndex * 5) % 20) : 30 + (($userIndex * 7) % 30),
                        'attempts' => $passed ? 1 : 2,
                        'completed_at' => $passed ? now()->subDays($userIndex) : null,
                    ]
                );
            }
        }
    }
}
