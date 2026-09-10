<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\ClientSource;
use App\Models\Industry;
use App\Models\Neighbourhood;
use App\Models\Region;
use Illuminate\Database\Seeder;

class CrmLookupSeeder extends Seeder
{
    public function run(): void
    {
        $this->seed(ClientSource::class, [
            'Referral',
            'Website',
            'Social Media',
            'Cold Call',
            'Walk-in',
            'Trade Show / Event',
            'Google Search',
            'Existing Client',
            'Partner / Agency',
            'Other',
        ]);

        $this->seed(Industry::class, [
            'Printing & Publishing',
            'Advertising & Marketing',
            'Manufacturing',
            'Retail & Trade',
            'Wholesale Trade',
            'Hospitality & Tourism',
            'Construction & Real Estate',
            'Education',
            'Healthcare',
            'Financial Services & Banking',
            'Insurance',
            'NGO / Non-Profit',
            'Government / Public Sector',
            'Telecommunications',
            'Information Technology',
            'Agriculture',
            'Oil & Gas / Energy',
            'Transportation & Logistics',
            'Mining',
            'Food & Beverage',
            'Fashion & Textiles',
            'Automotive',
            'Legal Services',
            'Media & Entertainment',
            'Religious Organization',
            'Sports & Recreation',
            'Other',
        ]);

        $this->seed(Region::class, [
            'Ahafo',
            'Ashanti',
            'Bono',
            'Bono East',
            'Central',
            'Eastern',
            'Greater Accra',
            'North East',
            'Northern',
            'Oti',
            'Savannah',
            'Upper East',
            'Upper West',
            'Volta',
            'Western',
            'Western North',
        ]);

        $this->seed(City::class, [
            'Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Ashaiman', 'Sunyani',
            'Cape Coast', 'Obuasi', 'Tema', 'Madina', 'Koforidua', 'Wa', 'Ho',
            'Techiman', 'Nungua', 'Bolgatanga', 'Berekum', 'Kasoa', 'Nsawam',
            'Winneba', 'Elmina', 'Axim', 'Bawku', 'Yendi', 'Nkawkaw', 'Suhum',
            'Akim Oda', 'Dunkwa-on-Offin', 'Konongo', 'Ejura', 'Mampong',
            'Agona Swedru', 'Anloga', 'Keta', 'Aflao', 'Hohoe', 'Kpando',
            'Dodowa', 'Prampram', 'Ada Foah', 'Somanya',
        ]);

        $this->seed(Neighbourhood::class, [
            'Victoriaborg', 'East Ridge', 'West Ridge', 'North Ridge', 'Adabraka',
            'Asylum Down', 'Jamestown', 'Swalaba', 'Tudu', 'Osu',
            'Airport Residential Area', 'East Legon', 'West Legon', 'Westlands',
            'Roman Ridge', 'Kanda', 'Dzorwulu', 'Kaneshie', 'North Kaneshie',
            'Accra New Town', 'Nima', 'Kokomlemle', 'Tesano', 'Maamobi', 'Alajo',
            'Christian Village', 'Apenkwa', 'Darkuman', 'Awoshie', 'Avenor',
            'Kwashieman', 'Achimota', 'Bubiashie', 'Kotobabi', 'Abelemkpe',
            'Bawaleshie', 'Abeka', 'Lapaz', 'Korle Gonno', 'Lartebiokorshie',
            'Abossey Okai', 'Mataheko', 'Mpoase', 'Chorkor', 'Dansoman',
            'Mamprobi', 'New Mamprobi', 'Odorkor', 'North Odorkor', 'South Odorkor',
            'Cantonments', 'East Cantonments', 'Labadi', 'South Labadi',
            'Labadi-Aborm', 'La', 'Burma Camp', 'Airport Hills', 'Agbogbloshie',
            'Kpehe', 'Pig Farm', 'Teshie', 'Nungua', 'Nii Boi Town', 'Akweteyman',
            'Mantseman', 'Sabon Zongo', 'Old Fadama', 'Lavender Hill', 'Abuja',
            'Chemuna', 'Gbegbeyise', 'Kinbu', 'Gold Coast City',
            'Ambassadorial Enclave', 'Usshertown', 'Makola', 'High Street',
            'Rawlings Park', 'Ringway Estates', 'Kuku Hill', 'Osu-Ako Adjei',
            'Osu-Alata', 'Osu-RE', 'Osu Kinkawe', 'El-Wak', 'Airport City',
            'HIPC Junction', 'Spintex', 'Circle', 'Odawna', 'Russia', 'Sahara',
            'Sukura', 'Shiabu', 'Dansoman Estates', 'Santa Maria', 'Old Dansoman',
            'Dansoman Amanhoma', 'SSNIT Flats', 'Akokorfoto', 'Tweneboa',
            'Sakaman', 'Awudome', 'First Light', 'Kisseman', 'Haatso',
            'Old Abelemkpe', 'New Abelemkpe', 'Abelemkpe Forest', 'Legion Village',
            'East Airport', 'Villagio', 'Manet', 'Okaishie', 'Shiashie',
            'South Shiashie', 'Okplongo', 'Adjiriganor', 'Nmai Djorn',
            'Odorgornor', 'Regimanuel Estates', 'Zoti Area', 'Official Town',
            'South Tesano', 'Kanda Estates', 'McCarthy Hill', 'Adenta', 'Korle Bu',
        ]);
    }

    private function seed(string $modelClass, array $names): void
    {
        foreach ($names as $index => $name) {
            $modelClass::updateOrCreate(
                ['name' => $name],
                ['sort_order' => $index, 'is_active' => true]
            );
        }
    }
}
