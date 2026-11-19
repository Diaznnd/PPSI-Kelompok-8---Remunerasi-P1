<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CekPeran
{
    public function handle(Request $request, Closure $next, ...$peran)
    {
        /** @var \App\Models\Akun|null $user */
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Akses ditolak: Silakan login terlebih dahulu.'], 401);
        }

        foreach ($peran as $p) {
            if ($user->hasRole((string) $p)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Akses ditolak: Anda tidak memiliki hak akses untuk peran ini (NFR-04).',
        ], 403);
    }
}
