<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Display a listing of all tags.
     */
    public function index()
    {
        $tags = Tag::orderBy('name')->get();
        return response()->json($tags);
    }

    /**
     * Display the specified tag with its tools.
     */
    public function show($id)
    {
        $tag = Tag::with(['tools' => function ($query) {
            $query->approved()->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json($tag);
    }

    /**
     * Store a newly created tag.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'color' => 'nullable|string|max:20',
        ]);

        $tag = Tag::create($validated);

        return response()->json($tag, 201);
    }
}
