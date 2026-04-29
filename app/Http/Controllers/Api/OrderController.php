<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request, $uuid)
    {
        $table = Table::where('uuid', $uuid)->firstOrFail();

        if ($table->status !== 'busy' || !$table->current_session_id) {
            return response()->json(['message' => 'No active session.'], 403);
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $table) {
            $order = Order::lockForUpdate()->find($table->current_session_id);
            $itemIds = collect($request->items)->pluck('id');
            $menuItems = MenuItem::whereIn('id', $itemIds)->get()->keyBy('id');

            foreach ($request->items as $itemData) {
                $menuItem = $menuItems[$itemData['id']];
                $subtotal = $menuItem->price * $itemData['quantity'];

                $orderItem = OrderItem::firstOrNew([
                    'order_id' => $order->id,
                    'item_id' => $menuItem->id
                ]);

                $orderItem->quantity = ($orderItem->exists ? $orderItem->quantity : 0) + $itemData['quantity'];
                $orderItem->subtotal = ($orderItem->exists ? $orderItem->subtotal : 0) + $subtotal;
                $orderItem->save();

                $order->total_price += $subtotal;
            }
            
            $order->save();
            return response()->json(['message' => 'Added', 'order' => $order->load('items.menuItem')]);
        });
    }

    public function checkout(Request $request, $uuid)
    {
        $table = Table::where('uuid', $uuid)->firstOrFail();

        if ($table->status !== 'busy' || !$table->current_session_id) {
            return response()->json(['message' => 'No session.'], 403);
        }

        $request->validate(['receipt_image' => 'required|image|max:5120']);

        $path = $request->file('receipt_image')->store('receipts', 'public');

        Payment::create([
            'order_id' => $table->current_session_id,
            'receipt_image_path' => $path,
            'status' => 'pending'
        ]);

        $table->update(['status' => 'pending_payment']);
        return response()->json(['message' => 'Success']);
    }
}
