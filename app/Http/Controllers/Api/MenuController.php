<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        // Return categories with available menu items
        $categories = Category::with(['menuItems' => function($query) {
            $query->where('is_available', true);
        }])->get();

        return response()->json(['categories' => $categories]);
    }
}
