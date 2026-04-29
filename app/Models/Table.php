<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory;

    protected $fillable = ['uuid', 'table_number', 'status', 'current_session_id'];

    public function currentSession()
    {
        return $this->belongsTo(Order::class, 'current_session_id');
    }
}
