<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HukumanDisiplin;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HukumanDisiplinController extends Controller
{
    protected function getKepegawaianUnitId(Request $request): ?int
    {
        /** @var \App\Models\Akun|null $user */
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $roleUnit = RoleUnit::where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();

        return $roleUnit?->unit_id ?? $user->pegawai?->unit_id;
    }

    protected function formatHukuman(HukumanDisiplin $h): array
    {
        $mulai = $h->tanggal_mulai ? Carbon::parse($h->tanggal_mulai)->format('Y-m-d') : '';
        $berakhir = $h->tanggal_berakhir ? Carbon::parse($h->tanggal_berakhir)->format('Y-m-d') : '';
        $hariIni = now()->format('Y-m-d');

        $status = 'Aktif';
        if ($mulai && $hariIni < $mulai) {
            $status = 'Akan berlaku';
        } elseif ($berakhir && $hariIni > $berakhir) {
            $status = 'Berakhir';
        }

        $tingkatFormatted = ucfirst(strtolower($h->tingkat ?? 'ringan'));
        if (!in_array($tingkatFormatted, ['Ringan', 'Sedang', 'Berat'], true)) {
            $tingkatFormatted = 'Ringan';
        }

        $potonganMap = [
            'Ringan' => 0,
            'Sedang' => 25,
            'Berat' => 100,
        ];

        $tahun = $h->tanggal_mulai ? Carbon::parse($h->tanggal_mulai)->format('Y') : now()->format('Y');
        $kode = sprintf('HKD-%s-%03d', $tahun, $h->id);

        return [
            'id' => $kode,
            'raw_id' => $h->id,
            'NIP' => $h->NIP,
            'nip' => $h->NIP,
            'nama' => $h->pegawai?->nama ?? '-',
            'tingkat' => $tingkatFormatted,
            'potongan_p1' => $potonganMap[$tingkatFormatted] ?? 0,
            'jenis' => $h->jenis ?? ($tingkatFormatted === 'Sedang'
                ? 'Pemotongan tunjangan kinerja 25% selama 6 bulan'
                : ($tingkatFormatted === 'Berat' ? 'Pembebasan dari jabatan / Pemberhentian' : 'Teguran tertulis')),
            'sk' => $h->nomor_sk ?? '-',
            'nomor_sk' => $h->nomor_sk ?? '-',
            'mulai' => $mulai,
            'berakhir' => $berakhir,
            'tanggal_mulai' => $mulai,
            'tanggal_berakhir' => $berakhir,
            'uraian' => $h->uraian ?? '',
            'status' => $status,
        ];
    }

    /**
     * FR-06 (L2): Daftar catatan hukuman disiplin pegawai pada unit kerja
     */
    public function index(Request $request): JsonResponse
    {
        $unitId = $this->getKepegawaianUnitId($request);

        $query = HukumanDisiplin::with('pegawai');

        if ($unitId) {
            $query->whereHas('pegawai', fn ($q) => $q->where('unit_id', $unitId));
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('NIP', 'like', "%{$q}%")
                    ->orWhere('nomor_sk', 'like', "%{$q}%")
                    ->orWhere('jenis', 'like', "%{$q}%")
                    ->orWhereHas('pegawai', fn ($pq) => $pq->where('nama', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('tingkat') && $request->query('tingkat') !== 'semua') {
            $query->whereRaw('LOWER(tingkat) = ?', [strtolower($request->query('tingkat'))]);
        }

        $items = $query->orderByDesc('tanggal_mulai')->orderByDesc('id')->get()
            ->map(fn ($h) => $this->formatHukuman($h));

        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $statusFilter = $request->query('status');
            $items = $items->filter(fn ($item) => strtolower($item['status']) === strtolower($statusFilter))->values();
        }

        return response()->json([
            'total' => $items->count(),
            'statistik' => [
                'aktif' => $items->where('status', 'Aktif')->count(),
                'akan_berlaku' => $items->where('status', 'Akan berlaku')->count(),
                'berakhir' => $items->where('status', 'Berakhir')->count(),
            ],
            'data' => $items,
        ]);
    }

    /**
     * FR-06 (L2): Tambah catatan hukuman disiplin baru dengan validasi logis rentang tanggal
     */
    public function store(Request $request): JsonResponse
    {
        $nip = trim((string) ($request->input('NIP') ?? $request->input('nip') ?? ''));
        $mulai = $request->input('tanggal_mulai') ?? $request->input('mulai');
        $berakhir = $request->input('tanggal_berakhir') ?? $request->input('berakhir');
        $nomorSk = trim((string) ($request->input('nomor_sk') ?? $request->input('sk') ?? ''));

        $request->merge([
            'NIP' => $nip,
            'tanggal_mulai' => $mulai,
            'tanggal_berakhir' => $berakhir,
            'nomor_sk' => $nomorSk,
        ]);

        // Validasi eksplisit rentang tanggal tidak logis: tidak boleh lebih awal ATAU di tanggal yang sama (FR-06)
        if ($mulai && $berakhir && strtotime($berakhir) <= strtotime($mulai)) {
            return response()->json([
                'message' => 'Rentang tanggal tidak logis: Tanggal berakhir harus setelah tanggal mulai (tidak boleh tanggal yang sama atau lebih awal) (FR-06).',
                'errors' => [
                    'tanggal_berakhir' => ['Tanggal berakhir harus setelah tanggal mulai (tidak boleh berada pada tanggal yang sama atau lebih awal).'],
                ],
            ], 422);
        }

        $validated = $request->validate([
            'NIP' => ['required', 'string', 'exists:pegawai,NIP'],
            'tingkat' => ['required', 'string', function ($attr, $val, $fail) {
                if (!in_array(strtolower($val), ['ringan', 'sedang', 'berat'], true)) {
                    $fail('Tingkat hukuman harus Ringan, Sedang, atau Berat.');
                }
            }],
            'jenis' => ['nullable', 'string', 'max:255'],
            'nomor_sk' => ['required', 'string', 'max:150'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_berakhir' => ['required', 'date', 'after:tanggal_mulai'],
            'uraian' => ['nullable', 'string', 'max:2000'],
        ], [
            'NIP.required' => 'Pegawai wajib dipilih.',
            'NIP.exists' => 'NIP pegawai tidak ditemukan.',
            'nomor_sk.required' => 'Nomor SK hukuman wajib diisi.',
            'tanggal_mulai.required' => 'Tanggal mulai wajib diisi.',
            'tanggal_berakhir.required' => 'Tanggal berakhir wajib diisi.',
            'tanggal_berakhir.after' => 'Rentang tanggal tidak logis: Tanggal berakhir harus setelah tanggal mulai (tidak boleh tanggal yang sama atau lebih awal).',
        ]);

        $pegawai = Pegawai::where('NIP', $validated['NIP'])->firstOrFail();
        $unitId = $this->getKepegawaianUnitId($request);

        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        if (!$pegawai->aktif) {
            return response()->json([
                'message' => 'Tidak dapat mencatat hukuman disiplin baru untuk pegawai yang berstatus nonaktif.',
                'errors' => [
                    'NIP' => ['Pegawai berstatus nonaktif.'],
                ],
            ], 422);
        }

        // Cek duplikasi nomor SK pada pegawai yang sama
        if (HukumanDisiplin::where('NIP', $pegawai->NIP)->where('nomor_sk', $validated['nomor_sk'])->exists()) {
            return response()->json([
                'message' => 'Nomor SK hukuman disiplin tersebut sudah pernah dicatat untuk pegawai ini.',
                'errors' => [
                    'nomor_sk' => ['Nomor SK hukuman disiplin sudah terdaftar untuk pegawai ini.'],
                ],
            ], 422);
        }

        /** @var \App\Models\Akun|null $user */
        $user = $request->user();
        $tingkatDb = strtolower($validated['tingkat']);

        $hukuman = HukumanDisiplin::create([
            'NIP' => $validated['NIP'],
            'akun_id' => $user?->id,
            'tingkat' => $tingkatDb,
            'jenis' => $validated['jenis'] ?? ($tingkatDb === 'sedang'
                ? 'Pemotongan tunjangan kinerja 25% selama 6 bulan'
                : ($tingkatDb === 'berat' ? 'Pembebasan dari jabatan / Pemberhentian' : 'Teguran tertulis')),
            'nomor_sk' => $validated['nomor_sk'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_berakhir' => $validated['tanggal_berakhir'],
            'uraian' => isset($validated['uraian']) ? trim($validated['uraian']) : null,
        ]);

        $hukuman->load('pegawai');

        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $pegawai->unit_id,
            'aksi' => 'Catat Hukuman Disiplin',
            'objek_type' => 'HukumanDisiplin',
            'objek_id' => $hukuman->id,
            'nilai_sebelum' => null,
            'nilai_sesudah' => [
                'NIP' => $hukuman->NIP,
                'tingkat' => $hukuman->tingkat,
                'jenis' => $hukuman->jenis,
                'nomor_sk' => $hukuman->nomor_sk,
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_berakhir' => $validated['tanggal_berakhir'],
            ],
            'alasan' => $hukuman->uraian ?? 'Pencatatan hukuman disiplin pegawai',
            'dicatat_at' => now(),
        ]);

        return response()->json([
            'message' => 'Catatan hukuman disiplin berhasil disimpan.',
            'data' => $this->formatHukuman($hukuman),
        ], 201);
    }

    /**
     * FR-06 (L2): Ubah catatan hukuman disiplin dengan validasi logis rentang tanggal
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $numericId = is_numeric($id) ? (int) $id : (int) preg_replace('/^HKD-\d{4}-0*/', '', $id);
        $hukuman = HukumanDisiplin::with('pegawai')->findOrFail($numericId);

        $unitId = $this->getKepegawaianUnitId($request);
        if ($unitId && $hukuman->pegawai && $hukuman->pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Data hukuman ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $mulai = $request->input('tanggal_mulai') ?? $request->input('mulai') ?? $hukuman->tanggal_mulai?->format('Y-m-d');
        $berakhir = $request->input('tanggal_berakhir') ?? $request->input('berakhir') ?? $hukuman->tanggal_berakhir?->format('Y-m-d');
        $nomorSk = $request->input('nomor_sk') ?? $request->input('sk') ?? $hukuman->nomor_sk;

        $request->merge([
            'tanggal_mulai' => $mulai,
            'tanggal_berakhir' => $berakhir,
            'nomor_sk' => $nomorSk,
        ]);

        // Validasi eksplisit: tanggal berakhir wajib setelah tanggal mulai (tidak boleh sama atau lebih awal)
        if ($mulai && $berakhir && strtotime($berakhir) <= strtotime($mulai)) {
            return response()->json([
                'message' => 'Rentang tanggal tidak logis: Tanggal berakhir harus setelah tanggal mulai (tidak boleh tanggal yang sama atau lebih awal) (FR-06).',
                'errors' => [
                    'tanggal_berakhir' => ['Tanggal berakhir harus setelah tanggal mulai (tidak boleh berada pada tanggal yang sama atau lebih awal).'],
                ],
            ], 422);
        }

        $validated = $request->validate([
            'tingkat' => ['sometimes', 'required', 'string', function ($attr, $val, $fail) {
                if (!in_array(strtolower($val), ['ringan', 'sedang', 'berat'], true)) {
                    $fail('Tingkat hukuman harus Ringan, Sedang, atau Berat.');
                }
            }],
            'jenis' => ['nullable', 'string', 'max:255'],
            'nomor_sk' => ['sometimes', 'required', 'string', 'max:150'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_berakhir' => ['required', 'date', 'after:tanggal_mulai'],
            'uraian' => ['nullable', 'string', 'max:2000'],
        ], [
            'tanggal_berakhir.after' => 'Rentang tanggal tidak logis: Tanggal berakhir harus setelah tanggal mulai (tidak boleh tanggal yang sama atau lebih awal).',
        ]);

        if (isset($validated['nomor_sk'])) {
            $dupSk = HukumanDisiplin::where('NIP', $hukuman->NIP)
                ->where('nomor_sk', trim($validated['nomor_sk']))
                ->where('id', '!=', $hukuman->id)
                ->exists();
            if ($dupSk) {
                return response()->json([
                    'message' => 'Nomor SK hukuman disiplin tersebut sudah pernah dicatat untuk pegawai ini.',
                    'errors' => [
                        'nomor_sk' => ['Nomor SK hukuman disiplin sudah terdaftar untuk pegawai ini.'],
                    ],
                ], 422);
            }
        }

        $nilaiSebelum = [
            'tingkat' => $hukuman->tingkat,
            'jenis' => $hukuman->jenis,
            'nomor_sk' => $hukuman->nomor_sk,
            'tanggal_mulai' => $hukuman->tanggal_mulai?->format('Y-m-d'),
            'tanggal_berakhir' => $hukuman->tanggal_berakhir?->format('Y-m-d'),
            'uraian' => $hukuman->uraian,
        ];

        if (isset($validated['tingkat'])) {
            $hukuman->tingkat = strtolower($validated['tingkat']);
        }
        if (array_key_exists('jenis', $validated)) {
            $hukuman->jenis = $validated['jenis'];
        }
        if (isset($validated['nomor_sk'])) {
            $hukuman->nomor_sk = trim($validated['nomor_sk']);
        }
        $hukuman->tanggal_mulai = $validated['tanggal_mulai'];
        $hukuman->tanggal_berakhir = $validated['tanggal_berakhir'];
        if (array_key_exists('uraian', $validated)) {
            $hukuman->uraian = $validated['uraian'] ? trim($validated['uraian']) : null;
        }

        $hukuman->save();

        /** @var \App\Models\Akun|null $user */
        $user = $request->user();
        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $hukuman->pegawai?->unit_id ?? $unitId,
            'aksi' => 'Ubah Hukuman Disiplin',
            'objek_type' => 'HukumanDisiplin',
            'objek_id' => $hukuman->id,
            'nilai_sebelum' => $nilaiSebelum,
            'nilai_sesudah' => [
                'tingkat' => $hukuman->tingkat,
                'jenis' => $hukuman->jenis,
                'nomor_sk' => $hukuman->nomor_sk,
                'tanggal_mulai' => $hukuman->tanggal_mulai?->format('Y-m-d'),
                'tanggal_berakhir' => $hukuman->tanggal_berakhir?->format('Y-m-d'),
                'uraian' => $hukuman->uraian,
            ],
            'alasan' => 'Pembaruan data hukuman disiplin pegawai',
            'dicatat_at' => now(),
        ]);

        return response()->json([
            'message' => 'Perubahan hukuman disiplin berhasil disimpan.',
            'data' => $this->formatHukuman($hukuman),
        ]);
    }
}
