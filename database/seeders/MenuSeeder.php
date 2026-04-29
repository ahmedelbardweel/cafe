<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\MenuItem;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $c1 = Category::create(['name' => '☕ القهوة']);
        $c2 = Category::create(['name' => '🍰 الحلويات']);
        $c3 = Category::create(['name' => '🍹 مشروبات باردة']);

        MenuItem::create([
            'category_id' => $c1->id,
            'name' => 'إسبريسو',
            'price' => 10,
            'description' => 'قهوة مركزة وقوية بطعم أصيل'
        ]);

        MenuItem::create([
            'category_id' => $c1->id,
            'name' => 'كابتشينو',
            'price' => 15,
            'description' => 'مزيج مثالي من القهوة والحليب والرغوة'
        ]);

        MenuItem::create([
            'category_id' => $c2->id,
            'name' => 'سان سباستيان',
            'price' => 25,
            'description' => 'تشيز كيك كريمي مخبوز على الطريقة الإسبانية'
        ]);

        MenuItem::create([
            'category_id' => $c3->id,
            'name' => 'موهيتو فراولة',
            'price' => 18,
            'description' => 'منعش ولذيذ مع قطع الفراولة والنعناع'
        ]);
    }
}
