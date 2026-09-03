<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Contact;
use App\Models\Interaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $clients = [
            [
                'company_name' => 'Tech Solutions Ghana',
                'email' => 'info@techsolutions.com.gh',
                'phone' => '0302123456',
                'status' => 'active',
                'industry' => 'Technology',
                'website' => 'https://techsolutions.com.gh',
                'address' => '12 Ring Road Central',
                'city' => 'Accra',
                'country' => 'Ghana',
                'location' => '5.6037,-0.1870',
                'source' => 'Referral',
                'notes' => 'Long-standing client. Prefers email communication and quick turnaround on proposals.',
                'linkedin' => 'https://www.linkedin.com/company/tech-solutions-ghana',
                'facebook' => 'https://www.facebook.com/techsolutionsgh',
                'instagram' => 'https://www.instagram.com/techsolutionsgh',
                'twitter' => 'https://x.com/techsolutionsgh',
                'tiktok' => 'https://www.tiktok.com/@techsolutionsgh',
                'next_follow_up_at' => now()->addDays(7),
                'contacts' => [
                    ['first_name' => 'Kwame', 'last_name' => 'Asante', 'branch' => 'Head Office', 'location' => '5.6037,-0.1870', 'job_title' => 'Operations Manager', 'phone' => '0241234567'],
                    ['first_name' => 'Ama', 'last_name' => 'Serwaa', 'branch' => 'Head Office', 'job_title' => 'Procurement Lead', 'phone' => '0552345678'],
                ],
                'interactions' => [
                    ['type' => 'call', 'subject' => 'Quarterly check-in', 'body' => 'Discussed upcoming branding project and delivery timelines.', 'occurred_at' => now()->subDays(20)],
                    ['type' => 'meeting', 'subject' => 'Proposal walkthrough', 'body' => 'Presented print package for their new product launch.', 'occurred_at' => now()->subDays(12)],
                    ['type' => 'email', 'subject' => 'Order confirmation', 'body' => 'Confirmed bulk business cards order. Expected in 5 working days.', 'occurred_at' => now()->subDays(3)],
                ],
            ],
            [
                'company_name' => 'Accra Digital Hub',
                'email' => 'contact@acradigitalhub.com',
                'phone' => '0302987654',
                'status' => 'active',
                'industry' => 'Technology',
                'website' => 'https://acradigitalhub.com',
                'address' => 'Osu, Oxford Street',
                'city' => 'Accra',
                'country' => 'Ghana',
                'location' => '5.5560,-0.1786',
                'source' => 'Website',
                'notes' => 'Interested in monthly retainer for all print materials.',
                'facebook' => 'https://www.facebook.com/acradigitalhub',
                'instagram' => 'https://www.instagram.com/acradigitalhub',
                'next_follow_up_at' => now()->addDays(14),
                'contacts' => [
                    ['first_name' => 'Ama', 'last_name' => 'Serwaa', 'branch' => 'Osu', 'job_title' => 'Marketing Director', 'phone' => '0552345678'],
                ],
                'interactions' => [
                    ['type' => 'meeting', 'subject' => 'Onboarding meeting', 'body' => 'Set up print retainer, discussed brand guidelines.', 'occurred_at' => now()->subDays(30)],
                    ['type' => 'note', 'subject' => 'Delivered flyers', 'body' => 'Delivered 500 flyers for their tech fair.', 'occurred_at' => now()->subDays(10)],
                ],
            ],
            [
                'company_name' => 'Kumasi Media Group',
                'email' => 'info@kumasimedia.com',
                'phone' => '0322067890',
                'status' => 'prospect',
                'industry' => 'Media & Entertainment',
                'website' => 'https://kumasimedia.com',
                'address' => 'Adum, Prempeh II Street',
                'city' => 'Kumasi',
                'country' => 'Ghana',
                'location' => '6.6885,-1.6244',
                'source' => 'Social Media',
                'notes' => 'Asked for a quote on studio backdrop printing. Follow up with price list.',
                'instagram' => 'https://www.instagram.com/kumasimedia',
                'twitter' => 'https://x.com/kumasimedia',
                'next_follow_up_at' => now()->addDays(3),
                'contacts' => [
                    ['first_name' => 'Yaw', 'last_name' => 'Mensah', 'branch' => 'Adum', 'job_title' => 'Creative Producer', 'phone' => '0203456789'],
                ],
                'interactions' => [
                    ['type' => 'call', 'subject' => 'Quote request', 'body' => 'Requested pricing for 2x3m backdrop and signage.', 'occurred_at' => now()->subDays(2)],
                ],
            ],
            [
                'company_name' => 'Lagos Tech Ventures',
                'email' => 'hello@lagostech.ng',
                'phone' => '0123456789',
                'status' => 'lead',
                'industry' => 'Technology',
                'website' => 'https://lagostech.ng',
                'address' => 'Victoria Island, Lagos',
                'city' => 'Lagos',
                'country' => 'Nigeria',
                'location' => '6.5244,3.3792',
                'source' => 'Trade Show',
                'notes' => 'Met at tech expo. Interested in international shipping of print materials.',
                'linkedin' => 'https://www.linkedin.com/company/lagos-tech-ventures',
                'next_follow_up_at' => now()->addDays(5),
                'contacts' => [
                    ['first_name' => 'Chidi', 'last_name' => 'Okonkwo', 'branch' => 'Victoria Island', 'job_title' => 'Founder', 'phone' => '0812345678'],
                ],
                'interactions' => [
                    ['type' => 'email', 'subject' => 'Introductory email', 'body' => 'Sent intro email with portfolio and capabilities deck.', 'occurred_at' => now()->subDays(1)],
                ],
            ],
            [
                'company_name' => 'West African Logistics',
                'email' => 'ops@walogistics.com',
                'phone' => '0302789012',
                'status' => 'active',
                'industry' => 'Logistics',
                'website' => 'https://walogistics.com',
                'address' => 'Tema Freeport Boulevard',
                'city' => 'Accra',
                'country' => 'Ghana',
                'location' => '5.6037,-0.1870',
                'source' => 'Referral',
                'notes' => 'Regular orders for vehicle branding. Needs faster reordering process.',
                'linkedin' => 'https://www.linkedin.com/company/west-african-logistics',
                'facebook' => 'https://www.facebook.com/walogistics',
                'next_follow_up_at' => now()->addDays(10),
                'contacts' => [
                    ['first_name' => 'Efua', 'last_name' => 'Osei', 'branch' => 'Tema', 'job_title' => 'Fleet Manager', 'phone' => '0244567890'],
                    ['first_name' => 'Nana', 'last_name' => 'Yaa', 'branch' => 'Tema', 'job_title' => 'Accountant', 'phone' => '0271230987'],
                ],
                'interactions' => [
                    ['type' => 'call', 'subject' => 'Vehicle wrap job', 'body' => 'Confirmed wrap for 3 delivery vans.', 'occurred_at' => now()->subDays(15)],
                    ['type' => 'meeting', 'subject' => 'Design review', 'body' => 'Reviewed new livery design, minor tweaks requested.', 'occurred_at' => now()->subDays(6)],
                ],
            ],
            [
                'company_name' => 'Abidjan Creative Agency',
                'email' => 'contact@abicreative.ci',
                'phone' => '0123456780',
                'status' => 'prospect',
                'industry' => 'Advertising',
                'website' => 'https://abicreative.ci',
                'address' => 'Cocody, Abidjan',
                'city' => 'Abidjan',
                'country' => 'Ivory Coast',
                'location' => '5.3599,-4.0083',
                'source' => 'Website',
                'notes' => 'Exploring partnership for outsourced large-format printing.',
                'instagram' => 'https://www.instagram.com/abicreative',
                'next_follow_up_at' => now()->addDays(8),
                'contacts' => [
                    ['first_name' => 'Jean-Luc', 'last_name' => 'Yao', 'branch' => 'Cocody', 'job_title' => 'Art Director', 'phone' => '0876543210'],
                ],
                'interactions' => [
                    ['type' => 'note', 'subject' => 'Inbound enquiry', 'body' => 'Enquired via website contact form about bulk printing rates.', 'occurred_at' => now()->subDays(4)],
                ],
            ],
            [
                'company_name' => 'Nairobi FinTech Ltd',
                'email' => 'info@nairobi-fintech.co.ke',
                'phone' => '0201234567',
                'status' => 'lead',
                'industry' => 'Financial Services',
                'website' => 'https://nairobi-fintech.co.ke',
                'address' => 'Nairobi CBD, Kenya',
                'city' => 'Nairobi',
                'country' => 'Kenya',
                'location' => '-1.2921,36.8219',
                'source' => 'Cold Call',
                'notes' => 'Cold called. Interested in branded corporate stationery.',
                'linkedin' => 'https://www.linkedin.com/company/nairobi-fintech',
                'next_follow_up_at' => now()->addDays(2),
                'contacts' => [
                    ['first_name' => 'Wanjiru', 'last_name' => 'Kamau', 'branch' => 'CBD', 'job_title' => 'HR Manager', 'phone' => '0712345678'],
                ],
                'interactions' => [
                    ['type' => 'call', 'subject' => 'Cold call', 'body' => 'Spoke with HR manager, sent sample catalogue by email.', 'occurred_at' => now()->subDays(1)],
                ],
            ],
            [
                'company_name' => 'Tema Industrial Corp',
                'email' => 'admin@temaindustrial.gh',
                'phone' => '0302781234',
                'status' => 'active',
                'industry' => 'Manufacturing',
                'website' => 'https://temaindustrial.gh',
                'address' => 'Industrial Area, Tema',
                'city' => 'Tema',
                'country' => 'Ghana',
                'location' => '5.6698,-0.0166',
                'source' => 'Referral',
                'notes' => 'Bulk supplier of safety signage. Annual contract under negotiation.',
                'facebook' => 'https://www.facebook.com/temaindustrial',
                'twitter' => 'https://x.com/temaindustrial',
                'next_follow_up_at' => now()->addDays(21),
                'contacts' => [
                    ['first_name' => 'Kojo', 'last_name' => 'Boateng', 'branch' => 'Tema', 'job_title' => 'Purchasing Manager', 'phone' => '0245678901'],
                ],
                'interactions' => [
                    ['type' => 'meeting', 'subject' => 'Safety signage contract', 'body' => 'Negotiating annual supply agreement for site signage.', 'occurred_at' => now()->subDays(9)],
                    ['type' => 'email', 'subject' => 'Contract draft sent', 'body' => 'Sent revised contract with volume pricing.', 'occurred_at' => now()->subDays(1)],
                ],
            ],
            [
                'company_name' => 'Cape Coast Tourism Board',
                'email' => 'info@cctourism.gh',
                'phone' => '0421234567',
                'status' => 'inactive',
                'industry' => 'Tourism',
                'website' => 'https://cctourism.gh',
                'address' => 'Cape Coast Castle Road',
                'city' => 'Cape Coast',
                'country' => 'Ghana',
                'location' => '5.1053,-1.2466',
                'source' => 'Event',
                'notes' => 'Seasonal client. No active projects. Reach out during festival season.',
                'instagram' => 'https://www.instagram.com/cctourism',
                'next_follow_up_at' => now()->addMonths(3),
                'contacts' => [
                    ['first_name' => 'Adjoa', 'last_name' => 'Mansa', 'branch' => 'Cape Coast', 'job_title' => 'Communications Officer', 'phone' => '0209876543'],
                ],
                'interactions' => [
                    ['type' => 'note', 'subject' => 'Project completed', 'body' => 'Festival banners and brochures delivered and invoiced.', 'occurred_at' => now()->subMonths(2)],
                ],
            ],
            [
                'company_name' => 'Takoradi Energy Partners',
                'email' => 'contact@takoradienergy.com',
                'phone' => '0312789012',
                'status' => 'prospect',
                'industry' => 'Energy',
                'website' => 'https://takoradienergy.com',
                'address' => 'Takoradi Harbour Area',
                'city' => 'Takoradi',
                'country' => 'Ghana',
                'location' => '4.9059,-1.7603',
                'source' => 'Trade Show',
                'notes' => 'Interested in large-format site signage for offshore operations.',
                'linkedin' => 'https://www.linkedin.com/company/takoradi-energy',
                'next_follow_up_at' => now()->addDays(11),
                'contacts' => [
                    ['first_name' => 'Kweku', 'last_name' => 'Dwamena', 'branch' => 'Takoradi', 'job_title' => 'Site Manager', 'phone' => '0556789012'],
                ],
                'interactions' => [
                    ['type' => 'email', 'subject' => 'Site signage proposal', 'body' => 'Sent proposal for 6 safety and directional signs.', 'occurred_at' => now()->subDays(5)],
                ],
            ],
        ];

        foreach ($clients as $clientData) {
            $contacts = $clientData['contacts'] ?? [];
            $interactions = $clientData['interactions'] ?? [];
            unset($clientData['contacts'], $clientData['interactions']);
            $clientData['pipeline_stage'] = Client::pipelineStageForStatus($clientData['status']);

            $client = Client::create($clientData);

            foreach ($contacts as $contactData) {
                $client->contacts()->create($contactData);
            }

            foreach ($interactions as $interactionData) {
                $client->interactions()->create(array_merge($interactionData, [
                    'user_id' => $user->id,
                ]));
            }
        }
    }
}
