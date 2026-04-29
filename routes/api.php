<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;

// Customer facing routes
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/tables/{uuid}', [TableController::class, 'show']);
Route::post('/tables/{uuid}/session', [TableController::class, 'startSession']);
Route::post('/tables/{uuid}/order', [OrderController::class, 'store']);
Route::post('/tables/{uuid}/checkout', [OrderController::class, 'checkout']);

// Admin routes
Route::post('/login', [DashboardController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/tables', [TableController::class, 'index']);
    Route::post('/dashboard/tables', [TableController::class, 'store']);
    Route::post('/dashboard/payments/{id}/approve', [DashboardController::class, 'approvePayment']);
    Route::post('/dashboard/payments/{id}/reject', [DashboardController::class, 'rejectPayment']);
    Route::post('/dashboard/tables/{id}/release', [DashboardController::class, 'forceReleaseTable']);
    Route::post('/dashboard/tables/{id}/move', [DashboardController::class, 'moveTable']);
    Route::post('/dashboard/items/{id}/toggle-prepared', [DashboardController::class, 'toggleItemPrepared']);

    Route::apiResource('categories', \App\Http\Controllers\Api\CategoryController::class);
    Route::apiResource('menu-items', \App\Http\Controllers\Api\MenuItemController::class);
});
