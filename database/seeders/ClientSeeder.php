<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        // Mock Clients Data
        $clients = [
            [
                'company_name' => 'Tech Solutions Ghana',
                'email' => 'info@techsolutions.com.gh',
                'phone' => '0302123456',
                'status' => 'active',
                'industry' => 'Technology',
                'city' => 'Accra',
                'country' => 'Ghana',
                'source' => 'Referral',
                'contact_person_1' => 'Kwame Asante',
                'contact_person_mobile' => '0241234567',
            ],
            [
                'company_name' => 'Accra Digital Hub',
                'email' => 'contact@acradigitalhub.com',
                'phone' => '0302987654',
                'status' => 'active',
                'industry' => 'Technology',
                'city' => 'Accra',
                'country' => 'Ghana',
                'source' => 'Website',
                'contact_person_1' => 'Ama Serwaa',
                'contact_person_mobile' => '0552345678',
            ],
            [
                'company_name' => 'Kumasi Media Group',
                'email' => 'info@kumasimedia.com',
                'phone' => '0322067890',
                'status' => 'prospect',
                'industry' => 'Media & Entertainment',
                'city' => 'Kumasi',
                'country' => 'Ghana',
                'source' => 'Social Media',
                'contact_person_1' => 'Yaw Mensah',
                'contact_person_mobile' => '0203456789',
            ],
            [
                'company_name' => 'Lagos Tech Ventures',
                'email' => 'hello@lagostech.ng',
                'phone' => '0123456789',
                'status' => 'lead',
                'industry' => 'Technology',
                'city' => 'Lagos',
                'country' => 'Nigeria',
                'source' => 'Trade Show',
                'contact_person_1' => 'Chidi Okonkwo',
                'contact_person_mobile' => '0812345678',
            ],
            [
                'company_name' => 'West African Logistics',
                'email' => 'ops@walogistics.com',
                'phone' => '0302789012',
                'status' => 'active',
                'industry' => 'Logistics',
                'city' => 'Accra',
                'country' => 'Ghana',
                'source' => 'Referral',
                'contact_person_1' => 'Efua Osei',
                'contact_person_mobile' => '0244567890',
            ],
            [
                'company_name' => 'Abidjan Creative Agency',
                'email' => 'contact@abicreative.ci',
                'phone' => '0123456780',
                'status' => 'prospect',
                'industry' => 'Advertising',
                'city' => 'Abidjan',
                'country' => 'Ivory Coast',
                'source' => 'Website',
                'contact_person_1' => 'Jean-Luc Yao',
                'contact_person_mobile' => '0876543210',
            ],
            [
                'company_name' => 'Nairobi FinTech Ltd',
                'email' => 'info@nairobi-fintech.co.ke',
                'phone' => '0201234567',
                'status' => 'lead',
                'industry' => 'Financial Services',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'source' => 'Cold Call',
                'contact_person_1' => 'Wanjiru Kamau',
                'contact_person_mobile' => '0712345678',
            ],
            [
                'company_name' => 'Tema Industrial Corp',
                'email' => 'admin@temaindustrial.gh',
                'phone' => '0302781234',
                'status' => 'active',
                'industry' => 'Manufacturing',
                'city' => 'Tema',
                'country' => 'Ghana',
                'source' => 'Referral',
                'contact_person_1' => 'Kojo Boateng',
                'contact_person_mobile' => '0245678901',
            ],
            [
                'company_name' => 'Cape Coast Tourism Board',
                'email' => 'info@cctourism.gh',
                'phone' => '0421234567',
                'status' => 'inactive',
                'industry' => 'Tourism',
                'city' => 'Cape Coast',
                'country' => 'Ghana',
                'source' => 'Event',
                'contact_person_1' => 'Adjoa Mansa',
                'contact_person_mobile' => '0209876543',
            ],
            [
                'company_name' => 'Takoradi Energy Partners',
                'email' => 'contact@takoradienergy.com',
                'phone' => '0312789012',
                'status' => 'prospect',
                'industry' => 'Energy',
                'city' => 'Takoradi',
                'country' => 'Ghana',
                'source' => 'Trade Show',
                'contact_person_1' => 'Kweku Dwamena',
                'contact_person_mobile' => '0556789012',
            ],
        ];

        foreach ($clients as $clientData) {
            Client::create($clientData);
        }
    }
}
