<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'avatar',
        'role_id',
        'is_active',
        'department',
        'department_manager_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
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

    public function departmentManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'department_manager_id');
    }

    public function departmentStaff(): HasMany
    {
        return $this->hasMany(User::class, 'department_manager_id');
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

    public function assignedClients(): HasMany
    {
        return $this->hasMany(Client::class, 'assigned_to');
    }

    public function productionJobs(): HasMany
    {
        return $this->hasMany(ProductionJob::class, 'assigned_to');
    }

    public function jobStatusHistory(): HasMany
    {
        return $this->hasMany(JobStatusHistory::class, 'changed_by');
    }
}
