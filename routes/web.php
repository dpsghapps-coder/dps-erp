<?php

use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CrmController;
use App\Http\Controllers\CrmLeadController;
use App\Http\Controllers\CrmReportController;
use App\Http\Controllers\CrmSettingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\Finance\AccountController;
use App\Http\Controllers\Finance\AssetController;
use App\Http\Controllers\Finance\BillController;
use App\Http\Controllers\Finance\CashBankController;
use App\Http\Controllers\Finance\DashboardController as FinanceDashboardController;
use App\Http\Controllers\Finance\InvoiceController;
use App\Http\Controllers\Finance\LedgerController;
use App\Http\Controllers\Finance\ReportController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\HRM\EmployeeInviteController;
use App\Http\Controllers\HRM\PerformanceReviewController;
use App\Http\Controllers\HRM\SettingController;
use App\Http\Controllers\HrmController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Inventory\ProductCatalogController;
use App\Http\Controllers\Inventory\RequisitionController;
use App\Http\Controllers\Inventory\StockController;
use App\Http\Controllers\Inventory\SupplierController;
use App\Http\Controllers\Management\ActionItemController;
use App\Http\Controllers\Management\DashboardController as ManagementDashboardController;
use App\Http\Controllers\Management\DecisionController;
use App\Http\Controllers\Management\MeetingController;
use App\Http\Controllers\Management\ReviewController;
use App\Http\Controllers\Marketing\CampaignController;
use App\Http\Controllers\Marketing\MarketingDocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OfficeIssueReportController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderReportController;
use App\Http\Controllers\Procurement\GoodController;
use App\Http\Controllers\Procurement\GoodEditController;
use App\Http\Controllers\Procurement\PurchaseRequestController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\ProductionReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProformaController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SalesOverviewController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\StudioController;
use App\Http\Controllers\TechnicalReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/setup', [SetupController::class, 'show'])->name('setup');
Route::post('/setup', [SetupController::class, 'store'])->name('setup.store');

