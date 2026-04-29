<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CafeSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Admin User
        User::create([
            'name' => 'إدارة النظام',
            'email' => 'admin@cafe.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'طاقم الخدمة',
            'email' => 'staff@cafe.com',
            'password' => Hash::make('password'),
            'role' => 'staff'
        ]);

        // 2. Create 40 Tables
        for ($i = 1; $i <= 40; $i++) {
            Table::create([
                'table_number' => $i,
                'status' => 'available',
                'uuid' => (string) Str::uuid()
            ]);
        }

        // 3. Define 30 Professional Categories
        $categories = [
            'القهوة المختصة', 'المشروبات الساخنة', 'المشروبات الباردة', 'القهوة المثلجة',
            'الشاي والمنقوعات', 'العصائر الطبيعية', 'الميلك شيك', 'الموهيتو',
            'الحلويات الفرنسية', 'الحلويات الشرقية', 'كعك المولتن', 'التشيز كيك',
            'البان كيك', 'الوافل البلجيكي', 'الكريب الفرنسي', 'المعجنات الطازجة',
            'وجبات الإفطار', 'الساندوتشات الساخنة', 'الساندوتشات الباردة', 'السلطات العالمية',
            'المقبلات الخفيفة', 'الشوربات', 'الباستا', 'البيتزا الإيطالية',
            'المشروبات الغازية', 'المياه المعدنية', 'الإضافات الجانبية', 'أطباق الفاكهة',
            'قسم الحمية والرشاقة', 'ركن الأطفال'
        ];

        foreach ($categories as $catName) {
            $category = Category::create(['name' => $catName]);

            // 4. Create 20 Menu Items per Category (600 Items total)
            for ($j = 1; $j <= 20; $j++) {
                MenuItem::create([
                    'category_id' => $category->id,
                    'name' => $catName . ' ' . $j,
                    'description' => 'وصف تفصيلي للمنتج ' . $j . ' ضمن قسم ' . $catName . ' يتميز بمكونات عالية الجودة وطعم أصيل.',
                    'price' => rand(15, 120),
                    'image' => null, // No emojis, professional placeholder logic
                ]);
            }
        }
    }
}
