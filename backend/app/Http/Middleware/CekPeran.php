<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CekPeran
{
    public function handle(Request $request, Closure $next, ...$peran)
    {
        $user = $request->user();
        if (!$user || !in_array($user->peran->value, $peran)) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }
        return $next($request);
    }
}