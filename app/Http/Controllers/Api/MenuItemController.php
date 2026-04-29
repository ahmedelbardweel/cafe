<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    public function index()
    {
        return response()->json(['items' => MenuItem::with('category')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'image' => 'nullable|image|max:5120',
        ]);

        $data = $request->only(['category_id', 'name', 'description', 'price']);
        $data['is_available'] = $request->is_available === 'true' || $request->is_available === '1' || $request->is_available === true;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('menu', 'public');
        }

        $item = MenuItem::create($data);
        return response()->json(['item' => $item->load('category')], 201);
    }

    public function show(MenuItem $menuItem)
    {
        return response()->json(['item' => $menuItem->load('category')]);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'image' => 'nullable|image|max:5120',
        ]);

        $data = $request->only(['category_id', 'name', 'description', 'price']);
        
        if ($request->has('is_available')) {
            $data['is_available'] = $request->is_available === 'true' || $request->is_available === '1' || $request->is_available === true;
        }

        if ($request->hasFile('image')) {
            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }
            $data['image'] = $request->file('image')->store('menu', 'public');
        }

        $menuItem->update($data);
        return response()->json(['item' => $menuItem->load('category')]);
    }

    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }
        $menuItem->delete();
        return response()->json(['message' => 'Item deleted.']);
    }
}
