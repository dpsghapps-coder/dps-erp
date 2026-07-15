<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestHistory;
use App\Models\Supplier;
use App\Models\SupplierBranch;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PurchaseRequestSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // -- Users -----------------------------------------------------------
        $admin = User::firstOrCreate(
            ['email' => 'admin@dps-erp.com'],
            ['name' => 'Admin User', 'password' => bcrypt('password'), 'is_active' => true]
        );

        $requester1 = User::firstOrCreate(
            ['email' => 'sarah.mensah@dps-erp.com'],
            [
                'name' => 'Sarah Mensah',
                'password' => bcrypt('password'),
                'is_active' => true,
                'department' => 'Engineering',
            ]
        );

        $requester2 = User::firstOrCreate(
            ['email' => 'john.darko@dps-erp.com'],
            [
                'name' => 'John Darko',
                'password' => bcrypt('password'),
                'is_active' => true,
                'department' => 'Operations',
            ]
        );

        $requester3 = User::firstOrCreate(
            ['email' => 'fatima.ibrahim@dps-erp.com'],
            [
                'name' => 'Fatima Ibrahim',
                'password' => bcrypt('password'),
                'is_active' => true,
                'department' => 'Sales',
            ]
        );

        $deptManager = User::firstOrCreate(
            ['email' => 'kofi.asante@dps-erp.com'],
            [
                'name' => 'Kofi Asante',
                'password' => bcrypt('password'),
                'is_active' => true,
                'department' => 'Operations',
            ]
        );

        $financeUser = User::firstOrCreate(
            ['email' => 'ama.osei@dps-erp.com'],
            [
                'name' => 'Ama Osei',
                'password' => bcrypt('password'),
                'is_active' => true,
                'department' => 'Finance',
            ]
        );

        // -- Create suppliers -------------------------------------------------
        $textileMills = Supplier::firstOrCreate(
            ['company_name' => 'Textile Mills Ghana'],
            ['city' => 'Accra', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true]
        );
        $fabricsDirect = Supplier::firstOrCreate(
            ['company_name' => 'Fabrics Direct Ltd'],
            ['city' => 'Kumasi', 'country' => 'Ghana', 'payment_terms' => 'Net 45', 'is_active' => true]
        );
        $accessoryWorld = Supplier::firstOrCreate(
            ['company_name' => 'Accessory World'],
            ['city' => 'Tema', 'country' => 'Ghana', 'payment_terms' => 'Net 30', 'is_active' => true]
        );
        $premiumZippers = Supplier::firstOrCreate(
            ['company_name' => 'Premium Zippers Co'],
            ['city' => 'Lagos', 'country' => 'Nigeria', 'payment_terms' => 'Net 60', 'is_active' => true]
        );
        $sustThreads = Supplier::firstOrCreate(
            ['company_name' => 'Sustainable Threads'],
            ['city' => 'Nairobi', 'country' => 'Kenya', 'payment_terms' => 'Net 30', 'is_active' => true]
        );

        // -- Create supplier branches -----------------------------------------
        $branchData = [
            $textileMills->id => [
                ['name' => 'Head Office - Accra', 'contact_name' => 'Kwame Mensah', 'mobile' => '+233244123456', 'email' => 'accra@textilemills.gh', 'address' => '14 Industrial Rd, East Legon, Accra', 'location' => '5.6037,-0.1870'],
                ['name' => 'Kumasi Factory', 'contact_name' => 'Ama Boateng', 'mobile' => '+233201654321', 'email' => 'kumasi@textilemills.gh', 'address' => 'Plot 12, Anloga Junction, Kumasi', 'location' => '6.6885,-1.6244'],
                ['name' => 'Tema Warehouse', 'contact_name' => 'Kofi Appiah', 'mobile' => '+233277987654', 'email' => 'tema@textilemills.gh', 'address' => 'Block 5, Tema Industrial Area', 'location' => '5.6698,-0.0166'],
            ],
            $fabricsDirect->id => [
                ['name' => 'Main Office - Kumasi', 'contact_name' => 'Efua Ansah', 'mobile' => '+233244555123', 'email' => 'main@fabricsdirect.gh', 'address' => '27 Adum Road, Kumasi', 'location' => '6.6990,-1.6248'],
                ['name' => 'Accra Showroom', 'contact_name' => 'Nana Yaa Asantewaa', 'mobile' => '+233201234567', 'email' => 'showroom@fabricsdirect.gh', 'address' => 'Oxford Street, Osu, Accra', 'location' => '5.5560,-0.1770'],
            ],
            $accessoryWorld->id => [
                ['name' => 'Tema Branch', 'contact_name' => 'Yaw Boakye', 'mobile' => '+233277888999', 'email' => 'tema@accessoryworld.gh', 'address' => 'CC 12, Tema Community 1', 'location' => '5.6644,-0.0098'],
                ['name' => 'Circle Branch', 'contact_name' => 'Abena Osei', 'mobile' => '+233244333222', 'email' => 'circle@accessoryworld.gh', 'address' => 'Opposite Circle Station, Accra', 'location' => '5.5580,-0.2160'],
            ],
            $premiumZippers->id => [
                ['name' => 'Lagos Office', 'contact_name' => 'Adewale Bankole', 'mobile' => '+2348031234567', 'email' => 'lagos@premiumzippers.ng', 'address' => '15 Apapa Road, Lagos', 'location' => '6.4541,-3.3947'],
            ],
            $sustThreads->id => [
                ['name' => 'Nairobi HQ', 'contact_name' => 'Wanjiku Kamau', 'mobile' => '+254722123456', 'email' => 'nairobi@sustainablethreads.ke', 'address' => 'Industrial Area, Nairobi', 'location' => '-1.2921,36.8219'],
                ['name' => 'Mombasa Depot', 'contact_name' => 'Odhiambo Onyango', 'mobile' => '+254733987654', 'email' => 'mombasa@sustainablethreads.ke', 'address' => 'Port Reitz Road, Mombasa', 'location' => '-4.0435,39.6682'],
            ],
        ];
        foreach ($branchData as $supplierId => $branches) {
            foreach ($branches as $branch) {
                SupplierBranch::firstOrCreate(
                    ['supplier_id' => $supplierId, 'name' => $branch['name']],
                    $branch
                );
            }
        }

        // -- Create products for PO items -------------------------------------
        $threadWhite = Product::firstOrCreate(
            ['sku' => 'RAW-THR-001'],
            [
                'name' => 'Sewing Thread - White 5000m',
                'description' => 'Bulk white thread for production line',
                'type' => 'physical',
                'unit' => 'Pieces',
                'is_active' => true,
            ]
        );
        $threadBlack = Product::firstOrCreate(
            ['sku' => 'RAW-THR-002'],
            [
                'name' => 'Sewing Thread - Black 5000m',
                'description' => 'Bulk black thread for formal wear line',
                'type' => 'physical',
                'unit' => 'Pieces',
                'is_active' => true,
            ]
        );

        // -- Look up PO products by sku ---------------------------------------
        $poProducts = DB::table('products')
            ->pluck('id', 'sku')
            ->toArray();

        // ---- Helper to create a PR with items + history ---------------------
        $createPr = function (array $prData, array $items, array $history = []) {
            $pr = PurchaseRequest::create($prData);

            foreach ($items as $item) {
                $pr->items()->create($item);
            }

            foreach ($history as $h) {
                PurchaseRequestHistory::create(array_merge($h, [
                    'purchase_request_id' => $pr->id,
                ]));
            }

            return $pr;
        };

        // =====================================================================
        // PR 1 – Draft (not yet submitted)
        // =====================================================================
        $createPr(
            [
                'request_date' => $now->toDateString(),
                'requester_id' => $requester1->id,
                'department' => 'Engineering',
                'priority' => 'Normal',
                'required_by_date' => $now->copy()->addDays(14)->toDateString(),
                'purpose' => 'Restocking cotton fabric for ongoing shirt production line.',
                'status' => 'draft',
                'created_by' => $requester1->id,
            ],
            [
                [
                    'item_name' => 'Cotton Fabric - Plain White',
                    'item_description' => 'High-quality cotton for premium shirt line',
                    'product_id' => null,
                    'estimated_cost' => 1250.00,
                    'qty_requested' => 100,
                    'uom' => 'Meters',
                ],
                [
                    'item_name' => 'Cotton Fabric - Plain Black',
                    'item_description' => 'Black cotton for formal wear collection',
                    'product_id' => null,
                    'estimated_cost' => 625.00,
                    'qty_requested' => 50,
                    'uom' => 'Meters',
                ],
            ]
        );

        // =====================================================================
        // PR 2 – Pending (submitted, awaiting dept review)
        // =====================================================================
        $pr2 = $createPr(
            [
                'request_date' => $now->copy()->subDays(2)->toDateString(),
                'requester_id' => $requester2->id,
                'department' => 'Operations',
                'priority' => 'High',
                'required_by_date' => $now->copy()->addDays(7)->toDateString(),
                'purpose' => 'Urgent need for zippers and buttons for new uniform order (Client: Ghana Telecom).',
                'status' => 'pending',
                'created_by' => $requester2->id,
            ],
            [
                [
                    'item_name' => 'Metal Zipper - #5 YKK Gold',
                    'item_description' => 'Gold-tone metal zippers for uniform jackets',
                    'product_id' => null,
                    'estimated_cost' => 350.00,
                    'qty_requested' => 100,
                    'uom' => 'Pieces',
                ],
                [
                    'item_name' => '4-Hole Button - 15mm Black',
                    'item_description' => 'Black buttons for uniform shirts',
                    'product_id' => null,
                    'estimated_cost' => 180.00,
                    'qty_requested' => 12,
                    'uom' => 'Boxes',
                ],
                [
                    'item_name' => 'Elastic Band - 25mm White',
                    'item_description' => 'Elastic for trouser waistbands',
                    'product_id' => null,
                    'estimated_cost' => 120.00,
                    'qty_requested' => 10,
                    'uom' => 'Rolls',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester2->id,
                    'comment' => 'PR created',
                    'created_at' => $now->copy()->subDays(2),
                    'updated_at' => $now->copy()->subDays(2),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester2->id,
                    'comment' => 'Submitted for department manager review',
                    'created_at' => $now->copy()->subDays(1),
                    'updated_at' => $now->copy()->subDays(1),
                ],
            ]
        );

        // =====================================================================
        // PR 3 – Dept Approved (dept manager approved, awaiting finance)
        // =====================================================================
        $pr3 = $createPr(
            [
                'request_date' => $now->copy()->subDays(5)->toDateString(),
                'requester_id' => $requester1->id,
                'department' => 'Engineering',
                'priority' => 'Normal',
                'required_by_date' => $now->copy()->addDays(10)->toDateString(),
                'purpose' => 'Embroidery supplies for upcoming festival collection (200 units).',
                'status' => 'dept_approved',
                'dept_manager_id' => $deptManager->id,
                'dept_manager_comment' => 'Approved. Budget allocation confirmed for festival collection.',
                'created_by' => $requester1->id,
            ],
            [
                [
                    'item_name' => 'Embroidery Thread Set',
                    'item_description' => 'Multi-color embroidery thread for festival patterns',
                    'product_id' => null,
                    'estimated_cost' => 450.00,
                    'qty_requested' => 10,
                    'uom' => 'Boxes',
                ],
                [
                    'item_name' => 'Embroidery Panel - Logo Only',
                    'item_description' => 'Pre-cut panels for logo embroidery',
                    'product_id' => null,
                    'estimated_cost' => 3750.00,
                    'qty_requested' => 250,
                    'uom' => 'Pieces',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester1->id,
                    'comment' => 'PR created',
                    'created_at' => $now->copy()->subDays(5),
                    'updated_at' => $now->copy()->subDays(5),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester1->id,
                    'comment' => 'Submitted for review',
                    'created_at' => $now->copy()->subDays(4),
                    'updated_at' => $now->copy()->subDays(4),
                ],
                [
                    'status' => 'dept_approved',
                    'changed_by' => $deptManager->id,
                    'comment' => 'Approved. Budget allocation confirmed for festival collection.',
                    'created_at' => $now->copy()->subDays(3),
                    'updated_at' => $now->copy()->subDays(3),
                ],
            ]
        );

        // =====================================================================
        // PR 4 – Finance Approved (ready for PO creation)
        // =====================================================================
        $pr4 = $createPr(
            [
                'request_date' => $now->copy()->subDays(8)->toDateString(),
                'requester_id' => $requester3->id,
                'department' => 'Sales',
                'priority' => 'Normal',
                'required_by_date' => $now->copy()->addDays(5)->toDateString(),
                'purpose' => 'Packaging materials for Q3 export orders to Nigeria.',
                'status' => 'finance_approved',
                'dept_manager_id' => $deptManager->id,
                'dept_manager_comment' => 'Approved. Aligned with sales forecast.',
                'finance_user_id' => $financeUser->id,
                'finance_comment' => 'Budget verified. Proceed with PO.',
                'supplier_id' => $fabricsDirect->id ?? null,
                'created_by' => $requester3->id,
            ],
            [
                [
                    'item_name' => 'Shipping Box - Medium',
                    'item_description' => 'Corrugated boxes for garment shipping',
                    'product_id' => null,
                    'estimated_cost' => 500.00,
                    'qty_requested' => 200,
                    'uom' => 'Pieces',
                ],
                [
                    'item_name' => 'Plastic Garment Bag',
                    'item_description' => 'Clear poly bags for individual garment wrapping',
                    'product_id' => null,
                    'estimated_cost' => 160.00,
                    'qty_requested' => 200,
                    'uom' => 'Pieces',
                ],
                [
                    'item_name' => 'Tissue Paper - White',
                    'item_description' => 'Acid-free tissue for premium packaging',
                    'product_id' => null,
                    'estimated_cost' => 100.00,
                    'qty_requested' => 200,
                    'uom' => 'Pieces',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester3->id,
                    'comment' => 'PR created',
                    'created_at' => $now->copy()->subDays(8),
                    'updated_at' => $now->copy()->subDays(8),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester3->id,
                    'comment' => 'Submitted for review',
                    'created_at' => $now->copy()->subDays(7),
                    'updated_at' => $now->copy()->subDays(7),
                ],
                [
                    'status' => 'dept_approved',
                    'changed_by' => $deptManager->id,
                    'comment' => 'Approved. Aligned with sales forecast.',
                    'created_at' => $now->copy()->subDays(6),
                    'updated_at' => $now->copy()->subDays(6),
                ],
                [
                    'status' => 'finance_approved',
                    'changed_by' => $financeUser->id,
                    'comment' => 'Budget verified. Proceed with PO.',
                    'created_at' => $now->copy()->subDays(5),
                    'updated_at' => $now->copy()->subDays(5),
                ],
            ]
        );

        // =====================================================================
        // PR 5 – PO Created (fully processed, linked to a PO)
        // =====================================================================
        $pr5 = $createPr(
            [
                'request_date' => $now->copy()->subDays(15)->toDateString(),
                'requester_id' => $requester1->id,
                'department' => 'Engineering',
                'priority' => 'Emergency',
                'required_by_date' => $now->copy()->subDays(3)->toDateString(),
                'purpose' => 'Critical thread stock-out halted production. Immediate purchase required.',
                'status' => 'po_created',
                'dept_manager_id' => $deptManager->id,
                'dept_manager_comment' => 'Emergency approved. Production line at standstill.',
                'finance_user_id' => $financeUser->id,
                'finance_comment' => 'Emergency procurement authorized.',
                'supplier_id' => $sustThreads->id ?? null,
                'created_by' => $requester1->id,
            ],
            [
                [
                    'item_name' => 'Sewing Thread - White 5000m',
                    'item_description' => 'Bulk white thread for production line',
                    'product_id' => null,
                    'estimated_cost' => 240.00,
                    'qty_requested' => 30,
                    'uom' => 'Pieces',
                ],
                [
                    'item_name' => 'Sewing Thread - Black 5000m',
                    'item_description' => 'Bulk black thread for formal wear line',
                    'product_id' => null,
                    'estimated_cost' => 160.00,
                    'qty_requested' => 20,
                    'uom' => 'Pieces',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester1->id,
                    'comment' => 'Emergency PR created',
                    'created_at' => $now->copy()->subDays(15),
                    'updated_at' => $now->copy()->subDays(15),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester1->id,
                    'comment' => 'Urgent: production halted',
                    'created_at' => $now->copy()->subDays(15)->addHour(),
                    'updated_at' => $now->copy()->subDays(15)->addHour(),
                ],
                [
                    'status' => 'dept_approved',
                    'changed_by' => $deptManager->id,
                    'comment' => 'Emergency approved. Production line at standstill.',
                    'created_at' => $now->copy()->subDays(14),
                    'updated_at' => $now->copy()->subDays(14),
                ],
                [
                    'status' => 'finance_approved',
                    'changed_by' => $financeUser->id,
                    'comment' => 'Emergency procurement authorized.',
                    'created_at' => $now->copy()->subDays(14)->addHour(),
                    'updated_at' => $now->copy()->subDays(14)->addHour(),
                ],
                [
                    'status' => 'po_created',
                    'changed_by' => $admin->id,
                    'comment' => 'PO-20260701-001 created',
                    'created_at' => $now->copy()->subDays(13),
                    'updated_at' => $now->copy()->subDays(13),
                ],
            ]
        );

        // Create the linked PO
        $po = PurchaseOrder::firstOrCreate(
            ['po_number' => 'PO-20260701-001'],
            [
                'supplier_id' => $sustThreads->id,
                'status' => 'ordered',
                'expected_date' => $now->copy()->subDays(2)->toDateString(),
                'total_amount' => 400.00,
                'notes' => 'Emergency thread order for production line',
                'created_by' => $admin->id,
            ]
        );

        PurchaseOrderItem::firstOrCreate(
            ['purchase_order_id' => $po->id, 'description' => 'Sewing Thread - White 5000m'],
            [
                'product_id' => $poProducts['RAW-THR-001'],
                'qty' => 30,
                'unit_cost' => 8.00,
                'line_total' => 240.00,
            ]
        );

        PurchaseOrderItem::firstOrCreate(
            ['purchase_order_id' => $po->id, 'description' => 'Sewing Thread - Black 5000m'],
            [
                'product_id' => $poProducts['RAW-THR-002'],
                'qty' => 20,
                'unit_cost' => 8.00,
                'line_total' => 160.00,
            ]
        );

        $pr5->update(['purchase_order_id' => $po->id]);

        // =====================================================================
        // PR 6 – Rejected
        // =====================================================================
        $createPr(
            [
                'request_date' => $now->copy()->subDays(10)->toDateString(),
                'requester_id' => $requester3->id,
                'department' => 'Sales',
                'priority' => 'Low',
                'required_by_date' => $now->copy()->addDays(30)->toDateString(),
                'purpose' => 'Sample fabrics for new client pitch deck.',
                'status' => 'rejected',
                'dept_manager_id' => $deptManager->id,
                'dept_manager_comment' => 'Rejected. Use existing sample stock instead of purchasing new materials.',
                'created_by' => $requester3->id,
            ],
            [
                [
                    'item_name' => 'Kente Fabric - Gold Thread',
                    'item_description' => 'Premium kente for client presentation samples',
                    'product_id' => null,
                    'estimated_cost' => 850.00,
                    'qty_requested' => 10,
                    'uom' => 'Meters',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester3->id,
                    'comment' => 'PR created',
                    'created_at' => $now->copy()->subDays(10),
                    'updated_at' => $now->copy()->subDays(10),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester3->id,
                    'comment' => 'Submitted for review',
                    'created_at' => $now->copy()->subDays(9),
                    'updated_at' => $now->copy()->subDays(9),
                ],
                [
                    'status' => 'rejected',
                    'changed_by' => $deptManager->id,
                    'comment' => 'Rejected. Use existing sample stock instead of purchasing new materials.',
                    'created_at' => $now->copy()->subDays(8),
                    'updated_at' => $now->copy()->subDays(8),
                ],
            ]
        );

        // =====================================================================
        // PR 7 – Queried (finance has questions)
        // =====================================================================
        $createPr(
            [
                'request_date' => $now->copy()->subDays(6)->toDateString(),
                'requester_id' => $requester2->id,
                'department' => 'Operations',
                'priority' => 'Normal',
                'required_by_date' => $now->copy()->addDays(12)->toDateString(),
                'purpose' => 'Interlining and velcro for winter jacket production run.',
                'status' => 'queried',
                'dept_manager_id' => $deptManager->id,
                'dept_manager_comment' => 'Approved. Within department budget.',
                'finance_user_id' => $financeUser->id,
                'finance_comment' => 'The estimated cost per unit seems high. Please provide a breakdown or alternative supplier quotes.',
                'created_by' => $requester2->id,
            ],
            [
                [
                    'item_name' => 'Interlining - Fusible Woven',
                    'item_description' => 'Heavy-duty interlining for jacket structure',
                    'product_id' => null,
                    'estimated_cost' => 1050.00,
                    'qty_requested' => 30,
                    'uom' => 'Rolls',
                ],
                [
                    'item_name' => 'Velcro Tape - 20mm',
                    'item_description' => 'Hook-and-loop tape for adjustable cuffs',
                    'product_id' => null,
                    'estimated_cost' => 255.00,
                    'qty_requested' => 30,
                    'uom' => 'Rolls',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester2->id,
                    'comment' => 'PR created',
                    'created_at' => $now->copy()->subDays(6),
                    'updated_at' => $now->copy()->subDays(6),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester2->id,
                    'comment' => 'Submitted for review',
                    'created_at' => $now->copy()->subDays(5),
                    'updated_at' => $now->copy()->subDays(5),
                ],
                [
                    'status' => 'dept_approved',
                    'changed_by' => $deptManager->id,
                    'comment' => 'Approved. Within department budget.',
                    'created_at' => $now->copy()->subDays(4),
                    'updated_at' => $now->copy()->subDays(4),
                ],
                [
                    'status' => 'queried',
                    'changed_by' => $financeUser->id,
                    'comment' => 'The estimated cost per unit seems high. Please provide a breakdown or alternative supplier quotes.',
                    'created_at' => $now->copy()->subDays(3),
                    'updated_at' => $now->copy()->subDays(3),
                ],
            ]
        );

        // =====================================================================
        // PR 8 – Held (finance put on hold)
        // =====================================================================
        $createPr(
            [
                'request_date' => $now->copy()->subDays(12)->toDateString(),
                'requester_id' => $requester1->id,
                'department' => 'Engineering',
                'priority' => 'Normal',
                'required_by_date' => $now->copy()->addDays(20)->toDateString(),
                'purpose' => 'Linen fabric for premium hotel uniform contract (Hilton Accra).',
                'status' => 'held',
                'dept_manager_id' => $deptManager->id,
                'dept_manager_comment' => 'Approved. Contract requires these materials.',
                'finance_user_id' => $financeUser->id,
                'finance_comment' => 'Held pending Q4 budget approval. Re-evaluate after board meeting on 2026-08-01.',
                'postpone_until' => '2026-08-05',
                'supplier_id' => $fabricsDirect->id ?? null,
                'created_by' => $requester1->id,
            ],
            [
                [
                    'item_name' => 'Linen Fabric - Natural',
                    'item_description' => 'Premium linen for hotel staff uniforms',
                    'product_id' => null,
                    'estimated_cost' => 3750.00,
                    'qty_requested' => 150,
                    'uom' => 'Meters',
                ],
                [
                    'item_name' => 'Invisible Zipper - #3 Black',
                    'item_description' => 'Concealed zippers for dress uniforms',
                    'product_id' => null,
                    'estimated_cost' => 200.00,
                    'qty_requested' => 100,
                    'uom' => 'Pieces',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester1->id,
                    'comment' => 'PR created for hotel uniform contract',
                    'created_at' => $now->copy()->subDays(12),
                    'updated_at' => $now->copy()->subDays(12),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester1->id,
                    'comment' => 'Submitted for review',
                    'created_at' => $now->copy()->subDays(11),
                    'updated_at' => $now->copy()->subDays(11),
                ],
                [
                    'status' => 'dept_approved',
                    'changed_by' => $deptManager->id,
                    'comment' => 'Approved. Contract requires these materials.',
                    'created_at' => $now->copy()->subDays(10),
                    'updated_at' => $now->copy()->subDays(10),
                ],
                [
                    'status' => 'held',
                    'changed_by' => $financeUser->id,
                    'comment' => 'Held pending Q4 budget approval. Re-evaluate after board meeting on 2026-08-01.',
                    'created_at' => $now->copy()->subDays(9),
                    'updated_at' => $now->copy()->subDays(9),
                ],
            ]
        );

        // =====================================================================
        // PR 9 – Cancelled (by requester)
        // =====================================================================
        $createPr(
            [
                'request_date' => $now->copy()->subDays(20)->toDateString(),
                'requester_id' => $requester3->id,
                'department' => 'Sales',
                'priority' => 'Normal',
                'required_by_date' => $now->copy()->subDays(5)->toDateString(),
                'purpose' => 'Polyester for summer promotional t-shirts.',
                'status' => 'cancelled',
                'created_by' => $requester3->id,
            ],
            [
                [
                    'item_name' => 'Polyester Blend - Navy Blue',
                    'item_description' => 'Breathable polyester for summer wear',
                    'product_id' => null,
                    'estimated_cost' => 900.00,
                    'qty_requested' => 50,
                    'uom' => 'Meters',
                ],
            ],
            [
                [
                    'status' => 'draft',
                    'changed_by' => $requester3->id,
                    'comment' => 'PR created',
                    'created_at' => $now->copy()->subDays(20),
                    'updated_at' => $now->copy()->subDays(20),
                ],
                [
                    'status' => 'pending',
                    'changed_by' => $requester3->id,
                    'comment' => 'Submitted for review',
                    'created_at' => $now->copy()->subDays(19),
                    'updated_at' => $now->copy()->subDays(19),
                ],
                [
                    'status' => 'cancelled',
                    'changed_by' => $requester3->id,
                    'comment' => 'Cancelled. Client changed promo design, different fabric needed.',
                    'created_at' => $now->copy()->subDays(14),
                    'updated_at' => $now->copy()->subDays(14),
                ],
            ]
        );
    }
}
