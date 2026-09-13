<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\TrainingModule;
use App\Models\User;
use Illuminate\Http\Request;

class TrainingController extends Controller
{
    public function index()
    {
        $modules = TrainingModule::with(['employeeTrainings' => fn ($q) => $q->where('status', 'completed')])
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        $activeEmployeeCount = User::where('is_active', true)->count();

        $modules = $modules->map(function (TrainingModule $module) use ($activeEmployeeCount) {
            $module->completed_count = $module->employeeTrainings->count();
            $module->active_employee_count = $activeEmployeeCount;

            return $module;
        });

        return inertia('HRM/Training/Index', [
            'modules' => $modules,
        ]);
    }

    public function create()
    {
        return inertia('HRM/Training/Create');
    }

    public function store(Request $request)
    {
        $validated = $this->validateModule($request);

        $module = TrainingModule::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'video_url' => $validated['video_url'] ?? null,
            'category' => $validated['category'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'passing_score' => $validated['passing_score'],
            'is_active' => $validated['is_active'],
            'created_by' => auth()->id(),
        ]);

        foreach ($validated['questions'] as $index => $q) {
            $module->quizQuestions()->create([
                'question' => $q['question'],
                'options' => $q['options'],
                'correct_option' => $q['correct_option'],
                'sort_order' => $index,
            ]);
        }

        return redirect()->route('hrm.training.show', $module)->with('success', 'Training module created');
    }

    public function show(TrainingModule $trainingModule)
    {
        $trainingModule->load('quizQuestions');

        $employees = User::where('is_active', true)
            ->with(['employeeTrainings' => fn ($q) => $q->where('training_module_id', $trainingModule->id)])
            ->orderBy('name')
            ->get()
            ->map(function (User $user) use ($trainingModule) {
                $record = $user->employeeTrainings->firstWhere('training_module_id', $trainingModule->id);

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'status' => $record->status ?? 'not_started',
                    'quiz_score' => $record->quiz_score ?? null,
                    'attempts' => $record->attempts ?? 0,
                    'completed_at' => $record->completed_at ?? null,
                ];
            });

        return inertia('HRM/Training/Show', [
            'module' => $trainingModule,
            'employees' => $employees,
        ]);
    }

    public function edit(TrainingModule $trainingModule)
    {
        $trainingModule->load('quizQuestions');

        return inertia('HRM/Training/Edit', [
            'module' => $trainingModule,
        ]);
    }

    public function update(Request $request, TrainingModule $trainingModule)
    {
        $validated = $this->validateModule($request);

        $trainingModule->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'video_url' => $validated['video_url'] ?? null,
            'category' => $validated['category'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'passing_score' => $validated['passing_score'],
            'is_active' => $validated['is_active'],
        ]);

        $trainingModule->quizQuestions()->delete();
        foreach ($validated['questions'] as $index => $q) {
            $trainingModule->quizQuestions()->create([
                'question' => $q['question'],
                'options' => $q['options'],
                'correct_option' => $q['correct_option'],
                'sort_order' => $index,
            ]);
        }

        return redirect()->route('hrm.training.show', $trainingModule)->with('success', 'Training module updated');
    }

    public function destroy(TrainingModule $trainingModule)
    {
        $trainingModule->delete();

        return redirect()->route('hrm.training.index')->with('success', 'Training module deleted');
    }

    private function validateModule(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'nullable|url|max:500',
            'category' => 'nullable|string|max:100',
            'due_date' => 'nullable|date',
            'passing_score' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.options' => 'required|array|min:2',
            'questions.*.options.*' => 'required|string|max:255',
            'questions.*.correct_option' => 'required|integer|min:0',
        ]);
    }
}
