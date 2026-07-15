<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $uoms = ['Pieces', 'Meters', 'Feet', 'Inches', 'Yards', 'Kg', 'Lbs', 'Liters', 'Gallons', 'Boxes', 'Rolls', 'Sheets'];
        foreach ($uoms as $uom) {
            Setting::updateOrCreate(
                ['key' => 'uom_'.Str::slug($uom, '_')],
                ['value' => $uom, 'type' => 'string']
            );
        }

        $categories = ['Apparel', 'Textiles', 'Accessories', 'Footwear', 'Raw Materials', 'Packaging', 'Embroidery', 'Printing'];
        foreach ($categories as $category) {
            ProductCategory::firstOrCreate(['name' => $category]);
        }

        DB::table('suppliers')->delete();
        $supplierIds = [];
        $suppliers = [
            ['company_name' => 'Textile Mills Ghana', 'contact_name' => 'Kojo Mensah', 'email' => 'info@textilemills.gh', 'payment_terms' => 'Net 30', 'city' => 'Accra', 'is_active' => true],
            ['company_name' => 'Fabrics Direct Ltd', 'contact_name' => 'Ama Serwaa', 'email' => 'sales@fabricsdirect.com', 'payment_terms' => 'Net 45', 'city' => 'Kumasi', 'is_active' => true],
            ['company_name' => 'Accessory World', 'contact_name' => 'Yaw Boateng', 'email' => 'orders@accessoryworld.ci', 'payment_terms' => 'Net 30', 'city' => 'Abidjan', 'is_active' => true],
            ['company_name' => 'Premium Zippers Co', 'contact_name' => 'Wei Chen', 'email' => 'procurement@premiumzippers.cn', 'payment_terms' => 'Net 60', 'city' => 'Shenzhen', 'is_active' => true],
            ['company_name' => 'Sustainable Threads', 'contact_name' => 'Fatima Al-Hassan', 'email' => 'hello@sustainablethreads.ke', 'payment_terms' => 'Net 30', 'city' => 'Nairobi', 'is_active' => true],
        ];
        foreach ($suppliers as $supplier) {
            $supplier['created_at'] = now();
            $supplier['updated_at'] = now();
            $supplierIds[] = DB::table('suppliers')->insertGetId($supplier);
        }

        DB::table('inventory_products')->delete();
        $productIds = [];
        $products = [
            ['material_id' => 'FAB-KTO-001', 'supplier_id' => $supplierIds[0], 'item_name' => 'Kente Fabric - Gold Thread', 'item_description' => 'Premium quality Ghanaian Kente fabric with gold thread woven pattern', 'item_category' => 'Apparel', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'FAB-KTO-002', 'supplier_id' => $supplierIds[0], 'item_name' => 'Kente Fabric - Multi-Color', 'item_description' => 'Traditional Ghanaian Kente fabric with multi-color pattern', 'item_category' => 'Apparel', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'FAB-KTO-003', 'supplier_id' => $supplierIds[0], 'item_name' => 'Kente Fabric - Silver Thread', 'item_description' => 'Elegant Ghanaian Kente fabric with silver thread accent', 'item_category' => 'Apparel', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'TXT-COT-001', 'supplier_id' => $supplierIds[1], 'item_name' => 'Cotton Fabric - Plain White', 'item_description' => '100% cotton plain white fabric, medium weight', 'item_category' => 'Textiles', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'TXT-COT-002', 'supplier_id' => $supplierIds[1], 'item_name' => 'Cotton Fabric - Plain Black', 'item_description' => '100% cotton plain black fabric, medium weight', 'item_category' => 'Textiles', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'TXT-COT-003', 'supplier_id' => $supplierIds[1], 'item_name' => 'Cotton Fabric - Ecru', 'item_description' => '100% cotton natural ecru fabric, medium weight', 'item_category' => 'Textiles', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'TXT-POL-001', 'supplier_id' => $supplierIds[1], 'item_name' => 'Polyester Blend - Navy Blue', 'item_description' => '65% polyester, 35% cotton blend in navy blue', 'item_category' => 'Textiles', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'TXT-POL-002', 'supplier_id' => $supplierIds[1], 'item_name' => 'Polyester Blend - Charcoal', 'item_description' => '65% polyester, 35% cotton blend in charcoal grey', 'item_category' => 'Textiles', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'TXT-LIN-001', 'supplier_id' => $supplierIds[1], 'item_name' => 'Linen Fabric - Natural', 'item_description' => '100% natural linen fabric, lightweight for summer', 'item_category' => 'Textiles', 'uom' => 'Meters', 'item_status' => 'Active'],
            ['material_id' => 'ACC-ZIP-001', 'supplier_id' => $supplierIds[3], 'item_name' => 'Metal Zipper - #5 YKK Gold', 'item_description' => 'YKK metal zipper, 60cm length, gold finish', 'item_category' => 'Accessories', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'ACC-ZIP-002', 'supplier_id' => $supplierIds[3], 'item_name' => 'Metal Zipper - #5 YKK Silver', 'item_description' => 'YKK metal zipper, 60cm length, silver finish', 'item_category' => 'Accessories', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'ACC-ZIP-003', 'supplier_id' => $supplierIds[3], 'item_name' => 'Invisible Zipper - #3 Black', 'item_description' => 'Invisible zipper, 45cm length, black', 'item_category' => 'Accessories', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'ACC-BTN-001', 'supplier_id' => $supplierIds[2], 'item_name' => '4-Hole Button - 11mm White', 'item_description' => 'Plastic 4-hole buttons, 11mm diameter, white', 'item_category' => 'Accessories', 'uom' => 'Boxes', 'item_status' => 'Active'],
            ['material_id' => 'ACC-BTN-002', 'supplier_id' => $supplierIds[2], 'item_name' => '4-Hole Button - 15mm Black', 'item_description' => 'Plastic 4-hole buttons, 15mm diameter, black', 'item_category' => 'Accessories', 'uom' => 'Boxes', 'item_status' => 'Active'],
            ['material_id' => 'ACC-ELC-001', 'supplier_id' => $supplierIds[2], 'item_name' => 'Elastic Band - 25mm White', 'item_description' => 'Flat elastic band, 25mm width, white, per roll', 'item_category' => 'Accessories', 'uom' => 'Rolls', 'item_status' => 'Active'],
            ['material_id' => 'ACC-VEL-001', 'supplier_id' => $supplierIds[2], 'item_name' => 'Velcro Tape - 20mm', 'item_description' => 'Hook and loop fastener tape, 20mm width, per roll', 'item_category' => 'Accessories', 'uom' => 'Rolls', 'item_status' => 'Active'],
            ['material_id' => 'RAW-THR-001', 'supplier_id' => $supplierIds[4], 'item_name' => 'Sewing Thread - White 5000m', 'item_description' => '100% polyester sewing thread, white, 5000m spool', 'item_category' => 'Raw Materials', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'RAW-THR-002', 'supplier_id' => $supplierIds[4], 'item_name' => 'Sewing Thread - Black 5000m', 'item_description' => '100% polyester sewing thread, black, 5000m spool', 'item_category' => 'Raw Materials', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'RAW-THR-003', 'supplier_id' => $supplierIds[4], 'item_name' => 'Embroidery Thread Set', 'item_description' => 'Multicolor embroidery thread set, 100 colors', 'item_category' => 'Raw Materials', 'uom' => 'Boxes', 'item_status' => 'Active'],
            ['material_id' => 'RAW-INT-001', 'supplier_id' => $supplierIds[4], 'item_name' => 'Interlining - Fusible Woven', 'item_description' => 'Fusible woven interlining, medium weight, per roll', 'item_category' => 'Raw Materials', 'uom' => 'Rolls', 'item_status' => 'Active'],
            ['material_id' => 'PKG-BOX-001', 'supplier_id' => $supplierIds[1], 'item_name' => 'Shipping Box - Medium', 'item_description' => 'Corrugated cardboard shipping box, medium size (40x30x20cm)', 'item_category' => 'Packaging', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'PKG-BOX-002', 'supplier_id' => $supplierIds[1], 'item_name' => 'Shipping Box - Small', 'item_description' => 'Corrugated cardboard shipping box, small size (25x20x15cm)', 'item_category' => 'Packaging', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'PKG-BAG-001', 'supplier_id' => $supplierIds[1], 'item_name' => 'Plastic Garment Bag', 'item_description' => 'Clear plastic garment bag, per piece', 'item_category' => 'Packaging', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'PKG-PAP-001', 'supplier_id' => $supplierIds[1], 'item_name' => 'Tissue Paper - White', 'item_description' => 'White tissue paper for wrapping, per pack', 'item_category' => 'Packaging', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'EMB-PAN-001', 'supplier_id' => $supplierIds[4], 'item_name' => 'Embroidery Panel - Custom 8 Color', 'item_description' => 'Custom embroidery panel for uniforms, up to 8 colors', 'item_category' => 'Embroidery', 'uom' => 'Pieces', 'item_status' => 'Disabled'],
            ['material_id' => 'EMB-PAN-002', 'supplier_id' => $supplierIds[4], 'item_name' => 'Embroidery Panel - Logo Only', 'item_description' => 'Simple logo embroidery panel, single color', 'item_category' => 'Embroidery', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'PRT-SCR-001', 'supplier_id' => $supplierIds[0], 'item_name' => 'Screen Print - Per Color', 'item_description' => 'Screen printing service, per color per item', 'item_category' => 'Printing', 'uom' => 'Pieces', 'item_status' => 'Active'],
            ['material_id' => 'PRT-DTF-001', 'supplier_id' => $supplierIds[0], 'item_name' => 'DTF Print - A4 Sheet', 'item_description' => 'DTF printing service, A4 size sheet', 'item_category' => 'Printing', 'uom' => 'Sheets', 'item_status' => 'Active'],
            ['material_id' => 'FTW-SHO-001', 'supplier_id' => $supplierIds[3], 'item_name' => 'Shoe Laces - 90cm Black', 'item_description' => 'Cotton shoe laces, 90cm length, black', 'item_category' => 'Footwear', 'uom' => 'Pairs', 'item_status' => 'Active'],
        ];

        DB::table('stocks')->delete();
        foreach ($products as $product) {
            $productId = Str::uuid()->toString();
            $product['id'] = $productId;
            $product['created_at'] = now();
            $product['updated_at'] = now();
            $product['date_deactivated'] = $product['item_status'] === 'Disabled' ? now() : null;
            DB::table('inventory_products')->insert($product);
            $productIds[] = $productId;
        }

        $stockRecords = [
            ['product_id' => $productIds[0], 'qty_purchased' => 200, 'date_purchased' => now()->subDays(60), 'notes' => 'Purchase Order #PO-2024-001'],
            ['product_id' => $productIds[0], 'qty_purchased' => 150, 'date_purchased' => now()->subDays(30), 'notes' => 'Purchase Order #PO-2024-002'],
            ['product_id' => $productIds[0], 'qty_purchased' => 100, 'date_purchased' => now()->subDays(10), 'notes' => 'Purchase Order #PO-2024-003'],
            ['product_id' => $productIds[1], 'qty_purchased' => 320, 'date_purchased' => now()->subDays(45), 'notes' => 'Purchase Order #PO-2024-001'],
            ['product_id' => $productIds[2], 'qty_purchased' => 180, 'date_purchased' => now()->subDays(20), 'notes' => 'Purchase Order #PO-2024-004'],
            ['product_id' => $productIds[3], 'qty_purchased' => 1500, 'date_purchased' => now()->subDays(90), 'notes' => 'Purchase Order #PO-2024-005'],
            ['product_id' => $productIds[3], 'qty_purchased' => 1000, 'date_purchased' => now()->subDays(15), 'notes' => 'Purchase Order #PO-2024-006'],
            ['product_id' => $productIds[4], 'qty_purchased' => 1000, 'date_purchased' => now()->subDays(75), 'notes' => 'Purchase Order #PO-2024-005'],
            ['product_id' => $productIds[4], 'qty_purchased' => 800, 'date_purchased' => now()->subDays(40), 'notes' => 'Purchase Order #PO-2024-007'],
            ['product_id' => $productIds[5], 'qty_purchased' => 2000, 'date_purchased' => now()->subDays(55), 'notes' => 'Purchase Order #PO-2024-008'],
            ['product_id' => $productIds[6], 'qty_purchased' => 2500, 'date_purchased' => now()->subDays(25), 'notes' => 'Purchase Order #PO-2024-009'],
            ['product_id' => $productIds[7], 'qty_purchased' => 3000, 'date_purchased' => now()->subDays(50), 'notes' => 'Purchase Order #PO-2024-010'],
            ['product_id' => $productIds[8], 'qty_purchased' => 150, 'date_purchased' => now()->subDays(35), 'notes' => 'Purchase Order #PO-2024-011'],
            ['product_id' => $productIds[8], 'qty_purchased' => 100, 'date_purchased' => now()->subDays(5), 'notes' => 'Purchase Order #PO-2024-012'],
            ['product_id' => $productIds[9], 'qty_purchased' => 5000, 'date_purchased' => now()->subDays(65), 'notes' => 'Purchase Order #PO-2024-013'],
            ['product_id' => $productIds[10], 'qty_purchased' => 4500, 'date_purchased' => now()->subDays(70), 'notes' => 'Purchase Order #PO-2024-013'],
            ['product_id' => $productIds[11], 'qty_purchased' => 3000, 'date_purchased' => now()->subDays(85), 'notes' => 'Purchase Order #PO-2024-014'],
            ['product_id' => $productIds[12], 'qty_purchased' => 200, 'date_purchased' => now()->subDays(80), 'notes' => 'Purchase Order #PO-2024-015'],
            ['product_id' => $productIds[13], 'qty_purchased' => 150, 'date_purchased' => now()->subDays(45), 'notes' => 'Purchase Order #PO-2024-015'],
            ['product_id' => $productIds[14], 'qty_purchased' => 100, 'date_purchased' => now()->subDays(30), 'notes' => 'Purchase Order #PO-2024-016'],
            ['product_id' => $productIds[15], 'qty_purchased' => 120, 'date_purchased' => now()->subDays(60), 'notes' => 'Purchase Order #PO-2024-017'],
            ['product_id' => $productIds[16], 'qty_purchased' => 800, 'date_purchased' => now()->subDays(55), 'notes' => 'Purchase Order #PO-2024-018'],
            ['product_id' => $productIds[17], 'qty_purchased' => 750, 'date_purchased' => now()->subDays(50), 'notes' => 'Purchase Order #PO-2024-018'],
            ['product_id' => $productIds[18], 'qty_purchased' => 50, 'date_purchased' => now()->subDays(20), 'notes' => 'Purchase Order #PO-2024-019'],
            ['product_id' => $productIds[19], 'qty_purchased' => 60, 'date_purchased' => now()->subDays(40), 'notes' => 'Purchase Order #PO-2024-020'],
            ['product_id' => $productIds[20], 'qty_purchased' => 1500, 'date_purchased' => now()->subDays(90), 'notes' => 'Purchase Order #PO-2024-021'],
            ['product_id' => $productIds[21], 'qty_purchased' => 2000, 'date_purchased' => now()->subDays(85), 'notes' => 'Purchase Order #PO-2024-022'],
            ['product_id' => $productIds[22], 'qty_purchased' => 5000, 'date_purchased' => now()->subDays(75), 'notes' => 'Purchase Order #PO-2024-023'],
            ['product_id' => $productIds[23], 'qty_purchased' => 3000, 'date_purchased' => now()->subDays(70), 'notes' => 'Purchase Order #PO-2024-024'],
        ];
        foreach ($stockRecords as $stock) {
            DB::table('stocks')->insert([
                'id' => Str::uuid()->toString(),
                'product_id' => $stock['product_id'],
                'qty_purchased' => $stock['qty_purchased'],
                'date_purchased' => $stock['date_purchased'],
                'notes' => $stock['notes'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('requisitions')->delete();
        $requisitionRecords = [
            ['product_id' => $productIds[0], 'qty_requested' => 50, 'date_requested' => now()->subDays(5), 'status' => 'approved', 'requested_by' => 'Production Team', 'notes' => 'Needed for upcoming order #ORD-2024-001'],
            ['product_id' => $productIds[3], 'qty_requested' => 100, 'date_requested' => now()->subDays(2), 'status' => 'pending', 'requested_by' => 'Design Studio', 'notes' => 'Sample production for new collection'],
            ['product_id' => $productIds[9], 'qty_requested' => 200, 'date_requested' => now()->subDays(1), 'status' => 'rejected', 'requested_by' => 'QC Team', 'notes' => 'Quality check - hold for inspection'],
            ['product_id' => $productIds[5], 'qty_requested' => 75, 'date_requested' => now()->subDays(3), 'status' => 'pending', 'requested_by' => 'Cutting Department', 'notes' => 'Urgent - order #ORD-2024-002'],
            ['product_id' => $productIds[12], 'qty_requested' => 30, 'date_requested' => now()->subDays(7), 'status' => 'approved', 'requested_by' => 'Embroidery Team', 'notes' => 'For embroidery job #EMB-001'],
            ['product_id' => $productIds[16], 'qty_requested' => 500, 'date_requested' => now()->subDays(10), 'status' => 'approved', 'requested_by' => 'Production Team', 'notes' => 'Monthly restocking'],
            ['product_id' => $productIds[20], 'qty_requested' => 100, 'date_requested' => now()->subDays(8), 'status' => 'pending', 'requested_by' => 'Warehouse', 'notes' => 'Low stock alert'],
            ['product_id' => $productIds[22], 'qty_requested' => 1000, 'date_requested' => now()->subDays(4), 'status' => 'approved', 'requested_by' => 'Shipping Department', 'notes' => 'Order fulfillment #ORD-2024-003'],
            ['product_id' => $productIds[7], 'qty_requested' => 200, 'date_requested' => now()->subDays(6), 'status' => 'rejected', 'requested_by' => 'Design Team', 'notes' => 'Design change - cancelled'],
            ['product_id' => $productIds[18], 'qty_requested' => 20, 'date_requested' => now()->subDays(9), 'status' => 'approved', 'requested_by' => 'Embroidery Team', 'notes' => 'New color sample required'],
        ];
        foreach ($requisitionRecords as $req) {
            DB::table('requisitions')->insert([
                'id' => Str::uuid()->toString(),
                'product_id' => $req['product_id'],
                'qty_requested' => $req['qty_requested'],
                'date_requested' => $req['date_requested'],
                'status' => $req['status'],
                'requested_by' => $req['requested_by'],
                'notes' => $req['notes'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
