<?php
namespace App\Models;

use App\Enums\Peran;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Akun extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'akun';
    protected $fillable = ['pegawai_id', 'username', 'password', 'peran', 'aktif'];
    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'peran' => Peran::class,
            'aktif' => 'boolean',
        ];
    }
}