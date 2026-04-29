<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    public function index()
    {
        // Get all tables with their current active order items
        $tables = Table::with(['currentSession.items.menuItem', 'currentSession.payment'])
            ->orderByRaw('CAST(table_number AS INTEGER) ASC')
            ->get();
        return response()->json(['tables' => $tables]);
    }

    public function store(Request $request)
    {
        $lastTable = Table::orderByRaw('CAST(table_number AS INTEGER) DESC')->first();
        $nextNumber = $lastTable ? (int)$lastTable->table_number + 1 : 1;

        $table = Table::create([
            'uuid' => (string) Str::uuid(),
            'table_number' => (string)$nextNumber,
            'status' => 'available'
        ]);

        return response()->json(['table' => $table]);
    }
    public function show($uuid)
    {
        $table = Table::where('uuid', $uuid)->firstOrFail();
        
        $qrLink = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' . urlencode(url('/table/' . $uuid));

        return response()->json([
            'table' => $table,
            'qr_link' => $qrLink,
            'current_session' => $table->currentSession()->with('items.menuItem')->first()
        ]);
    }

    public function startSession($uuid)
    {
        $table = Table::where('uuid', $uuid)->firstOrFail();

        if ($table->status === 'pending_payment') {
            return response()->json(['message' => 'Table is locked for payment verification.'], 403);
        }

        if ($table->status === 'available') {
            // Create a new order/session
            $order = Order::create([
                'table_id' => $table->id,
                'total_price' => 0,
                'status' => 'open'
            ]);

            $table->update([
                'status' => 'busy',
                'current_session_id' => $order->id
            ]);

            return response()->json(['message' => 'Session started', 'session' => $order]);
        }

        return response()->json(['message' => 'Table is already busy', 'session' => $table->currentSession], 200);
    }
}
