<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'is_active',
        'employee_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Both derive from the employee relation (avatar and department live on
    // employees, not users -- see the 2026_07_17_000003 migration). Appending
    // them keeps `user.avatar` / `user.department` working transparently
    // anywhere a User is JSON-serialized, matching pre-migration behavior.
    protected $appends = [
        'avatar',
        'department',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    protected static function booted(): void
    {
        static::saved(function (User $user) {
            if ($user->wasChanged('email') && $user->employee && $user->employee->email !== $user->email) {
                $user->employee->updateQuietly(['email' => $user->email]);
            }
        });
    }

    public function getDepartmentAttribute(): ?string
    {
        return $this->employee?->department?->name;
    }

    public function getAvatarAttribute(): ?string
    {
        return $this->employee?->avatar;
    }

    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function hasPermission(string $permissionName): bool
    {
        if ($this->hasRole('admin')) {
            return true;
        }

        return $this->role && $this->role->permissions->contains('name', $permissionName);
    }

    public function hasAnyPermission(array $permissionNames): bool
    {
        if ($this->hasRole('admin')) {
            return true;
        }

        return $this->role && $this->role->permissions->contains(fn ($p) => in_array($p->name, $permissionNames));
    }

    public function getPermissionNames(): array
    {
        if (! $this->role) {
            return [];
        }

        if ($this->hasRole('admin')) {
            return ['*'];
        }

        return $this->role->permissions->pluck('name')->toArray();
    }

    public function productionJobs(): HasMany
    {
        return $this->hasMany(ProductionJob::class, 'assigned_to');
    }

    public function jobStatusHistory(): HasMany
    {
        return $this->hasMany(JobStatusHistory::class, 'changed_by');
    }

    public function assignedTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignees')
            ->withPivot(['status', 'completed_at'])
            ->withTimestamps();
    }
}