// Public employee self-onboarding form — accessed via a tokenized link, no login required.
Route::middleware('throttle:30,1')->group(function () {
    Route::get('/onboarding/{token}', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('/onboarding/{token}', [OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::middleware('permission:dashboard.view_executive')->group(function () {
        Route::get('/executive-dashboard', [DashboardController::class, 'executiveDashboard'])->name('executive-dashboard');
    });
    Route::get('/reports', [ReportsController::class, 'index'])->name('reports.index');

    // Help Center
    Route::get('/help', [HelpController::class, 'index'])->name('help.index');
    Route::get('/help/{slug}', [HelpController::class, 'show'])->name('help.show');

    // CRM Routes
    Route::middleware('permission:crm.create_clients')->group(function () {
        Route::get('/crm/create', [CrmController::class, 'create'])->name('crm.create');
        Route::post('/crm', [CrmController::class, 'store'])->name('crm.store');
    });

    // CRM Settings routes (must be before {client} wildcard)
    Route::middleware('permission:crm.manage_settings')->group(function () {
        Route::get('/crm/settings', [CrmSettingController::class, 'index'])->name('crm.settings.index');
        Route::post('/crm/settings/{type}', [CrmSettingController::class, 'store'])->name('crm.settings.store');
        Route::put('/crm/settings/{type}/{id}', [CrmSettingController::class, 'update'])->name('crm.settings.update');
        Route::delete('/crm/settings/{type}/{id}', [CrmSettingController::class, 'destroy'])->name('crm.settings.destroy');
    });

    Route::middleware('permission:crm.view')->group(function () {
        Route::get('/crm', [CrmController::class, 'index'])->name('crm.index');
        Route::get('/crm/leads', [CrmLeadController::class, 'index'])->name('crm.leads');
        Route::get('/crm/reports', [CrmReportController::class, 'index'])->name('crm.reports');
        Route::get('/crm/proformas', [ProformaController::class, 'all'])->name('crm.proformas.all');
        Route::get('/crm/{client}', [CrmController::class, 'show'])->name('crm.show');

        // Proforma Routes (must be before {client} wildcard)
        Route::get('/crm/{client}/proformas', [ProformaController::class, 'index'])->name('crm.proformas.index');
        // "create" is a literal segment and must be registered before the {proforma} wildcard below,
        // otherwise a request like /crm/5/proformas/create matches {proforma}="create" first and 404s.
        Route::get('/crm/{client}/proformas/create', [ProformaController::class, 'create'])
            ->name('crm.proformas.create')
            ->middleware('permission:crm.edit_clients');
        Route::get('/crm/{client}/proformas/{proforma}', [ProformaController::class, 'show'])->name('crm.proformas.show');
    });

    Route::middleware('permission:crm.edit_clients')->group(function () {
        Route::get('/crm/{client}/edit', [CrmController::class, 'edit'])->name('crm.edit');
        Route::put('/crm/{client}', [CrmController::class, 'update'])->name('crm.update');
        Route::patch('/crm/bulk-update', [CrmController::class, 'updateBulk'])->name('crm.updateBulk');
        Route::patch('/crm/{client}/status', [CrmController::class, 'updateStatus'])->name('crm.updateStatus');
        Route::post('/crm/{client}/greylist', [CrmController::class, 'toggleGreylist'])->name('crm.toggleGreylist');
        Route::post('/crm/{client}/deals', [DealController::class, 'store'])->name('crm.deals.store');
        Route::patch('/deals/{deal}/status', [DealController::class, 'updateStatus'])->name('deals.updateStatus');
        Route::post('/crm/{client}/interactions', [CrmController::class, 'logInteraction'])->name('crm.interactions');
        Route::post('/crm/{client}/contacts', [CrmController::class, 'storeContact'])->name('crm.contacts.store');
        Route::put('/crm/{client}/contacts/{contact}', [CrmController::class, 'updateContact'])->name('crm.contacts.update');
        Route::delete('/crm/{client}/contacts/{contact}', [CrmController::class, 'destroyContact'])->name('crm.contacts.destroy');

        Route::post('/crm/{client}/proformas', [ProformaController::class, 'store'])->name('crm.proformas.store');
        Route::get('/crm/{client}/proformas/{proforma}/edit', [ProformaController::class, 'edit'])->name('crm.proformas.edit');
        Route::put('/crm/{client}/proformas/{proforma}', [ProformaController::class, 'update'])->name('crm.proformas.update');
    });

    Route::middleware('permission:crm.delete_clients')->group(function () {
        Route::delete('/crm/{client}', [CrmController::class, 'destroy'])->name('crm.destroy');
        Route::delete('/crm/{client}/proformas/{proforma}', [ProformaController::class, 'destroy'])->name('crm.proformas.destroy');
    });


    Route::middleware('permission:products.view')->group(function () {
        Route::get('/sales/overview', [SalesOverviewController::class, 'index'])->name('sales.overview');
    });

    // Products Routes
    Route::middleware('permission:products.create')->group(function () {
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    });

    Route::middleware('permission:products.view')->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
        Route::get('/calculators', [ProductController::class, 'calculators'])->name('products.calculators');
    });

    Route::middleware('permission:products.edit')->group(function () {
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    });

    Route::middleware('permission:products.delete')->group(function () {
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    // Services Routes
    Route::middleware('permission:services.create')->group(function () {
        Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
        Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
    });

    Route::middleware('permission:services.view')->group(function () {
        Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
        Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
    });

    Route::middleware('permission:services.edit')->group(function () {
        Route::get('/services/{service}/edit', [ServiceController::class, 'edit'])->name('services.edit');
        Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
    });

    Route::middleware('permission:services.delete')->group(function () {
        Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
    });

    // Inventory Routes
    Route::middleware('permission:inventory.view')->group(function () {
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::get('/inventory/suppliers', [SupplierController::class, 'index'])->name('inventory.suppliers');
        Route::get('/inventory/suppliers/{supplier}', [SupplierController::class, 'show'])->name('inventory.suppliers.show');
        Route::get('/inventory/materials', [ProductCatalogController::class, 'index'])->name('inventory.materials');
        Route::get('/inventory/materials/{product}', [ProductCatalogController::class, 'show'])->name('inventory.materials.show');
        Route::get('/inventory/stock', [StockController::class, 'index'])->name('inventory.stock');
        Route::get('/inventory/requisitions', [RequisitionController::class, 'index'])->name('inventory.requisitions');
    });

    Route::middleware('permission:inventory.manage_suppliers')->group(function () {
        Route::post('/inventory/suppliers', [SupplierController::class, 'store'])->name('inventory.suppliers.store');
        Route::put('/inventory/suppliers/{supplier}', [SupplierController::class, 'update'])->name('inventory.suppliers.update');
        Route::delete('/inventory/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('inventory.suppliers.destroy');
    });

    Route::middleware('permission:inventory.manage_products')->group(function () {
        Route::post('/inventory/materials', [ProductCatalogController::class, 'store'])->name('inventory.materials.store');
        Route::get('/inventory/materials/{product}/edit', [ProductCatalogController::class, 'edit'])->name('inventory.materials.edit');
        Route::put('/inventory/materials/{product}', [ProductCatalogController::class, 'update'])->name('inventory.materials.update');
        Route::delete('/inventory/materials/{product}', [ProductCatalogController::class, 'destroy'])->name('inventory.materials.destroy');
        Route::patch('/inventory/materials/{product}/threshold', [ProductCatalogController::class, 'updateThreshold'])->name('inventory.materials.threshold');

        Route::post('/inventory/materials/{product}/suppliers', [ProductCatalogController::class, 'storeSupplierPrice'])->name('inventory.materials.suppliers.store');
        Route::put('/inventory/materials/suppliers/{supplierPrice}', [ProductCatalogController::class, 'updateSupplierPrice'])->name('inventory.materials.suppliers.update');
        Route::delete('/inventory/materials/suppliers/{supplierPrice}', [ProductCatalogController::class, 'destroySupplierPrice'])->name('inventory.materials.suppliers.destroy');

        Route::post('/inventory/materials/{product}/prices', [ProductCatalogController::class, 'storePrice'])->name('inventory.materials.prices.store');
        Route::put('/inventory/materials/prices/{price}', [ProductCatalogController::class, 'updatePrice'])->name('inventory.materials.prices.update');
        Route::delete('/inventory/materials/prices/{price}', [ProductCatalogController::class, 'destroyPrice'])->name('inventory.materials.prices.destroy');
    });

    Route::middleware('permission:inventory.manage_stock')->group(function () {
        Route::post('/inventory/stock', [StockController::class, 'store'])->name('inventory.stock.store');
        Route::put('/inventory/stock/{stock}', [StockController::class, 'update'])->name('inventory.stock.update');
        Route::delete('/inventory/stock/{stock}', [StockController::class, 'destroy'])->name('inventory.stock.destroy');
    });

    Route::middleware('permission:inventory.manage_requisitions')->group(function () {
        Route::post('/inventory/requisitions', [RequisitionController::class, 'store'])->name('inventory.requisitions.store');
        Route::put('/inventory/requisitions/{requisition}', [RequisitionController::class, 'update'])->name('inventory.requisitions.update');
        Route::patch('/inventory/requisitions/{requisition}/status', [RequisitionController::class, 'updateStatus'])->name('inventory.requisitions.status');
        Route::delete('/inventory/requisitions/{requisition}', [RequisitionController::class, 'destroy'])->name('inventory.requisitions.destroy');
    });

    // Orders Routes
    Route::middleware('permission:orders.create')->group(function () {
        Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    });

    Route::middleware('permission:orders.view')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/reports', [OrderReportController::class, 'index'])->name('orders.reports');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    });

    Route::middleware('permission:orders.edit')->group(function () {
        Route::get('/orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
        Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    });

    Route::middleware('permission:orders.manage_status')->group(function () {
        Route::post('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status.update');
    });

    Route::middleware('permission:orders.record_payment')->group(function () {
        Route::post('/orders/{order}/payments', [OrderController::class, 'storePayment'])->name('orders.payments.store');
    });

    // Production Routes
    Route::middleware('permission:production.create')->group(function () {
        Route::get('/production/create', [ProductionController::class, 'create'])->name('production.create');
        Route::post('/production', [ProductionController::class, 'store'])->name('production.store');
    });

    Route::middleware('permission:production.view')->group(function () {
        Route::get('/production', [ProductionController::class, 'index'])->name('production.index');
        Route::get('/production/reports', [ProductionReportController::class, 'index'])->name('production.reports');
        Route::get('/production/{job}', [ProductionController::class, 'show'])->name('production.show');
    });

    Route::middleware('permission:production.edit')->group(function () {
        Route::get('/production/{job}/edit', [ProductionController::class, 'edit'])->name('production.edit');
        Route::put('/production/{job}', [ProductionController::class, 'update'])->name('production.update');
        Route::patch('/production/{job}/status', [ProductionController::class, 'updateStatus'])->name('production.updateStatus');
    });

    Route::middleware('permission:production.delete')->group(function () {
        Route::delete('/production/{job}', [ProductionController::class, 'destroy'])->name('production.destroy');
    });

    // Procurement Routes
    $prCtrl = PurchaseRequestController::class;

    Route::middleware('permission:procurement.view')->group(function () {
        Route::get('/procurement', [ProcurementController::class, 'index'])->name('procurement.index');
        Route::get('/procurement/orders', [ProcurementController::class, 'orders'])->name('procurement.orders');
    });

    Route::middleware('permission:procurement.create')->group(function () {
        Route::get('/procurement/create', [ProcurementController::class, 'create'])->name('procurement.create');
        Route::post('/procurement', [ProcurementController::class, 'store'])->name('procurement.store');
    });

    // Goods routes (must be before wildcard {po})
    Route::middleware('permission:procurement.view')->group(function () {
        Route::get('/procurement/goods', [GoodController::class, 'index'])->name('procurement.goods.index');
        Route::get('/procurement/goods/{good}', [GoodController::class, 'show'])->name('procurement.goods.show');
    });

    Route::middleware('permission:procurement.manage_goods')->group(function () {
        Route::post('/procurement/goods', [GoodController::class, 'store'])->name('procurement.goods.store');
        Route::get('/procurement/goods/{good}/edit', GoodEditController::class)->name('procurement.goods.edit');
        Route::put('/procurement/goods/{good}', [GoodController::class, 'update'])->name('procurement.goods.update');
        Route::delete('/procurement/goods/{good}', [GoodController::class, 'destroy'])->name('procurement.goods.destroy');

        Route::post('/procurement/goods/{good}/suppliers', [GoodController::class, 'storeSupplierPrice'])->name('procurement.goods.suppliers.store');
        Route::delete('/procurement/goods/suppliers/{supplierPrice}', [GoodController::class, 'destroySupplierPrice'])->name('procurement.goods.suppliers.destroy');
    });

    // Purchase Requests (must be before {po} wildcard, and /create before {purchaseRequest})
    Route::middleware('permission:pr.create')->group(function () use ($prCtrl) {
        Route::get('/procurement/purchase-requests/create', [$prCtrl, 'create'])->name('procurement.purchase-requests.create');
        Route::post('/procurement/purchase-requests', [$prCtrl, 'store'])->name('procurement.purchase-requests.store');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/submit', [$prCtrl, 'submit'])->name('procurement.purchase-requests.submit');
    });

    // Edit/update also allow dept and finance reviewers (not just the pr.create'd requester) to
    // fix a PR directly during their review stage -- canManagePr() in the controller does the
    // precise per-PR scoping (requester/department/status), this just gets them past the gate.
    Route::middleware('permission:pr.create,pr.approve,pr.finance.review')->group(function () use ($prCtrl) {
        Route::get('/procurement/purchase-requests/{purchaseRequest}/edit', [$prCtrl, 'edit'])->name('procurement.purchase-requests.edit');
        Route::put('/procurement/purchase-requests/{purchaseRequest}', [$prCtrl, 'update'])->name('procurement.purchase-requests.update');
    });

    Route::middleware('permission:pr.view')->group(function () use ($prCtrl) {
        Route::get('/procurement/purchase-requests', [$prCtrl, 'index'])->name('procurement.purchase-requests.index');
        Route::get('/procurement/purchase-requests/{purchaseRequest}', [$prCtrl, 'show'])->name('procurement.purchase-requests.show');
    });

    Route::middleware('permission:pr.cancel')->group(function () use ($prCtrl) {
        Route::delete('/procurement/purchase-requests/{purchaseRequest}', [$prCtrl, 'destroy'])->name('procurement.purchase-requests.destroy');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/cancel', [$prCtrl, 'cancel'])->name('procurement.purchase-requests.cancel');
    });

    Route::middleware('permission:pr.approve')->group(function () use ($prCtrl) {
        Route::post('/procurement/purchase-requests/{purchaseRequest}/dept-review', [$prCtrl, 'deptReview'])->name('procurement.purchase-requests.dept-review');
    });

    Route::middleware('permission:pr.finance.review')->group(function () use ($prCtrl) {
        Route::post('/procurement/purchase-requests/{purchaseRequest}/finance-review', [$prCtrl, 'financeReview'])->name('procurement.purchase-requests.finance-review');
    });

    Route::middleware('permission:procurement.create')->group(function () use ($prCtrl) {
        Route::get('/procurement/purchase-requests/{purchaseRequest}/create-po', [$prCtrl, 'createPo'])->name('procurement.purchase-requests.create-po');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/store-po', [$prCtrl, 'storePo'])->name('procurement.purchase-requests.store-po');
    });

    Route::middleware('permission:procurement.manage_goods')->group(function () use ($prCtrl) {
        Route::post('/procurement/purchase-requests/{purchaseRequest}/upload-receipt', [$prCtrl, 'uploadReceipt'])->name('procurement.purchase-requests.upload-receipt');
    });

    Route::middleware('permission:procurement.inspect')->group(function () use ($prCtrl) {
        Route::post('/procurement/purchase-requests/{purchaseRequest}/inspect', [$prCtrl, 'inspect'])->name('procurement.purchase-requests.inspect');
    });

    Route::middleware('permission:procurement.close')->group(function () use ($prCtrl) {
        Route::post('/procurement/purchase-requests/{purchaseRequest}/close-po', [$prCtrl, 'closePo'])->name('procurement.purchase-requests.close-po');
        Route::post('/procurement/{po}/pull-to-stock', [ProcurementController::class, 'pullToStock'])->name('procurement.pull-to-stock');
    });

    Route::middleware('permission:procurement.view')->group(function () {
        Route::get('/procurement/{po}', [ProcurementController::class, 'show'])->name('procurement.show');
        Route::get('/procurement/{po}/pdf', [ProcurementController::class, 'downloadPdf'])->name('procurement.pdf');
        Route::get('/procurement/{po}/whatsapp', [ProcurementController::class, 'downloadWhatsapp'])->name('procurement.whatsapp');
        Route::post('/procurement/{po}/mark-ordered', [ProcurementController::class, 'markOrdered'])->name('procurement.mark-ordered');
    });

    Route::middleware('permission:procurement.edit')->group(function () {
        Route::get('/procurement/{po}/edit', [ProcurementController::class, 'edit'])->name('procurement.edit');
        Route::put('/procurement/{po}', [ProcurementController::class, 'update'])->name('procurement.update');
    });

    // HRM Routes
    Route::middleware('permission:hrm.view')->group(function () {
        Route::get('/hrm', [HrmController::class, 'index'])->name('hrm.index');
        Route::get('/hrm/dashboard', [HrmController::class, 'dashboard'])->name('hrm.dashboard');
        Route::get('/hrm/employees', [HrmController::class, 'employees'])->name('hrm.employees');
        Route::get('/hrm/employees/{employee}', [HrmController::class, 'employeeShow'])->name('hrm.employeeShow');
        Route::get('/hrm/org-chart', [HrmController::class, 'orgChart'])->name('hrm.orgChart');
        Route::get('/hrm/attendance', [HrmController::class, 'attendance'])->name('hrm.attendance');
        Route::post('/hrm/attendance/check-in', [HrmController::class, 'checkIn'])->name('hrm.checkIn');
        Route::post('/hrm/attendance/check-out', [HrmController::class, 'checkOut'])->name('hrm.checkOut');
        Route::get('/hrm/leaves', [HrmController::class, 'leaves'])->name('hrm.leaves');
        Route::post('/hrm/leaves', [HrmController::class, 'storeLeave'])->name('hrm.leaves.store');
        Route::post('/hrm/leaves/{leaveRequest}/approve', [HrmController::class, 'approveLeave'])->name('hrm.leaves.approve');
        Route::post('/hrm/leaves/{leaveRequest}/reject', [HrmController::class, 'rejectLeave'])->name('hrm.leaves.reject');
        Route::get('/hrm/holidays', [HrmController::class, 'holidays'])->name('hrm.holidays');
        Route::post('/hrm/holidays', [HrmController::class, 'storeHoliday'])->name('hrm.holidays.store');
        Route::get('/hrm/payroll', [HrmController::class, 'payroll'])->name('hrm.payroll');
        Route::get('/hrm/payroll/{payroll}/pdf', [HrmController::class, 'payslipPdf'])->name('hrm.payroll.pdf');
        Route::get('/hrm/performance', [HrmController::class, 'performance'])->name('hrm.performance');
        Route::post('/hrm/performance', [PerformanceReviewController::class, 'initiate'])->name('hrm.performance.store');
        Route::get('/hrm/noticeboard', [HrmController::class, 'noticeboard'])->name('hrm.noticeboard');
        Route::post('/hrm/noticeboard', [HrmController::class, 'storeNotice'])->name('hrm.noticeboard.store');
        Route::get('/hrm/create', [HrmController::class, 'create'])->name('hrm.create');
        Route::post('/hrm', [HrmController::class, 'store'])->name('hrm.store');

        // HRM Settings routes (must be before {employee} wildcard)
        Route::get('/hrm/settings', [SettingController::class, 'index'])->name('hrm.settings.index');
        Route::post('/hrm/settings/departments', [SettingController::class, 'storeDepartment'])->name('hrm.settings.departments.store');
        Route::get('/hrm/settings/departments/{department}/edit', [SettingController::class, 'editDepartment'])->name('hrm.settings.departments.edit');
        Route::put('/hrm/settings/departments/{department}', [SettingController::class, 'updateDepartment'])->name('hrm.settings.departments.update');
        Route::delete('/hrm/settings/departments/{department}', [SettingController::class, 'destroyDepartment'])->name('hrm.settings.departments.destroy');

        Route::post('/hrm/settings/employment-types', [SettingController::class, 'storeEmploymentType'])->name('hrm.settings.employment-types.store');
        Route::get('/hrm/settings/employment-types/{employmentType}/edit', [SettingController::class, 'editEmploymentType'])->name('hrm.settings.employment-types.edit');
        Route::put('/hrm/settings/employment-types/{employmentType}', [SettingController::class, 'updateEmploymentType'])->name('hrm.settings.employment-types.update');
        Route::delete('/hrm/settings/employment-types/{employmentType}', [SettingController::class, 'destroyEmploymentType'])->name('hrm.settings.employment-types.destroy');

        Route::post('/hrm/settings/leave-types/matrix', [SettingController::class, 'storeLeaveTypeMatrix'])->name('hrm.settings.leave-types.matrix');

        Route::post('/hrm/settings/staff-levels', [SettingController::class, 'storeStaffLevel'])->name('hrm.settings.staff-levels.store');
        Route::get('/hrm/settings/staff-levels/{staffLevel}/edit', [SettingController::class, 'editStaffLevel'])->name('hrm.settings.staff-levels.edit');
        Route::put('/hrm/settings/staff-levels/{staffLevel}', [SettingController::class, 'updateStaffLevel'])->name('hrm.settings.staff-levels.update');
        Route::delete('/hrm/settings/staff-levels/{staffLevel}', [SettingController::class, 'destroyStaffLevel'])->name('hrm.settings.staff-levels.destroy');

        // Employee self-onboarding invites (must be before {employee} wildcard)
        Route::get('/hrm/invites', [EmployeeInviteController::class, 'index'])->name('hrm.invites.index');
        Route::post('/hrm/invites', [EmployeeInviteController::class, 'store'])->name('hrm.invites.store');
        Route::delete('/hrm/invites/{invite}', [EmployeeInviteController::class, 'destroy'])->name('hrm.invites.destroy');
        Route::get('/hrm/invites/{invite}/review', [EmployeeInviteController::class, 'review'])->name('hrm.invites.review');
        Route::post('/hrm/invites/{invite}/approve', [EmployeeInviteController::class, 'approve'])->name('hrm.invites.approve');

        // Office issue reports (must be before {employee} wildcard)
        Route::get('/hrm/issue-reports', [OfficeIssueReportController::class, 'index'])->name('hrm.issue-reports');
        Route::post('/hrm/issue-reports/{officeIssueReport}/status', [OfficeIssueReportController::class, 'updateStatus'])->name('hrm.issue-reports.status');

        Route::get('/hrm/{employee}', [HrmController::class, 'show'])->name('hrm.show');
        Route::get('/hrm/{employee}/edit', [HrmController::class, 'edit'])->name('hrm.edit');
        Route::put('/hrm/{employee}', [HrmController::class, 'update'])->name('hrm.update');
    });

    // Studio Routes
    Route::middleware('permission:studio.view')->group(function () {
        Route::get('/studio', [StudioController::class, 'index'])->name('studio.index');
        Route::get('/studio/create', [StudioController::class, 'create'])->name('studio.create');
        Route::post('/studio', [StudioController::class, 'store'])->name('studio.store');

        // Resource management (must be before {booking} wildcard)
        Route::get('/studio/resources', [StudioController::class, 'resources'])->name('studio.resources.index');
        Route::post('/studio/resources', [StudioController::class, 'storeResource'])->name('studio.resources.store');
        Route::put('/studio/resources/{resource}', [StudioController::class, 'updateResource'])->name('studio.resources.update');
        Route::delete('/studio/resources/{resource}', [StudioController::class, 'destroyResource'])->name('studio.resources.destroy');

        Route::post('/studio/shoot-types', [StudioController::class, 'storeShootType'])->name('studio.shoot-types.store');
        Route::put('/studio/shoot-types/{shootType}', [StudioController::class, 'updateShootType'])->name('studio.shoot-types.update');
        Route::delete('/studio/shoot-types/{shootType}', [StudioController::class, 'destroyShootType'])->name('studio.shoot-types.destroy');

        Route::put('/studio/deliverables/{deliverable}', [StudioController::class, 'updateDeliverable'])->name('studio.deliverables.update');
        Route::delete('/studio/deliverables/{deliverable}', [StudioController::class, 'destroyDeliverable'])->name('studio.deliverables.destroy');

        Route::get('/studio/{booking}', [StudioController::class, 'show'])->name('studio.show');
        Route::get('/studio/{booking}/edit', [StudioController::class, 'edit'])->name('studio.edit');
        Route::put('/studio/{booking}', [StudioController::class, 'update'])->name('studio.update');
        Route::delete('/studio/{booking}', [StudioController::class, 'destroy'])->name('studio.destroy');
        Route::post('/studio/{booking}/invoice', [StudioController::class, 'generateInvoice'])->name('studio.invoice');
        Route::post('/studio/{booking}/deliverables', [StudioController::class, 'storeDeliverable'])->name('studio.deliverables.store');
    });

    // Finance Dashboard Route
    Route::middleware('permission:finance.view')->group(function () {
        Route::get('/finance/dashboard', [FinanceDashboardController::class, 'index'])->name('finance.dashboard');
        Route::get('/finance/help', fn () => view('finance.help'))->name('finance.help');
    });

    // Finance Reports Routes
    Route::middleware('permission:finance.view')->prefix('finance/reports')->name('finance.reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/profit-loss', [ReportController::class, 'profitLoss'])->name('profit-loss');
        Route::get('/balance-sheet', [ReportController::class, 'balanceSheet'])->name('balance-sheet');
        Route::get('/transactions', [ReportController::class, 'transactions'])->name('transactions');
    });

    // Finance / Accounts Receivable Routes
    Route::middleware('permission:finance.view')->prefix('finance/receivables')->name('finance.receivables.')->group(function () {
        Route::get('/', [InvoiceController::class, 'index'])->name('index');
        Route::get('/create', [InvoiceController::class, 'create'])->name('create');
        Route::get('/{invoice}', [InvoiceController::class, 'show'])->name('show');
        Route::get('/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('pdf');
    });
    Route::middleware('permission:finance.manage_receivables')->prefix('finance/receivables')->name('finance.receivables.')->group(function () {
        Route::post('/', [InvoiceController::class, 'store'])->name('store');
        Route::post('/{invoice}/send', [InvoiceController::class, 'send'])->name('send');
        Route::post('/{invoice}/payments', [InvoiceController::class, 'storePayment'])->name('payments.store');
        Route::post('/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('cancel');
        Route::delete('/{invoice}', [InvoiceController::class, 'destroy'])->name('destroy');
    });

    // Finance / Accounts Payable Routes
    Route::middleware('permission:finance.view')->prefix('finance/payables')->name('finance.payables.')->group(function () {
        Route::get('/', [BillController::class, 'index'])->name('index');
        Route::get('/create', [BillController::class, 'create'])->name('create');
        Route::get('/{bill}', [BillController::class, 'show'])->name('show');
    });
    Route::middleware('permission:finance.manage_payables')->prefix('finance/payables')->name('finance.payables.')->group(function () {
        Route::post('/', [BillController::class, 'store'])->name('store');
        Route::post('/{bill}/submit', [BillController::class, 'submit'])->name('submit');
        Route::post('/{bill}/payments', [BillController::class, 'storePayment'])->name('payments.store');
        Route::post('/{bill}/cancel', [BillController::class, 'cancel'])->name('cancel');
        Route::delete('/{bill}', [BillController::class, 'destroy'])->name('destroy');
    });

    // Finance / Asset Ledger Routes (registered before the /finance/{transaction} wildcard below)
    Route::middleware('permission:finance.view_assets')->group(function () {
        Route::get('/finance/assets', [AssetController::class, 'index'])->name('finance.assets.index');
        Route::get('/finance/assets/{asset}', [AssetController::class, 'show'])->name('finance.assets.show');
    });
    Route::middleware('permission:finance.manage_assets')->group(function () {
        Route::post('/finance/assets', [AssetController::class, 'store'])->name('finance.assets.store');
        Route::post('/finance/assets/{asset}/entries', [AssetController::class, 'storeEntry'])->name('finance.assets.entries.store');
        Route::delete('/finance/assets/{asset}', [AssetController::class, 'destroy'])->name('finance.assets.destroy');
    });

    // Finance / Chart of Accounts Routes
    Route::middleware('permission:finance.view')->group(function () {
        Route::get('/finance/accounts', [AccountController::class, 'index'])->name('finance.accounts.index');
    });
    Route::middleware('permission:finance.manage_accounts')->group(function () {
        Route::post('/finance/accounts', [AccountController::class, 'store'])->name('finance.accounts.store');
        Route::put('/finance/accounts/{account}', [AccountController::class, 'update'])->name('finance.accounts.update');
        Route::delete('/finance/accounts/{account}', [AccountController::class, 'destroy'])->name('finance.accounts.destroy');
    });

    // Finance / Cash & Bank Routes
    Route::middleware('permission:finance.view')->group(function () {
        Route::get('/finance/cash-bank', [CashBankController::class, 'index'])->name('finance.cash-bank.index');
    });
    Route::middleware('permission:finance.manage_transfers')->group(function () {
        Route::post('/finance/cash-bank/transfer', [CashBankController::class, 'transfer'])->name('finance.cash-bank.transfer');
    });

    // Finance / General Ledger Routes
    Route::middleware('permission:finance.view')->group(function () {
        Route::get('/finance/ledger', [LedgerController::class, 'index'])->name('finance.ledger.index');
        Route::get('/finance/ledger/{journalEntry}', [LedgerController::class, 'show'])->name('finance.ledger.show');
    });

    // Finance Routes
    Route::middleware('permission:finance.view')->group(function () {
        Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
        Route::get('/finance/create', [FinanceController::class, 'create'])->name('finance.create');
        Route::post('/finance', [FinanceController::class, 'store'])->name('finance.store');
        Route::get('/finance/{transaction}', [FinanceController::class, 'show'])->name('finance.show');
        Route::get('/finance/{transaction}/edit', [FinanceController::class, 'edit'])->name('finance.edit');
        Route::put('/finance/{transaction}', [FinanceController::class, 'update'])->name('finance.update');
        Route::delete('/finance/{transaction}', [FinanceController::class, 'destroy'])->name('finance.destroy');
    });

    // Decision Hub Routes
    Route::middleware('permission:decision_hub.view')->prefix('management')->name('management.')->group(function () {
        Route::get('/dashboard', [ManagementDashboardController::class, 'index'])->name('dashboard');

        // Meetings
        Route::get('/meetings', [MeetingController::class, 'index'])->name('meetings.index');
        Route::get('/meetings/create', [MeetingController::class, 'create'])->name('meetings.create');
        Route::post('/meetings', [MeetingController::class, 'store'])->name('meetings.store');
        Route::get('/meetings/{meeting}', [MeetingController::class, 'show'])->name('meetings.show');
        Route::get('/meetings/{meeting}/edit', [MeetingController::class, 'edit'])->name('meetings.edit');
        Route::put('/meetings/{meeting}', [MeetingController::class, 'update'])->name('meetings.update');
        Route::delete('/meetings/{meeting}', [MeetingController::class, 'destroy'])->name('meetings.destroy');

        // Decisions
        Route::get('/decisions', [DecisionController::class, 'index'])->name('decisions.index');
        Route::get('/decisions/create', [DecisionController::class, 'create'])->name('decisions.create');
        Route::post('/decisions', [DecisionController::class, 'store'])->name('decisions.store');
        Route::get('/decisions/{decision}', [DecisionController::class, 'show'])->name('decisions.show');
        Route::get('/decisions/{decision}/edit', [DecisionController::class, 'edit'])->name('decisions.edit');
        Route::put('/decisions/{decision}', [DecisionController::class, 'update'])->name('decisions.update');
        Route::delete('/decisions/{decision}', [DecisionController::class, 'destroy'])->name('decisions.destroy');
        Route::patch('/decisions/{decision}/status', [DecisionController::class, 'updateStatus'])->name('decisions.status');

        // Action Items
        Route::post('/action-items', [ActionItemController::class, 'store'])->name('action-items.store');
        Route::put('/action-items/{item}', [ActionItemController::class, 'update'])->name('action-items.update');
        Route::post('/action-items/{item}/updates', [ActionItemController::class, 'addUpdate'])->name('action-items.updates');
        Route::delete('/action-items/{item}', [ActionItemController::class, 'destroy'])->name('action-items.destroy');

        // Reviews
        Route::post('/decisions/{decision}/review', [ReviewController::class, 'store'])->name('reviews.store');
        Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    });

    // Admin Routes
    Route::middleware('permission:admin.manage_users,admin.manage_roles,admin.manage_settings')->group(function () {
        Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');

        // User Management
        Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
        Route::get('/admin/users/create', [AdminController::class, 'userCreate'])->name('admin.users.create');
        Route::post('/admin/users', [AdminController::class, 'userStore'])->name('admin.users.store');
        Route::get('/admin/users/{user}/edit', [AdminController::class, 'userEdit'])->name('admin.users.edit');
        Route::put('/admin/users/{user}', [AdminController::class, 'userUpdate'])->name('admin.users.update');

        // Role Management
        Route::get('/admin/roles', [AdminController::class, 'roles'])->name('admin.roles');
        Route::get('/admin/roles/create', [AdminController::class, 'roleCreate'])->name('admin.roles.create');
        Route::post('/admin/roles', [AdminController::class, 'roleStore'])->name('admin.roles.store');
        Route::get('/admin/roles/{role}/edit', [AdminController::class, 'roleEdit'])->name('admin.roles.edit');
        Route::put('/admin/roles/{role}', [AdminController::class, 'roleUpdate'])->name('admin.roles.update');
        Route::delete('/admin/roles/{role}', [AdminController::class, 'roleDestroy'])->name('admin.roles.destroy');

        // Settings
        Route::get('/admin/settings', [AdminController::class, 'settings'])->name('admin.settings');
        Route::put('/admin/settings', [AdminController::class, 'settingsUpdate'])->name('admin.settings.update');
        Route::post('/admin/settings/uom', [AdminController::class, 'storeUom']);
        Route::delete('/admin/settings/uom/{setting}', [AdminController::class, 'deleteUom']);
        Route::post('/admin/settings/category', [AdminController::class, 'storeCategory']);
        Route::delete('/admin/settings/category/{productCategory}', [AdminController::class, 'deleteCategory']);
        Route::post('/admin/settings/attribute', [AdminController::class, 'storeAttribute']);
        Route::delete('/admin/settings/attribute/{setting}', [AdminController::class, 'deleteAttribute']);
        Route::post('/admin/settings/category-attribute', [AdminController::class, 'toggleCategoryAttribute']);
        Route::post('/admin/settings/extra-cost-type', [AdminController::class, 'storeExtraCostType']);
        Route::delete('/admin/settings/extra-cost-type/{setting}', [AdminController::class, 'deleteExtraCostType']);
    });

    // Factory reset — deliberately gated behind its own dedicated permission,
    // not bundled with general settings management.
    Route::middleware('permission:admin.factory_reset')->group(function () {
        Route::post('/admin/settings/factory-reset', [AdminController::class, 'factoryReset'])->name('admin.settings.factory-reset');
    });

    // Database backups — on-demand + scheduled email backups. Literal routes
    // (/settings) before the {filename} wildcard.
    Route::middleware('permission:admin.manage_backups')->group(function () {
        Route::get('/admin/backups', [BackupController::class, 'index'])->name('admin.backups.index');
        Route::post('/admin/backups', [BackupController::class, 'store'])->name('admin.backups.store');
        Route::put('/admin/backups/settings', [BackupController::class, 'updateSettings'])->name('admin.backups.settings');
        Route::get('/admin/backups/{filename}/download', [BackupController::class, 'download'])->name('admin.backups.download');
        Route::delete('/admin/backups/{filename}', [BackupController::class, 'destroy'])->name('admin.backups.destroy');
    });

    // Technical reports review — permission checked inside the controller
    // (technical_reports.manage) since submission itself is open to all
    // authenticated users via /profile/technical-report above.
    Route::get('/admin/technical-reports', [TechnicalReportController::class, 'index'])->name('admin.technical-reports.index');
    Route::post('/admin/technical-reports/{technicalReport}/status', [TechnicalReportController::class, 'updateStatus'])->name('admin.technical-reports.status');

    // Chat Routes
    Route::middleware('permission:chat.view')->group(function () {
        Route::get('/chat/conversations', [ChatController::class, 'getConversations']);
        Route::get('/chat/conversations/{conversationId}', [ChatController::class, 'getConversation']);
        Route::get('/chat/conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
        Route::post('/chat/conversations/{conversationId}/messages', [ChatController::class, 'sendMessage']);
        Route::post('/chat/conversations', [ChatController::class, 'createConversation']);
        Route::delete('/chat/conversations/{conversationId}/messages/{messageId}', [ChatController::class, 'deleteMessage']);
        Route::get('/chat/search', [ChatController::class, 'searchMessages']);
        Route::post('/chat/conversations/{conversationId}/read', [ChatController::class, 'markAsRead']);
        Route::post('/chat/conversations/{conversationId}/participants', [ChatController::class, 'addParticipants']);
        Route::post('/chat/conversations/{conversationId}/leave', [ChatController::class, 'leaveConversation']);
        Route::delete('/chat/conversations/{conversationId}', [ChatController::class, 'deleteConversation']);
        Route::get('/chat/unread', [ChatController::class, 'getUnreadCounts']);
        Route::get('/chat/presence', [ChatController::class, 'getPresence']);
        Route::post('/chat/conversations/{conversationId}/messages/{messageId}/pin', [ChatController::class, 'pinMessage']);
        Route::delete('/chat/conversations/{conversationId}/messages/{messageId}/pin', [ChatController::class, 'unpinMessage']);
    });

    // Marketing Routes
    Route::middleware('permission:marketing.view')->prefix('marketing')->name('marketing.')->group(function () {
        Route::get('/', [CampaignController::class, 'index'])->name('index');
        Route::get('/create', [CampaignController::class, 'create'])->name('create');
        Route::post('/', [CampaignController::class, 'store'])->name('store');

        // Documents routes (must be before {campaign} wildcard)
        Route::prefix('documents')->name('documents.')->group(function () {
            Route::get('/', [MarketingDocumentController::class, 'index'])->name('index');
            Route::post('/', [MarketingDocumentController::class, 'store'])
                ->middleware('permission:marketing.create')
                ->name('store');
            Route::put('/{document}', [MarketingDocumentController::class, 'update'])
                ->middleware('permission:marketing.edit')
                ->name('update');
            Route::delete('/{document}', [MarketingDocumentController::class, 'destroy'])
                ->middleware('permission:marketing.delete')
                ->name('destroy');
        });

        Route::get('/{campaign}', [CampaignController::class, 'show'])->name('show');
        Route::get('/{campaign}/edit', [CampaignController::class, 'edit'])->name('edit');
        Route::put('/{campaign}', [CampaignController::class, 'update'])->name('update');
        Route::delete('/{campaign}', [CampaignController::class, 'destroy'])->name('destroy');
    });

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/preferences', [NotificationController::class, 'getPreferences']);
    Route::put('/notifications/preferences', [NotificationController::class, 'updatePreferences']);

    // Profile & Search (accessible to all authenticated users)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/notification-preferences', [ProfileController::class, 'updateNotificationPreferences'])->name('profile.notification-preferences');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/profile/employee', [ProfileController::class, 'employeeDetails'])->name('profile.employee');
    Route::get('/profile/leave', [ProfileController::class, 'leave'])->name('profile.leave');
    Route::post('/profile/leave', [ProfileController::class, 'storeLeave'])->name('profile.leave.store');
    Route::get('/profile/performance', [ProfileController::class, 'performance'])->name('profile.performance');

    // Performance review show/actions are relationship-gated in the controller
    // (self, direct supervisor, direct manager, or HR) rather than permission-gated,
    // so a supervisor with no HRM permissions can still act on their own report's review.
    Route::get('/hrm/performance/{performance}', [PerformanceReviewController::class, 'show'])->name('hrm.performance.show');
    Route::post('/hrm/performance/{performance}/self-assessment', [PerformanceReviewController::class, 'submitSelfAssessment'])->name('hrm.performance.self-assessment');
    Route::post('/hrm/performance/{performance}/supervisor-review', [PerformanceReviewController::class, 'submitSupervisorReview'])->name('hrm.performance.supervisor-review');
    Route::post('/hrm/performance/{performance}/manager-review', [PerformanceReviewController::class, 'submitManagerReview'])->name('hrm.performance.manager-review');
    Route::post('/hrm/performance/{performance}/hr-review', [PerformanceReviewController::class, 'submitHrReview'])->name('hrm.performance.hr-review');
    Route::get('/profile/report-issue', [OfficeIssueReportController::class, 'create'])->name('profile.report-issue');
    Route::post('/profile/report-issue', [OfficeIssueReportController::class, 'store'])->name('profile.report-issue.store');
    Route::get('/profile/technical-report', [TechnicalReportController::class, 'create'])->name('profile.technical-report');
    Route::post('/profile/technical-report', [TechnicalReportController::class, 'store'])->name('profile.technical-report.store');

    Route::get('/search', [SearchController::class, 'search'])->name('search');
});

require __DIR__.'/auth.php';
