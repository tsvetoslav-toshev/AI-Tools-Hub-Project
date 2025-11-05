<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'link' => 'sometimes|required|url|max:500',
            'documentation_link' => 'nullable|url|max:500',
            'description' => 'sometimes|required|string|max:1000',
            'how_to_use' => 'nullable|string|max:2000',
            'real_examples' => 'nullable|string|max:2000',
            'categories' => 'sometimes|required|array|min:1',
            'categories.*' => 'exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'recommended_roles' => 'nullable|array',
            'recommended_roles.*' => 'string|max:255',
        ];
    }
}
