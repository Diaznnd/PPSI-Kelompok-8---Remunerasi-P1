<?php
namespace App\Enums;

enum Peran: string
{
    case PEGAWAI = 'pegawai';
    case BENDAHARA = 'bendahara';
    case KEPEGAWAIAN = 'kepegawaian';
    case PENANGGUNG_JAWAB = 'penanggung_jawab';
    case VERIFIKATOR = 'verifikator';
    case UPT_REMUNERASI = 'upt_remunerasi';
}