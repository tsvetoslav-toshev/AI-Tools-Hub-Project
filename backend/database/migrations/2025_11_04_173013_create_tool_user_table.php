<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tool_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('recommended_role')->nullable(); // e.g., 'Backend Dev', 'Frontend Dev', etc.
            $table->timestamps();
            
            $table->unique(['tool_id', 'user_id']);
            $table->index('tool_id');
            $table->index('user_id');
            $table->index('recommended_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_user');
    }
};
