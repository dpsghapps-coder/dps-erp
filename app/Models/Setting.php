<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    protected $casts = [
        'value' => 'string',
        'type' => 'string',
    ];

    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        if ($setting->type === 'json' && $setting->value) {
            return json_decode($setting->value, true);
        }

        return $setting->value;
    }

    public static function set($key, $value, $type = 'string')
    {
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
            $type = 'json';
        }

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );
    }

    public static function getUomOptions()
    {
        return static::get('uom_options', ['Meters', 'Inches', 'Feet', 'Area', 'Pieces']);
    }

    public static function getCategoryOptions()
    {
        return static::get('category_options', ['Apparel']);
    }

    public static function setUomOptions(array $options)
    {
        return static::set('uom_options', $options, 'json');
    }

    public static function setCategoryOptions(array $options)
    {
        return static::set('category_options', $options, 'json');
    }
}
