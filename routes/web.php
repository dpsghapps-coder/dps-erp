<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CrmController;
use App\Http\Controllers\CrmLeadController;
use App\Http\Controllers\CrmReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\HRM\SettingController;
use App\Http\Controllers\HrmController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Inventory\ProductCatalogController;
use App\Http\Controllers\Inventory\RequisitionController;
use App\Http\Controllers\Inventory\StockController;
use App\Http\Controllers\Inventory\SupplierController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Procurement\GoodController;
use App\Http\Controllers\Procurement\GoodEditController;
use App\Http\Controllers\Procurement\PurchaseRequestController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\StudioController;
use App\Http\Controllers\Management\DashboardController as ManagementDashboardController;
use App\Http\Controllers\Management\MeetingController;
use App\Http\Controllers\Management\DecisionController;
use App\Http\Controllers\Management\ActionItemController;
use App\Http\Controllers\Management\ReviewController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

    // CRM Routes
    Route::middleware('permission:crm.view')->group(function () {
        Route::get('/crm', [CrmController::class, 'index'])->name('crm.index');
        Route::get('/crm/leads', [CrmLeadController::class, 'index'])->name('crm.leads');
        Route::get('/crm/reports', [CrmReportController::class, 'index'])->name('crm.reports');
        Route::get('/crm/{client}', [CrmController::class, 'show'])->name('crm.show');
        Route::get('/crm/create', [CrmController::class, 'create'])->name('crm.create');
        Route::post('/crm', [CrmController::class, 'store'])->name('crm.store');
        Route::get('/crm/{client}/edit', [CrmController::class, 'edit'])->name('crm.edit');
        Route::put('/crm/{client}', [CrmController::class, 'update'])->name('crm.update');
        Route::delete('/crm/{client}', [CrmController::class, 'destroy'])->name('crm.destroy');
        Route::post('/crm/{client}/interactions', [CrmController::class, 'logInteraction'])->name('crm.interactions');
    });

    // Products Routes
    Route::middleware('permission:products.view')->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    // Services Routes
    Route::middleware('permission:services.view')->group(function () {
        Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
        Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
        Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
        Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
        Route::get('/services/{service}/edit', [ServiceController::class, 'edit'])->name('services.edit');
        Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
        Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
    });

    // Inventory Routes
    Route::middleware('permission:inventory.view')->group(function () {
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::get('/inventory/suppliers', [SupplierController::class, 'index'])->name('inventory.suppliers');
        Route::post('/inventory/suppliers', [SupplierController::class, 'store'])->name('inventory.suppliers.store');
        Route::get('/inventory/suppliers/{supplier}', [SupplierController::class, 'show'])->name('inventory.suppliers.show');
        Route::put('/inventory/suppliers/{supplier}', [SupplierController::class, 'update'])->name('inventory.suppliers.update');
        Route::delete('/inventory/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('inventory.suppliers.destroy');

        Route::get('/inventory/materials', [ProductCatalogController::class, 'index'])->name('inventory.materials');
        Route::post('/inventory/materials', [ProductCatalogController::class, 'store'])->name('inventory.materials.store');
        Route::get('/inventory/materials/{product}', [ProductCatalogController::class, 'show'])->name('inventory.materials.show');
        Route::get('/inventory/materials/{product}/edit', [ProductCatalogController::class, 'edit'])->name('inventory.materials.edit');
        Route::put('/inventory/materials/{product}', [ProductCatalogController::class, 'update'])->name('inventory.materials.update');
        Route::delete('/inventory/materials/{product}', [ProductCatalogController::class, 'destroy'])->name('inventory.materials.destroy');
        Route::patch('/inventory/materials/{product}/threshold', [ProductCatalogController::class, 'updateThreshold'])->name('inventory.materials.threshold');

        Route::post('/inventory/materials/{product}/suppliers', [ProductCatalogController::class, 'storeSupplierPrice'])->name('inventory.materials.suppliers.store');
        Route::put('/inventory/materials/suppliers/{supplierPrice}', [ProductCatalogController::class, 'updateSupplierPrice'])->name('inventory.materials.suppliers.update');
        Route::delete('/inventory/materials/suppliers/{supplierPrice}', [ProductCatalogController::class, 'destroySupplierPrice'])->name('inventory.materials.suppliers.destroy');

        Route::get('/inventory/stock', [StockController::class, 'index'])->name('inventory.stock');
        Route::post('/inventory/stock', [StockController::class, 'store'])->name('inventory.stock.store');
        Route::put('/inventory/stock/{stock}', [StockController::class, 'update'])->name('inventory.stock.update');
        Route::delete('/inventory/stock/{stock}', [StockController::class, 'destroy'])->name('inventory.stock.destroy');

        Route::get('/inventory/requisitions', [RequisitionController::class, 'index'])->name('inventory.requisitions');
        Route::post('/inventory/requisitions', [RequisitionController::class, 'store'])->name('inventory.requisitions.store');
        Route::put('/inventory/requisitions/{requisition}', [RequisitionController::class, 'update'])->name('inventory.requisitions.update');
        Route::patch('/inventory/requisitions/{requisition}/status', [RequisitionController::class, 'updateStatus'])->name('inventory.requisitions.status');
        Route::delete('/inventory/requisitions/{requisition}', [RequisitionController::class, 'destroy'])->name('inventory.requisitions.destroy');
    });

    // Orders Routes
    Route::middleware('permission:orders.view')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::get('/orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
        Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
        Route::post('/orders/{order}/confirm', [OrderController::class, 'confirm'])->name('orders.confirm');
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    });

    // Production Routes
    Route::middleware('permission:production.view')->group(function () {
        Route::get('/production', [ProductionController::class, 'index'])->name('production.index');
        Route::get('/production/create', [ProductionController::class, 'create'])->name('production.create');
        Route::post('/production', [ProductionController::class, 'store'])->name('production.store');
        Route::get('/production/{job}', [ProductionController::class, 'show'])->name('production.show');
        Route::get('/production/{job}/edit', [ProductionController::class, 'edit'])->name('production.edit');
        Route::put('/production/{job}', [ProductionController::class, 'update'])->name('production.update');
        Route::patch('/production/{job}/status', [ProductionController::class, 'updateStatus'])->name('production.updateStatus');
        Route::delete('/production/{job}', [ProductionController::class, 'destroy'])->name('production.destroy');
    });

    // Procurement Routes
    Route::middleware('permission:procurement.view')->group(function () {
        Route::get('/procurement', [ProcurementController::class, 'index'])->name('procurement.index');
        Route::get('/procurement/orders', [ProcurementController::class, 'orders'])->name('procurement.orders');
        Route::get('/procurement/create', [ProcurementController::class, 'create'])->name('procurement.create');
        Route::post('/procurement', [ProcurementController::class, 'store'])->name('procurement.store');

        // Goods routes (Must be before wildcard {po})
        Route::get('/procurement/goods', [GoodController::class, 'index'])->name('procurement.goods.index');
        Route::post('/procurement/goods', [GoodController::class, 'store'])->name('procurement.goods.store');
        Route::get('/procurement/goods/{good}/edit', GoodEditController::class)->name('procurement.goods.edit');
        Route::get('/procurement/goods/{good}', [GoodController::class, 'show'])->name('procurement.goods.show');
        Route::put('/procurement/goods/{good}', [GoodController::class, 'update'])->name('procurement.goods.update');
        Route::delete('/procurement/goods/{good}', [GoodController::class, 'destroy'])->name('procurement.goods.destroy');

        Route::post('/procurement/goods/{good}/suppliers', [GoodController::class, 'storeSupplierPrice'])->name('procurement.goods.suppliers.store');
        Route::delete('/procurement/goods/suppliers/{supplierPrice}', [GoodController::class, 'destroySupplierPrice'])->name('procurement.goods.suppliers.destroy');

        // Purchase Requests (must be before {po} wildcard)
        $prCtrl = PurchaseRequestController::class;
        Route::get('/procurement/purchase-requests', [$prCtrl, 'index'])->name('procurement.purchase-requests.index');
        Route::get('/procurement/purchase-requests/create', [$prCtrl, 'create'])->name('procurement.purchase-requests.create');
        Route::post('/procurement/purchase-requests', [$prCtrl, 'store'])->name('procurement.purchase-requests.store');
        Route::get('/procurement/purchase-requests/{purchaseRequest}/edit', [$prCtrl, 'edit'])->name('procurement.purchase-requests.edit');
        Route::put('/procurement/purchase-requests/{purchaseRequest}', [$prCtrl, 'update'])->name('procurement.purchase-requests.update');
        Route::delete('/procurement/purchase-requests/{purchaseRequest}', [$prCtrl, 'destroy'])->name('procurement.purchase-requests.destroy');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/submit', [$prCtrl, 'submit'])->name('procurement.purchase-requests.submit');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/dept-review', [$prCtrl, 'deptReview'])->name('procurement.purchase-requests.dept-review');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/finance-review', [$prCtrl, 'financeReview'])->name('procurement.purchase-requests.finance-review');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/cancel', [$prCtrl, 'cancel'])->name('procurement.purchase-requests.cancel');
        Route::get('/procurement/purchase-requests/{purchaseRequest}/create-po', [$prCtrl, 'createPo'])->name('procurement.purchase-requests.create-po');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/store-po', [$prCtrl, 'storePo'])->name('procurement.purchase-requests.store-po');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/upload-receipt', [$prCtrl, 'uploadReceipt'])->name('procurement.purchase-requests.upload-receipt');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/inspect', [$prCtrl, 'inspect'])->name('procurement.purchase-requests.inspect');
        Route::post('/procurement/purchase-requests/{purchaseRequest}/close-po', [$prCtrl, 'closePo'])->name('procurement.purchase-requests.close-po');
        Route::get('/procurement/purchase-requests/{purchaseRequest}', [$prCtrl, 'show'])->name('procurement.purchase-requests.show');

        Route::get('/procurement/{po}', [ProcurementController::class, 'show'])->name('procurement.show');
        Route::get('/procurement/{po}/edit', [ProcurementController::class, 'edit'])->name('procurement.edit');
        Route::put('/procurement/{po}', [ProcurementController::class, 'update'])->name('procurement.update');
    });

    // HRM Routes
    Route::middleware('permission:hrm.view')->group(function () {
        Route::get('/hrm', [HrmController::class, 'index'])->name('hrm.index');
        Route::get('/hrm/dashboard', [HrmController::class, 'dashboard'])->name('hrm.dashboard');
        Route::get('/hrm/employees', [HrmController::class, 'employees'])->name('hrm.employees');
        Route::get('/hrm/employees/{employee}', [HrmController::class, 'employeeShow'])->name('hrm.employeeShow');
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
        Route::get('/hrm/performance', [HrmController::class, 'performance'])->name('hrm.performance');
        Route::post('/hrm/performance', [HrmController::class, 'storePerformance'])->name('hrm.performance.store');
        Route::get('/hrm/noticeboard', [HrmController::class, 'noticeboard'])->name('hrm.noticeboard');
        Route::post('/hrm/noticeboard', [HrmController::class, 'storeNotice'])->name('hrm.noticeboard.store');
        Route::get('/admin/hrm/departments', [HrmController::class, 'departments'])->name('admin.hrm.departments');
        Route::post('/admin/hrm/departments', [HrmController::class, 'storeDepartment'])->name('admin.hrm.departments.store');
        Route::put('/admin/hrm/departments/{department}', [HrmController::class, 'updateDepartment'])->name('admin.hrm.departments.update');
        Route::delete('/admin/hrm/departments/{department}', [HrmController::class, 'destroyDepartment'])->name('admin.hrm.departments.destroy');
        Route::get('/hrm/create', [HrmController::class, 'create'])->name('hrm.create');
        Route::post('/hrm', [HrmController::class, 'store'])->name('hrm.store');
        Route::get('/hrm/{employee}', [HrmController::class, 'show'])->name('hrm.show');
        Route::get('/hrm/{employee}/edit', [HrmController::class, 'edit'])->name('hrm.edit');
        Route::put('/hrm/{employee}', [HrmController::class, 'update'])->name('hrm.update');

        // HRM Settings routes
        Route::get('/hrm/settings', [SettingController::class, 'index'])->name('hrm.settings.index');
        Route::post('/hrm/settings/departments', [SettingController::class, 'storeDepartment'])->name('hrm.settings.departments.store');
        Route::get('/hrm/settings/departments/{department}/edit', [SettingController::class, 'editDepartment'])->name('hrm.settings.departments.edit');
        Route::put('/hrm/settings/departments/{department}', [SettingController::class, 'updateDepartment'])->name('hrm.settings.departments.update');
        Route::delete('/hrm/settings/departments/{department}', [SettingController::class, 'destroyDepartment'])->name('hrm.settings.departments.destroy');

        Route::post('/hrm/settings/levels', [SettingController::class, 'storeLevel'])->name('hrm.settings.levels.store');
        Route::get('/hrm/settings/levels/{level}/edit', [SettingController::class, 'editLevel'])->name('hrm.settings.levels.edit');
        Route::put('/hrm/settings/levels/{level}', [SettingController::class, 'updateLevel'])->name('hrm.settings.levels.update');
        Route::delete('/hrm/settings/levels/{level}', [SettingController::class, 'destroyLevel'])->name('hrm.settings.levels.destroy');

        Route::post('/hrm/settings/employment-types', [SettingController::class, 'storeEmploymentType'])->name('hrm.settings.employment-types.store');
        Route::get('/hrm/settings/employment-types/{employmentType}/edit', [SettingController::class, 'editEmploymentType'])->name('hrm.settings.employment-types.edit');
        Route::put('/hrm/settings/employment-types/{employmentType}', [SettingController::class, 'updateEmploymentType'])->name('hrm.settings.employment-types.update');
        Route::delete('/hrm/settings/employment-types/{employmentType}', [SettingController::class, 'destroyEmploymentType'])->name('hrm.settings.employment-types.destroy');

        Route::post('/hrm/settings/leave-types', [SettingController::class, 'storeLeaveType'])->name('hrm.settings.leave-types.store');
        Route::get('/hrm/settings/leave-types/{leaveType}/edit', [SettingController::class, 'editLeaveType'])->name('hrm.settings.leave-types.edit');
        Route::put('/hrm/settings/leave-types/{leaveType}', [SettingController::class, 'updateLeaveType'])->name('hrm.settings.leave-types.update');
        Route::delete('/hrm/settings/leave-types/{leaveType}', [SettingController::class, 'destroyLeaveType'])->name('hrm.settings.leave-types.destroy');
    });

    // Studio Routes
    Route::middleware('permission:studio.view')->group(function () {
        Route::get('/studio', [StudioController::class, 'index'])->name('studio.index');
        Route::get('/studio/create', [StudioController::class, 'create'])->name('studio.create');
        Route::post('/studio', [StudioController::class, 'store'])->name('studio.store');
        Route::get('/studio/{booking}', [StudioController::class, 'show'])->name('studio.show');
        Route::get('/studio/{booking}/edit', [StudioController::class, 'edit'])->name('studio.edit');
        Route::put('/studio/{booking}', [StudioController::class, 'update'])->name('studio.update');
        Route::delete('/studio/{booking}', [StudioController::class, 'destroy'])->name('studio.destroy');
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

        // Department Management
        Route::post('/admin/settings/department', [AdminController::class, 'storeDepartment']);
        Route::delete('/admin/settings/department/{department}', [AdminController::class, 'deleteDepartment']);
    });

    // Chat Routes
    Route::middleware('permission:chat.view')->group(function () {
        Route::get('/chat/conversations', [ChatController::class, 'getConversations']);
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
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/search', [SearchController::class, 'search'])->name('search');
});

require __DIR__.'/auth.php';
