<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Table;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DashboardController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return response()->json([
            'token' => $user->createToken('admin-token')->plainTextToken,
            'role' => $user->role
        ]);
    }

    public function tables()
    {
        $tables = Table::with(['currentSession.payment' => function($q) {
            $q->where('status', 'pending');
        }])->get();

        return response()->json(['tables' => $tables]);
    }

    public function approvePayment($id)
    {
        return DB::transaction(function () use ($id) {
            $payment = Payment::with('order.table')->findOrFail($id);
            
            if ($payment->status !== 'pending') {
                return response()->json(['message' => 'Payment is already processed.'], 400);
            }

            $payment->update(['status' => 'verified']);
            
            if ($payment->order) {
                $payment->order->update(['status' => 'paid']);
                
                if ($payment->order->table) {
                    $payment->order->table->update([
                        'status' => 'available',
                        'current_session_id' => null
                    ]);
                }
            }

            return response()->json(['message' => 'Payment approved and table is available.']);
        });
    }

    public function rejectPayment($id)
    {
        return DB::transaction(function () use ($id) {
            $payment = Payment::with('order.table')->findOrFail($id);
            
            if ($payment->status !== 'pending') {
                return response()->json(['message' => 'Payment is already processed.'], 400);
            }

            $payment->update(['status' => 'rejected']);
            
            if ($payment->order && $payment->order->table) {
                $payment->order->table->update(['status' => 'busy']);
            }

            return response()->json(['message' => 'Payment rejected. Table is back to busy state.']);
        });
    }

    public function forceReleaseTable($id)
    {
        return DB::transaction(function () use ($id) {
            $table = Table::with('currentSession')->findOrFail($id);
            
            if ($table->current_session_id) {
                $order = \App\Models\Order::find($table->current_session_id);
                if ($order) {
                    $order->update(['status' => 'cancelled']);
                }
            }

            $table->update([
                'status' => 'available',
                'current_session_id' => null
            ]);

            return response()->json(['message' => 'Table released successfully.']);
        });
    }

    public function moveTable(Request $request, $id)
    {
        $request->validate(['target_table_id' => 'required|exists:tables,id']);
        
        return DB::transaction(function () use ($request, $id) {
            $sourceTable = Table::findOrFail($id);
            $targetTable = Table::findOrFail($request->target_table_id);

            if (!$sourceTable->current_session_id) {
                return response()->json(['message' => 'No active session to move.'], 400);
            }

            if ($targetTable->status !== 'available') {
                return response()->json(['message' => 'Target table is not available.'], 400);
            }

            $sessionId = $sourceTable->current_session_id;

            // Update the order itself to the new table
            $order = \App\Models\Order::find($sessionId);
            if ($order) {
                $order->update(['table_id' => $targetTable->id]);
            }

            // Move session to target
            $targetTable->update([
                'status' => 'busy',
                'current_session_id' => $sessionId
            ]);

            // Release source
            $sourceTable->update([
                'status' => 'available',
                'current_session_id' => null
            ]);

            return response()->json(['message' => 'Session moved successfully.']);
        });
    }

    public function toggleItemPrepared($id)
    {
        $item = \App\Models\OrderItem::findOrFail($id);
        $item->is_prepared = !$item->is_prepared;
        $item->save();

        return response()->json(['message' => 'Item status updated.', 'is_prepared' => $item->is_prepared]);
    }
}
