<?php

namespace Database\Seeders;

use App\Models\Finance\Account;
use Illuminate\Database\Seeder;

class ChartOfAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $tree = [
            ['code' => '1000', 'name' => 'Assets', 'type' => 'asset', 'children' => [
                ['code' => '1010', 'name' => 'Cash', 'type' => 'asset', 'children' => [
                    ['code' => '1011', 'name' => 'Main Cash', 'type' => 'asset', 'subtype' => 'cash'],
                    ['code' => '1012', 'name' => 'Petty Cash', 'type' => 'asset', 'subtype' => 'cash'],
                ]],
                ['code' => '1020', 'name' => 'Bank', 'type' => 'asset', 'children' => [
                    ['code' => '1021', 'name' => 'GCB Business Account', 'type' => 'asset', 'subtype' => 'bank'],
                    ['code' => '1022', 'name' => 'Ecobank Account', 'type' => 'asset', 'subtype' => 'bank'],
                ]],
                ['code' => '1030', 'name' => 'Mobile Money', 'type' => 'asset', 'children' => [
                    ['code' => '1031', 'name' => 'MTN MoMo', 'type' => 'asset', 'subtype' => 'mobile_money'],
                    ['code' => '1032', 'name' => 'Telecel Cash', 'type' => 'asset', 'subtype' => 'mobile_money'],
                    ['code' => '1033', 'name' => 'AT Money', 'type' => 'asset', 'subtype' => 'mobile_money'],
                ]],
                ['code' => '1040', 'name' => 'Accounts Receivable', 'type' => 'asset', 'subtype' => 'receivable'],
                ['code' => '1050', 'name' => 'Inventory', 'type' => 'asset', 'subtype' => 'inventory'],
                ['code' => '1060', 'name' => 'Equipment', 'type' => 'asset', 'subtype' => 'fixed_asset'],
                ['code' => '1070', 'name' => 'Vehicles', 'type' => 'asset', 'subtype' => 'fixed_asset'],
                ['code' => '1080', 'name' => 'Buildings', 'type' => 'asset', 'subtype' => 'fixed_asset'],
                ['code' => '1090', 'name' => 'Other Assets', 'type' => 'asset', 'subtype' => 'other'],
            ]],
            ['code' => '2000', 'name' => 'Liabilities', 'type' => 'liability', 'children' => [
                ['code' => '2010', 'name' => 'Accounts Payable', 'type' => 'liability'],
                ['code' => '2020', 'name' => 'Loans', 'type' => 'liability'],
                ['code' => '2030', 'name' => 'Taxes Payable', 'type' => 'liability'],
                ['code' => '2040', 'name' => 'Accrued Expenses', 'type' => 'liability'],
                ['code' => '2090', 'name' => 'Other Liabilities', 'type' => 'liability'],
            ]],
            ['code' => '3000', 'name' => 'Equity', 'type' => 'equity', 'children' => [
                ['code' => '3010', 'name' => "Owner's Capital", 'type' => 'equity'],
                ['code' => '3020', 'name' => 'Retained Earnings', 'type' => 'equity'],
                ['code' => '3030', 'name' => 'Drawings', 'type' => 'equity'],
                ['code' => '3090', 'name' => 'Opening Balance Equity', 'type' => 'equity'],
            ]],
            ['code' => '4000', 'name' => 'Income', 'type' => 'income', 'children' => [
                ['code' => '4010', 'name' => 'Product Sales', 'type' => 'income'],
                ['code' => '4020', 'name' => 'Service Income', 'type' => 'income'],
                ['code' => '4030', 'name' => 'Printing Services', 'type' => 'income'],
                ['code' => '4040', 'name' => 'Design Services', 'type' => 'income'],
                ['code' => '4050', 'name' => 'Photography Services', 'type' => 'income'],
                ['code' => '4060', 'name' => 'Advertising', 'type' => 'income'],
                ['code' => '4090', 'name' => 'Other Income', 'type' => 'income'],
            ]],
            ['code' => '5000', 'name' => 'Expenses', 'type' => 'expense', 'children' => [
                ['code' => '5100', 'name' => 'Administrative Expenses', 'type' => 'expense', 'children' => [
                    ['code' => '5110', 'name' => 'Office Supplies', 'type' => 'expense'],
                    ['code' => '5120', 'name' => 'Internet', 'type' => 'expense'],
                    ['code' => '5130', 'name' => 'Electricity', 'type' => 'expense'],
                    ['code' => '5140', 'name' => 'Rent', 'type' => 'expense'],
                    ['code' => '5150', 'name' => 'Salaries', 'type' => 'expense'],
                ]],
                ['code' => '5200', 'name' => 'Operating Expenses', 'type' => 'expense', 'children' => [
                    ['code' => '5210', 'name' => 'Transport', 'type' => 'expense'],
                    ['code' => '5220', 'name' => 'Maintenance', 'type' => 'expense'],
                    ['code' => '5230', 'name' => 'Marketing', 'type' => 'expense'],
                    ['code' => '5240', 'name' => 'Materials', 'type' => 'expense'],
                ]],
                ['code' => '5900', 'name' => 'Other Expenses', 'type' => 'expense'],
            ]],
        ];

        foreach ($tree as $node) {
            $this->createNode($node, null);
        }
    }

    private function createNode(array $node, ?int $parentId): void
    {
        $account = Account::updateOrCreate(
            ['code' => $node['code']],
            [
                'name' => $node['name'],
                'type' => $node['type'],
                'subtype' => $node['subtype'] ?? null,
                'parent_id' => $parentId,
            ]
        );

        foreach ($node['children'] ?? [] as $child) {
            $this->createNode($child, $account->id);
        }
    }
}
