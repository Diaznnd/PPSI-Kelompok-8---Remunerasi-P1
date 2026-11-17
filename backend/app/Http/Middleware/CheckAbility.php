<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAbility
{
    /**
     * Handle an incoming request.
     * 
     * Middleware untuk cek abilities spesifik
     * Usage: ->middleware('ability:pengajuan:create,pengajuan:update')
     */
    public function handle(Request $request, Closure $next, string ...$abilities): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        // Cek apakah user punya salah satu dari abilities yang diminta
        foreach ($abilities as $ability) {
            if ($user->tokenCan($ability)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Akses ditolak. Anda tidak memiliki permission yang diperlukan.',
            'required_abilities' => $abilities,
        ], 403);
    }
}
