<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jabatan extends Model
{
    use HasFactory;

    protected $table = 'jabatan';

    protected $fillable = [
        'kode_id',
        'nama_jabatan',
    ];

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class, 'kode_id');
    }

    public function usulanJabatan(): HasMany
    {
        return $this->hasMany(UsulanJabatan::class, 'jabatan_id');
    }
}
