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
        Schema::table('tools', function (Blueprint $table) {
            // Add status enum column
            $table->enum('status', ['pending', 'approved', 'rejected', 'archived'])
                  ->default('pending')
                  ->after('user_id');
            
            // Add approval tracking fields
            $table->foreignId('approved_by')
                  ->nullable()
                  ->after('status')
                  ->constrained('users')
                  ->nullOnDelete();
            
            $table->timestamp('reviewed_at')
                  ->nullable()
                  ->after('approved_by');
            
            // Add indexes
            $table->index('status');
            $table->index(['status', 'is_approved']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['status', 'approved_by', 'reviewed_at']);
        });
    }
};
