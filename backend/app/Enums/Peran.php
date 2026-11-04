<?php
namespace App\Enums;

enum Peran: string
{
    case PEGAWAI = 'pegawai';
    case KEPEGAWAIAN = 'kepegawaian';
    case BENDAHARA = 'bendahara';
    case VERIFIKATOR = 'verifikator';
    case PJ_UNIT = 'pj_unit';
    case UPT_REMUNERASI = 'upt_remunerasi';
}