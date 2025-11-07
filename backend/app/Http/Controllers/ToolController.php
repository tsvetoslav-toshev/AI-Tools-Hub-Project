<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use Illuminate\Http\Request;

class ToolController extends Controller
{
    /**
     * Display a listing of the resource with filters.
     */
    public function index(Request $request)
    {
        $query = Tool::with(['user', 'categories', 'tags', 'recommendedForUsers']);

        // Search filter
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Category filter
        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        // Tag filter
        if ($request->has('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.id', $request->tag_id);
            });
        }

        // Role filter
        if ($request->has('role')) {
            $query->whereHas('recommendedForUsers', function ($q) use ($request) {
                $q->where('tool_user.recommended_role', $request->role);
            });
        }

        // Status filter - only show approved tools by default for non-admin users
        if ($request->has('status')) {
            $query->byStatus($request->status);
        } else {
            // Default: only show approved tools unless user is admin
            $query->byStatus('approved');
        }

        // Featured filter
        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if ($sortBy === 'views') {
            $query->orderBy('views_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return response()->json($query->paginate(12));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreToolRequest $request)
    {
        $validated = $request->validated();
        
        // Create tool with pending status (requires admin approval)
        $tool = auth()->user()->tools()->create([
            'name' => $validated['name'],
            'link' => $validated['link'],
            'documentation_link' => $validated['documentation_link'] ?? null,
            'description' => $validated['description'],
            'how_to_use' => $validated['how_to_use'] ?? null,
            'real_examples' => $validated['real_examples'] ?? null,
            'status' => 'pending',
            'is_approved' => false,
        ]);

        // Attach categories
        if (isset($validated['categories'])) {
            $tool->categories()->attach($validated['categories']);
        }

        // Attach tags
        if (isset($validated['tags'])) {
            $tool->tags()->attach($validated['tags']);
        }

        // Attach recommended roles
        if (isset($validated['recommended_roles'])) {
            foreach ($validated['recommended_roles'] as $role) {
                $tool->recommendedForUsers()->attach(auth()->id(), ['recommended_role' => $role]);
            }
        }

        // Log the submission
        \App\Services\AuditService::logToolSubmitted(
            auth()->user(),
            $tool->id,
            $tool->name,
            request()
        );

        // Notify admins about new tool submission
        \App\Services\NotificationService::createToolSubmittedNotification($tool, auth()->user());

        $tool->load(['categories', 'tags', 'recommendedForUsers', 'user']);
        
        return (new ToolResource($tool))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tool = Tool::with(['user', 'categories', 'tags', 'recommendedForUsers'])
            ->findOrFail($id);

        // Increment views count
        $tool->increment('views_count');

        return new ToolResource($tool);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateToolRequest $request, $id)
    {
        $tool = Tool::findOrFail($id);

        // Check authorization
        if (auth()->id() !== $tool->user_id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

        // Update basic fields
        $tool->update([
            'name' => $validated['name'] ?? $tool->name,
            'link' => $validated['link'] ?? $tool->link,
            'documentation_link' => $validated['documentation_link'] ?? $tool->documentation_link,
            'description' => $validated['description'] ?? $tool->description,
            'how_to_use' => $validated['how_to_use'] ?? $tool->how_to_use,
            'real_examples' => $validated['real_examples'] ?? $tool->real_examples,
        ]);

        // Sync categories
        if (isset($validated['categories'])) {
            $tool->categories()->sync($validated['categories']);
        }

        // Sync tags
        if (isset($validated['tags'])) {
            $tool->tags()->sync($validated['tags']);
        }

        // Sync recommended roles
        if (isset($validated['recommended_roles'])) {
            $tool->recommendedForUsers()->detach(auth()->id());
            foreach ($validated['recommended_roles'] as $role) {
                $tool->recommendedForUsers()->attach(auth()->id(), ['recommended_role' => $role]);
            }
        }

        $tool->load(['categories', 'tags', 'recommendedForUsers', 'user']);
        
        return new ToolResource($tool);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tool = Tool::findOrFail($id);

        // Check authorization
        if (auth()->id() !== $tool->user_id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Force delete to permanently remove from database and avoid slug conflicts
        $tool->forceDelete();

        return response()->json(['message' => 'Tool deleted successfully']);
    }

    /**
     * Approve a tool (admin only).
     */
    public function approve($id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = Tool::findOrFail($id);
        $tool->update(['is_approved' => true]);

        return response()->json($tool);
    }

    /**
     * Feature a tool (admin only).
     */
    public function feature($id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tool = Tool::findOrFail($id);
        $tool->update(['is_featured' => !$tool->is_featured]);

        return response()->json($tool);
    }
}
