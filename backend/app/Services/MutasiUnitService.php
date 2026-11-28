<?php

namespace App\Services;

use Carbon\Carbon;

class MutasiUnitService
{
    /**
     * Menentukan unit mana yang dipakai untuk P1 pegawai berdasarkan logika mutasi:
     * - Jika mutasi minggu 1-2: ikut P1 unit BARU
     * - Jika mutasi minggu 3-4: ikut P1 unit LAMA
     * 
     * @param int|null $unitLamaId Unit kerja sebelum mutasi
     * @param int|null $unitBaruId Unit kerja setelah mutasi (null jika tidak mutasi)
     * @param int|null $mingguMutasi Minggu ke berapa mutasi (1-4)
     * @param string|Carbon|null $tanggalBerlaku Tanggal mulai berlaku
     * @return int Unit ID yang dipakai untuk P1
     */
    public static function tentukanUnitUntukP1(
        ?int $unitLamaId,
        ?int $unitBaruId,
        ?int $mingguMutasi = null,
        $tanggalBerlaku = null
    ): int {
        // Jika tidak ada mutasi unit, gunakan unit lama
        if (!$unitBaruId || $unitBaruId === $unitLamaId) {
            return $unitLamaId;
        }

        // Jika minggu_mutasi belum tercatat, hitung dari tanggal_berlaku
        if ($mingguMutasi === null && $tanggalBerlaku) {
            $mingguMutasi = self::hitungMingguMutasi($tanggalBerlaku);
        }

        // Logika bisnis:
        // Minggu 1-2: Pegawai ikut P1 unit BARU
        // Minggu 3-4: Pegawai ikut P1 unit LAMA
        if ($mingguMutasi >= 1 && $mingguMutasi <= 2) {
            return $unitBaruId;
        }

        // Default: minggu 3-4 atau tidak diketahui -> ikut unit lama
        return $unitLamaId;
    }

    /**
     * Menghitung minggu ke berapa dalam bulan dari tanggal tertentu
     * 
     * @param string|Carbon $tanggal
     * @return int Minggu ke-1 sampai ke-4
     */
    public static function hitungMingguMutasi($tanggal): int
    {
        $date = $tanggal instanceof Carbon ? $tanggal : Carbon::parse($tanggal);
        $dayOfMonth = $date->day;

        // Pembagian sederhana:
        // Hari 1-7: Minggu 1
        // Hari 8-14: Minggu 2
        // Hari 15-21: Minggu 3
        // Hari 22-31: Minggu 4
        if ($dayOfMonth <= 7) {
            return 1;
        } elseif ($dayOfMonth <= 14) {
            return 2;
        } elseif ($dayOfMonth <= 21) {
            return 3;
        } else {
            return 4;
        }
    }

    /**
     * Update unit_id pegawai ketika usulan jabatan dengan mutasi unit ditetapkan
     * 
     * @param \App\Models\Pegawai $pegawai
     * @param int $unitBaruId
     * @return void
     */
    public static function aplikasiMutasiUnit($pegawai, int $unitBaruId): void
    {
        $pegawai->update([
            'unit_id' => $unitBaruId,
        ]);
    }

    /**
     * Dapatkan label minggu mutasi untuk UI
     * 
     * @param int $minggu
     * @return string
     */
    public static function labelMingguMutasi(int $minggu): string
    {
        return match ($minggu) {
            1 => 'Minggu ke-1 (Hari 1-7)',
            2 => 'Minggu ke-2 (Hari 8-14)',
            3 => 'Minggu ke-3 (Hari 15-21)',
            4 => 'Minggu ke-4 (Hari 22-31)',
            default => 'Tidak diketahui',
        };
    }

    /**
     * Dapatkan keterangan unit P1 untuk pegawai yang mutasi
     * 
     * @param int $minggu
     * @param string $namaUnitLama
     * @param string $namaUnitBaru
     * @return string
     */
    public static function keteranganUnitP1(int $minggu, string $namaUnitLama, string $namaUnitBaru): string
    {
        if ($minggu >= 1 && $minggu <= 2) {
            return "Ikut P1 unit BARU ({$namaUnitBaru}) karena mutasi di minggu awal bulan";
        }

        return "Ikut P1 unit LAMA ({$namaUnitLama}) karena mutasi di minggu akhir bulan";
    }
}
