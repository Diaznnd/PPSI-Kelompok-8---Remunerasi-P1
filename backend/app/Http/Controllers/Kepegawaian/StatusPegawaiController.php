<?php

namespace App\Http\Controllers\Kepegawaian;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Pegawai;
use App\Models\RoleUnit;
use App\Models\UsulanJabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class StatusPegawaiController extends Controller
{
    /**
     * Dapatkan RoleUnit aktif untuk pengguna Kepegawaian
     */
    protected function getKepegawaianRoleUnit(Request $request): ?RoleUnit
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        return RoleUnit::with('unitKerja')
            ->where('role_id', $user->id)
            ->where('peran', 'kepegawaian')
            ->where('aktif', true)
            ->first();
    }

    /**
     * Format data pegawai untuk respons API & kompatibilitas frontend
     */
    protected function formatPegawai(Pegawai $p): array
    {
        $persenP1 = 100;
        if ($p->status_tugas_belajar === 'tugas_belajar') {
            $persenP1 = 60;
        } elseif (in_array($p->status_kepegawaian, ['CPNS', 'CPT-PTNBH'])) {
            $persenP1 = 80;
        }

        // Ambil jabatan resmi yang sedang berlaku (status ditetapkan atau diverifikasi)
        $usulanResmi = UsulanJabatan::with('jabatan.grade')
            ->where('NIP', $p->NIP)
            ->whereIn('status', ['ditetapkan', 'diverifikasi', 'disetujui_verifikator'])
            ->orderByDesc('tanggal_berlaku')
            ->orderByDesc('id')
            ->first();

        $jabatanNama = $usulanResmi?->jabatan?->nama_jabatan;
        $kodeGrade = $usulanResmi?->jabatan?->grade?->kode_grade;
        $gradeAngka = $kodeGrade ? (int) preg_replace('/\D/', '', $kodeGrade) : 0;

        $jenisNormalized = $p->jenis === 'Tendik' ? 'Tenaga Kependidikan' : ($p->jenis ?? 'Dosen');

        return [
            'NIP' => $p->NIP,
            'nip' => $p->NIP,
            'nama' => $p->nama,
            'email' => $p->email ?? (strtolower(preg_replace('/[^a-zA-Z0-9]/', '.', explode(',', $p->nama)[0])) . '@unand.ac.id'),
            'jenis' => $jenisNormalized,
            'unit_id' => $p->unit_id,
            'unit_nama' => $p->unitKerja?->nama ?? '-',
            'status_kepegawaian' => $p->status_kepegawaian ?? 'PNS',
            'status' => $p->status_kepegawaian ?? 'PNS',
            'status_tugas_belajar' => $p->status_tugas_belajar ?? 'aktif',
            'persen_hak_p1' => $persenP1,
            'sk_tugas_belajar' => $p->sk_tugas_belajar,
            'tgl_mulai_tubel' => $p->tgl_mulai_tubel,
            'tgl_selesai_tubel' => $p->tgl_selesai_tubel,
            'pangkat_golongan' => $p->pangkat_golongan ?? 'III/a',
            'golongan' => $p->pangkat_golongan ?? 'III/a',
            'tmt' => $p->tmt ? Carbon::parse($p->tmt)->format('Y-m-d') : '',
            'npwp' => $p->npwp,
            'no_rekening' => $p->no_rekening,
            'aktif' => (bool) $p->aktif,
            'alasan_nonaktif' => $p->alasan_nonaktif,
            'alasanNonaktif' => $p->alasan_nonaktif,
            'jabatan' => $jabatanNama ? [
                'id' => $usulanResmi->jabatan->id,
                'nama' => $jabatanNama,
                'grade_nama' => $gradeAngka ?: $kodeGrade,
                'kode_grade' => $kodeGrade,
                'nilai_grade' => (float) ($usulanResmi->jabatan->grade?->nilai ?? 0),
            ] : null,
            'jabatan_nama' => $jabatanNama ?? '',
            'grade' => $gradeAngka,
        ];
    }

    /**
     * FR-03 (L1): Dapatkan daftar pegawai pada unit kerja kepegawaian (Isolasi Unit Kerja)
     */
    public function index(Request $request): JsonResponse
    {
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $request->user()?->pegawai?->unit_id;

        $query = Pegawai::with('unitKerja');

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('nama', 'like', "%{$q}%")
                    ->orWhere('NIP', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($request->filled('jenis') && $request->query('jenis') !== 'semua') {
            $jenis = $request->query('jenis');
            if ($jenis === 'Tenaga Kependidikan') {
                $query->whereIn('jenis', ['Tenaga Kependidikan', 'Tendik']);
            } else {
                $query->where('jenis', $jenis);
            }
        }

        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $query->where('status_kepegawaian', $request->query('status'));
        }

        if ($request->filled('aktif') && $request->query('aktif') !== 'semua') {
            $isAktif = $request->query('aktif') === 'aktif' || $request->query('aktif') === '1' || $request->query('aktif') === 'true';
            $query->where('aktif', $isAktif);
        }

        if ($request->filled('status_tugas_belajar')) {
            $query->where('status_tugas_belajar', $request->query('status_tugas_belajar'));
        }

        $pegawaiList = $query->orderBy('nama')->get()->map(fn($p) => $this->formatPegawai($p));

        return response()->json([
            'unit_kerja' => $roleUnit?->unitKerja?->nama ?? ($request->user()?->pegawai?->unitKerja?->nama ?? 'Fakultas Teknologi Informasi'),
            'total' => $pegawaiList->count(),
            'data' => $pegawaiList,
        ]);
    }

    /**
     * FR-03 (L1): Detail satu pegawai beserta riwayat jabatan, hukuman disiplin, dan presensi
     */
    public function show(Request $request, string $nip): JsonResponse
    {
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $request->user()?->pegawai?->unit_id;

        $pegawai = Pegawai::with(['unitKerja', 'usulanJabatan.jabatan.grade', 'hukumanDisiplin', 'presensiBulanan'])
            ->where('NIP', $nip)
            ->firstOrFail();

        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        return response()->json([
            'data' => $this->formatPegawai($pegawai),
        ]);
    }

    /**
     * FR-03 (L1): Tambah pegawai baru, tolak NIP ganda, dan tolak pengubahan jabatan/grade langsung
     */
    public function store(Request $request): JsonResponse
    {
        // FR-03: Jabatan dan grade tidak dapat diubah/diisi langsung melalui fitur Data Pegawai
        if ($request->filled('jabatan_id') || ($request->filled('jabatan') && $request->input('jabatan') !== '') || ($request->filled('grade') && (int) $request->input('grade') > 0)) {
            return response()->json([
                'message' => 'Jabatan dan grade tidak dapat ditetapkan atau diubah melalui fitur Data Pegawai, melainkan harus melalui fitur Usulan Perubahan Jabatan/Grade (FR-04).',
                'errors' => [
                    'jabatan' => ['Jabatan dan grade hanya dapat diajukan melalui fitur Usulan Perubahan Jabatan/Grade (FR-04).'],
                ],
            ], 422);
        }

        $nipInput = trim((string) ($request->input('NIP') ?? $request->input('nip') ?? ''));
        $emailInput = $request->filled('email') ? trim((string) $request->input('email')) : null;
        $request->merge([
            'NIP' => $nipInput,
            'email' => $emailInput,
        ]);

        // Cek NIP ganda secara eksplisit (FR-03: Tolak NIP ganda)
        if ($nipInput !== '' && Pegawai::where('NIP', $nipInput)->exists()) {
            return response()->json([
                'message' => 'NIP sudah terdaftar. Sistem menolak penambahan NIP ganda (FR-03).',
                'errors' => [
                    'NIP' => ['NIP sudah terdaftar pada sistem. NIP ganda ditolak.'],
                ],
            ], 422);
        }

        $validated = $request->validate([
            'NIP' => ['required', 'string', 'regex:/^\d{8,30}$/', 'unique:pegawai,NIP'],
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('pegawai', 'email')],
            'jenis' => ['required', Rule::in(['Dosen', 'Tenaga Kependidikan', 'Tendik'])],
            'status_kepegawaian' => ['nullable', Rule::in(['PNS', 'CPNS', 'CPT-PTNBH', 'Pegawai Tetap'])],
            'status' => ['nullable', Rule::in(['PNS', 'CPNS', 'CPT-PTNBH', 'Pegawai Tetap'])],
            'pangkat_golongan' => ['nullable', 'string', 'max:100'],
            'golongan' => ['nullable', 'string', 'max:100'],
            'tmt' => ['nullable', 'date'],
            'npwp' => ['nullable', 'string', 'max:50'],
            'no_rekening' => ['nullable', 'string', 'max:100'],
        ], [
            'NIP.required' => 'NIP wajib diisi.',
            'NIP.regex' => 'NIP harus berupa deretan angka (minimal 8 s.d. 18 digit).',
            'NIP.unique' => 'NIP sudah terdaftar pada sistem. NIP ganda ditolak.',
            'nama.required' => 'Nama lengkap pegawai wajib diisi.',
            'email.email' => 'Format email institusi tidak valid.',
            'email.unique' => 'Email institusi sudah digunakan oleh pegawai lain.',
        ]);

        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id ?? 1;

        $pegawai = Pegawai::create([
            'NIP' => $validated['NIP'],
            'unit_id' => $unitId,
            'nama' => trim($validated['nama']),
            'email' => $validated['email'] ?? null,
            'jenis' => $validated['jenis'],
            'status_kepegawaian' => $validated['status_kepegawaian'] ?? $validated['status'] ?? 'PNS',
            'status_tugas_belajar' => 'aktif',
            'pangkat_golongan' => $validated['pangkat_golongan'] ?? $validated['golongan'] ?? 'III/a',
            'tmt' => $validated['tmt'] ?? null,
            'npwp' => $validated['npwp'] ?? null,
            'no_rekening' => $validated['no_rekening'] ?? null,
            'aktif' => true,
        ]);

        // NFR-05: Catat Jejak Audit
        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $unitId,
            'aksi' => 'Tambah Data Pegawai',
            'objek_type' => 'Pegawai',
            'objek_id' => null,
            'nilai_sebelum' => null,
            'nilai_sesudah' => [
                'NIP' => $pegawai->NIP,
                'nama' => $pegawai->nama,
                'jenis' => $pegawai->jenis,
                'status_kepegawaian' => $pegawai->status_kepegawaian,
                'pangkat_golongan' => $pegawai->pangkat_golongan,
                'aktif' => true,
            ],
            'alasan' => 'Penambahan pegawai baru pada unit kerja',
            'dicatat_at' => now(),
        ]);

        $pegawai->load('unitKerja');

        return response()->json([
            'message' => 'Data pegawai berhasil ditambahkan.',
            'data' => $this->formatPegawai($pegawai),
        ], 201);
    }

    /**
     * FR-03 (L1): Ubah data identitas pegawai (tolak perubahan jabatan/grade langsung)
     */
    public function update(Request $request, string $nip): JsonResponse
    {
        // FR-03: Jabatan dan grade tidak dapat diubah dari fitur ini, melainkan harus melalui FR-04
        if ($request->filled('jabatan_id') || ($request->has('jabatan') && !empty($request->input('jabatan'))) || ($request->has('grade') && !empty($request->input('grade')))) {
            return response()->json([
                'message' => 'Jabatan dan grade tidak dapat diubah dari fitur Data Pegawai, melainkan harus melalui fitur Mengajukan Perubahan Jabatan/Grade (FR-04).',
                'errors' => [
                    'jabatan' => ['Jabatan dan grade tidak dapat diubah dari fitur ini, melainkan harus melalui FR-04.'],
                ],
            ], 422);
        }

        $pegawai = Pegawai::where('NIP', $nip)->firstOrFail();

        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $validated = $request->validate([
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('pegawai', 'email')->ignore($pegawai->NIP, 'NIP')],
            'jenis' => ['sometimes', Rule::in(['Dosen', 'Tenaga Kependidikan', 'Tendik'])],
            'status_kepegawaian' => ['nullable', Rule::in(['PNS', 'CPNS', 'CPT-PTNBH', 'Pegawai Tetap'])],
            'status' => ['nullable', Rule::in(['PNS', 'CPNS', 'CPT-PTNBH', 'Pegawai Tetap'])],
            'pangkat_golongan' => ['nullable', 'string', 'max:100'],
            'golongan' => ['nullable', 'string', 'max:100'],
            'tmt' => ['nullable', 'date'],
            'npwp' => ['nullable', 'string', 'max:50'],
            'no_rekening' => ['nullable', 'string', 'max:100'],
        ], [
            'email.unique' => 'Email institusi sudah digunakan oleh pegawai lain.',
        ]);

        $nilaiSebelum = [
            'nama' => $pegawai->nama,
            'email' => $pegawai->email,
            'jenis' => $pegawai->jenis,
            'status_kepegawaian' => $pegawai->status_kepegawaian,
            'pangkat_golongan' => $pegawai->pangkat_golongan,
            'tmt' => $pegawai->tmt,
        ];

        if (isset($validated['nama'])) {
            $pegawai->nama = trim($validated['nama']);
        }
        if (array_key_exists('email', $validated)) {
            $pegawai->email = $validated['email'];
        }
        if (isset($validated['jenis'])) {
            $pegawai->jenis = $validated['jenis'];
        }
        if (isset($validated['status_kepegawaian']) || isset($validated['status'])) {
            $pegawai->status_kepegawaian = $validated['status_kepegawaian'] ?? $validated['status'];
        }
        if (isset($validated['pangkat_golongan']) || isset($validated['golongan'])) {
            $pegawai->pangkat_golongan = $validated['pangkat_golongan'] ?? $validated['golongan'];
        }
        if (array_key_exists('tmt', $validated)) {
            $pegawai->tmt = $validated['tmt'];
        }
        if (array_key_exists('npwp', $validated)) {
            $pegawai->npwp = $validated['npwp'];
        }
        if (array_key_exists('no_rekening', $validated)) {
            $pegawai->no_rekening = $validated['no_rekening'];
        }

        $pegawai->save();

        // NFR-05: Catat Jejak Audit
        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $pegawai->unit_id,
            'aksi' => 'Ubah Data Pegawai',
            'objek_type' => 'Pegawai',
            'objek_id' => null,
            'nilai_sebelum' => $nilaiSebelum,
            'nilai_sesudah' => [
                'NIP' => $pegawai->NIP,
                'nama' => $pegawai->nama,
                'email' => $pegawai->email,
                'jenis' => $pegawai->jenis,
                'status_kepegawaian' => $pegawai->status_kepegawaian,
                'pangkat_golongan' => $pegawai->pangkat_golongan,
                'tmt' => $pegawai->tmt,
            ],
            'alasan' => 'Pembaruan data identitas pegawai oleh Kepegawaian',
            'dicatat_at' => now(),
        ]);

        $pegawai->load('unitKerja');

        return response()->json([
            'message' => 'Perubahan identitas pegawai berhasil disimpan.',
            'data' => $this->formatPegawai($pegawai),
        ]);
    }

    /**
     * FR-03 (L1): Nonaktifkan pegawai (pegawai nonaktif tidak ikut dihitung pada P1)
     */
    public function nonaktifkan(Request $request, string $nip): JsonResponse
    {
        $pegawai = Pegawai::where('NIP', $nip)->firstOrFail();

        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $validated = $request->validate([
            'alasan' => ['nullable', 'string', 'max:150'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $alasan = $validated['alasan'] ?? 'Mutasi keluar unit';
        $ket = isset($validated['keterangan']) ? trim($validated['keterangan']) : '';
        $alasanLengkap = $ket !== '' ? "{$alasan} — {$ket}" : $alasan;

        $pegawai->aktif = false;
        $pegawai->alasan_nonaktif = $alasanLengkap;
        $pegawai->save();

        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $pegawai->unit_id,
            'aksi' => 'Nonaktifkan Pegawai',
            'objek_type' => 'Pegawai',
            'objek_id' => null,
            'nilai_sebelum' => ['NIP' => $pegawai->NIP, 'aktif' => true],
            'nilai_sesudah' => ['NIP' => $pegawai->NIP, 'aktif' => false, 'alasan_nonaktif' => $alasanLengkap],
            'alasan' => $alasanLengkap,
            'dicatat_at' => now(),
        ]);

        $pegawai->load('unitKerja');

        return response()->json([
            'message' => "Pegawai {$pegawai->nama} berhasil dinonaktifkan dan tidak akan diikutsertakan pada perhitungan P1.",
            'data' => $this->formatPegawai($pegawai),
        ]);
    }

    /**
     * FR-03 (L1): Aktifkan kembali pegawai
     */
    public function aktifkan(Request $request, string $nip): JsonResponse
    {
        $pegawai = Pegawai::where('NIP', $nip)->firstOrFail();

        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $alasanLama = $pegawai->alasan_nonaktif;
        $pegawai->aktif = true;
        $pegawai->alasan_nonaktif = null;
        $pegawai->save();

        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $pegawai->unit_id,
            'aksi' => 'Aktifkan Pegawai',
            'objek_type' => 'Pegawai',
            'objek_id' => null,
            'nilai_sebelum' => ['NIP' => $pegawai->NIP, 'aktif' => false, 'alasan_nonaktif' => $alasanLama],
            'nilai_sesudah' => ['NIP' => $pegawai->NIP, 'aktif' => true, 'alasan_nonaktif' => null],
            'alasan' => 'Pegawai diaktifkan kembali oleh Kepegawaian',
            'dicatat_at' => now(),
        ]);

        $pegawai->load('unitKerja');

        return response()->json([
            'message' => "Pegawai {$pegawai->nama} berhasil diaktifkan kembali.",
            'data' => $this->formatPegawai($pegawai),
        ]);
    }

    /**
     * Update status kepegawaian dari aktif menjadi tugas belajar atau sebaliknya
     */
    public function updateStatusTugasBelajar(Request $request, string $nip): JsonResponse
    {
        if (
            $request->input('status_tugas_belajar') === 'tugas_belajar'
            && $request->filled('tgl_mulai_tubel')
            && $request->filled('tgl_selesai_tubel')
            && strtotime((string) $request->input('tgl_selesai_tubel')) <= strtotime((string) $request->input('tgl_mulai_tubel'))
        ) {
            return response()->json([
                'message' => 'Rentang tanggal tugas belajar tidak logis: Tanggal selesai harus setelah tanggal mulai (tidak boleh tanggal yang sama atau lebih awal).',
                'errors' => [
                    'tgl_selesai_tubel' => ['Tanggal selesai tugas belajar harus setelah tanggal mulai.'],
                ],
            ], 422);
        }

        $validated = $request->validate([
            'status_tugas_belajar' => 'required|in:aktif,tugas_belajar',
            'sk_tugas_belajar' => 'required_if:status_tugas_belajar,tugas_belajar|nullable|string|max:100',
            'tgl_mulai_tubel' => 'required_if:status_tugas_belajar,tugas_belajar|nullable|date',
            'tgl_selesai_tubel' => 'required_if:status_tugas_belajar,tugas_belajar|nullable|date|after:tgl_mulai_tubel',
        ], [
            'sk_tugas_belajar.required_if' => 'Nomor SK Tugas Belajar wajib diisi.',
            'tgl_mulai_tubel.required_if' => 'Tanggal mulai tugas belajar wajib diisi.',
            'tgl_selesai_tubel.required_if' => 'Tanggal selesai tugas belajar wajib diisi.',
            'tgl_selesai_tubel.after' => 'Tanggal selesai tugas belajar harus setelah tanggal mulai (tidak boleh tanggal yang sama atau lebih awal).',
        ]);

        $pegawai = Pegawai::where('NIP', $nip)->firstOrFail();

        $user = $request->user();
        $roleUnit = $this->getKepegawaianRoleUnit($request);
        $unitId = $roleUnit?->unit_id ?? $user?->pegawai?->unit_id;

        if ($unitId && $pegawai->unit_id !== $unitId) {
            return response()->json([
                'message' => 'Akses ditolak: Pegawai ini bukan berasal dari unit kerja Anda.',
            ], 403);
        }

        $statusSebelum = $pegawai->status_tugas_belajar;

        $pegawai->status_tugas_belajar = $validated['status_tugas_belajar'];
        if ($validated['status_tugas_belajar'] === 'tugas_belajar') {
            $pegawai->sk_tugas_belajar = $validated['sk_tugas_belajar'] ?? $pegawai->sk_tugas_belajar;
            $pegawai->tgl_mulai_tubel = $validated['tgl_mulai_tubel'] ?? $pegawai->tgl_mulai_tubel;
            $pegawai->tgl_selesai_tubel = $validated['tgl_selesai_tubel'] ?? $pegawai->tgl_selesai_tubel;
        } else {
            $pegawai->sk_tugas_belajar = null;
            $pegawai->tgl_mulai_tubel = null;
            $pegawai->tgl_selesai_tubel = null;
        }

        $pegawai->save();

        AuditLog::create([
            'NIP' => $user?->NIP,
            'unit_id' => $pegawai->unit_id,
            'aksi' => 'Ubah Status Tugas Belajar',
            'objek_type' => 'Pegawai',
            'objek_id' => null,
            'nilai_sebelum' => ['NIP' => $pegawai->NIP, 'status_tugas_belajar' => $statusSebelum],
            'nilai_sesudah' => [
                'NIP' => $pegawai->NIP,
                'status_tugas_belajar' => $pegawai->status_tugas_belajar,
                'sk_tugas_belajar' => $pegawai->sk_tugas_belajar,
                'tgl_mulai_tubel' => $pegawai->tgl_mulai_tubel,
                'tgl_selesai_tubel' => $pegawai->tgl_selesai_tubel,
            ],
            'alasan' => 'Perubahan status tugas belajar pegawai',
            'dicatat_at' => now(),
        ]);

        $persenHak = ($pegawai->status_tugas_belajar === 'tugas_belajar') ? 60 : (in_array($pegawai->status_kepegawaian, ['CPNS', 'CPT-PTNBH']) ? 80 : 100);

        return response()->json([
            'message' => 'Status tugas belajar pegawai berhasil diperbarui.',
            'pegawai' => [
                'NIP' => $pegawai->NIP,
                'nama' => $pegawai->nama,
                'status_tugas_belajar' => $pegawai->status_tugas_belajar,
                'persen_hak_p1' => $persenHak,
                'sk_tugas_belajar' => $pegawai->sk_tugas_belajar,
                'tgl_mulai_tubel' => $pegawai->tgl_mulai_tubel,
                'tgl_selesai_tubel' => $pegawai->tgl_selesai_tubel,
            ],
        ]);
    }
}
