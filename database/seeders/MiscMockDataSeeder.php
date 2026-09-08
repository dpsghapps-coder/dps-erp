<?php

namespace Database\Seeders;

use App\Models\AttendanceLog;
use App\Models\Client;
use App\Models\Deal;
use App\Models\Employee;
use App\Models\Good;
use App\Models\GoodSupplierPrice;
use App\Models\LeaveType;
use App\Models\OfficeIssueReport;
use App\Models\PriceList;
use App\Models\PriceListItem;
use App\Models\Product;
use App\Models\Proforma;
use App\Models\StaffLevel;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MiscMockDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::whereHas('role', fn ($q) => $q->where('name', 'admin'))->first()
            ?? User::where('email', 'admin@dps-erp.com')->first();

        $this->seedLeaveTypes();
        $this->seedAttendanceLogs();
        $this->seedOfficeIssueReports();
        $this->seedProformas($admin);
        $this->seedPriceList();
        $this->seedGoods($admin);
    }

    private function seedLeaveTypes(): void
    {
        $days = [
            'Junior' => ['Annual' => 15, 'Sick' => 10, 'Casual' => 5, 'Emergency' => 3],
            'Mid-Level' => ['Annual' => 18, 'Sick' => 10, 'Casual' => 6, 'Emergency' => 3],
            'Senior' => ['Annual' => 21, 'Sick' => 12, 'Casual' => 6, 'Emergency' => 4],
            'Lead' => ['Annual' => 21, 'Sick' => 12, 'Casual' => 7, 'Emergency' => 4],
            'Manager' => ['Annual' => 24, 'Sick' => 14, 'Casual' => 7, 'Emergency' => 5],
            'Director' => ['Annual' => 27, 'Sick' => 14, 'Casual' => 8, 'Emergency' => 5],
            'Executive' => ['Annual' => 30, 'Sick' => 15, 'Casual' => 10, 'Emergency' => 5],
        ];

        foreach (StaffLevel::all() as $level) {
            $typeDays = $days[$level->name] ?? ['Annual' => 15, 'Sick' => 10, 'Casual' => 5, 'Emergency' => 3];
            foreach ($typeDays as $type => $count) {
                LeaveType::firstOrCreate(
                    ['name' => $type, 'staff_level_id' => $level->id],
                    ['days_per_year' => $count]
                );
            }
        }
    }

    private function seedAttendanceLogs(): void
    {
        if (AttendanceLog::exists()) {
            return;
        }

        $employees = Employee::take(15)->get();
        foreach ($employees as $employee) {
            for ($d = 13; $d >= 0; $d--) {
                $date = now()->subDays($d);
                if ($date->isWeekend()) {
                    continue;
                }
                $checkIn = $date->copy()->setTime(8, rand(0, 30));
                $checkOut = $date->copy()->setTime(17, rand(0, 30));
                AttendanceLog::create([
                    'employee_id' => $employee->id,
                    'date' => $date->toDateString(),
                    'check_in' => $checkIn->format('H:i:s'),
                    'check_out' => $checkOut->format('H:i:s'),
                    'hours_worked' => round($checkOut->diffInMinutes($checkIn) / 60, 2),
                    'notes' => null,
                ]);
            }
        }
    }

    private function seedOfficeIssueReports(): void
    {
        if (OfficeIssueReport::exists()) {
            return;
        }

        $reports = [
            ['category' => 'Facilities', 'location' => 'Main Workshop', 'description' => 'Air conditioning unit in the cutting room is not cooling properly.', 'status' => 'new'],
            ['category' => 'IT/Equipment', 'location' => 'Office - Front Desk', 'description' => 'Front desk printer keeps jamming on double-sided prints.', 'status' => 'in_review'],
            ['category' => 'Safety', 'location' => 'Warehouse', 'description' => 'Exit sign above the warehouse back door is not lit.', 'status' => 'resolved', 'admin_notes' => 'Bulb replaced 2026-08-20.'],
            ['category' => 'Facilities', 'location' => 'Restroom - 2nd Floor', 'description' => 'Leaking tap in the 2nd floor restroom.', 'status' => 'new'],
            ['category' => 'Other', 'location' => 'Studio', 'description' => 'Studio backdrop stand is wobbly and needs tightening.', 'status' => 'dismissed', 'admin_notes' => 'Checked, stand is fine — was set up incorrectly.'],
        ];

        foreach ($reports as $r) {
            OfficeIssueReport::create($r);
        }
    }

    private function seedProformas(?User $admin): void
    {
        if (Proforma::exists()) {
            return;
        }

        $deals = Deal::with('client')->take(6)->get();
        if ($deals->isEmpty()) {
            return;
        }

        $itemSets = [
            [['description' => 'Business Cards - 1000pcs', 'quantity' => 10, 'unit_cost' => 32], ['description' => 'Letterheads - 500pcs', 'quantity' => 5, 'unit_cost' => 28]],
            [['description' => 'Branded Polo Shirts', 'quantity' => 50, 'unit_cost' => 75]],
            [['description' => 'Trade Show Banner - 2x3m', 'quantity' => 2, 'unit_cost' => 450]],
            [['description' => 'Corporate Headshot Session', 'quantity' => 1, 'unit_cost' => 2400]],
            [['description' => 'Safety Signage Set', 'quantity' => 12, 'unit_cost' => 65]],
            [['description' => 'Vehicle Wrap Design & Print', 'quantity' => 3, 'unit_cost' => 1800]],
        ];

        $statuses = ['draft', 'sent', 'sent', 'accepted', 'accepted', 'rejected'];

        foreach ($deals as $i => $deal) {
            $items = $itemSets[$i % count($itemSets)];
            $calc = Proforma::calculate(['items' => $items, 'discount_type' => 'flat', 'discount' => 0, 'vat_rate' => 20, 'deposit_rate' => 70]);

            Proforma::create(array_merge($calc, [
                'client_id' => $deal->client_id,
                'deal_id' => $deal->id,
                'number' => Proforma::generateNumber(),
                'date' => now()->subDays(20 - $i * 3)->toDateString(),
                'valid_until' => now()->addDays(10 + $i)->toDateString(),
                'status' => $statuses[$i % count($statuses)],
                'items' => $items,
                'rep_name' => $admin?->name,
                'terms' => 'Deposit due on acceptance, balance due on delivery.',
                'notes' => null,
            ]));
        }
    }

    private function seedPriceList(): void
    {
        $priceList = PriceList::firstOrCreate(
            ['name' => 'Default Price List'],
            ['currency' => 'USD', 'is_default' => true]
        );

        foreach (Product::with('prices')->get() as $product) {
            $unitPrice = $product->prices->sortBy('min_qty')->first()?->unit_price ?? 50;
            PriceListItem::firstOrCreate(
                ['price_list_id' => $priceList->id, 'product_id' => $product->id],
                ['unit_price' => $unitPrice, 'min_qty' => 1]
            );
        }
    }

    private function seedGoods(?User $admin): void
    {
        if (Good::exists()) {
            return;
        }

        $suppliers = Supplier::orderBy('id')->take(6)->get();
        if ($suppliers->isEmpty()) {
            return;
        }

        $goods = [
            ['item_name' => 'Kente Shirt - Ready Stock (M)', 'item_category' => 'Apparel', 'uom' => 'Pieces', 'qty_available' => 45, 'restock_threshold' => 10],
            ['item_name' => 'Kente Shirt - Ready Stock (L)', 'item_category' => 'Apparel', 'uom' => 'Pieces', 'qty_available' => 32, 'restock_threshold' => 10],
            ['item_name' => 'Corporate Polo - Navy (M)', 'item_category' => 'Apparel', 'uom' => 'Pieces', 'qty_available' => 60, 'restock_threshold' => 15],
            ['item_name' => 'Branded Tote Bag', 'item_category' => 'Accessories', 'uom' => 'Pieces', 'qty_available' => 120, 'restock_threshold' => 25],
            ['item_name' => 'Embroidered Cap - Black', 'item_category' => 'Accessories', 'uom' => 'Pieces', 'qty_available' => 8, 'restock_threshold' => 15],
            ['item_name' => 'Custom Mug - White', 'item_category' => 'Accessories', 'uom' => 'Pieces', 'qty_available' => 200, 'restock_threshold' => 40],
        ];

        foreach ($goods as $i => $g) {
            $id = (string) Str::uuid();
            $good = Good::create(array_merge($g, [
                'id' => $id,
                'material_id' => 'GD-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'supplier_id' => $suppliers[$i % $suppliers->count()]->id,
                'item_status' => 'Active',
            ]));

            GoodSupplierPrice::firstOrCreate(
                ['good_id' => $good->id, 'supplier_id' => $good->supplier_id],
                [
                    'price' => rand(15, 90),
                    'collection' => now()->subDays(rand(5, 60)),
                    'date_created' => now()->subDays(rand(5, 60))->toDateString(),
                    'created_by' => $admin?->id,
                ]
            );
        }
    }
}
