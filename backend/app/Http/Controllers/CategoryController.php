<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of active categories.
     */
    public function index()
    {
        $categories = Category::active()->ordered()->get();
        return response()->json($categories);
    }

    /**
     * Display the specified category with its tools.
     */
    public function show($id)
    {
        $category = Category::with(['tools' => function ($query) {
            $query->approved()->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json($category);
    }
}
